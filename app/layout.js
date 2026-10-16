import { Italiana, Jost, Pinyon_Script } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
import './globals.css';

// Headings: Italiana (thin, elegant). Body: Jost. Signature: Pinyon Script.
const display = Italiana({ subsets: ['latin'], weight: '400', variable: '--nf-display' });
const body = Jost({ subsets: ['latin'], weight: 'variable', variable: '--nf-body' });
const script = Pinyon_Script({ subsets: ['latin'], weight: '400', variable: '--nf-script' });

export const viewport = { themeColor: '#f4e9e2' };

// Resolves relative canonical / Open Graph URLs into absolute ones
export const metadata = { metadataBase: new URL(SITE_URL) };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
