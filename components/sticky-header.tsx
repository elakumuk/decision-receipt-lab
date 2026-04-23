import Link from "next/link";

const links: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/demo?state=refused", label: "Live demo" },
  { href: "#about", label: "Docs" },
  { href: "https://github.com/elakumuk/decision-receipt-lab", label: "GitHub", external: true },
  { href: "#how-it-works", label: "How it works" },
];

export function StickyHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0a0a0b]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-[18px] font-semibold tracking-[-0.03em] text-neutral-50">
          Ovrule
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-neutral-400 md:flex">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-neutral-100"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="transition hover:text-neutral-100">
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
