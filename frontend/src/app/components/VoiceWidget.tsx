"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Service = { id: string; name: string; price: string; description: string };
type Business = { id: string; name: string; phone: string; location: string; hours: string; persona: string; accent_color?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VoiceWidget({ businessId: businessIdProp }: { businessId?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [isWide, setIsWide] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alreadyBookedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkWidth = () => setIsWide(window.innerWidth >= 720);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    let id = businessIdProp;
    if (!id) {
      const params = new URLSearchParams(window.location.search);
      id = params.get("business_id") || "6a7aaff7-772a-4fb5-8394-6118a4424d5e";
    }
    setBusinessId(id);
    setLoadingBusiness(true);
    setLoadError(false);

    fetch(`${API_URL}/business/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setBusiness(data.business);
        setServices(data.services || []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoadingBusiness(false));
  }, [businessIdProp]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendToAgent = async (userText: string) => {
    setSending(true);
    setSendError("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    try {
      const chatRes = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userText,
          business_id: businessId,
          history: messages,
          already_booked: alreadyBookedRef.current,
        }),
      });

      if (!chatRes.ok) throw new Error("Chat request failed");
      const chatData = await chatRes.json();
      setMessages(chatData.history);
      alreadyBookedRef.current = chatData.already_booked;

      const speakRes = await fetch(`${API_URL}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatData.reply }),
      });

      if (speakRes.ok) {
        const audioBlobReply = await speakRes.blob();
        const audioUrl = URL.createObjectURL(audioBlobReply);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (err) {
      setSendError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleTextSend = () => {
    if (!textInput.trim() || sending) return;
    sendToAgent(textInput.trim());
    setTextInput("");
  };

  const handleQuickAction = (message: string) => {
    if (sending) return;
    sendToAgent(message);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        try {
          const res = await fetch(`${API_URL}/transcribe`, {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Transcribe failed");
          const data = await res.json();
          if (data.text && data.text.trim()) {
            sendToAgent(data.text.trim());
          }
        } catch {
          setSendError("Couldn't process audio. Please try again or type instead.");
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setSendError("Microphone access denied. Please type instead.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const accentOverride = business?.accent_color
    ? ({ "--accent": business.accent_color, "--accent-soft": `${business.accent_color}26` } as React.CSSProperties)
    : {};

  const businessInfoBlock = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: business ? "0.4rem" : 0 }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: isRecording ? "#ef4444" : "var(--accent)",
            flexShrink: 0,
          }}
        />
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600 }}>
          {loadingBusiness ? "Loading..." : loadError ? "Unable to load" : business ? business.name : "Business not found"}
        </p>
      </div>
      {business && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)" }}>
          {business.hours} {business.location && `· ${business.location}`}
          {business.phone && (
            <>
              {" · "}
              <a href={`tel:${business.phone}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
                {business.phone}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );

  const servicesListBlock = services.length > 0 && (
    <div style={{ display: "flex", flexDirection: isWide ? "column" : "row", gap: "0.5rem", flexWrap: isWide ? "nowrap" : "wrap", overflowX: isWide ? "visible" : "auto" }}>
      {services.map((s) => (
        <div
          key={s.id}
          style={{
            flexShrink: 0,
            background: "var(--accent-soft)",
            border: "1px solid rgba(138,163,119,0.2)",
            borderRadius: "8px",
            padding: isWide ? "0.6rem 0.8rem" : "0.4rem 0.7rem",
            whiteSpace: isWide ? "normal" : "nowrap",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{s.name}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{s.price}</span>
          </div>
          {isWide && s.description && (
            <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.2rem" }}>{s.description}</p>
          )}
        </div>
      ))}
    </div>
  );

  const chatArea = (
    <>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.length === 0 && !loadingBusiness && (
          <>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "1rem", marginBottom: "0.5rem" }}>
              How can we help?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
              <button
                onClick={() => handleQuickAction("I'd like to book an appointment")}
                style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer" }}
              >
                Book Appointment
              </button>
              <button
                onClick={() => handleQuickAction("What services and prices do you offer?")}
                style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer" }}
              >
                View Prices
              </button>
              <button
                onClick={() => handleQuickAction("I have a question")}
                style={{ padding: "0.5rem 0.9rem", borderRadius: "999px", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer" }}
              >
                Ask a Question
              </button>
            </div>
          </>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.role === "user" ? "var(--accent)" : "rgba(242,237,228,0.08)",
              color: m.role === "user" ? "var(--bg)" : "var(--text)",
              padding: "0.6rem 0.9rem",
              borderRadius: "12px",
              fontSize: "0.9rem",
              lineHeight: 1.4,
            }}
          >
            {m.content}
          </div>
        ))}

        {sending && (
          <div style={{ alignSelf: "flex-start", color: "var(--muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            typing...
          </div>
        )}

        {sendError && (
          <div style={{ alignSelf: "center", color: "var(--accent)", fontSize: "0.8rem", textAlign: "center" }}>
            {sendError}
          </div>
        )}
      </div>

      <div style={{ padding: "0.9rem 1rem", borderTop: "1px solid rgba(242,237,228,0.1)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loadingBusiness}
          style={{
            width: "42px",
            height: "42px",
            flexShrink: 0,
            borderRadius: "50%",
            border: "none",
            background: isRecording ? "#ef4444" : "var(--accent)",
            color: "var(--bg)",
            fontSize: "1.1rem",
            cursor: loadingBusiness ? "not-allowed" : "pointer",
            opacity: loadingBusiness ? 0.5 : 1,
          }}
          aria-label={isRecording ? "Stop talking" : "Start talking"}
        >
          🎤
        </button>

        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder="Type a message..."
          disabled={loadingBusiness}
          style={{
            flex: 1,
            padding: "0.7rem 0.9rem",
            borderRadius: "10px",
            border: "1px solid rgba(242,237,228,0.15)",
            background: "rgba(242,237,228,0.05)",
            color: "var(--text)",
            fontFamily: "var(--font-body)",
          }}
        />

        <button
          onClick={handleTextSend}
          disabled={sending || loadingBusiness}
          style={{
            padding: "0.7rem 1rem",
            borderRadius: "10px",
            border: "none",
            background: "var(--muted)",
            color: "var(--bg)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </>
  );

  if (loadError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "rgba(242,237,228,0.04)",
          border: "1px solid rgba(242,237,228,0.12)",
          borderRadius: "16px",
          overflow: "hidden",
          height: "100%",
          width: "100%",
          maxWidth: "480px",
          margin: "0 auto",
          padding: "2rem 1.25rem",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          We couldn't reach this business right now. Please try again in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (isWide) {
    return (
      <div
        style={{
          display: "flex",
          background: "rgba(242,237,228,0.04)",
          border: "1px solid rgba(242,237,228,0.12)",
          borderRadius: "16px",
          overflow: "hidden",
          height: "100%",
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          ...accentOverride,
        }}
      >
        <audio ref={audioRef} />

        <div style={{ width: "230px", flexShrink: 0, borderRight: "1px solid rgba(242,237,228,0.1)", padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {businessInfoBlock}
          {servicesListBlock}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {chatArea}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(242,237,228,0.04)",
        border: "1px solid rgba(242,237,228,0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        height: "100%",
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        ...accentOverride,
      }}
    >
      <audio ref={audioRef} />

      <div
        style={{ padding: "1.1rem 1.25rem", borderBottom: "1px solid rgba(242,237,228,0.1)", cursor: services.length > 0 ? "pointer" : "default", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        onClick={() => services.length > 0 && setServicesOpen(!servicesOpen)}
      >
        {businessInfoBlock}
        {services.length > 0 && (
          <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)", marginLeft: "0.5rem" }}>
            {servicesOpen ? "▲" : "▼"} prices
          </span>
        )}
      </div>

      {servicesOpen && (
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(242,237,228,0.1)" }}>
          {servicesListBlock}
        </div>
      )}

      {chatArea}
    </div>
  );
}