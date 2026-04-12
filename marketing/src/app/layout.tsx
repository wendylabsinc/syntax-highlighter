import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Footer } from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Syntax Highlighter for Adobe After Effects',
    template: '%s | Syntax Highlighter',
  },
  description:
    'Syntax highlight code in Adobe After Effects text layers. 690+ languages, 130+ themes, one-click formatting powered by Shiki.',
  keywords: [
    'Syntax Highlighter',
    'After Effects',
    'Adobe',
    'CEP',
    'code highlighting',
    'text layers',
    'Shiki',
    'motion graphics',
  ],
  authors: [{ name: 'Wendy Labs' }],
  creator: 'Wendy Labs',
  publisher: 'Wendy Labs',
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'Syntax Highlighter for Adobe After Effects',
    description:
      'Syntax highlight code in Adobe After Effects text layers. 690+ languages, 130+ themes, one-click formatting.',
    siteName: 'Syntax Highlighter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syntax Highlighter for Adobe After Effects',
    description:
      'Syntax highlight code in Adobe After Effects text layers. 690+ languages, 130+ themes, one-click formatting.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`h-screen ${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
