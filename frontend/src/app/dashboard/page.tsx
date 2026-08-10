"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Business = {
  id: string;
  name: string;
  persona: string;
  services: string;
  hours: string;
  location: string;
  phone: string;
};

type Service = {
  id: string;
  business_id: string;
  name: string;
  price: string;
  description: string;
};

type Appointment = {
  id: string;
  customer_name: string;
  requested_date: string;
  requested_time: string;
  notes: string;
  status: string;
};

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<Partial<Business>>({});
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: "", price: "", description: "" });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: biz } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (biz) {
      setBusiness(biz);
      setForm(biz);

      const { data: svc } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: true });
      setServices(svc || []);

      const { data: appts } = await supabase
        .from("appointments")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });
      setAppointments(appts || []);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("businesses")
      .update({
        name: form.name,
        persona: form.persona,
        services: form.services,
        hours: form.hours,
        location: form.location,
        phone: form.phone,
      })
      .eq("id", business.id);

    setSaving(false);
    setSaved(true);
    loadData();
    setTimeout(() => setSaved(false), 2000);
  };

  const addService = async () => {
    if (!business || !newService.name) return;

    await supabase.from("services").insert({
      business_id: business.id,
      name: newService.name,
      price: newService.price,
      description: newService.description,
    });

    setNewService({ name: "", price: "", description: "" });
    loadData();
  };

  const updateService = async (id: string, field: string, value: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const saveService = async (service: Service) => {
    await supabase
      .from("services")
      .update({ name: service.name, price: service.price, description: service.description })
      .eq("id", service.id);
  };

  const deleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    loadData();
  };

  const cancelAppointment = async (id: string) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const inputStyle = {
    padding: "0.6rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid rgba(242,237,228,0.15)",
    background: "rgba(242,237,228,0.05)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    width: "100%",
  };

  const labelStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    color: "var(--muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "0.35rem",
    display: "block",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--text)" }}>
          No business linked to this account yet.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "3rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{business.name}</h1>
        <button
          onClick={handleLogout}
          style={{ background: "none", border: "1px solid var(--muted)", color: "var(--muted)", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
        >
          Log out
        </button>
      </div>

      <div style={{ background: "var(--accent-soft)", border: "1px solid rgba(138,163,119,0.2)", borderRadius: "10px", padding: "1.25rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
          Your public page{' '}
          <a
            href={`https://ai-voice-receptionist-amber.vercel.app/widget/${business.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "0.9rem", wordBreak: "break-all" }}
          >
            https://ai-voice-receptionist-amber.vercel.app/widget/{business.id}
          </a>
        </p>
      </div>

      <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
        Business details
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem", background: "rgba(242,237,228,0.03)", padding: "1.5rem", borderRadius: "10px" }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Persona</label>
          <input style={inputStyle} value={form.persona || ""} onChange={(e) => setForm({ ...form, persona: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Hours</label>
          <input style={inputStyle} value={form.hours || ""} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "0.7rem", borderRadius: "6px", border: "none", background: "var(--accent)", color: "var(--bg)", fontWeight: 600, cursor: "pointer", marginTop: "0.5rem" }}
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
        Services & Prices
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {services.map((service) => (
          <div
            key={service.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 2fr auto",
              gap: "0.5rem",
              alignItems: "center",
              background: "rgba(242,237,228,0.05)",
              padding: "0.75rem",
              borderRadius: "8px",
            }}
          >
            <input
              style={inputStyle}
              value={service.name}
              onChange={(e) => updateService(service.id, "name", e.target.value)}
              onBlur={() => saveService(services.find((s) => s.id === service.id)!)}
            />
            <input
              style={inputStyle}
              value={service.price}
              onChange={(e) => updateService(service.id, "price", e.target.value)}
              onBlur={() => saveService(services.find((s) => s.id === service.id)!)}
            />
            <input
              style={inputStyle}
              value={service.description || ""}
              onChange={(e) => updateService(service.id, "description", e.target.value)}
              onBlur={() => saveService(services.find((s) => s.id === service.id)!)}
            />
            <button
              onClick={() => deleteService(service.id)}
              style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "0.5rem", borderRadius: "6px", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 2fr auto",
          gap: "0.5rem",
          alignItems: "center",
          background: "var(--accent-soft)",
          padding: "0.75rem",
          borderRadius: "8px",
          marginBottom: "2.5rem",
        }}
      >
        <input
          style={inputStyle}
          placeholder="Service name"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Price"
          value={newService.price}
          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
        />
        <input
          style={inputStyle}
          placeholder="Description"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
        />
        <button
          onClick={addService}
          style={{ background: "var(--accent)", border: "none", color: "var(--bg)", padding: "0.5rem 0.75rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
        >
          Add
        </button>
      </div>

      <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
        Appointments
      </h2>

      {appointments.length === 0 && (
        <p style={{ color: "var(--muted)" }}>No appointments yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {appointments.map((appt) => (
          <div
            key={appt.id}
            style={{
              background: "rgba(242,237,228,0.05)",
              border: "1px solid rgba(242,237,228,0.1)",
              borderRadius: "8px",
              padding: "1rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: appt.status === "cancelled" ? 0.4 : 1,
            }}
          >
            <div>
              <p style={{ fontWeight: 600 }}>{appt.customer_name}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--muted)" }}>
                {appt.requested_date} — {appt.requested_time}
              </p>
              {appt.notes && <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.25rem" }}>{appt.notes}</p>}
              <p style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "0.25rem", textTransform: "uppercase" }}>{appt.status}</p>
            </div>

            {appt.status !== "cancelled" && (
              <button
                onClick={() => cancelAppointment(appt.id)}
                style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}