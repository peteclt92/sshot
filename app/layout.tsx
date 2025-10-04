import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudClip - Instant Screenshot Sharing",
  description: "Upload screenshots and get instant shareable links with automatic clipboard copy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
