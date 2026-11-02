import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#2e9e44",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 48 48">
          <path d="M11 20h26l-2.6 14.2a2.4 2.4 0 0 1-2.4 2H16a2.4 2.4 0 0 1-2.4-2L11 20z" fill="#fff" />
          <path d="M19 20l4.5-8M29 20l-4.5-8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M17 26h14M18 30h12" stroke="#2e9e44" strokeWidth="1.8" strokeLinecap="round" opacity=".55" />
          <circle cx="35.5" cy="11.5" r="5" fill="#f59e0b" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
