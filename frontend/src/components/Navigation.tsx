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
    <div className="flex overflow-x-auto py-1 px-2 rounded-full bg-white/10 backdrop-blur-md shadow-sm border border-white/20">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${
              isActive
                ? 'bg-white/15 text-white font-medium'
                : 'text-blue-100 hover:text-white'
            } px-4 py-2 rounded-full transition-colors text-sm whitespace-nowrap`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}