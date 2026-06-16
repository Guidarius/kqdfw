// Small pixel-font eyebrow label used above sections.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-pixel text-[11px] uppercase tracking-wider text-amber-500/80">
      {children}
    </p>
  );
}
