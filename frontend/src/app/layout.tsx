import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from '@/providers';
import Image from "next/image";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StakeHub - Monad Validator Platform",
  description: "Monad ağı için validator-kullanıcı etkileşim platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
            
            <footer className="bg-gray-50 dark:bg-gray-900/30 py-10 mt-auto">
              <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Image src="/globe.svg" alt="Monad Logo" width={24} height={24} className="opacity-70" />
                    <span className="font-medium text-gray-600 dark:text-gray-300">StakeHub</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Monad Testnet</span>
                  </div>
                  
                  <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <a href="#" className="hover:text-gray-800 dark:hover:text-white">Docs</a>
                    <a href="#" className="hover:text-gray-800 dark:hover:text-white">Github</a>
                    <a href="#" className="hover:text-gray-800 dark:hover:text-white">Twitter</a>
                    <a href="#" className="hover:text-gray-800 dark:hover:text-white">Discord</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
