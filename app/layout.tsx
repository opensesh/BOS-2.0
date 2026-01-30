import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { ChatProvider } from '@/lib/chat-context';
import { MobileMenuProvider } from '@/lib/mobile-menu-context';
import { VercelAnalytics } from '@/components/VercelAnalytics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Brand Operating System',
  description: 'Your AI-powered brand management platform built with Next.js and BRAND-OS styling',
  icons: {
    apple: '/assets/icons/OS_brand_favicon.png',
  },
  openGraph: {
    title: 'Brand Operating System',
    description: 'Your AI-powered brand management platform',
    images: [{ url: '/og-image.webp', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ChatProvider>
            <MobileMenuProvider>
              {children}
            </MobileMenuProvider>
          </ChatProvider>
        </ThemeProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
