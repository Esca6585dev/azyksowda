import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AzykSowda — Onlaýn azyk dükany",
    short_name: "AzykSowda",
    description: "Azyk harytlary — amatly bahadan, öýüňize çenli",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f5",
    theme_color: "#2e9e44",
    lang: "tk",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
