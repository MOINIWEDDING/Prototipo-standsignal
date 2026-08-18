// components/dashboard/RestaurantProfileForm.tsx
"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle, Upload, Building2, Clock } from "lucide-react";
import { T } from "@/lib/theme";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const TIMEZONES = [
  { value: "America/Santo_Domingo", label: "República Dominicana (GMT-4)" },
  { value: "America/New_York", label: "Nueva York / Miami (ET)" },
  { value: "America/Mexico_City", label: "Ciudad de México (CT)" },
  { value: "America/Bogota", label: "Bogotá / Lima / Quito (GMT-5)" },
  { value: "America/Santiago", label: "Santiago de Chile" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { value: "America/Caracas", label: "Caracas" },
  { value: "Europe/Madrid", label: "Madrid" },
];

export default function RestaurantProfileForm({
  restaurantId,
  initialName,
  initialLogoUrl,
  initialTimezone,
}: {
  restaurantId: string;
  initialName: string;
  initialLogoUrl: string | null;
  initialTimezone: string;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [timezone, setTimezone] = useState(initialTimezone || "America/Santo_Domingo");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("El logo no puede pesar más de 2MB.");
      return;
    }
    setError(null);
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      setError("Sesión expirada, recarga la página.");
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("restaurant-assets").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    setUploading(false);

    if (uploadError) {
      setError("No se pudo subir el logo: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("restaurant-assets").getPublicUrl(path);
    setLogoUrl(publicUrlData.publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/restaurant/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        fields: { name: name.trim(), logo_url: logoUrl, timezone },
      }),
    });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error || "No se pudo guardar.");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="card" style={{ padding: 24, maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <Building2 size={15} color={T.blue} />
        <div className="jk" style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Perfil del restaurante</div>
      </div>
      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 18 }}>
        El nombre y el logo también se usan en el panel — reemplazan la marca "StandSignal" por la tuya.
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* -------- logo -------- */}
        <div>
          <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, marginBottom: 8 }}>LOGO</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
            }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Building2 size={22} color={T.textFaint} />
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              <button
                type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="btn" style={{
                  padding: "8px 14px", background: T.bg, border: `1px solid ${T.border}`, color: T.text,
                  fontSize: 12.5, display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {uploading ? <Loader2 size={13} className="spin" /> : <Upload size={13} />}
                {uploading ? "Subiendo…" : "Subir logo"}
              </button>
              <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 5 }}>Cuadrado, hasta 2MB. Se ajusta solo.</div>
            </div>
          </div>
        </div>

        {/* -------- nombre -------- */}
        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
            Nombre del restaurante
          </label>
          <input className="input-pill" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        {/* -------- zona horaria -------- */}
        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Clock size={12} /> Zona horaria
          </label>
          <select className="select-pill" style={{ width: "100%" }} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
          <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 5 }}>
            Determina la hora exacta que ves en "Horarios pico" del Resumen.
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#B5493A", display: "flex", gap: 6, alignItems: "center" }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <button type="submit" className="btn" disabled={saving || uploading} style={{
          padding: "10px", fontSize: 13, background: T.blue, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
          {saving ? "Guardando…" : "Guardar perfil"}
        </button>

        {saved && (
          <div className="fade-up" style={{ fontSize: 12, color: T.teal, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Check size={13} /> Perfil actualizado
          </div>
        )}
      </form>
    </div>
  );
}
