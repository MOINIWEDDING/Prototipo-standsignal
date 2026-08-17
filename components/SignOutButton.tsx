// components/SignOutButton.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={`nav-item ${className || ""}`} onClick={handleSignOut} style={{ cursor: loading ? "default" : "pointer" }}>
      {loading ? <Loader2 size={17} className="spin" /> : <LogOut size={17} />}
      {loading ? "Saliendo…" : "Cerrar sesión"}
      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
