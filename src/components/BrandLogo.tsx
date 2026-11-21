import { cn } from "@/lib/utils";

type Props = { name: string; logoUrl?: string; className?: string };

export function BrandLogo({ name, logoUrl, className }: Props) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={cn("h-11 w-11 rounded-xl object-contain", className)}
      />
    );
  }
  return (
    <span
      aria-label={`${name} logo`}
      className={cn(
        "bg-mark grid h-11 w-11 place-items-center rounded-xl font-display text-xl font-bold text-primary-foreground",
        className,
      )}
    >
      {name.trim().charAt(0).toLowerCase() || "b"}
    </span>
  );
}
