import type { Metadata, Viewport } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Provider from "@/components/Provider";

const recursive = Recursive({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fast, Reliable Profanity API",
  description: "Project made by ansarjarvis",
};

export const viewport: Viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari, credit to https://github.com/ai-ng
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={recursive.className}>
        <Navbar />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
