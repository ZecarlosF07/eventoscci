import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";

import { BrandBackground } from "../components/BrandBackground";

export function IntroScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ alignItems: "center", color: "white", display: "flex", fontFamily: "Arial, sans-serif", justifyContent: "center" }}>
      <BrandBackground />
      <Interactive.Div name="Presentación CCI" style={{ alignItems: "center", display: "flex", flexDirection: "column", opacity: interpolate(frame, [0, 20, 60, 74], [0, 1, 1, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" }), position: "relative", scale: interpolate(frame, [0, 35], [0.92, 1], { easing: Easing.spring({ damping: 180 }), extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <Img src={staticFile("assets/brand/cci-logo-white.webp")} style={{ height: 128, objectFit: "contain", width: 420 }} />
        <div style={{ backgroundColor: "#B6EB66", height: 5, marginTop: 50, width: 90 }} />
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 96, fontWeight: 400, letterSpacing: -3, margin: "38px 0 0", textAlign: "center" }}>Campus Virtual CCI</h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 38, margin: "28px 0 0" }}>Formación que se adapta a ti</p>
      </Interactive.Div>
    </AbsoluteFill>
  );
}
