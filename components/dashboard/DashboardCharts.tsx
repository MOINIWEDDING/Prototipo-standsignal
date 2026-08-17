// components/dashboard/DashboardCharts.tsx
"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import {
  Radio, Clock, TrendingUp, TrendingDown, Table2, QrCode, Smartphone,
  Signal, Apple, Bot, Server,
} from "lucide-react";
import { T } from "@/lib/theme";
import type { buildDashboardAggregates } from "@/lib/queries";

type Aggregates = ReturnType<typeof buildDashboardAggregates>;

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "ahora";
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m}min`;
  return `hace ${Math.floor(m / 60)}h`;
}

export default function DashboardCharts({ data }: { data: Aggregates }) {
  const {
    todayCount, delta, deltaPct, tableStats, maxTableCount,
    hourlyStats, peakHour, mediumStats, osStats, nfcSharePct, recentEvents,
  } = data;

  const deadTables = tableStats.filter((t) => t.count === 0 || t.count < maxTableCount * 0.15);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.15fr)", gap: 16 }}>
        <StatCard label="Escaneos hoy" value={todayCount} icon={<Radio size={16} color={T.blue} />} accent={T.blueSoft}
          sub={<DeltaTag delta={delta} pct={deltaPct} />} />
        <StatCard label="Total (3 días)" value={data.totalEvents} icon={<Server size={16} color={T.textDim} />} accent={T.bg}
          sub={<span style={{ fontSize: 12, color: T.textFaint }}>eventos registrados</span>} />
        <StatCard label="Hora pico" value={peakHour.label} icon={<TrendingUp size={16} color={T.orange} />} accent={T.orangeSoft}
          sub={<span style={{ fontSize: 12, color: T.textFaint }}>{peakHour.count} escaneos acumulados</span>} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 18 }}>
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle icon={<Table2 size={15} color={T.orange} />} title="Mapa de calor de mesas" sub="Ranking de actividad, últimos 3 días" />
          {tableStats.length === 0 ? (
            <EmptyHint text="Todavía no hay mesas creadas. Agrégalas en 'Mesas y stands'." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              {tableStats.map((t, i) => {
                const pct = Math.max(4, Math.round((t.count / maxTableCount) * 100));
                const dead = t.count < maxTableCount * 0.15;
                return (
                  <div key={t.table} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="mono" style={{ width: 16, fontSize: 11, color: T.textFaint }}>{i + 1}</div>
                    <div className="jk" style={{ width: 90, fontSize: 12.5, fontWeight: 700, flexShrink: 0, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.table}</div>
                    <div style={{ flex: 1, height: 10, background: T.bg, borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: dead ? T.textFaint : `linear-gradient(90deg, ${T.blue}, ${T.coral})`, transition: "width .5s ease" }} />
                    </div>
                    <div className="mono" style={{ width: 28, fontSize: 11.5, color: T.textDim, textAlign: "right" }}>{t.count}</div>
                  </div>
                );
              })}
            </div>
          )}
          {deadTables.length > 0 && tableStats.length > 0 && (
            <div style={{ marginTop: 16, padding: "11px 13px", borderRadius: 12, background: T.coralSoft, fontSize: 12, color: "#B5493A", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14 }}>⚠</span>
              <span><b>{deadTables.length} mesa(s) con muy baja actividad</b> — {deadTables.map((d) => d.table).join(", ")}. Revisa la señal NFC o la posición del QR.</span>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <SectionTitle icon={<Clock size={15} color={T.blue} />} title="Horarios pico" sub="Distribución de escaneos por hora del día" />
          <div style={{ height: 232, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyStats} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.borderSoft} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: T.textFaint }} axisLine={{ stroke: T.border }} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: T.textFaint }} axisLine={false} tickLine={false} width={26} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, boxShadow: T.shadow }} labelStyle={{ color: T.ink, fontWeight: 700 }} cursor={{ fill: T.bg }} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {hourlyStats.map((h, i) => (
                    <Cell key={i} fill={h.hour === peakHour.hour ? T.orange : T.blue} fillOpacity={h.hour === peakHour.hour ? 1 : 0.35} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,0.85fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.05fr)", gap: 16 }}>
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <SectionTitle icon={<Signal size={15} color={T.teal} />} title="Adopción NFC" sub="vs. total de escaneos" />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 150 }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={[{ v: nfcSharePct }, { v: 100 - nfcSharePct }]} dataKey="v" innerRadius={48} outerRadius={64} startAngle={90} endAngle={-270} stroke="none">
                  <Cell fill={T.teal} />
                  <Cell fill={T.bg} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div className="jk" style={{ fontSize: 24, fontWeight: 800, color: T.ink }}>{nfcSharePct}%</div>
              <div style={{ fontSize: 10.5, color: T.textFaint }}>toca el chip</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <SectionTitle icon={<QrCode size={15} color={T.orange} />} title="QR vs NFC" sub="Adopción por medio" />
          <DonutChart data={mediumStats} />
        </div>

        <div className="card" style={{ padding: 22 }}>
          <SectionTitle icon={<Smartphone size={15} color={T.coral} />} title="iOS vs Android" sub="Dispositivos" />
          <DonutChart data={osStats} />
        </div>

        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: 99, background: T.teal, animation: "pulse-ring 1.8s infinite" }} />
            <div className="jk" style={{ fontSize: 14.5, fontWeight: 800, color: T.ink }}>Últimos escaneos</div>
          </div>
          <div className="scroll" style={{ overflowY: "auto", maxHeight: 190, marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
            {recentEvents.length === 0 && <EmptyHint text="Aún no hay escaneos registrados." />}
            {recentEvents.map((e) => (
              <div key={e.id} className="fade-up" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}` }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: e.medium === "qr" ? T.orangeSoft : T.blueSoft, flexShrink: 0 }}>
                  {e.medium === "qr" ? <QrCode size={12} color={T.orange} /> : <Signal size={12} color={T.blue} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="jk" style={{ fontSize: 11.5, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.table}</div>
                  <div className="mono" style={{ fontSize: 10, color: T.textFaint }}>{timeAgo(e.ts)}</div>
                </div>
                {e.os === "ios" ? <Apple size={12} color={T.textDim} /> : e.os === "android" ? <Bot size={12} color={T.textDim} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub, accent }: { label: string; value: React.ReactNode; icon: React.ReactNode; sub?: React.ReactNode; accent: string }) {
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
      <div>
        <div style={{ fontSize: 12, color: T.textDim, fontWeight: 600, marginBottom: 10 }}>{label}</div>
        <div className="jk" style={{ fontSize: 27, fontWeight: 800, color: T.ink }}>{value}</div>
        {sub && <div style={{ marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    </div>
  );
}
function DeltaTag({ delta, pct }: { delta: number; pct: number }) {
  const up = delta >= 0;
  return (
    <span className="pill" style={{ background: up ? T.tealSoft : T.coralSoft, color: up ? T.teal : T.coral }}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {up ? "+" : ""}{delta} ({up ? "+" : ""}{pct}%)
    </span>
  );
}
function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>{icon}<div className="jk" style={{ fontSize: 14.5, fontWeight: 800, color: T.ink }}>{title}</div></div>
      <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 2 }}>{sub}</div>
    </div>
  );
}
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: 8 }}>
      <div style={{ width: 118, height: 118 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={38} outerRadius={58} paddingAngle={3} stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, boxShadow: T.shadow }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {data.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.text }}>
            <div style={{ width: 8, height: 8, borderRadius: 99, background: d.color, flexShrink: 0 }} />
            {d.name}
            <span className="mono" style={{ marginLeft: "auto", color: T.textDim }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function EmptyHint({ text }: { text: string }) {
  return <div style={{ fontSize: 12.5, color: T.textFaint, padding: "20px 0", textAlign: "center" }}>{text}</div>;
}
