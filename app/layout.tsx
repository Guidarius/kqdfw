import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Silkscreen } from "next/font/google";
import "./globals.css";
import { links } from "@/lib/scene";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  weight: "400",
  variable: "--font-silkscreen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KQDFW — Killer Queen Arcade in Dallas–Fort Worth",
  description:
    "The Dallas–Fort Worth Killer Queen Arcade community. League schedule, standings, and where to play.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/league", label: "League" },
  { href: "/calendar", label: "Calendar" },
  { href: "/join", label: "Join" },
  // /admin is intentionally not linked in the public nav — it gates
  // itself to organizers. Navigate to it directly.
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <div aria-hidden className="marquee h-1.5" />
        <header className="border-b border-stone-800 bg-[#0e0c0a]/80 backdrop-blur">
          <div className="mx-auto max-w-4xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/"
              className="font-pixel text-amber-400 text-base tracking-wide glow-amber"
            >
              KQ<span className="text-stone-100">DFW</span>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-300">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="hover:text-amber-400 transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full mx-auto max-w-4xl px-5 py-10">
          {children}
        </main>

        <footer className="border-t border-stone-800 text-sm text-stone-400">
          <div className="mx-auto max-w-4xl px-5 py-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-pixel text-xs text-amber-500">
              KQ<span className="text-stone-300">DFW</span>
            </span>
            <nav className="flex flex-wrap gap-x-5 gap-y-1">
              <a
                href={links.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Instagram
              </a>
              <a
                href={links.facebook}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Facebook
              </a>
              <a
                href={links.twitch}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                Twitch
              </a>
              <Link
                href="/conduct"
                className="hover:text-amber-400 transition-colors"
              >
                Community standards
              </Link>
            </nav>
            <span className="ms-auto">© {new Date().getFullYear()} KQDFW</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
