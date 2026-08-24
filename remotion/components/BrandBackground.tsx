import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export function BrandBackground() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0C211C", overflow: "hidden" }}>
      <div style={{ background: "radial-gradient(circle, rgba(182,235,102,0.14), transparent 68%)", height: 900, left: -360, position: "absolute", top: -420, width: 900 }} />
      <div style={{ border: "2px solid rgba(182,235,102,0.22)", borderRadius: 9999, height: 850, position: "absolute", right: -220, rotate: interpolate(frame, [0, durationInFrames], ["0deg", "24deg"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), top: -310, width: 850 }} />
      <div style={{ border: "1px solid rgba(166,192,178,0.18)", borderRadius: 9999, height: 650, position: "absolute", right: -80, top: -200, width: 650 }} />
      <div style={{ background: "linear-gradient(135deg, transparent 55%, rgba(182,235,102,0.04) 55%)", inset: 0, position: "absolute" }} />
    </AbsoluteFill>
  );
}
