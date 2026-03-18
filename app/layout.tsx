import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Note Assistant',
  description: 'AI-powered note summarization tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
