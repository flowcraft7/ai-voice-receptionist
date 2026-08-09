"use client";
import { useEffect, useState, useRef } from "react";

// Lightweight client-side fallback for `useParams` when Next types aren't available.
function useParams() {
  if (typeof window === "undefined") return {} as { business_id?: string };
  const params = new URLSearchParams(window.location.search);
  return { business_id: params.get("business_id") || undefined };
}
import VoiceWidget from "../../components/VoiceWidget";

type Service = { id: string; name: string; price: string; description: string };
type Business = { id: string; name: string; phone: string; location: string; hours: string; persona: string };

export default function WidgetPage() {
  const params = useParams();
  const businessId = params.business_id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!businessId) return;
    fetch(`http://localhost:8000/business/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        setBusiness(data.business);
        setServices(data.services || []);
      })
      .catch((err) => console.error("Failed to load business:", err));
  }, [businessId]);

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
          <VoiceWidget businessId={businessId} />
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