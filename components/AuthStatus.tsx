'use client'

import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function AuthStatus() {
  const { session, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div> // Render a placeholder during loading
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-gray-300">Hello, {session.user.email}</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => router.push('/login')}
      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Login
    </button>
  )
}
