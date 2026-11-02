"use client";

import type { DayStat } from "@/lib/types";
import { money } from "@/lib/format";

/** Dependency-free bar chart for the last 7 days (revenue bars + order counts). */
export default function SalesChart({ days }: { days: DayStat[] }) {
  const max = Math.max(1, ...days.map((d) => d.revenue));
  const W = 560;
  const H = 180;
  const padL = 44;
  const padB = 28;
  const padT = 12;
  const innerW = W - padL - 12;
  const innerH = H - padB - padT;
  const bw = innerW / days.length;
  const ticks = [0, 0.5, 1].map((t) => ({ y: padT + innerH - innerH * t, v: max * t }));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Soňky 7 günüň satuwy">
        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={padL} x2={W - 12} y1={t.y} y2={t.y} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="#6b7280">
              {Math.round(t.v)}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const h = (d.revenue / max) * innerH;
          const x = padL + i * bw + bw * 0.2;
          const y = padT + innerH - h;
          const w = bw * 0.6;
          return (
            <g key={d.date}>
              <title>
                {d.label}: {money(d.revenue)} manat · {d.orders} sargyt
              </title>
              <rect x={x} y={padT} width={w} height={innerH} fill="#f6f7f5" rx="6" />
              <rect x={x} y={y} width={w} height={h} fill="url(#g)" rx="6" />
              {d.orders > 0 && (
                <text x={x + w / 2} y={Math.max(y - 4, 10)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e6630">
                  {d.orders}
                </text>
              )}
              <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7280">
                {d.label}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5ab268" />
            <stop offset="100%" stopColor="#2e9e44" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
        <span>Sütün: girdeji (manat) · san: sargyt sany</span>
        <span>Jemi 7 gün: {money(days.reduce((a, d) => a + d.revenue, 0))} manat</span>
      </div>
    </div>
  );
}
