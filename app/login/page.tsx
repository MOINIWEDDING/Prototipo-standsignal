// app/login/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";
import AuthLayout, { AUTH_TOKENS as T } from "@/components/AuthLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// 1. Extraemos la lógica del login a un componente hijo
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos. Verifica e intenta de nuevo."
          : signInError.message
      );
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <AuthLayout
      eyebrow="BIENVENIDO DE VUELTA"
      title="Inicia sesión"
      subtitle="Entra a tu panel para ver cómo se mueve tu negocio hoy."
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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

        <Field
          label="Contraseña"
          trailing={
            <Link href="/reset-password" className="auth-link" style={{ fontSize: 12.5 }}>
              ¿La olvidaste?
            </Link>
          }
        >
          <div style={{ position: "relative" }}>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textFaint,
                display: "flex",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {error && (
          <div
            className="auth-fade"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "rgba(223,110,91,0.1)",
              border: "1px solid rgba(223,110,91,0.3)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12.5,
              color: "#B5493A",
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />}
          {loading ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 22, fontSize: 13.5, color: T.textDim }}>
        ¿No tienes cuenta todavía?{" "}
        <Link href="/signup" className="auth-link">
          Crea una gratis
        </Link>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AuthLayout>
  );
}

// 2. El componente principal que Vercel intentará compilar envuelve todo en <Suspense>
export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}>
          Cargando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

// 3. El componente Field se queda igual
function Field({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text }}>
          {label}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  );
}
