import type { Metadata } from 'next';
import { Prompt, Sarabun, Inter } from 'next/font/google';
import './globals.css';

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-prompt',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false,
});

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sarabun',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'KHH Safe-Connect — NCDs Care & Requisition Portal',
  description: 'ระบบดูแล ติดตาม และสื่อสารกับผู้ป่วยโรคไม่ติดต่อเรื้อรัง (NCDs) โรงพยาบาลส่งเสริมสุขภาพตำบล KHH',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${prompt.variable} ${sarabun.variable} ${inter.variable} h-full`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
