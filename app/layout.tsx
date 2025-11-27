import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { VercelAnalytics } from '@/components/VercelAnalytics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Brand Operating System',
  description: 'Your AI-powered brand management platform built with Next.js and BRAND-OS styling',
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
          {children}
        </ThemeProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}

