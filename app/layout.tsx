import type { Metadata } from 'next'
import { Playfair_Display, Lato, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SevNotes — Catatan Pribadimu',
  description: 'Simpan catatan, file, dan kelola tugasmu dengan rapi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${playfair.variable} ${lato.variable} ${jetbrains.variable}`}>
      <body className="font-body bg-paper-100 text-ink-900 antialiased">
        {children}
      </body>
    </html>
  )
}
