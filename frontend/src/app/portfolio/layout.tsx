'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';

export default function PortfolioLayout({ 
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Portfolio Header */}
      <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-light py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-white bg-opacity-10 p-2 rounded-full">
                <Image src="/globe.svg" alt="Monad Logo" width={24} height={24} className="filter brightness-0 invert" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">StakeHub</h3>
                <p className="text-xs text-blue-100">Monad Testnet Platformu</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white hover:text-blue-100 transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/#validators" className="text-white hover:text-blue-100 transition-colors">
                Validatorlar
              </Link>
              <Link href="/#stake" className="text-white hover:text-blue-100 transition-colors">
                Stake Et
              </Link>
              <div className="h-4 border-r border-white/30 mx-2"></div>
              <Link 
                href="/portfolio" 
                className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg text-white transition-all"
              >
                Portfolyo
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <main>{children}</main>
      
      {/* Portfolio Footer */}
      <footer className="bg-background-secondary dark:bg-background-secondary/50 border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="bg-primary bg-opacity-10 p-2 rounded-full">
                <Image src="/globe.svg" alt="Monad Logo" width={16} height={16} className="filter brightness-0" />
              </div>
              <div>
                <h3 className="text-sm font-bold">StakeHub</h3>
                <p className="text-xs text-secondary">Monad Testnet Platformu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">
                Yardım
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">
                Gizlilik Politikası
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">
                Kullanım Şartları
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}