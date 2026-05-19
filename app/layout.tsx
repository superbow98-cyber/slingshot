import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Slingshot · Website builder for Malaysian businesses',
  description: 'Build your business website in minutes. Customer app, owner dashboard, kitchen display, and counter display — all in one. RM 79/month.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
