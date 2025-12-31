import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/components/ThemeProvider'
import LayoutWrapper from '@/components/LayoutWrapper'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FitFlow',
  description: 'Your all-in-one health and fitness tracking companion',
  manifest: '/manifest.json',
  themeColor: '#F59E0B',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitFlow',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-gray-50 dark:bg-gray-900 transition-colors`}>
        <AuthProvider>
          <ThemeProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <PWAInstallPrompt />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
