'use client'

import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Loading authentication...</p>
      </div>
    )
  }

  if (!session) {
    // This redirect will happen on the client-side after initial load if session is null
    redirect('/login')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Chronicle Admin Dashboard</h2>
      <p className="text-lg text-gray-600">You are logged in as: {session.user?.email}</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Manage Stories</h3>
          <p className="text-gray-600">Create, edit, and publish news stories.</p>
          <a href="/stories" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">Go to Stories &rarr;</a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Manage Sources</h3>
          <p className="text-gray-600">Add URLs and RSS feeds for atomization.</p>
          <a href="/sources/rss" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">Go to Sources &rarr;</a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Review Draft Atoms</h3>
          <p className="text-gray-600">Approve or edit AI-generated atomic facts.</p>
          <a href="/atoms/draft" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">Review Atoms &rarr;</a>
        </div>
      </div>
    </div>
  )
}