import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorker } from "@/components/service-worker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // Canonical base for OG/sitemap URLs. Set NEXT_PUBLIC_APP_URL in production (task 08.6).
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://travelapp.example.com",
  ),
  title: {
    default: "Travel App: Plan Your Adventures",
    template: "%s | Travel App",
  },
  description:
    "Capture trips, itineraries, budgets, and memories, all in one place per trip.",
  keywords: [
    "travel",
    "trip planning",
    "itinerary",
    "budget",
    "packing",
    "documents",
  ],
  authors: [{ name: "Travel App" }],
  creator: "Travel App",
  publisher: "Travel App",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Travel App",
    title: "Travel App: Plan Your Adventures",
    description:
      "Capture trips, itineraries, budgets, and memories, all in one place per trip.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Travel App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel App: Plan Your Adventures",
    description:
      "Capture trips, itineraries, budgets, and memories, all in one place per trip.",
    images: ["/og-image.png"],
  },
  // Next.js auto-injects <link rel="icon" href="/favicon.ico"> from
  // app/favicon.ico, so that path must NOT be declared again here — doing so
  // emits the tag twice. The extra sizes below are additive and all resolve to
  // files in public/. Regenerate with `node scripts/generate-icons.mjs` rather
  // than hand-adding entries; a missing icon is a 404 on every page load.
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  // Matched to the design system's own surfaces so the browser chrome agrees
  // with the page: --clay-surface is 35 25% 96% (#f5f0eb) in light and
  // 25 15% 16% (#2a2724) in dark. See app/globals.css.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0eb" },
    { media: "(prefers-color-scheme: dark)", color: "#2a2724" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}
