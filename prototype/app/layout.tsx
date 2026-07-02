import type { Metadata, Viewport } from "next";
import { PwaRuntime } from "@/components/PwaRuntime";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fori Prototype",
  description: "Fori mobile web app prototype scaffold",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fori",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <PwaRuntime />
        {children}
      </body>
    </html>
  );
}
