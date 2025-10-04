'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Anasayfa', href: '/' },
    { name: 'Validator', href: '/validator' },
    { name: 'Portfolyo', href: '/portfolio' },
    { name: 'Governance', href: '/governance' },
    { name: 'Launchpad', href: '/launchpad' },
  ];

  return (
    <nav className="glass-effect flex overflow-x-auto px-3 py-2 rounded-xl shadow-md border border-white/20 mx-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${
              isActive
                ? 'bg-primary text-white font-medium shadow-md'
                : 'text-foreground hover:bg-background-secondary'
            } px-4 py-2 rounded-lg transition-all duration-200 text-sm whitespace-nowrap mx-1`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}