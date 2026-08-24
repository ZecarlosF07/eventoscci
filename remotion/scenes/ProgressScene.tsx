import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";

import { BrandBackground } from "../components/BrandBackground";

export function ProgressScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ alignItems: "center", color: "white", display: "flex", fontFamily: "Arial, sans-serif", overflow: "hidden", padding: "90px" }}>
      <BrandBackground />
      <div style={{ display: "grid", gap: 90, gridTemplateColumns: "650px 1fr", position: "relative", width: "100%" }}>
        <Interactive.Div name="Mensaje de progreso" style={{ alignSelf: "center", opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), translate: interpolate(frame, [0, 25], ["-60px 0px", "0px 0px"], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <p style={{ color: "#B6EB66", fontSize: 25, fontWeight: 800, letterSpacing: 5, margin: 0 }}>AVANZA</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 92, fontWeight: 400, lineHeight: 1.02, margin: "28px 0 0" }}>Tu progreso, siempre visible</h2>
        </Interactive.Div>
        <Interactive.Div name="Panel de progreso" style={{ backgroundColor: "#FBFDFC", borderRadius: 38, boxShadow: "0 36px 100px rgba(0,0,0,0.32)", color: "#0C211C", height: 770, padding: 54, scale: interpolate(frame, [0, 30], [0.9, 1], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ color: "#376756", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>RESUMEN ACADÉMICO</div><div style={{ fontFamily: "Georgia, serif", fontSize: 48, marginTop: 14 }}>Gestión empresarial</div></div><div style={{ alignItems: "center", background: `conic-gradient(#B6EB66 ${interpolate(frame, [15, 78], [0, 78], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%, #E0EEE6 0)`, borderRadius: 999, display: "flex", height: 170, justifyContent: "center", width: 170 }}><div style={{ alignItems: "center", backgroundColor: "white", borderRadius: 999, display: "flex", fontSize: 38, fontWeight: 800, height: 126, justifyContent: "center", width: 126 }}>78%</div></div></div>
          <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 50 }}>
            {[['8', 'Clases completas'], ['3', 'Módulos aprobados'], ['92', 'Nota del quiz']].map(([value, label], index) => <div key={label} style={{ backgroundColor: index === 2 ? "#0C211C" : "#E0EEE6", borderRadius: 22, color: index === 2 ? "white" : "#0C211C", padding: "30px 28px" }}><div style={{ color: index === 2 ? "#B6EB66" : "#183C32", fontSize: 54, fontWeight: 800 }}>{value}{index === 2 ? "%" : ""}</div><div style={{ fontSize: 21, marginTop: 12 }}>{label}</div></div>)}
          </div>
          <div style={{ backgroundColor: "#E0EEE6", borderRadius: 18, marginTop: 28, padding: "24px 28px" }}><div style={{ display: "flex", fontSize: 23, justifyContent: "space-between" }}><span>Progreso general</span><strong>Continúa aprendiendo →</strong></div></div>
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
}
