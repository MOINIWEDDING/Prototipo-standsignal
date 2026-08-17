// app/reset-password/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, MailCheck, AlertCircle } from "lucide-react";
import AuthLayout, { AUTH_TOKENS as T } from "@/components/AuthLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="REVISA TU CORREO" title="Enlace enviado" subtitle="Sigue las instrucciones para continuar.">
        <div
          className="auth-fade"
          style={{
            background: T.blueSoft, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}
        >
          <MailCheck size={20} color={T.blue} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>
            Si <b>{email}</b> tiene una cuenta con nosotros, te enviamos un enlace para
            restablecer tu contraseña. Puede tardar un par de minutos en llegar.
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: T.textDim }}>
          <Link href="/login" className="auth-link">Volver a iniciar sesión</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="RECUPERAR ACCESO"
      title="¿Olvidaste tu contraseña?"
      subtitle="Te mandamos un enlace a tu correo para crear una nueva."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
            Correo electrónico
          </label>
          <input
            className="auth-input" type="email" required autoComplete="email"
            placeholder="tucorreo@restaurante.com" value={email} onChange={(e) => setEmail(e.target.value)}
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
          {loading ? <Loader2 size={16} className="spin" /> : <Mail size={16} />}
          {loading ? "Enviando…" : "Enviar enlace de recuperación"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: T.textDim }}>
        <Link href="/login" className="auth-link">Volver a iniciar sesión</Link>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AuthLayout>
  );
}
