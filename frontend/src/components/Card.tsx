'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
}

export function Card({ children, className = '', variant = 'default', hover = true }: CardProps) {
  let cardClass = '';
  
  switch (variant) {
    case 'glass':
      cardClass = 'glass-card';
      break;
    case 'gradient':
      cardClass = 'gradient-bg text-white';
      break;
    default:
      cardClass = 'premium-card';
  }
  
  return (
    <div className={`
      ${cardClass}
      ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}