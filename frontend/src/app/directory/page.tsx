"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Business = { id: string; name: string; hours: string; location: string; phone: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/businesses`)
      .then((res) => res.json())
      .then((data) => setBusinesses(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
      <Link href="/" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", textDecoration: "none" }}>
        ← Back home
      </Link>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginTop: "1rem", marginBottom: "0.5rem" }}>
        Browse Businesses
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Talk to any business's AI receptionist directly.
      </p>

      {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}

      {!loading && businesses.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No businesses listed yet.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {businesses.map((biz) => (
          <Link
            key={biz.id}
            href={`/widget/${biz.id}`}
            style={{
              display: "block",
              background: "rgba(242,237,228,0.05)",
              border: "1px solid rgba(242,237,228,0.12)",
              borderRadius: "12px",
              padding: "1.25rem",
              textDecoration: "none",
              color: "var(--text)",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(242,237,228,0.12)";
            }}
          >
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.4rem" }}>
              {biz.name}
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--muted)" }}>
              {biz.hours} {biz.location && `· ${biz.location}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}