import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COGNIVIA | كوغنيفيا",
  description: "منصة تعليمية تفاعلية لدعم مهارات الذاكرة والانتباه واللغة والحساب.",
  applicationName: "COGNIVIA",
};

export const viewport: Viewport = {
  themeColor: "#071426",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
