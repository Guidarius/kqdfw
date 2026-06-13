import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Silkscreen } from "next/font/google";
import { links } from "@/lib/scene";
import "./globals.css";

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
  { href: "/calendar", label: "Calendar" },
  { href: "/league", label: "League" },
  { href: "/locations", label: "Where to Play" },
  { href: "/join", label: "Join" },
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
        <div aria-hidden className="marquee h-1" />
        <header className="border-b border-stone-800">
          <div className="mx-auto max-w-4xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/"
              className="font-pixel text-amber-400 text-base tracking-wide"
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
            <div className="ms-auto">
              <Link
                href="/members"
                className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
              >
                Members
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full mx-auto max-w-4xl px-5 py-10">
          {children}
        </main>

        <footer className="border-t border-stone-800 text-sm text-stone-400">
          <div className="mx-auto max-w-4xl px-5 py-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} KQDFW</span>
            <Link href="/conduct" className="hover:text-amber-400">
              Community standards
            </Link>
            <a href={links.instagram} className="hover:text-amber-400">
              Instagram
            </a>
            <a href={links.facebook} className="hover:text-amber-400">
              Facebook
            </a>
            <a href={links.twitch} className="hover:text-amber-400">
              Twitch
            </a>
            <a href={links.hivemind} className="hover:text-amber-400">
              HiveMind stats
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
