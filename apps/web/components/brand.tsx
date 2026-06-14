import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <defs>
          <linearGradient id="echoes-mark" x1="0" y1="0" x2="26" y2="26">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <circle cx="13" cy="13" r="3.2" fill="url(#echoes-mark)" />
        <circle
          cx="13"
          cy="13"
          r="7"
          stroke="url(#echoes-mark)"
          strokeOpacity="0.6"
          strokeWidth="1.5"
        />
        <circle
          cx="13"
          cy="13"
          r="11.25"
          stroke="url(#echoes-mark)"
          strokeOpacity="0.28"
          strokeWidth="1.5"
        />
      </svg>
      {showText ? (
        <span className="text-[17px] font-semibold tracking-tight text-foreground">
          Echoes
        </span>
      ) : null}
    </span>
  );
}
