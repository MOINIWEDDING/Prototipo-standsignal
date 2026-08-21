// components/dashboard/about/FeatureIllustrations.tsx
import React from "react";
import { T } from "@/lib/theme";

const wrap: React.CSSProperties = {
  width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center",
  justifyContent: "center", flexShrink: 0,
};

export function IllustrationRealtime() {
  return (
    <div style={{ ...wrap, background: T.blueSoft }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="4" y="20" width="6" height="12" rx="2" fill={T.blue} opacity="0.35">
          <animate attributeName="height" values="12;20;12" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="y" values="20;12;20" dur="1.6s" repeatCount="indefinite" />
        </rect>
        <rect x="15" y="12" width="6" height="20" rx="2" fill={T.blue}>
          <animate attributeName="height" values="20;28;20" dur="1.6s" begin="0.2s" repeatCount="indefinite" />
          <animate attributeName="y" values="12;4;12" dur="1.6s" begin="0.2s" repeatCount="indefinite" />
        </rect>
        <rect x="26" y="6" width="6" height="26" rx="2" fill={T.teal}>
          <animate attributeName="height" values="26;16;26" dur="1.6s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="y" values="6;16;6" dur="1.6s" begin="0.4s" repeatCount="indefinite" />
        </rect>
      </svg>
    </div>
  );
}

export function IllustrationHeatmap() {
  return (
    <div style={{ ...wrap, background: T.orangeSoft }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const intensity = [0.9, 0.3, 0.6, 0.4, 1, 0.25, 0.5, 0.35, 0.75][row * 3 + col];
            return (
              <rect
                key={`${row}-${col}`} x={4 + col * 10} y={4 + row * 10} width="7" height="7" rx="2"
                fill={T.orange} opacity={intensity}
              >
                <animate attributeName="opacity" values={`${intensity};${intensity * 0.4};${intensity}`} dur="2.2s" begin={`${(row * 3 + col) * 0.15}s`} repeatCount="indefinite" />
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}

export function IllustrationPeakHours() {
  return (
    <div style={{ ...wrap, background: T.tealSoft }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke={T.teal} strokeWidth="2" opacity="0.3" />
        <line x1="18" y1="18" x2="18" y2="8" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="6s" repeatCount="indefinite" />
        </line>
        <line x1="18" y1="18" x2="24" y2="18" stroke={T.blue} strokeWidth="2.5" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="2s" repeatCount="indefinite" />
        </line>
        <circle cx="18" cy="18" r="1.8" fill={T.ink} />
      </svg>
    </div>
  );
}

export function IllustrationQr() {
  return (
    <div style={{ ...wrap, background: T.coralSoft }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        {[[4, 4], [24, 4], [4, 24]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="8" height="8" rx="1.5" fill="none" stroke={T.coral} strokeWidth="2">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </rect>
            <rect x={x + 2.5} y={y + 2.5} width="3" height="3" fill={T.coral}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </rect>
          </g>
        ))}
        <rect x="22" y="22" width="3" height="3" fill={T.coral} />
        <rect x="27" y="22" width="3" height="3" fill={T.coral} opacity="0.5" />
        <rect x="22" y="27" width="3" height="3" fill={T.coral} opacity="0.5" />
      </svg>
    </div>
  );
}

export function IllustrationCustomize() {
  return (
    <div style={{ ...wrap, background: T.yellowSoft }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="12" cy="12" r="6" fill={T.blue}>
          <animate attributeName="cy" values="12;10;12" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="24" cy="12" r="6" fill={T.teal} opacity="0.85">
          <animate attributeName="cy" values="12;14;12" dur="2.4s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="18" cy="23" r="6" fill={T.orange} opacity="0.9">
          <animate attributeName="cy" values="23;21;23" dur="2.4s" begin="0.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export function IllustrationTraining() {
  return (
    <div style={{ ...wrap, width: 48, height: 48, borderRadius: 14, background: T.blueSoft }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 8l10 5 8-4.2V15" stroke={T.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" stroke={T.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function IllustrationSupport() {
  return (
    <div style={{ ...wrap, width: 48, height: 48, borderRadius: 14, background: T.tealSoft }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={T.teal} strokeWidth="1.8" />
        <path d="M12 7v5l3 2" stroke={T.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function IllustrationReplace() {
  return (
    <div style={{ ...wrap, width: 48, height: 48, borderRadius: 14, background: T.orangeSoft }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" stroke={T.orange} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M21 4v4h-4" stroke={T.orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" stroke={T.orange} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 20v-4h4" stroke={T.orange} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function IllustrationGrowth() {
  return (
    <div style={{ ...wrap, width: 48, height: 48, borderRadius: 14, background: T.coralSoft }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l6-6 4 4 8-8" stroke={T.coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7h6v6" stroke={T.coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
