import type { Metadata, Viewport } from "next";
import {
  Architects_Daughter,
  Caveat,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/lib/content/site";
import { AppProviders } from "@/components/providers/AppProviders";
import { FocusScribble } from "@/components/sketch/FocusScribble";
import { PencilCursor } from "@/components/sketch/PencilCursor";
import { PencilDefs } from "@/components/sketch/PencilDefs";
import { ScrollBuilding } from "@/components/sketch/ScrollBuilding";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import "./globals.css";

// Headings: a quick, legible handwriting. Preloaded: it's in the hero.
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});
// Annotations, labels, title blocks: classic architect's lettering.
const architects = Architects_Daughter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-architects",
  display: "swap",
});
// Body copy.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
// Dimensions, sheet numbers, dates.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.description,
    creator: "@Yrishavjs",
  },
};

export const viewport: Viewport = {
  themeColor: "#FDFDFB",
  colorScheme: "light",
};

/*
 * Runs before first paint: marks the document as JS-capable so drawings can
 * start hidden and draw themselves in. Without JS the class never appears
 * and every drawing is simply shown finished.
 */
const bootScript = `document.documentElement.classList.add("js")`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${architects.variable} ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="text-graphite font-sans antialiased">
        <a
          href="#main"
          className="focus:bg-paper focus:font-arch sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <PencilDefs />
        <AppProviders>
          <Navbar />
          <ScrollBuilding />
          <main id="main" className="max-w-page relative mx-auto px-5 sm:px-8">
            {children}
          </main>
          <Footer />
          <PencilCursor />
          <FocusScribble />
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
