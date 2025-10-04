'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

export function SectionHeader({ title, subtitle, align = 'left' }: SectionHeaderProps) {
  const alignClass = 
    align === 'center' ? 'text-center mx-auto' : 
    align === 'right' ? 'text-right ml-auto' : '';
  
  return (
    <div className={`mb-8 max-w-3xl ${alignClass}`}>
      <h2 className="text-3xl font-bold mb-3 text-foreground">{title}</h2>
      {subtitle && <p className="text-secondary text-lg">{subtitle}</p>}
    </div>
  );
}