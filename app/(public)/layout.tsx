import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import ConvexClerkProvider from "@/components/ConvexProviderWithClerk";
import Footer from '@/components/Footer'
import ConciergeWidget from '@/components/ConciergeWidget'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Velo',
  description: 'The premier car dealership web app.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClerkProvider>
            <Navbar />
            {children}
            <ConciergeWidget />
            <Footer />
          </ConvexClerkProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}