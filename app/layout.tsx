import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "./fonts/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  fallback: ["Inter", "system-ui", "sans-serif"],
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "./fonts/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  fallback: ["JetBrains Mono", "SFMono-Regular", "monospace"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://decision-receipt-lab.vercel.app"),
  title: "Ovrule",
  description: "Case management for auditable AI agent decisions, refusals, challenges, and reviewer overrides.",
  openGraph: {
    title: "Ovrule",
    description: "Case management for auditable AI agent decisions, refusals, challenges, and reviewer overrides.",
    url: "https://decision-receipt-lab.vercel.app",
    siteName: "Ovrule",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ovrule",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ovrule",
    description: "Case management for auditable AI agent decisions, refusals, challenges, and reviewer overrides.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full bg-[#0a0a0b]`}>
      <body className="min-h-full bg-[#0a0a0b] font-sans text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
