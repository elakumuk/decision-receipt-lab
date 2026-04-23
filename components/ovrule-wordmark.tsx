export function OvruleWordmark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ovrule"
      role="img"
    >
      <circle cx="25" cy="36" r="13" stroke="currentColor" strokeWidth="4.5" />
      <path
        d="M39 20L49 52L59 20"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 36H61" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <text
        x="86"
        y="46"
        fill="currentColor"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontSize="30"
        fontWeight="600"
        letterSpacing="-0.04em"
      >
        Ovrule
      </text>
    </svg>
  );
}
