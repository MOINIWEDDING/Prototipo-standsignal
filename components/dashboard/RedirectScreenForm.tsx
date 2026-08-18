// components/dashboard/RedirectScreenForm.tsx
"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle, Upload, Image as ImageIcon, Video, X, Sparkles } from "lucide-react";
import { T } from "@/lib/theme";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function RedirectScreenForm({
  restaurantId,
  initialColor,
  initialImageUrl,
  initialVideoUrl,
}: {
  restaurantId: string;
  initialColor: string;
  initialImageUrl: string | null;
  initialVideoUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState(initialColor || "#111827");
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [uploadingWhich, setUploadingWhich] = useState<"image" | "video" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function uploadFile(file: File, kind: "image" | "video") {
    const maxSize = kind === "video" ? 15 * 1024 * 1024 : 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`El archivo no puede pesar más de ${kind === "video" ? "15MB" : "3MB"}.`);
      return;
    }
    setError(null);
    setUploadingWhich(kind);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploadingWhich(null);
      setError("Sesión expirada, recarga la página.");
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/redirect-bg-${kind}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("restaurant-assets").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    setUploadingWhich(null);

    if (uploadError) {
      setError("No se pudo subir el archivo: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("restaurant-assets").getPublicUrl(path);
    if (kind === "image") {
      setImageUrl(publicUrlData.publicUrl);
      setVideoUrl(null); // el video tiene prioridad sobre la imagen — solo uno activo a la vez
    } else {
      setVideoUrl(publicUrlData.publicUrl);
      setImageUrl(null);
    }
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
        fields: {
          redirect_bg_color: color,
          redirect_bg_image_url: imageUrl,
          redirect_bg_video_url: videoUrl,
        },
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

  const hasMedia = !!videoUrl || !!imageUrl;

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <Sparkles size={15} color={T.orange} />
        <div className="jk" style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Pantalla de redirección</div>
      </div>
      <div style={{ fontSize: 12, color: T.textFaint, marginBottom: 18, lineHeight: 1.5 }}>
        Lo que ve tu cliente durante medio segundo entre tocar el stand y llegar al menú —
        en vez de una pantalla en blanco, puede llevar tu color, tu imagen o un video de fondo.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 200px", gap: 24 }}>
        {/* -------- controles -------- */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
              Color de fondo
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color" value={color} onChange={(e) => setColor(e.target.value)}
                style={{ width: 44, height: 38, borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer", padding: 2, background: "transparent" }}
              />
              <input className="input-pill" value={color} onChange={(e) => setColor(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 5 }}>
              Se usa siempre como base, incluso si agregas imagen o video.
            </div>
          </div>

          <div>
            <label className="jk" style={{ fontSize: 12.5, fontWeight: 700, color: T.text, display: "block", marginBottom: 6 }}>
              Imagen o video de fondo <span style={{ fontWeight: 500, color: T.textFaint }}>(opcional, uno u otro)</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "image")} />
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={!!uploadingWhich} className="btn" style={{
                flex: 1, padding: "9px", background: imageUrl ? T.orangeSoft : T.bg, border: `1px solid ${imageUrl ? T.orange : T.border}`,
                color: imageUrl ? T.orange : T.text, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {uploadingWhich === "image" ? <Loader2 size={13} className="spin" /> : <ImageIcon size={13} />} Imagen
              </button>

              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], "video")} />
              <button type="button" onClick={() => videoInputRef.current?.click()} disabled={!!uploadingWhich} className="btn" style={{
                flex: 1, padding: "9px", background: videoUrl ? T.blueSoft : T.bg, border: `1px solid ${videoUrl ? T.blue : T.border}`,
                color: videoUrl ? T.blue : T.text, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                {uploadingWhich === "video" ? <Loader2 size={13} className="spin" /> : <Video size={13} />} Video
              </button>
            </div>

            {hasMedia && (
              <button
                type="button"
                onClick={() => { setImageUrl(null); setVideoUrl(null); }}
                style={{
                  marginTop: 8, background: "none", border: "none", cursor: "pointer", color: T.textFaint,
                  fontSize: 11.5, display: "flex", alignItems: "center", gap: 4, padding: 0,
                }}
              >
                <X size={12} /> Quitar {videoUrl ? "video" : "imagen"} y usar solo el color
              </button>
            )}
            <div style={{ fontSize: 10.5, color: T.textFaint, marginTop: 5 }}>
              Imagen hasta 3MB · Video hasta 15MB (mp4/webm, se reproduce en loop y sin sonido).
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#B5493A", display: "flex", gap: 6, alignItems: "center" }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={saving || !!uploadingWhich} style={{
            padding: "10px", fontSize: 13, background: T.orange, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
            {saving ? "Guardando…" : "Guardar pantalla de redirección"}
          </button>

          {saved && (
            <div className="fade-up" style={{ fontSize: 12, color: T.teal, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
              <Check size={13} /> Aplicado a todos tus stands
            </div>
          )}
        </form>

        {/* -------- preview en vivo -------- */}
        <div>
          <div className="mono" style={{ fontSize: 10, color: T.textFaint, marginBottom: 8 }}>VISTA PREVIA</div>
          <div style={{
            width: 200, height: 360, borderRadius: 20, border: `6px solid ${T.ink}`, overflow: "hidden",
            position: "relative", background: color,
          }}>
            {videoUrl && (
              <video src={videoUrl} autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {!videoUrl && imageUrl && (
              <img src={imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {(videoUrl || imageUrl) && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />}
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff", animation: "spin 0.7s linear infinite",
              }} />
              <div style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Abriendo el menú…</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
