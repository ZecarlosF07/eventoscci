import { ImageResponse } from "next/og";

import { SITE_CONFIG } from "@/config/site";

export const alt = "Eventos, capacitaciones y cursos de la Cámara de Comercio de Ica";
export const contentType = "image/png";
export const size = { height: 630, width: 1200 };

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #062b24 0%, #0d473a 72%, #b6eb66 160%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ color: "#b6eb66", display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>
            CÁMARA DE COMERCIO DE ICA
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.08, marginTop: 34 }}>
            Eventos, capacitaciones y cursos en Ica, Perú
          </div>
          <div style={{ color: "#d9e8e2", display: "flex", fontSize: 30, lineHeight: 1.4, marginTop: 30 }}>
            {SITE_CONFIG.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
