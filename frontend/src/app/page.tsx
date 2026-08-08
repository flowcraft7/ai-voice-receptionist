"use client";
import { useEffect, useState, useRef } from "react";
import VoiceWidget from "./components/VoiceWidget";

type Service = { id: string; name: string; price: string; description: string };
type Business = { id: string; name: string; phone: string; location: string; hours: string; persona: string };

export default function Home() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("business_id") || "6a7aaff7-772a-4fb5-8394-6118a4424d5e";

    fetch(`http://localhost:8000/business/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBusiness(data.business);
        setServices(data.services || []);
      })
      .catch((err) => console.error("Failed to load business:", err));
  }, []);

  const scrollToChat = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="bg-blob" style={{ width: "400px", height: "400px", background: "#2DD4BF", top: "-100px", left: "-100px", animation: "float 18s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: "350px", height: "350px", background: "#818CF8", top: "40%", right: "-120px", animation: "float 22s ease-in-out infinite reverse" }} />
      <div className="bg-blob" style={{ width: "300px", height: "300px", background: "#F472B6", bottom: "-100px", left: "30%", animation: "float 25s ease-in-out infinite" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <section style={{ textAlign: "center", padding: "3.5rem 1.5rem 1.5rem" }}>
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>
            Front Desk
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.75rem" }}>
            {business ? business.name : "Loading..."}
          </h1>
          {business && (
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {business.hours} · {business.location}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={scrollToChat}
              style={{ padding: "0.7rem 1.4rem", borderRadius: "8px", border: "none", background: "var(--accent)", color: "var(--bg)", fontWeight: 600, cursor: "pointer" }}
            >
              Book Appointment
            </button>
            {business?.phone && (
              <a
                href={`tel:${business.phone}`}
                style={{ padding: "0.7rem 1.4rem", borderRadius: "8px", border: "1px solid var(--muted)", color: "var(--text)", fontWeight: 600, textDecoration: "none" }}
              >
                Call Now
              </a>
            )}
          </div>
        </section>

        <section style={{ maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem 2.5rem" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(45,212,191,0.15), rgba(129,140,248,0.15))",
              border: "1px solid var(--accent-soft)",
              borderRadius: "14px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s ease-in-out infinite", flexShrink: 0 }} />
            <p style={{ fontSize: "0.9rem" }}>
              <strong>New patient offer</strong> — 15% off your first visit when booked through this chat.
            </p>
          </div>
        </section>

        {services.length > 0 && (
          <section style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" }}>
            <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", textAlign: "center" }}>
              Services
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.9rem" }}>
              {services.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: "rgba(241,245,249,0.04)",
                    border: "1px solid rgba(241,245,249,0.1)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(241,245,249,0.1)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
                    <p style={{ fontWeight: 600 }}>{s.name}</p>
                    <p style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>{s.price}</p>
                  </div>
                  {s.description && <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section ref={chatRef} style={{ padding: "0 1.5rem 3rem" }}>
          <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", textAlign: "center" }}>
            Talk to us
          </h2>
          <VoiceWidget />
        </section>

        {business?.phone && (
          <footer style={{ textAlign: "center", padding: "1.5rem 1.5rem 3rem", borderTop: "1px solid rgba(241,245,249,0.08)" }}>
            <a
              href={`tel:${business.phone}`}
              style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", textDecoration: "underline" }}
            >
              or call us at {business.phone}
            </a>
          </footer>
        )}
      </div>
    </div>
  );
}