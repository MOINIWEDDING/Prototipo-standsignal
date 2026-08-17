// app/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, AlertCircle, Loader2, MailCheck, Check } from "lucide-react";
import AuthLayout, { AUTH_TOKENS as T } from "@/components/AuthLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const strength = passwordStrength(password);
  const strengthLabel = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"][strength];
  const strengthColor = [T.coral, T.coral, T.orange, T.teal, T.teal][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError("Acepta los términos para continuar.");
      return;
    }
    if (strength < 2) {
      setError("Usa una contraseña un poco más segura (mínimo 8 caracteres).");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { restaurant_name: restaurantName.trim() } },
    });

    if (signUpError) {
      setLoading(false);
      setError(
        signUpError.message.includes("already registered")
          ? "Ya existe una cuenta con ese correo. Intenta iniciar sesión."
          : signUpError.message
      );
      return;
    }

    // Si la confirmación de correo está desactivada en Supabase, ya hay sesión
    // activa aquí mismo -> aprovisionamos el restaurante y entramos directo.
    if (data.session && data.user) {
      const { error: insertError } = await supabase.from("restaurants").insert({
        owner_id: data.user.id,
        name: restaurantName.trim() || "Mi restaurante",
        menu_url: "https://",
      });

      setLoading(false);

      if (insertError) {
        setError("Tu cuenta se creó, pero hubo un problema al configurar el restaurante: " + insertError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Confirmación de correo activada -> el usuario debe verificar antes de entrar.
    // El restaurante se crea en el primer login (o vía trigger de Supabase).
    setLoading(false);
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <AuthLayout
        eyebrow="CASI LISTO"
        title="Revisa tu correo"
        subtitle="Te enviamos un enlace de confirmación."
      >
        <div
          className="auth-fade"
          style={{
            background: T.blueSoft,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 20,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <MailCheck size={20} color={T.blue} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>
            Enviamos un enlace de confirmación a <b>{email}</b>. Ábrelo desde tu teléfono o
            computadora para activar tu cuenta y configurar tu primer restaurante.
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: T.textDim }}>
          ¿Ya confirmaste?{" "}
          <Link href="/login" className="auth-link">
            Inicia sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="EMPIEZA GRATIS"
      title="Crea tu cuenta"
      subtitle="Configura tu primer restaurante en menos de dos minutos."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Nombre del restaurante">
          <input
            className="auth-input"
            type="text"
            required
            placeholder="El Faro"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
          />
        </Field>

        <Field label="Correo electrónico">
          <input
            className="auth-input"
            type="email"
            required
            autoComplete="email"
            placeholder="tucorreo@restaurante.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Contraseña">
          <div style={{ position: "relative" }}>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: T.textFaint, display: "flex",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="auth-fade" style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: i < strength ? strengthColor : T.border,
                      transition: "background .2s ease",
                    }}
                  />
                ))}
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: strengthColor }}>{strengthLabel}</div>
            </div>
          )}
        </Field>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer", marginTop: 2 }}>
          <div
            onClick={() => setAcceptedTerms((v) => !v)}
            style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
              border: `1.5px solid ${acceptedTerms ? T.blue : T.border}`,
              background: acceptedTerms ? T.blue : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s ease",
            }}
          >
            {acceptedTerms && <Check size={12} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{ fontSize: 12.5, color: T.textDim, lineHeight: 1.5 }}>
            Acepto los <span className="auth-link">Términos de servicio</span> y la{" "}
            <span className="auth-link">Política de privacidad</span> de StandSignal.
          </span>
        </label>

        {error && (
          <div
            className="auth-fade"
            style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              background: "rgba(223,110,91,0.1)", border: "1px solid rgba(223,110,91,0.3)",
              borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "#B5493A",
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />}
          {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: T.textDim }}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="auth-link">
          Inicia sesión
        </Link>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AuthLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
