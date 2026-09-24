"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Request hub", match: (p: string) => !p.startsWith("/admin") },
  { href: "/admin", label: "Admin", match: (p: string) => p.startsWith("/admin") },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="wordmark" aria-label="Marketing Request Forms — home">
          <span className="wordmark__mark" aria-hidden="true">
            m
          </span>
          <span>Marketing Request Forms</span>
          <span className="wordmark__tag">Internal</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.match(pathname) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
