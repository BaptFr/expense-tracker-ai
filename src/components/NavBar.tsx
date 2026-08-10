"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/expenses", label: "Dépenses" },
  { href: "/insights", label: "Aperçu" },
  { href: "/top-categories", label: "Top catégories" },
  { href: "/top-vendors", label: "Top dépenses" },
  { href: "/export", label: "Export" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#e1e0d9] bg-[#fcfcfb]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2a78d6] text-white">
            <svg width="100%" viewBox="0 0 64 64" role="img" xmlns="http://www.w3.org/2000/svg">
              <text x="32" y="51" font-size="56" font-weight="600" text-anchor="middle" fill="white">€</text>
            </svg>
          </div>
          <span className="text-base font-semibold text-[#0b0b0b]">Expensely</span>
        </div>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#eaf2fc] text-[#2a78d6]"
                    : "text-[#52514e] hover:bg-[#f0efec] hover:text-[#0b0b0b]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
