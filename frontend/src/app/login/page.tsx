"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup) {
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
      setIsSignup(false);
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
      <div className="bg-blob" style={{ width: "350px", height: "350px", background: "#2DD4BF", top: "-80px", left: "-80px", animation: "float 18s ease-in-out infinite" }} />
      <div className="bg-blob" style={{ width: "300px", height: "300px", background: "#818CF8", bottom: "-100px", right: "-80px", animation: "float 22s ease-in-out infinite reverse" }} />

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", position: "relative", zIndex: 1 }}>
        {isSignup ? "Create your business account" : "Business login"}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "320px", position: "relative", zIndex: 1 }}>
        {isSignup && (
          <input
            type="text"
            placeholder="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(241,245,249,0.15)", background: "rgba(241,245,249,0.05)", color: "var(--text)" }}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(241,245,249,0.15)", background: "rgba(241,245,249,0.05)", color: "var(--text)" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(241,245,249,0.15)", background: "rgba(241,245,249,0.05)", color: "var(--text)" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.75rem", borderRadius: "8px", border: "none", background: "var(--accent)", color: "var(--bg)", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      {error && <p style={{ color: "var(--accent)", fontSize: "0.85rem", maxWidth: "320px", textAlign: "center", position: "relative", zIndex: 1 }}>{error}</p>}

      <button
        onClick={() => setIsSignup(!isSignup)}
        style={{ background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem", position: "relative", zIndex: 1 }}
      >
        {isSignup ? "Already have an account? Log in" : "New business? Sign up"}
      </button>
    </div>
  );
}