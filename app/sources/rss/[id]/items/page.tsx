'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface RssItem {
  id: string
  feed_id: string
  url: string
  title: string | null
  description: string | null
  status: string
  discovered_at: string
}

export default function RssItemsPage() {
  const params = useParams()
  const feedId = params.id as string

  const [items, setItems] = useState<RssItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedUrl, setFeedUrl] = useState<string | null>(null)
  const [atomizingItemId, setAtomizingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (feedId) {
      fetchFeedDetails(feedId)
      fetchRssItems(feedId)
    }
  }, [feedId])

  const fetchFeedDetails = async (id: string) => {
    const { data, error } = await supabase
      .from('rss_feeds')
      .select('url')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching feed details:', error.message)
    } else if (data) {
      setFeedUrl(data.url)
    }
  }

  const fetchRssItems = async (id: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('rss_items')
      .select('*')
      .eq('feed_id', id)
      .order('discovered_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleAtomize = async (item: RssItem) => {
    setAtomizingItemId(item.id)

    // 1. Create a source entry
    const { data: sourceData, error: sourceError } = await supabase
      .from('sources')
      .insert({
        url: item.url,
        title: item.title,
        status: 'pending', // Will be updated to 'processed' by the Edge Function
      })
      .select('id')
      .single()

    if (sourceError || !sourceData) {
      console.error('Error creating source entry:', sourceError?.message)
      alert('Failed to create source entry for atomization.')
      setAtomizingItemId(null)
      return
    }

    const sourceId = sourceData.id

    // 2. Call the atomize-url Edge Function
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/atomize-url?sourceId=${sourceId}&url=${encodeURIComponent(item.url)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Edge Function returned non-2xx status: ${response.status}`)
      }

      const result = await response.json()

      // 3. Update the rss_item status
      const { error: updateItemError } = await supabase
        .from('rss_items')
        .update({ status: 'processed' }) // Mark as processed after sending to atomizer
        .eq('id', item.id)

      if (updateItemError) {
        console.error('Error updating rss_item status:', updateItemError.message)
      }

      // Redirect to edit the newly created story
      if (result.storyId) {
        window.location.href = `/stories/${result.storyId}/edit`
      } else {
        alert('Story created! Check the Stories page.')
        fetchRssItems(feedId)
      }

    } catch (error: any) {
      console.error('Error atomizing URL:', error.message)
      alert(`Failed to atomize URL: ${error.message}`)

      // If atomization fails, set source status to 'failed'
      await supabase
        .from('sources')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', sourceId)

      setAtomizingItemId(null)
    }
  }

  return (
    <div className="container mx-auto p-4 text-gray-900">
      <h2 className="text-2xl font-bold mb-4">RSS Items for Feed</h2>
      {feedUrl && (
        <p className="mb-4 text-gray-600">
          Viewing items from: <a href={feedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{feedUrl}</a>
        </p>
      )}
      <Link href="/sources/rss" className="bg-gray-200 text-gray-800 px-4 py-2 rounded mb-4 inline-block hover:bg-gray-300">
        &larr; Back to RSS Feeds
      </Link>

      {loading && <p>Loading RSS items...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && items.length === 0 && !error && (
        <p>No RSS items found for this feed yet. The feed might not have been checked or has no new items.</p>
      )}

      {!loading && items.length > 0 && (
        <div className="bg-white shadow rounded-lg mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discovered At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.title || 'No Title'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Link
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.discovered_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {item.status !== 'processed' && (
                      <button
                        onClick={() => handleAtomize(item)}
                        className={`mr-4 ${atomizingItemId === item.id ? 'text-gray-400' : 'text-indigo-600 hover:text-indigo-900'}`}
                        disabled={atomizingItemId !== null}
                      >
                        {atomizingItemId === item.id ? 'Atomizing...' : 'Atomize'}
                      </button>
                    )}
                    {/* Other actions */}
                    <button className="text-yellow-600 hover:text-yellow-900" disabled={atomizingItemId !== null}>Ignore</button>
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
