import { ImageResponse } from "next/og";
import { getCaseFileById } from "@/lib/receipts";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type CaseOgProps = {
  params: {
    id: string;
  };
};

export default async function Image({ params }: CaseOgProps) {
  const receipt = await getCaseFileById(params.id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0b",
          color: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 600 }}>Ovrule</div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 999,
              padding: "12px 18px",
              fontSize: 18,
              color:
                receipt?.decision === "ADMISSIBLE"
                  ? "#86efac"
                  : receipt?.decision === "AMBIGUOUS"
                    ? "#fcd34d"
                    : "#fca5a5",
            }}
          >
            {receipt?.decision ?? "CASE NOT FOUND"}
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 28,
            padding: "28px",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ fontSize: 18, color: "#a3a3a3" }}>Shared case</div>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1.6 }}>
            {receipt?.summary ?? "Receipt unavailable"}
          </div>
          <div style={{ display: "flex", gap: "22px", fontSize: 20, color: "#d4d4d8" }}>
            <div>Risk {receipt?.riskScore ?? "—"}</div>
            <div>Hash {receipt?.hash ?? "—"}</div>
            <div>{receipt?.timestamp ?? "—"}</div>
          </div>
        </div>

        <div style={{ fontSize: 20, color: "#737373" }}>Auditable case files for AI agent decisions</div>
      </div>
    ),
    size,
  );
}
