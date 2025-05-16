import type { Metadata } from 'next';
// Removed Geist font imports as the package is not found
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// const geistSans = GeistSans; // Removed
// const geistMono = GeistMono; // Removed

export const metadata: Metadata = {
  title: 'FAQ Schema Generator',
  description: 'Generate AI-powered FAQ schema for your webpages.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Removed Geist font variables from className */}
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
