import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tickon | Lightweight Project Management',
  description: 'Fast, lightweight project planning, kanban boards, and real-time collaboration.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-neutral-950 text-neutral-100 antialiased`}>
        <QueryProvider>
          {children}
          <Toaster richColors theme="dark" position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
