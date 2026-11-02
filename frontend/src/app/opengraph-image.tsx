import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AzykSowda — Onlaýn azyk dükany";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #23803a 0%, #2e9e44 55%, #5ab268 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="72" height="72" viewBox="0 0 48 48">
              <path d="M11 20h26l-2.6 14.2a2.4 2.4 0 0 1-2.4 2H16a2.4 2.4 0 0 1-2.4-2L11 20z" fill="#2e9e44" />
              <path d="M19 20l4.5-8M29 20l-4.5-8" stroke="#2e9e44" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="35.5" cy="11.5" r="5" fill="#f59e0b" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
            <span>Azyk</span>
            <span style={{ color: "#fbbf24" }}>Sowda</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 40, fontWeight: 600, opacity: 0.95 }}>Azyk harytlary - amatly bahadan, oyunize cenli</div>
        <div style={{ marginTop: 20, fontSize: 28, opacity: 0.85 }}>Miweler · Gok onumler · Suyt · Et · Corek · 200+ haryt · Asgabat boyunca eltip bermek</div>
        <div style={{ marginTop: 60, fontSize: 26, opacity: 0.8 }}>azyksowda.com.tm</div>
      </div>
    ),
    { ...size },
  );
}
