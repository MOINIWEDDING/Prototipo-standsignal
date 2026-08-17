// app/reset-password/confirm/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, AlertCircle, Loader2, Check } from "lucide-react";
import AuthLayout, { AUTH_TOKENS as T } from "@/components/AuthLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    // Esto solo funciona si el link de /auth/callback ya dejó una sesión de
    // recuperación activa en las cookies — si el usuario llegó aquí directo,
    // Supabase devuelve un error claro que mostramos abajo.
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1800);
  }

  if (done) {
    return (
      <AuthLayout eyebrow="LISTO" title="Contraseña actualizada" subtitle="Te llevamos a tu panel en un momento…">
        <div className="auth-fade" style={{
          display: "flex", alignItems: "center", gap: 10, background: T.blueSoft,
          border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, color: T.blue, fontWeight: 700, fontSize: 13.5,
        }}>
          <Check size={18} /> Contraseña actualizada correctamente
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="ÚLTIMO PASO" title="Crea una nueva contraseña" subtitle="Elige algo que no uses en otro lugar.">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
            Nueva contraseña
          </label>
          <div style={{ position: "relative" }}>
            <input
              className="auth-input" type={show ? "text" : "password"} required
              placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 42 }}
            />
            <button type="button" onClick={() => setShow((s) => !s)} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: T.textFaint, display: "flex",
            }}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
            Confirma la contraseña
          </label>
          <input
            className="auth-input" type={show ? "text" : "password"} required
            placeholder="Repite tu contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <div className="auth-fade" style={{
            display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(223,110,91,0.1)",
            border: "1px solid rgba(223,110,91,0.3)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "#B5493A",
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
          </div>
        )}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
          {loading ? "Guardando…" : "Guardar nueva contraseña"}
        </button>
      </form>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AuthLayout>
  );
}
