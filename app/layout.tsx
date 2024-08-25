import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import ConvexClerkProvider from "./ConvexClerkProvider";
import { Analytics } from "@vercel/analytics/react"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <header>
      <ConvexClerkProvider>
        <Analytics>
          <html lang="en">
            <SpeedInsights>
              <body className={`${geistSans.variable} ${geistMono.variable}`}>
                {children}
              </body>
            </SpeedInsights>
          </html>
        </Analytics>
      </ConvexClerkProvider>
    </header>
  );
}
