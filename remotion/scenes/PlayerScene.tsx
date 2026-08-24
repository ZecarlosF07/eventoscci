import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";

import { BrandBackground } from "../components/BrandBackground";
import { BrowserFrame } from "../components/BrowserFrame";

const LESSONS = ["Introducción al curso", "Estrategia y objetivos", "Aplicación práctica", "Evaluación del módulo"] as const;

export function PlayerScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ color: "white", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
      <BrandBackground />
      <Interactive.Div name="Título reproductor" style={{ left: 92, opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "absolute", top: 90 }}>
        <p style={{ color: "#B6EB66", fontSize: 24, fontWeight: 800, letterSpacing: 5, margin: 0 }}>APRENDE</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 82, fontWeight: 400, margin: "18px 0 0" }}>A tu ritmo</h2>
      </Interactive.Div>
      <Interactive.Div name="Reproductor del Campus" style={{ height: 770, left: 90, position: "absolute", top: 245, translate: interpolate(frame, [0, 28], ["0px 100px", "0px 0px"], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: 1740 }}>
        <BrowserFrame title="campus.camaraica.org.pe/contenido">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 500px", height: "100%" }}>
            <div style={{ background: "linear-gradient(145deg, #183C32, #0C211C)", padding: 46, position: "relative" }}>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 26 }}>Gestión empresarial · Módulo 2</div>
              <div style={{ alignItems: "center", display: "flex", inset: 0, justifyContent: "center", position: "absolute" }}>
                <div style={{ alignItems: "center", backgroundColor: "#B6EB66", borderRadius: 999, boxShadow: "0 0 80px rgba(182,235,102,0.25)", display: "flex", height: 150, justifyContent: "center", scale: interpolate(frame, [20, 42, 64], [0.82, 1.06, 1], { easing: Easing.spring({ damping: 160 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: 150 }}><span style={{ color: "#0C211C", fontSize: 58, marginLeft: 10 }}>▶</span></div>
              </div>
              <div style={{ bottom: 38, left: 46, position: "absolute", right: 46 }}><div style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, height: 9 }}><div style={{ backgroundColor: "#B6EB66", borderRadius: 999, height: 9, width: `${interpolate(frame, [20, 100], [18, 68], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%` }} /></div></div>
            </div>
            <div style={{ backgroundColor: "#FBFDFC", color: "#0C211C", padding: 38 }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 39 }}>Contenido del módulo</div>
              {LESSONS.map((lesson, index) => <div key={lesson} style={{ alignItems: "center", backgroundColor: index === 1 ? "#E0EEE6" : "white", border: "1px solid #E0EEE6", borderRadius: 16, display: "flex", gap: 18, marginTop: 18, padding: "20px 22px" }}><span style={{ alignItems: "center", backgroundColor: index < 2 ? "#B6EB66" : "#E0EEE6", borderRadius: 999, display: "flex", fontSize: 18, height: 36, justifyContent: "center", width: 36 }}>{index < 2 ? "✓" : "▶"}</span><span style={{ fontSize: 23 }}>{lesson}</span></div>)}
            </div>
          </div>
        </BrowserFrame>
      </Interactive.Div>
    </AbsoluteFill>
  );
}
