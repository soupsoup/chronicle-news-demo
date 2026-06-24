'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase'

interface StoryFormProps {
  storyId?: string // Optional for create mode
}

interface Story {
  id: string
  title: string
  summary: string | null
  category: string | null
  status: string
}

interface Atom {
  id: string
  story_id: string
  content: string
  source_url: string | null
  source_title: string | null
  position: number
  created_at: string
}

export default function StoryForm({ storyId }: StoryFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('draft')
  const [atoms, setAtoms] = useState<Atom[]>([]) // New state for atoms
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (storyId) {
      fetchStoryData(storyId) // Renamed for clarity
    }
  }, [storyId])

  const fetchStoryData = async (id: string) => { // Renamed
    console.log('Fetching story with ID:', id);
    setLoading(true)
    setError(null)
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single()

    if (storyError) {
      console.error('Error fetching story:', storyError.message);
      setError(storyError.message)
      alert(`Error fetching story: ${storyError.message}`);
    } else if (storyData) {
      console.log('Fetched story data:', storyData);
      setTitle(storyData.title)
      setSummary(storyData.summary || '')
      setCategory(storyData.category || '')
      setStatus(storyData.status)
      console.log('Populating form with:', {
        title: storyData.title,
        summary: storyData.summary,
        category: storyData.category,
        status: storyData.status,
      });

      // Fetch associated atoms
      const { data: atomsData, error: atomsError } = await supabase
        .from('atoms')
        .select('*')
        .eq('story_id', id)
        .order('position')

      if (atomsError) {
        console.error('Error fetching atoms:', atomsError.message);
        alert(`Error fetching atoms: ${atomsError.message}`);
      } else {
        setAtoms(atomsData || [])
        console.log('Fetched atoms:', atomsData);
      }
    } else {
      console.log('No story data found for ID:', id);
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const storyData = {
      title,
      summary: summary || null,
      category: category || null,
      status,
    }

    let error;

    if (storyId) {
      // Update existing story
      const result = await supabase
        .from('stories')
        .update(storyData)
        .eq('id', storyId)
      error = result.error
    } else {
      // Create new story
      const result = await supabase
        .from('stories')
        .insert({ ...storyData, id: crypto.randomUUID() })
      error = result.error
    }

    if (error) {
      setError(error.message)
    } else {
      router.push('/stories')
    }
    setLoading(false)
  }

  if (loading && storyId) {
    return <p>Loading story data...</p>
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">{storyId ? 'Edit Story' : 'Create New Story'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea
            id="summary"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            id="category"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {storyId && atoms.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Atoms</h3>
            <ul className="list-decimal pl-5 space-y-2">
              {atoms.map((atom) => (
                <li key={atom.id} className="text-gray-800">
                  {atom.content}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : (storyId ? 'Update Story' : 'Create Story')}
        </button>
      </form>
    </div>
  )
}
