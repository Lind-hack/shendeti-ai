import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Shendeti AI — Platforma Mjekësore me AI",
  description: "Profil unik shëndetësor për çdo pacient. AI analizon të dhënat dhe ndihmon mjekët të marrin vendime më të shpejta.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" className="h-full">
      <body className="min-h-full bg-[#050C14]">
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
