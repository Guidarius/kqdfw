import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, Silkscreen } from "next/font/google";
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

// Bare-bones proof of concept: only Calendar and League for now.
// Hidden (pages still exist, just unlinked): Home, Where to Play (/locations),
// Join (/join), Members (/members). Add them back here to re-enable.
const nav = [
  { href: "/league", label: "League" },
  { href: "/calendar", label: "Calendar" },
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
              href="/league"
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
          </div>
        </header>

        <main className="flex-1 w-full mx-auto max-w-4xl px-5 py-10">
          {children}
        </main>

        {/* Footer links (Community standards / Instagram / Facebook / Twitch /
            HiveMind) are hidden for the bare-bones proof of concept. Restore
            from git history when ready. */}
        <footer className="border-t border-stone-800 text-sm text-stone-400">
          <div className="mx-auto max-w-4xl px-5 py-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} KQDFW</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
