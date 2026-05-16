import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SafeRent — Rent a Home in Nigeria Safely",
  description:
    "SafeRent is Nigeria's trust-first rental marketplace. Find verified listings, transact through escrow, and rent with confidence.",
  keywords: "rent Nigeria, rental marketplace, Lagos apartments, Abuja rentals, safe rent Nigeria",
  openGraph: {
    title: "SafeRent — Rent a Home in Nigeria Safely",
    description: "Nigeria's trust-first rental marketplace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
