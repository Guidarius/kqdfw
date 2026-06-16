import Image from "next/image";

import { hero, logo } from "@/lib/scene";

// Full-bleed welcome banner: a lively scene photo (or styled
// placeholder) behind the logo/wordmark, tagline, and CTAs.
export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative -mx-5 overflow-hidden border-b border-stone-800 sm:mx-0 sm:rounded-xl sm:border">
      {/* Background image / placeholder */}
      <div className="absolute inset-0">
        {hero.image.src ? (
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        ) : (
          <div className="photo-placeholder absolute inset-0" />
        )}
        {/* Legibility scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-[#0e0c0a]/80 to-[#0e0c0a]/40" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-[19rem] flex-col justify-end gap-4 p-6 sm:min-h-[24rem] sm:p-10">
        <div>
          <p className="font-pixel text-xs tracking-wider text-amber-500">
            dallas–fort worth
          </p>
          {logo.src ? (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={320}
              height={120}
              className="mt-2 h-auto w-56 max-w-full sm:w-72"
              priority
            />
          ) : (
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-stone-50 sm:text-6xl">
              Killer Queen{" "}
              <span className="text-amber-400 glow-amber">DFW</span>
            </h1>
          )}
          <p className="mt-3 max-w-md text-stone-300">{hero.tagline}</p>
        </div>
        {children && <div className="flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
