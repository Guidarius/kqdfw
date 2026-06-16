import Link from "next/link";

// Arcade-style CTA. Renders a Next.js Link (internal/external) styled
// as a pressable cabinet button. `variant="primary"` for the amber CTA.
export function Button({
  href,
  children,
  variant = "default",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "primary";
  className?: string;
}) {
  const external = href.startsWith("http");
  const classes = [
    "btn-arcade",
    variant === "primary" ? "btn-arcade-primary" : "text-stone-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
