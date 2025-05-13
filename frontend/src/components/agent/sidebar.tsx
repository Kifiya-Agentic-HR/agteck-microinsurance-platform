'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/agent', label: 'Enrollment' },
    { href: '/agent/premium', label: 'Premium' },
    { href: '/agent/renrollment', label: 'Re-enrollment' },
    { href: '/agent/policy', label: 'Policy' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md p-6">
      <h1 className="text-2xl font-bold text-black mb-6">Agent Dashboard</h1>
      <nav className="space-y-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block text-black hover:text-green-600 ${
              pathname === link.href ? 'font-bold text-green-600' : ''
            }`}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}