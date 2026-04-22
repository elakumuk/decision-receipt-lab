import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decision Receipt Lab",
  description: "Prototype decision classification and contest flows with Next.js 14, OpenAI, and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-paper">
      <body className="min-h-full bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
