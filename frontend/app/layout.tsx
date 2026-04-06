import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TransitionProvider } from "@/components/GlobalTransition"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Absenin",
  description: "Modern HR Attendance System",
  generator: "Absenin Engine",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png' },
    ],
  },
}

import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider>
            <TransitionProvider>
              {children}
              <Toaster position="top-center" richColors />
            </TransitionProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
