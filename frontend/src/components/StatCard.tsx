'use client';

import React from 'react';

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

export function StatCard({ icon, title, value, change, isPositive = true, className = '' }: StatCardProps) {
  return (
    <div className={`dashboard-stat-new p-5 rounded-xl border border-border bg-card-bg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-secondary">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="stat-value">{value}</p>
          {change && (
            <div className={`flex items-center text-xs mt-1 ${isPositive ? 'text-success' : 'text-error'}`}>
              <span className="mr-1">
                {isPositive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                )}
              </span>
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}