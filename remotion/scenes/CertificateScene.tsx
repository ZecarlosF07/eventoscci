import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";

import { BrandBackground } from "../components/BrandBackground";

export function CertificateScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ color: "white", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>
      <BrandBackground />
      <Interactive.Div name="Certificado CCI" style={{ backgroundColor: "#FBFDFC", borderRadius: 28, boxShadow: "0 40px 110px rgba(0,0,0,0.38)", height: 700, left: 120, padding: 55, position: "absolute", rotate: interpolate(frame, [0, 35], ["-5deg", "-2deg"], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), top: 190, translate: interpolate(frame, [0, 35], ["-80px 70px", "0px 0px"], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), width: 980 }}>
        <Img src={staticFile("assets/brand/cci-logo.webp")} style={{ height: 90, objectFit: "contain", width: 260 }} />
        <div style={{ color: "#376756", fontSize: 22, letterSpacing: 4, marginTop: 65 }}>CERTIFICADO DE FINALIZACIÓN</div>
        <div style={{ color: "#0C211C", fontFamily: "Georgia, serif", fontSize: 64, lineHeight: 1.08, marginTop: 34 }}>Gestión empresarial para nuevos líderes</div>
        <div style={{ backgroundColor: "#B6EB66", height: 5, marginTop: 48, width: 120 }} />
        <div style={{ color: "#376756", fontSize: 25, marginTop: 40 }}>Cámara de Comercio de Ica · Campus Virtual CCI</div>
      </Interactive.Div>
      <Interactive.Div name="Mensaje final" style={{ opacity: interpolate(frame, [20, 42, 78, 94], [0, 1, 1, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "absolute", right: 100, top: 280, width: 650 }}>
        <p style={{ color: "#B6EB66", fontSize: 25, fontWeight: 800, letterSpacing: 5, margin: 0 }}>LOGRA MÁS</p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 90, fontWeight: 400, lineHeight: 1.03, margin: "30px 0 0" }}>Aprende. Avanza. Certifícate.</h2>
        <Img src={staticFile("assets/brand/cci-logo-white.webp")} style={{ height: 90, marginTop: 70, objectFit: "contain", width: 300 }} />
      </Interactive.Div>
    </AbsoluteFill>
  );
}
