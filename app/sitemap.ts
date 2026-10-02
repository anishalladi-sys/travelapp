import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://travelapp.example.com";
  const now = new Date();
  return [
    { url: base + "/", lastModified: now },
    // /privacy and /terms are public and indexable.
    { url: base + "/privacy", lastModified: now },
    { url: base + "/terms", lastModified: now },
    // /trips is deliberately absent: it is authenticated, so every crawler
    // request lands on /login. Advertising it invites indexing of a login wall
    // and spends crawl budget on a redirect. /login and /signup are excluded for
    // the same reason plus the usual low-value argument.
  ];
}
