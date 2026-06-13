import type { Metadata } from "next";
import { contacts, links } from "@/lib/scene";

export const metadata: Metadata = {
  title: "Community Standards — KQDFW",
};

export default function ConductPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-stone-50">Community standards</h1>

      <div className="flex flex-col gap-6 leading-7 text-stone-300">
        <p>
          Compete hard on the cab, leave it there. No harassment, no making
          anyone&apos;s night worse because of who they are. Treat people like
          you want them back next week.
        </p>
        <p>
          If something feels off, talk to a host that night, or privately
          through{" "}
          <a href={links.instagram} className="text-amber-400 hover:text-amber-300">
            Instagram
          </a>{" "}
          or{" "}
          <a href={links.facebook} className="text-amber-400 hover:text-amber-300">
            Facebook
          </a>
          . It stays private and it gets acted on.
        </p>
        <div>
          {contacts.map((c) => (
            <p key={c.name}>
              <span className="font-medium text-stone-100">{c.name}</span>
              <span className="text-stone-400"> — {c.role}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
