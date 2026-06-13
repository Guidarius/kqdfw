import type { Metadata } from "next";
import Link from "next/link";
import { venues } from "@/lib/scene";

export const metadata: Metadata = {
  title: "Where to Play — KQDFW",
};

export default function LocationsPage() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold text-stone-50">Where to play</h1>
        <p className="mt-2 text-stone-400">
          Killer Queen cabinets around the metroplex. What&apos;s on each week
          is on the{" "}
          <Link href="/calendar" className="text-amber-400 hover:text-amber-300">
            calendar
          </Link>
          .
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {venues.map((v) => (
          <a
            key={v.name}
            href={v.maps}
            className="rounded-lg border border-stone-800 p-5 hover:border-amber-400 transition-colors"
          >
            <span className="font-medium text-stone-100">{v.name}</span>
            <span className="block text-sm text-stone-400">{v.area}</span>
          </a>
        ))}
      </section>
    </div>
  );
}
