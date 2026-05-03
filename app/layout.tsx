import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./components/providers";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "LUMINA",
  description: "Publication Management System",
  icons: [
    {
      url: "/logo.png",
      href: "/logo.png",
    },
  ],
  openGraph: {
    title: "LUMINA",
    description: "Publication Management System",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "LUMINA",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${outfit.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster/>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
