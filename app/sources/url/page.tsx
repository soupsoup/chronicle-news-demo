'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'

export default function UrlSourcePage() {
  const [url, setUrl] = useState('')
  const [atomizing, setAtomizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAtomize = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setAtomizing(true)
    setError(null)

    // 1. Create a source entry
    const { data: sourceData, error: sourceError } = await supabase
      .from('sources')
      .insert({
        url: url,
        status: 'pending',
      })
      .select('id')
      .single()

    if (sourceError || !sourceData) {
      console.error('Error creating source entry:', sourceError?.message)
      setError('Failed to create source entry for atomization.')
      setAtomizing(false)
      return
    }

    const sourceId = sourceData.id

    // 2. Call the atomize-url Edge Function
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/atomize-url?sourceId=${sourceId}&url=${encodeURIComponent(url)}`, {
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

      // Redirect to edit the newly created story
      if (result.storyId) {
        window.location.href = `/stories/${result.storyId}/edit`
      } else {
        setError('Story created but no ID returned. Check the Stories page.')
        setAtomizing(false)
      }

    } catch (err: any) {
      console.error('Error atomizing URL:', err.message)
      setError(`Failed to atomize URL: ${err.message}`)

      // If atomization fails, set source status to 'failed'
      await supabase
        .from('sources')
        .update({ status: 'failed', error_message: err.message })
        .eq('id', sourceId)

      setAtomizing(false)
    }
  }

  return (
    <div className="container mx-auto p-4 text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Atomize URL</h2>

      <div className="mb-4">
        <Link href="/sources/rss" className="text-blue-600 hover:underline">
          &larr; Back to RSS Feeds
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <p className="text-gray-600 mb-4">
          Paste an article URL below to extract atomic facts and create a new story.
        </p>

        <form onSubmit={handleAtomize} className="space-y-4">
          <div>
            <label htmlFor="articleUrl" className="block text-sm font-medium text-gray-700">
              Article URL
            </label>
            <input
              type="url"
              id="articleUrl"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              disabled={atomizing}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white ${
              atomizing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            disabled={atomizing}
          >
            {atomizing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atomizing...
              </span>
            ) : (
              'Atomize Article'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">How it works:</h3>
          <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
            <li>Paste any article URL above</li>
            <li>Click &quot;Atomize Article&quot; to extract facts</li>
            <li>You&apos;ll be redirected to edit the story with extracted atoms</li>
            <li>Review and edit the atoms as needed</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
