import type { BrowserFrameProps } from "./types/browser-frame.types";

export function BrowserFrame({ children, title }: BrowserFrameProps) {
  return (
    <div style={{ backgroundColor: "#FBFDFC", border: "1px solid rgba(166,192,178,0.35)", borderRadius: 34, boxShadow: "0 32px 90px rgba(0,0,0,0.3)", height: "100%", overflow: "hidden", width: "100%" }}>
      <div style={{ alignItems: "center", backgroundColor: "#E0EEE6", display: "flex", gap: 14, height: 70, padding: "0 28px" }}>
        <span style={{ backgroundColor: "#B6EB66", borderRadius: 999, height: 14, width: 14 }} />
        <span style={{ backgroundColor: "#A6C0B2", borderRadius: 999, height: 14, width: 14 }} />
        <span style={{ backgroundColor: "#0C211C", borderRadius: 999, height: 14, opacity: 0.3, width: 14 }} />
        <div style={{ backgroundColor: "rgba(255,255,255,0.75)", borderRadius: 12, color: "#376756", fontFamily: "Arial, sans-serif", fontSize: 22, marginLeft: 20, padding: "10px 24px", textAlign: "center", width: 500 }}>{title}</div>
      </div>
      <div style={{ height: "calc(100% - 70px)" }}>{children}</div>
    </div>
  );
}
