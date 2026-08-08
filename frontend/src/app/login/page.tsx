"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      setError("Account created. Check your email if confirmation is required, then log in.");
      setIsSignup(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>
        {isSignup ? "Create account" : "Business login"}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "300px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.75rem", borderRadius: "6px", border: "none", background: "var(--muted)", color: "var(--bg)" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.75rem", borderRadius: "6px", border: "none", background: "var(--muted)", color: "var(--bg)" }}
        />
        <button
          type="submit"
          style={{ padding: "0.75rem", borderRadius: "6px", border: "none", background: "var(--accent)", color: "var(--bg)", fontWeight: 600, cursor: "pointer" }}
        >
          {isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      {error && <p style={{ color: "var(--accent)", fontSize: "0.85rem", maxWidth: "300px", textAlign: "center" }}>{error}</p>}

      <button
        onClick={() => setIsSignup(!isSignup)}
        style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}
      >
        {isSignup ? "Already have an account? Log in" : "New business? Sign up"}
      </button>
    </div>
  );
}