"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function VoiceWidget() {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [sending, setSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alreadyBookedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("business_id");
    setBusinessId(idFromUrl || "6a7aaff7-772a-4fb5-8394-6118a4424d5e");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendToAgent = async (userText: string) => {
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    const chatRes = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: userText,
        business_id: businessId,
        history: messages,
        already_booked: alreadyBookedRef.current,
      }),
    });

    const chatData = await chatRes.json();
    setMessages(chatData.history);
    alreadyBookedRef.current = chatData.already_booked;

    const speakRes = await fetch("http://localhost:8000/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chatData.reply }),
    });

    const audioBlobReply = await speakRes.blob();
    const audioUrl = URL.createObjectURL(audioBlobReply);

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }

    setSending(false);
  };

  const handleTextSend = () => {
    if (!textInput.trim() || sending) return;
    sendToAgent(textInput.trim());
    setTextInput("");
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.text && data.text.trim()) {
        sendToAgent(data.text.trim());
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(242,239,233,0.04)",
        border: "1px solid rgba(242,239,233,0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        height: "520px",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <audio ref={audioRef} />

      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(242,239,233,0.1)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: isRecording ? "#ef4444" : "var(--accent)",
          }}
        />
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {isRecording ? "listening..." : "front desk"}
        </p>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "2rem" }}>
            Say hello or type a message to get started.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.role === "user" ? "var(--accent)" : "rgba(242,239,233,0.08)",
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
      </div>

      <div style={{ padding: "0.9rem 1rem", borderTop: "1px solid rgba(242,239,233,0.1)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            width: "42px",
            height: "42px",
            flexShrink: 0,
            borderRadius: "50%",
            border: "none",
            background: isRecording ? "#ef4444" : "var(--accent)",
            color: "var(--bg)",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
          aria-label={isRecording ? "Stop talking" : "Start talking"}
        >
          🔔
        </button>

        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "0.7rem 0.9rem",
            borderRadius: "10px",
            border: "1px solid rgba(242,239,233,0.15)",
            background: "rgba(242,239,233,0.05)",
            color: "var(--text)",
            fontFamily: "var(--font-body)",
          }}
        />

        <button
          onClick={handleTextSend}
          disabled={sending}
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
    </div>
  );
}