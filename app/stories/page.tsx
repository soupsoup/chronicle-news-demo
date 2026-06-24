'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

interface Story {
  id: string
  title: string
  status: string
  created_at: string
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setStories(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (storyId: string, storyTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${storyTitle}"? This will also delete all associated atoms.`)) {
      return
    }

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)

    if (error) {
      alert(`Failed to delete story: ${error.message}`)
    } else {
      fetchStories()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Stories</h2>
      <Link href="/stories/create" className="bg-blue-600 text-white px-4 py-2 rounded mb-4 inline-block hover:bg-blue-700">
        Create New Story
      </Link>

      {loading && <p>Loading stories...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && stories.length === 0 && !error && (
        <p>No stories found. Create one!</p>
      )}

      {!loading && stories.length > 0 && (
        <div className="bg-white shadow rounded-lg mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stories.map((story) => (
                <tr key={story.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {story.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {story.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(story.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/stories/${story.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(story.id, story.title)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
