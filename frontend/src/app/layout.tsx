import type { Metadata, Viewport } from "next";
import "./globals.css";
import StoreHydration from "@/components/layout/StoreHydration";
import Toaster from "@/components/layout/Toaster";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Onlaýn azyk dükany`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_TAGLINE}. Miweler, gök önümler, süýt, et, çörek we 200-den gowrak haryt. Aşgabat boýunça çalt eltip bermek.`,
  keywords: ["azyk", "onlaýn dükan", "Aşgabat", "eltip bermek", "azyk harytlary", "AzykSowda", "söwda"],
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Onlaýn azyk dükany`,
    description: SITE_TAGLINE,
    locale: "tk_TM",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2e9e44",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tk" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <StoreHydration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
