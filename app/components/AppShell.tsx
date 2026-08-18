"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Hoje" },
  { href: "/train", label: "Treinar" },
  { href: "/progress", label: "Progresso" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Poker Loop — Hoje">
          <span className="brand-mark" aria-hidden="true">∞</span>
          <span>POKER LOOP</span>
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={active ? "nav-link active" : "nav-link"}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="page-wrap">{children}</main>
    </div>
  );
}
