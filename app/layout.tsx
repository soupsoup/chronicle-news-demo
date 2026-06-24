import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import AuthStatus from '@/components/AuthStatus'
import Link from 'next/link'

// DEMO BUILD — the real app loads Inter via next/font/google, which fetches
// from Google Fonts at build time. Swapped for a system font stack so the
// demo builds offline without depending on an external network call.
const inter = { className: 'font-sans' }

export const metadata: Metadata = {
  title: 'Chronicle Admin',
  description: 'Admin interface for Chronicle news app',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold text-white">Chronicle Admin</h1>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/stories" className="text-gray-300 hover:text-white transition-colors">Stories</Link>
              <Link href="/sources/rss" className="text-gray-300 hover:text-white transition-colors">RSS Feeds</Link>
              <Link href="/sources/url" className="text-gray-300 hover:text-white transition-colors">Atomize URL</Link>
              <Link href="/atoms/draft" className="text-gray-300 hover:text-white transition-colors">Draft Atoms</Link>
            </nav>
            <AuthStatus />
          </header>
          <main className="container mx-auto p-4 bg-white shadow-sm rounded-lg mt-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
