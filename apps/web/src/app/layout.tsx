import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { I18nProvider } from "@/i18n/context";
import "./globals.css";

/* ─── Fonts ───────────────────────────────────────────────────────────
   Design system: Instrument Serif (display), Geist (UI), Geist Mono (meta).
────────────────────────────────────────────────────────────────────── */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "glamr — Beauty & Wellness Appointments",
    template: "%s — glamr",
  },
  description:
    "Find your next good hair day. Browse verified beauty professionals, book instantly, and discover inspiration — all in one place.",
  keywords: ["beauty", "hair salon", "booking", "nail salon", "skincare", "wellness", "Romania"],
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: "ro_RO",
    siteName: "glamr",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#6B21A8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)]">
        {/* Skip-to-content for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-[var(--plum)] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-[13px] focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
