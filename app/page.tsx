// app/page.tsx
//
// Landing pública en "/". Antes esta ruta redirigía directo a /dashboard;
// ahora es la página de marketing que ve cualquiera sin sesión. El acceso
// al panel vive en el botón "Iniciar sesión" de la barra superior.

import Link from "next/link";
import {
  Clock, FileCheck2, Wallet, ShieldCheck, Phone, Mail, ArrowRight,
} from "lucide-react";
import LandingNav from "@/components/landing/LandingNav";
import LandingGlobalStyles from "@/components/landing/LandingGlobalStyles";
import Reveal from "@/components/dashboard/Reveal";
import HeroFlowIllustration from "@/components/dashboard/about/HeroFlowIllustration";
import {
  IllustrationRealtime, IllustrationHeatmap, IllustrationPeakHours,
  IllustrationQr, IllustrationCustomize, IllustrationTraining,
  IllustrationSupport, IllustrationReplace, IllustrationGrowth,
} from "@/components/dashboard/about/FeatureIllustrations";
import { T } from "@/lib/theme";
import { PRICING_TIERS, INSTALLATION_FEE_RD, formatRD } from "@/lib/pricing";

const FEATURES = [
  { icon: IllustrationRealtime, title: "Estadísticas en tiempo real", text: "Interacciones por punto NFC y por ubicación, al momento, sin esperar cierre de mes." },
  { icon: IllustrationHeatmap, title: "Mapa de calor de mesas", text: "Qué mesas y zonas concentran más actividad y cuáles pasan desapercibidas. Sirve para redistribuir el salón y asignar personal." },
  { icon: IllustrationPeakHours, title: "Horarios pico", text: "Cuándo se concentra el uso durante el día y la semana, para ajustar turnos y promociones a las horas flojas." },
  { icon: IllustrationQr, title: "QR de respaldo", text: "Cada stand lleva su código QR. El cliente con un teléfono sin NFC accede igual, y nadie se queda fuera de la experiencia." },
  { icon: IllustrationCustomize, title: "Personalización", text: "Pantallas, enlaces y diseño de la experiencia adaptados a la identidad del restaurante, no a una plantilla genérica." },
];

const INCLUDED = [
  { icon: IllustrationTraining, title: "Capacitación inicial", text: "Sesiones con tu equipo para explicar cómo funciona StandSignal, cómo se lee el tablero y qué hacer con los datos. Presencial, en tu local." },
  { icon: IllustrationSupport, title: "Soporte", text: "Si algo falla, lo resolvemos. Estamos atentos al sistema y atendemos cualquier incidencia hasta dejarla cerrada." },
  { icon: IllustrationReplace, title: "Reposición sin costo", text: "Un stand que se dañe, se despegue o desaparezca se reemplaza sin cargo adicional. El desgaste corre por nuestra cuenta." },
  { icon: IllustrationGrowth, title: "Crecimiento incluido", text: "Suma stands cuando quieras. Mientras el total se mantenga dentro del rango contratado, la mensualidad es la misma." },
];

