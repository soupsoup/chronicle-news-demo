'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

interface RssFeed {
  id: string
  url: string
  name: string | null
  category: string | null
  last_checked: string | null
  is_active: boolean
  created_at: string
}

export default function RssFeedsPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [newFeedName, setNewFeedName] = useState('')
  const [newFeedCategory, setNewFeedCategory] = useState('')
  const [addingFeed, setAddingFeed] = useState(false)
  const [addFeedError, setAddFeedError] = useState<string | null>(null)

  const [checkingFeeds, setCheckingFeeds] = useState(false)
  const [checkFeedsError, setCheckFeedsError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setFeeds(data || [])
    }
    setLoading(false)
  }

  const handleCheckFeeds = async () => {
    setCheckingFeeds(true)
    setCheckFeedsError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-rss-feeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Edge Function returned non-2xx status: ${response.status}`)
      }

      const result = await response.json()
      alert(`Feeds checked successfully! Processed: ${result.processed}, New Items: ${result.newItems}`)
      fetchFeeds() // Refresh feed list, which will update 'last_checked'

    } catch (error: any) {
      setCheckFeedsError(error.message)
      alert(`Failed to check feeds: ${error.message}`)
    } finally {
      setCheckingFeeds(false)
    }
  }

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingFeed(true)
    setAddFeedError(null)

    const feedData = {
      url: newFeedUrl,
      name: newFeedName || null,
      category: newFeedCategory || null,
    }

    const { error } = await supabase
      .from('rss_feeds')
      .insert(feedData)

    if (error) {
      setAddFeedError(error.message)
    } else {
      setNewFeedUrl('')
      setNewFeedName('')
      setNewFeedCategory('')
      fetchFeeds() // Refresh the list
    }
    setAddingFeed(false)
  }

  const handleDeleteFeed = async (id: string) => {
    if (confirm('Are you sure you want to delete this RSS feed?')) {
      const { error } = await supabase
        .from('rss_feeds')
        .delete()
        .eq('id', id)

      if (error) {
        alert(`Error deleting feed: ${error.message}`)
      } else {
        fetchFeeds() // Refresh the list
      }
    }
  }

  const handleToggleActive = async (feed: RssFeed) => {
    const { error } = await supabase
      .from('rss_feeds')
      .update({ is_active: !feed.is_active })
      .eq('id', feed.id)

    if (error) {
      alert(`Error updating feed status: ${error.message}`)
    } else {
      fetchFeeds() // Refresh the list
    }
  }

  return (
    <div className="container mx-auto p-4 text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Manage RSS Feeds</h2>

      <div className="flex justify-between mb-4">
        <Link
          href="/sources/url"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Atomize URL
        </Link>
        <button
          onClick={handleCheckFeeds}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={loading || checkingFeeds}
        >
          {checkingFeeds ? 'Checking...' : 'Check Feeds Now'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New RSS Feed</h3>
        <form onSubmit={handleAddFeed} className="space-y-4">
          <div>
            <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700">Feed URL</label>
            <input
              type="url"
              id="feedUrl"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="feedName" className="block text-sm font-medium text-gray-700">Name (Optional)</label>
            <input
              type="text"
              id="feedName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="feedCategory" className="block text-sm font-medium text-gray-700">Category (Optional)</label>
            <input
              type="text"
              id="feedCategory"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
              value={newFeedCategory}
              onChange={(e) => setNewFeedCategory(e.target.value)}
            />
          </div>
          {addFeedError && <p className="text-red-500 text-sm">{addFeedError}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={addingFeed}
          >
            {addingFeed ? 'Adding...' : 'Add Feed'}
          </button>
        </form>
      </div>

      <h3 className="text-xl font-semibold mb-4">Existing RSS Feeds</h3>
      {loading && <p>Loading RSS feeds...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && feeds.length === 0 && !error && (
        <p>No RSS feeds added yet.</p>
      )}

      {!loading && feeds.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeds.map((feed) => (
                <tr key={feed.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <a href={feed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {feed.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feed.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feed.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feed.last_checked ? new Date(feed.last_checked).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      checked={feed.is_active}
                      onChange={() => handleToggleActive(feed)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/sources/rss/${feed.id}/items`} className="text-blue-600 hover:text-blue-800 mr-4">
                      View Items
                    </Link>
                    <button
                      onClick={() => handleDeleteFeed(feed.id)}
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
