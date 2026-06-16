"use client";

// Small shared building blocks for the admin screens, so each editor
// stays compact and visually consistent with the rest of the site.

export const inputCls =
  "rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-400 placeholder:text-stone-600";

export function Btn({
  children,
  onClick,
  variant = "default",
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    default:
      "border-stone-700 text-stone-200 hover:border-amber-400 hover:text-amber-400",
    primary:
      "border-amber-400 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20",
    danger: "border-stone-700 text-stone-400 hover:border-rose-400 hover:text-rose-400",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors active:translate-y-px disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-pixel text-[10px] uppercase tracking-wider text-stone-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export function AdminCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-800 p-5">
      <h2 className="text-lg font-bold text-stone-50">{title}</h2>
      {desc && <p className="mt-1 text-sm text-stone-400">{desc}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

// Inline status line. Prefix a message with "!" to render it as an error.
export function Status({ msg }: { msg: string | null }) {
  if (!msg) return null;
  const isErr = msg.startsWith("!");
  return (
    <p
      className={`text-sm ${isErr ? "text-rose-400" : "text-emerald-400"}`}
      role="status"
    >
      {isErr ? msg.slice(1).trim() : msg}
    </p>
  );
}
