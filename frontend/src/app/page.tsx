"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 2rem", position: "relative", zIndex: 2 }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600 }}>Front Desk</p>
        <button
          onClick={() => router.push("/login")}
          className="btn-outline"
          style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "1px solid var(--accent)", background: "transparent", color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
        >
          Business Login
        </button>
      </nav>

      <main style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "3rem", padding: "2rem 4rem 6rem", maxWidth: "1300px", margin: "0 auto" }}>
        <div style={{ flex: "1 1 420px", position: "relative", zIndex: 2 }}>
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1rem" }}>
            AI Voice & Chat Receptionist
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4.5vw, 3.3rem)", lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Never miss a booking again
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", maxWidth: "460px", marginBottom: "2rem" }}>
            Give your business an AI front desk that talks to customers, answers questions about your services and prices, and books appointments — day or night.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="btn-primary"
            style={{ padding: "0.85rem 1.8rem", borderRadius: "10px", border: "none", background: "var(--accent)", color: "var(--bg)", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}
          >
            Get Started — It's Free
          </button>

          <div style={{ display: "flex", gap: "2.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--accent)" }}>24/7</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Always answering</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--accent)" }}>Voice + Chat</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Customers choose</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--accent)" }}>Any language</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Auto-detects & replies</p>
            </div>
          </div>
        </div>

        <div style={{ flex: "1 1 420px", position: "relative", minHeight: "560px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="mockup-card"
            style={{
              width: "300px",
              background: "rgba(242,237,228,0.05)",
              border: "1px solid rgba(242,237,228,0.12)",
              borderRadius: "18px",
              padding: "1.25rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: "float-card 5s ease-in-out infinite",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--accent)" }} />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Your Business Name</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.7rem", background: "var(--accent-soft)", border: "1px solid rgba(138,163,119,0.3)", borderRadius: "999px", padding: "0.3rem 0.7rem", color: "var(--accent)" }}>Your Service · $Price</span>
            </div>
            <div style={{ background: "var(--accent)", color: "var(--bg)", borderRadius: "12px", padding: "0.5rem 0.8rem", fontSize: "0.85rem", maxWidth: "80%", marginLeft: "auto", marginBottom: "0.5rem" }}>
              Book me for Friday 3pm
            </div>
            <div style={{ background: "rgba(242,237,228,0.08)", borderRadius: "12px", padding: "0.5rem 0.8rem", fontSize: "0.85rem", maxWidth: "85%" }}>
              You're all set for Friday at 3pm ✓
            </div>
          </div>

          <div
            className="hover-badge"
            style={{
              position: "absolute",
              top: "20px",
              left: "-10px",
              background: "var(--accent-soft)",
              border: "1px solid rgba(138,163,119,0.3)",
              borderRadius: "12px",
              padding: "0.6rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--accent)",
              animation: "float-badge 4s ease-in-out infinite",
              zIndex: 3,
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            ✓ Appointment confirmed
          </div>

          <div
            className="hover-badge"
            style={{
              position: "absolute",
              bottom: "60px",
              right: "-10px",
              background: "rgba(201,161,90,0.12)",
              border: "1px solid rgba(201,161,90,0.3)",
              borderRadius: "12px",
              padding: "0.6rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--accent2)",
              animation: "float-badge 5s ease-in-out infinite 1s",
              zIndex: 3,
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            💬 Instant reply
          </div>

          <div
            className="hover-badge"
            style={{
              position: "absolute",
              bottom: "-10px",
              left: "20px",
              background: "rgba(242,237,228,0.08)",
              border: "1px solid rgba(242,237,228,0.2)",
              borderRadius: "12px",
              padding: "0.6rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text)",
              animation: "float-badge 4.5s ease-in-out infinite 0.5s",
              zIndex: 3,
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            🌐 Speaks Urdu & English
          </div>

          <div className="bg-blob" style={{ width: "280px", height: "280px", background: "var(--accent)", top: "10%", right: "5%", animation: "float 20s ease-in-out infinite" }} />
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", position: "relative", zIndex: 2 }}>
        Set up your own AI receptionist in minutes.
      </footer>
    </div>
  );
}