export default function LandingPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <LandingGlobalStyles />
      <div style={{ background: "#0F1420" }}>
        <LandingNav />

        {/* ============================= HERO ============================= */}
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 64px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
            <div className="jk pill" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", marginBottom: 18 }}>
              Stands NFC + software de analítica
            </div>
            <h1 className="jk" style={{ fontSize: "clamp(28px, 4.5vw, 42px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>
              El menú de papel, convertido en datos que puedes usar
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, margin: "0 0 28px" }}>
              Stands NFC en las mesas, conectados a StandSignal — nuestro software de analítica —
              bajo una sola mensualidad. Instalación, capacitación, soporte y reposición incluidos.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="#contacto" className="btn jk" style={{
                padding: "13px 24px", fontSize: 14, background: `linear-gradient(90deg, ${T.blue}, ${T.teal})`,
                color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                Hablar con nosotros <ArrowRight size={15} />
              </a>
              <Link href="/login" className="btn jk" style={{
                padding: "13px 24px", fontSize: 14, background: "rgba(255,255,255,0.1)",
                color: "#fff", textDecoration: "none",
              }}>
                Ya soy cliente — iniciar sesión
              </Link>
            </div>
          </div>

          <Reveal>
            <HeroFlowIllustration />
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 80px", display: "flex", flexDirection: "column", gap: 56 }}>
        {/* ============================= LO ESENCIAL ============================= */}
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <MiniStat icon={<ShieldCheck size={16} color={T.blue} />} label="Instalación" value={formatRD(INSTALLATION_FEE_RD)} sub="pago único, cualquier tamaño" />
            <MiniStat icon={<Wallet size={16} color={T.teal} />} label="Mensualidad" value="Desde RD$15,000" sub="según tu rango de stands" />
            <MiniStat icon={<Clock size={16} color={T.orange} />} label="Puesta en marcha" value="7 días" sub="desde la firma" />
            <MiniStat icon={<FileCheck2 size={16} color={T.coral} />} label="Permanencia" value="Ninguna" sub="cancela con 30 días de aviso" />
          </div>
        </Reveal>

        {/* ============================= POR QUÉ ============================= */}
        <Reveal>
          <div className="card" style={{ padding: 32 }}>
            <div className="jk" style={{ fontSize: 19, fontWeight: 800, color: T.ink, marginBottom: 14 }}>
              Por qué le sirve a un restaurante
            </div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8 }}>
              Hoy lo que pasa en el salón vive en la cabeza del gerente de turno. Se sabe que hay mesas que
              rotan más, que hay horas fuertes y horas muertas, y que la mayoría de los clientes satisfechos
              se van sin dejar una reseña. Todo eso es información valiosa que nadie está capturando.
              <br /><br />
              El stand NFC convierte cada mesa en un punto de contacto medible. El cliente acerca el teléfono
              al stand y entra directo a donde ustedes decidan: el menú, una reseña de Google, una promoción
              del día, una encuesta corta. No hay que descargar nada. Del otro lado, ustedes ven qué mesas se
              usan, a qué hora y con qué frecuencia.
            </div>
          </div>
        </Reveal>

        {/* ============================= FEATURES ============================= */}
        <div>
          <Reveal><SectionHeader eyebrow="EL SOFTWARE INCLUIDO" title="StandSignal, en la práctica" /></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 20 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <FeatureCard Icon={f.icon} title={f.title} text={f.text} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ============================= QUÉ INCLUYE ============================= */}
        <div>
          <Reveal><SectionHeader eyebrow="SIN COSTOS ESCONDIDOS" title="Qué incluye el servicio" /></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 20 }}>
            {INCLUDED.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <div className="card" style={{ padding: 20, height: "100%" }}>
                  <item.icon />
                  <div className="jk" style={{ fontSize: 13.5, fontWeight: 800, color: T.ink, marginTop: 14, marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6 }}>{item.text}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ============================= PRECIOS ============================= */}
        <div id="planes">
          <Reveal><SectionHeader eyebrow="CÓMO CRECE SIN QUE SUBA LA CUOTA" title="Rangos y mensualidad" /></Reveal>
          <Reveal delay={80}>
            <div style={{ fontSize: 13.5, color: T.textDim, lineHeight: 1.7, marginTop: 12, marginBottom: 24, maxWidth: 640 }}>
              No cobramos por stand, cobramos por rango. Un salón que arranca con 70 stands y luego suma mesas,
              terraza o una barra nueva hasta llegar a 100 sigue pagando lo mismo. Solo al pasar de 100 se mueve
              al siguiente nivel.
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PRICING_TIERS.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 60}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 14,
                  background: T.card, border: `1.5px solid ${T.border}`, flexWrap: "wrap",
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: tier.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 130 }}>
                    <div className="jk" style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{tier.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: T.textFaint }}>{tier.minStands}–{tier.maxStands} stands</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  <div className="jk" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{formatRD(tier.monthlyPriceRD)}<span style={{ fontSize: 11, fontWeight: 500, color: T.textFaint }}> /mes</span></div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div style={{ marginTop: 18, padding: "16px 20px", borderRadius: 14, background: T.blueSoft, fontSize: 12.5, color: T.text, lineHeight: 1.7 }}>
              <b>Ejemplo:</b> una cadena con 70 stands entra en el rango Business. Paga {formatRD(INSTALLATION_FEE_RD)} el
              primer mes y {formatRD(25000)} los meses siguientes — y puede llegar hasta 100 stands sin que la cuota se mueva.
              Si el grupo tiene más de un local, el conteo total de stands de todas las sucursales define el rango.
            </div>
          </Reveal>
        </div>

        {/* ============================= CONDICIONES ============================= */}
        <div>
          <Reveal><SectionHeader eyebrow="LETRA CLARA" title="Condiciones del servicio" /></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 20 }}>
            <Reveal delay={0}><ConditionCard title="Forma de pago" text="Instalación al firmar. Mensualidad a partir del siguiente mes, facturada el mismo día de cada mes." /></Reveal>
            <Reveal delay={70}><ConditionCard title="Permanencia" text="Sin permanencia mínima. Para terminar el servicio basta un aviso con 30 días de antelación." /></Reveal>
            <Reveal delay={140}><ConditionCard title="Propiedad de los datos" text="La información que genera tu salón es tuya, y se entrega exportada si el servicio termina." /></Reveal>
          </div>
        </div>

        {/* ============================= CONTACTO ============================= */}
        <Reveal>
          <div id="contacto">
            <SectionHeader eyebrow="¿EMPEZAMOS?" title="Habla con nosotros" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginTop: 20 }}>
              <ContactCard name="Carlos Rosario" role="CEO StandSignal" phone="+1 (829) 773-7231" email="rosariosanchezc066@gmail.com" color={T.blue} />
              <ContactCard name="Moisés Fermín" role="CEO StandSignal" phone="+1 (829) 584-0103" email="asaferwork@outlook.com" color={T.teal} />
            </div>
          </div>
        </Reveal>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, padding: "24px", textAlign: "center", fontSize: 12, color: T.textFaint }}>
        © {new Date().getFullYear()} StandSignal — <Link href="/login" style={{ color: T.textFaint }}>Iniciar sesión</Link>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, color: T.textFaint, letterSpacing: 0.6, marginBottom: 6 }}>{eyebrow}</div>
      <div className="jk" style={{ fontSize: 19, fontWeight: 800, color: T.ink }}>{title}</div>
    </div>
  );
}
function MiniStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>{icon}<span style={{ fontSize: 11.5, color: T.textDim, fontWeight: 600 }}>{label}</span></div>
      <div className="jk" style={{ fontSize: 19, fontWeight: 800, color: T.ink }}>{value}</div>
      <div style={{ fontSize: 11, color: T.textFaint, marginTop: 3 }}>{sub}</div>
    </div>
  );
}
function FeatureCard({ Icon, title, text }: { Icon: React.ComponentType; title: string; text: string }) {
  return (
    <div className="card landing-feature-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <Icon />
      <div>
        <div className="jk" style={{ fontSize: 14.5, fontWeight: 800, color: T.ink, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: T.textDim, lineHeight: 1.6 }}>{text}</div>
      </div>
      <style>{`.landing-feature-card { transition: transform .25s ease, box-shadow .25s ease; } .landing-feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -14px rgba(28,39,64,0.18); }`}</style>
    </div>
  );
}
function ConditionCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card" style={{ padding: 20, height: "100%" }}>
      <div className="jk" style={{ fontSize: 13.5, fontWeight: 800, color: T.ink, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}
function ContactCard({ name, role, phone, email, color }: { name: string; role: string; phone: string; email: string; color: string }) {
  return (
    <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
      <div className="jk" style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>
        {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="jk" style={{ fontSize: 13.5, fontWeight: 800, color: T.ink }}>{name}</div>
        <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 6 }}>{role}</div>
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text, textDecoration: "none", marginBottom: 2 }}><Phone size={11} color={color} /> {phone}</a>
        <a href={`mailto:${email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text, textDecoration: "none" }}><Mail size={11} color={color} /> {email}</a>
      </div>
    </div>
  );
}
