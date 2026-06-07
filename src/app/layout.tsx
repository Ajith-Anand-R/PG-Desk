import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PG Desk | Accommodation Management",
  description: "Premium, simplified paying guest and hostel accommodation management system.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PG Desk",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-slate-50/50 text-slate-900 min-h-[100dvh] font-sans">
        {children}
      </body>
    </html>
  );
}
