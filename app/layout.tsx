import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { GlobalThemeProvider } from "@/components/providers/global-theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Davel Library - Modern Digital Library Management System",
  description: "A comprehensive library management system with digital catalog, book reservations, member management, and modern features. Access books, manage memberships, and explore our digital library from anywhere.",
  keywords: "library, digital library, book management, library system, book reservations, member management, Davel Library, online library, library catalog, digital books, library services",
  authors: [{ name: "Davel Library" }],
  creator: "Davel Library",
  publisher: "Davel Library",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://davel-library.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Davel Library - Modern Digital Library Management",
    description: "A comprehensive library management system with digital catalog, book reservations, and member management.",
    url: 'https://davel-library.vercel.app',
    siteName: 'Davel Library',
    images: [
      {
        url: '/images/library-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Davel Library - Modern Digital Library',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Davel Library - Modern Digital Library Management",
    description: "A comprehensive library management system with digital catalog and modern features.",
    images: ['/images/library-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
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
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        
        {/* Viewport meta for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#8B4513" />
        <meta name="msapplication-TileColor" content="#8B4513" />
        
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen-safe safe-area-inset" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <GlobalThemeProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </GlobalThemeProvider>
      </body>
    </html>
  )
}
