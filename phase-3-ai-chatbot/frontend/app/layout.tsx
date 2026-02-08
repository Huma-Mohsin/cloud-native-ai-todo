import type { Metadata } from 'next'
import './globals.css'
import '../styles/metallic-chic-theme.css'
import { ClientProviders } from '@/components/providers/ClientProviders'

export const metadata: Metadata = {
  title: 'Phase III AI Chatbot',
  description: 'AI-powered task management chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark-900 text-light-100">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
