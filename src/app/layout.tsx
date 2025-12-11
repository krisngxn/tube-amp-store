import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classic Tube Amps - Premium Tube Amplifiers",
  description: "Premium tube amplifiers for true music lovers. Vintage and modern handmade amplifiers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
