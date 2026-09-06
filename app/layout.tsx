import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Travel App — Plan Your Adventures",
    template: "%s | Travel App",
  },
  description: "Capture trips, itineraries, budgets, and memories — all in one place per trip.",
  keywords: ["travel", "trip planning", "itinerary", "budget", "packing", "documents"],
  authors: [{ name: "Travel App" }],
  creator: "Travel App",
  publisher: "Travel App",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://travelapp.example.com",
    siteName: "Travel App",
    title: "Travel App — Plan Your Adventures",
    description: "Capture trips, itineraries, budgets, and memories — all in one place per trip.",
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
    title: "Travel App — Plan Your Adventures",
    description: "Capture trips, itineraries, budgets, and memories — all in one place per trip.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
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
        </ThemeProvider>
      </body>
    </html>
  );
}