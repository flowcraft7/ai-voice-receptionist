"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setError("Password reset link sent. Check your email.");
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (userId) {
        await supabase.from("businesses").insert({
          user_id: userId,
          name: businessName || "My Business",
          persona: "Friendly and professional",
          hours: "Mon-Sat 9am-6pm",
          location: "",
          phone: "",
        });
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (!loginError) {
        router.push("/dashboard");
        return;
      }
      setError("Account created. Please log in.");
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", position: "relative" }}>
      <div className="bg-blob" style={{ width: "350px", height: "350px", background: "var(--accent)", top: "-80px", left: "-80px", animation: "float 18s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: "300px", height: "300px", background: "var(--accent2)", bottom: "-100px", right: "-80px", animation: "float 22s ease-in-out infinite reverse" }} />

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", position: "relative", zIndex: 1, textAlign: "center" }}>
        {mode === "signup" ? "Create your business account" : mode === "forgot" ? "Reset your password" : "Business login"}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "320px", position: "relative", zIndex: 1 }}>
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(242,237,228,0.15)", background: "rgba(242,237,228,0.05)", color: "var(--text)" }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(242,237,228,0.15)", background: "rgba(242,237,228,0.05)", color: "var(--text)" }}
        />
        {mode !== "forgot" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(242,237,228,0.15)", background: "rgba(242,237,228,0.05)", color: "var(--text)" }}
          />
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.75rem", borderRadius: "8px", border: "none", background: "var(--accent)", color: "var(--bg)", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Please wait..." : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
        </button>
      </form>

      {error && <p style={{ color: "var(--accent)", fontSize: "0.85rem", maxWidth: "320px", textAlign: "center", position: "relative", zIndex: 1 }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", position: "relative", zIndex: 1 }}>
        {mode === "login" && (
          <>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}
            >
              New business? Sign up
            </button>
            <button
              onClick={() => { setMode("forgot"); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Forgot password?
            </button>
          </>
        )}
        {mode !== "login" && (
          <button
            onClick={() => { setMode("login"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}
          >
            Back to login
          </button>
        )}
      </div>
    </div>
  );
}