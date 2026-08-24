import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: [
        "/admin",
        "/auth",
        "/campus",
        "/login",
        "/recuperar-contrasena",
        "/registro",
        "/restablecer-contrasena",
      ],
      userAgent: "*",
    },
  };
}
