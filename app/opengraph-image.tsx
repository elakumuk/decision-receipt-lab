import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ovrule";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px",
          color: "#f5f5f5",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 600 }}>Ovrule</div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "10px 16px",
              color: "#a3a3a3",
              fontSize: 18,
            }}
          >
            Built with OpenAI Codex
          </div>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          {["01 / Propose", "02 / Decision", "03 / Evidence", "04 / Timeline"].map((label, index) => (
            <div
              key={label}
              style={{
                flex: 1,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#111214",
                borderRadius: 28,
                padding: 26,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 16, color: "#737373" }}>{label}</div>
              <div
                style={{
                  height: 210,
                  borderRadius: 22,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: index === 1 ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: index === 1 ? "#fca5a5" : "#737373",
                  fontSize: 22,
                }}
              >
                {index === 1 ? "REFUSED" : index === 2 ? "Evidence gaps" : "Case file"}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 52, fontWeight: 600, letterSpacing: -1.5 }}>
          Auditable case files for AI agent decisions
        </div>
      </div>
    ),
    size,
  );
}
