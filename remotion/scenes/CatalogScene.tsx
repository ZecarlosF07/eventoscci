import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";

import { BrandBackground } from "../components/BrandBackground";
import { BrowserFrame } from "../components/BrowserFrame";

const COURSES = ["Gestión empresarial", "Marketing digital", "Finanzas para negocios"] as const;

export function CatalogScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ color: "white", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
      <BrandBackground />
      <Interactive.Div name="Título catálogo" style={{ left: 90, opacity: interpolate(frame, [0, 18], [0, 1], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "absolute", top: 120, translate: interpolate(frame, [0, 25], ["-50px 0px", "0px 0px"], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: 560 }}>
        <p style={{ color: "#B6EB66", fontSize: 26, fontWeight: 800, letterSpacing: 5, margin: 0 }}>DESCUBRE</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 86, fontWeight: 400, lineHeight: 1.02, margin: "28px 0 0" }}>Elige tu próxima oportunidad</h2>
      </Interactive.Div>
      <Interactive.Div name="Catálogo de cursos" style={{ height: 780, position: "absolute", right: -90, top: 150, translate: interpolate(frame, [0, 35, 80, 99], ["180px 0px", "0px 0px", "0px 0px", "-30px 0px"], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: 1220 }}>
        <BrowserFrame title="campus.camaraica.org.pe/cursos">
          <div style={{ display: "grid", gap: 28, gridTemplateColumns: "230px 1fr", height: "100%", padding: 34 }}>
            <div style={{ backgroundColor: "#0C211C", borderRadius: 22, color: "white", padding: 28 }}>
              <div style={{ color: "#B6EB66", fontSize: 20, fontWeight: 800, letterSpacing: 3 }}>CAMPUS</div>
              {['Mis cursos', 'Certificados', 'Mi perfil'].map((item, index) => <div key={item} style={{ backgroundColor: index === 0 ? "rgba(182,235,102,0.14)" : "transparent", borderRadius: 12, fontSize: 24, marginTop: 25, padding: "15px 18px" }}>{item}</div>)}
            </div>
            <div>
              <div style={{ color: "#0C211C", fontFamily: "Georgia, serif", fontSize: 42, marginBottom: 28 }}>Cursos disponibles</div>
              <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(3, 1fr)" }}>
                {COURSES.map((course, index) => <div key={course} style={{ backgroundColor: index === 1 ? "#183C32" : "#0C211C", borderRadius: 20, height: 390, overflow: "hidden", position: "relative" }}><div style={{ border: "1px solid rgba(182,235,102,0.35)", borderRadius: 999, height: 260, position: "absolute", right: -90, top: -100, width: 260 }} /><div style={{ bottom: 28, left: 26, position: "absolute", right: 26 }}><div style={{ color: "#B6EB66", fontSize: 17, fontWeight: 800, letterSpacing: 2 }}>CURSO VIRTUAL</div><div style={{ color: "white", fontFamily: "Georgia, serif", fontSize: 30, lineHeight: 1.12, marginTop: 12 }}>{course}</div></div></div>)}
              </div>
            </div>
          </div>
        </BrowserFrame>
      </Interactive.Div>
      <div style={{ backgroundColor: "white", clipPath: "polygon(0 0, 100% 52%, 58% 65%, 45% 100%)", height: 58, left: interpolate(frame, [30, 78], [1300, 1535], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "absolute", top: interpolate(frame, [30, 78], [790, 610], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: 42 }} />
    </AbsoluteFill>
  );
}
