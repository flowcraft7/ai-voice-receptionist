import os
import io
import json
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from supabase import create_client
from groq import Groq
import edge_tts

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_booking_email(to_email: str, business_name: str, customer_name: str, date: str, time: str, notes: str):
    print(f"Attempting to send email. to={to_email}, smtp_email_set={bool(SMTP_EMAIL)}, smtp_password_set={bool(SMTP_PASSWORD)}")

    if not to_email or not SMTP_EMAIL or not SMTP_PASSWORD:
        print("Email skipped: missing to_email or SMTP credentials")
        return

    try:
        body = f"""New appointment booked for {business_name}!

Customer: {customer_name}
Date: {date}
Time: {time}
Notes: {notes or "N/A"}

Log in to your dashboard to view all appointments."""

        msg = MIMEText(body)
        msg["Subject"] = f"New Booking: {customer_name} - {date} at {time}"
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print("Email send error:", e)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/test-db")
def test_db():
    result = supabase.table("businesses").select("*").execute()
    return result.data


@app.get("/businesses")
def list_businesses():
    result = supabase.table("businesses").select("id, name, hours, location, phone").execute()
    return result.data


@app.get("/business/{business_id}")
def get_business(business_id: str):
    biz = supabase.table("businesses").select("*").eq("id", business_id).execute()
    services = supabase.table("services").select("*").eq("business_id", business_id).execute()
    return {
        "business": biz.data[0] if biz.data else None,
        "services": services.data,
    }


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()

    transcription = groq_client.audio.transcriptions.create(
        file=(audio.filename, audio_bytes),
        model="whisper-large-v3-turbo",
    )

    return {"text": transcription.text}


@app.post("/chat")
async def chat(payload: dict = Body(...), background_tasks: BackgroundTasks = None):
    user_text = payload.get("text", "")
    business_id = payload.get("business_id")
    history = payload.get("history", [])
    already_booked = payload.get("already_booked", False)

    business = supabase.table("businesses").select("*").eq("id", business_id).execute()
    biz = business.data[0] if business.data else {}

    services = supabase.table("services").select("*").eq("business_id", business_id).execute()
    services_text = ", ".join(
        f"{s['name']} ({s.get('price', 'price on request')})" for s in services.data
    ) if services.data else biz.get("services", "N/A")

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    weekday_str = now.strftime("%A")

    booking_instruction = (
        "An appointment has ALREADY been booked in this conversation. Do NOT output another [BOOKING] block, even if asked to confirm again. Just chat normally."
        if already_booked else
        f"""Today's date is {today_str} ({weekday_str}). When the customer mentions a relative day (e.g. "Friday", "tomorrow", "next Monday"), resolve it to the correct actual calendar date based on today's date — always assume the NEXT upcoming occurrence of that day.

If you now have all three of: customer's name, preferred date, and preferred time (collected across this whole conversation), end your reply with a hidden JSON block on its own line in this exact format:
[BOOKING]{{"customer_name": "...", "requested_date": "YYYY-MM-DD", "requested_time": "HH:MM (24-hour)", "notes": "..."}}[/BOOKING]
The requested_date MUST be an actual resolved calendar date in YYYY-MM-DD format, never a relative word like "Friday". The requested_time MUST be in 24-hour HH:MM format.
Only include this block once you actually have all three. Otherwise don't include it at all."""
    )

    system_prompt = f"""You are the AI receptionist for {biz.get('name', 'this business')}.
Persona: {biz.get('persona', 'Friendly and professional')}
Services with prices: {services_text}
Hours: {biz.get('hours', 'N/A')}
Location: {biz.get('location', 'N/A')}

Always reply in the SAME language and script the customer used (English, Urdu, or Roman Urdu) — match them exactly.
Keep responses short and conversational, like a real phone receptionist. Quote prices when asked. Remember everything the customer has told you earlier in this conversation. When confirming a booking back to the customer in your spoken reply, mention the date in a natural human way (e.g. "Friday, August 15th"), not the raw YYYY-MM-DD format.

{booking_instruction}"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_text})

    completion = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
    )

    reply = completion.choices[0].message.content
    clean_reply = reply
    booked_now = already_booked

    if not already_booked and "[BOOKING]" in reply and "[/BOOKING]" in reply:
        try:
            start = reply.index("[BOOKING]") + len("[BOOKING]")
            end = reply.index("[/BOOKING]")
            booking_json = reply[start:end].strip()
            booking_data = json.loads(booking_json)

            requested_date = booking_data.get("requested_date")
            requested_time = booking_data.get("requested_time")

            conflict = supabase.table("appointments") \
                .select("id") \
                .eq("business_id", business_id) \
                .eq("requested_date", requested_date) \
                .eq("requested_time", requested_time) \
                .neq("status", "cancelled") \
                .execute()

            if conflict.data:
                clean_reply = reply[:reply.index("[BOOKING]")].strip()
                clean_reply += f"\n\nActually, that slot ({requested_date} at {requested_time}) is already booked. Could you pick a different time?"
            else:
                supabase.table("appointments").insert({
                    "business_id": business_id,
                    "customer_name": booking_data.get("customer_name"),
                    "requested_date": requested_date,
                    "requested_time": requested_time,
                    "notes": booking_data.get("notes", ""),
                }).execute()

                clean_reply = reply[:reply.index("[BOOKING]")].strip()
                booked_now = True

                notify_email = biz.get("notification_email")
                if notify_email and background_tasks is not None:
                    background_tasks.add_task(
                        send_booking_email,
                        notify_email,
                        biz.get("name", "Your business"),
                        booking_data.get("customer_name"),
                        requested_date,
                        requested_time,
                        booking_data.get("notes", ""),
                    )
        except Exception as e:
            print("Booking parse error:", e)
    elif "[BOOKING]" in reply:
        clean_reply = reply.split("[BOOKING]")[0].strip()

    updated_history = history + [
        {"role": "user", "content": user_text},
        {"role": "assistant", "content": clean_reply},
    ]

    return {"reply": clean_reply, "history": updated_history, "already_booked": booked_now}


@app.post("/speak")
async def speak(payload: dict = Body(...)):
    text = payload.get("text", "")

    communicate = edge_tts.Communicate(text, voice="en-US-AriaNeural")
    audio_buffer = io.BytesIO()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    audio_buffer.seek(0)
    return StreamingResponse(audio_buffer, media_type="audio/mpeg")