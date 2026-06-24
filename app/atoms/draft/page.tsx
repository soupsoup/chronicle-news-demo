'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface DraftAtom {
  id: string
  source_id: string
  content: string
  position: number
  is_approved: boolean
  created_at: string
}

interface Source {
  id: string
  url: string
  title: string | null
  story_id: string | null // If source is linked to a story
}

export default function DraftAtomsPage() {
  const router = useRouter()
  const [draftAtoms, setDraftAtoms] = useState<(DraftAtom & { source: Source | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDraftAtoms()
  }, [])

  const fetchDraftAtoms = async () => {
    setLoading(true)
    setError(null)

    // 1. Fetch draft_atoms without the join
    const { data: atomsData, error: atomsError } = await supabase
      .from('draft_atoms')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('is_approved', false) // Only show unapproved draft atoms

    if (atomsError) {
      setError(atomsError.message)
      setLoading(false)
      return
    }

    if (!atomsData || atomsData.length === 0) {
      setDraftAtoms([])
      setLoading(false)
      return
    }

    // 2. Get unique source_id's
    const uniqueSourceIds = Array.from(new Set(atomsData.map((atom: DraftAtom) => atom.source_id)))

    // 3. Fetch sources based on unique source_id's
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('sources')
      .select('id, url, title, story_id')
      .in('id', uniqueSourceIds)

    if (sourcesError) {
      setError(sourcesError.message)
      setLoading(false)
      return
    }

    const sourcesMap = new Map<string, Source>()
    sourcesData?.forEach((source: Source) => sourcesMap.set(source.id, source))

    // 4. Map draft atoms to include their source data
    const combinedData = atomsData.map((atom: DraftAtom) => ({
      ...atom,
      source: sourcesMap.get(atom.source_id) || null,
    })) as (DraftAtom & { source: Source | null })[]

    setDraftAtoms(combinedData)
    setLoading(false)
  }

  const handleApproveAndCreateStory = async (sourceId: string) => {
    // 1. Fetch all draft atoms for this source
    const { data: atomsToApprove, error: fetchError } = await supabase
      .from('draft_atoms')
      .select('*')
      .eq('source_id', sourceId)
      .eq('is_approved', false)
      .order('position')

    if (fetchError || !atomsToApprove || atomsToApprove.length === 0) {
      alert(`Failed to fetch draft atoms for source: ${fetchError?.message || 'No atoms found.'}`)
      return
    }

    // 2. Fetch source details
    const { data: source, error: fetchSourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (fetchSourceError || !source) {
      alert(`Failed to fetch source details: ${fetchSourceError?.message}`)
      return
    }

    // 3. Create a new Story
    const { data: newStory, error: createStoryError } = await supabase
      .from('stories')
      .insert({
        title: source.title || 'Untitled Story',
        summary: null, // Can be added in story editor later
        category: null, // Can be added in story editor later
        status: 'draft', // Initial status
      })
      .select('id')
      .single()

    if (createStoryError || !newStory) {
      alert(`Failed to create new story: ${createStoryError?.message}`)
      return
    }

    const storyId = newStory.id

    // 4. Update draft atoms to be approved and link to new story
    const atomsToInsert = atomsToApprove.map(atom => ({
      story_id: storyId,
      content: atom.content,
      source_url: source.url,
      source_title: source.title,
      position: atom.position,
    }))

    const { error: insertAtomsError } = await supabase
      .from('atoms')
      .insert(atomsToInsert)

    if (insertAtomsError) {
      alert(`Failed to insert atoms for new story: ${insertAtomsError.message}`)
      // Optionally, roll back story creation
      await supabase.from('stories').delete().eq('id', storyId)
      return
    }

    // 5. Mark draft atoms as approved
    const { error: updateDraftError } = await supabase
      .from('draft_atoms')
      .update({ is_approved: true })
      .eq('source_id', sourceId)

    if (updateDraftError) {
      console.error('Failed to mark draft atoms as approved:', updateDraftError.message)
    }

    // 6. Update source to link to the new story
    const { error: updateSourceError } = await supabase
      .from('sources')
      .update({ story_id: storyId, status: 'processed' }) // Mark source as fully processed
      .eq('id', sourceId)

    if (updateSourceError) {
      console.error('Failed to update source with story_id:', updateSourceError.message)
    }

    alert('Story created successfully from draft atoms! Redirecting to edit story.')
    router.push(`/stories/${storyId}/edit`)
  }

  const handleRejectSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to reject this source and delete its draft atoms? This action cannot be undone.')) {
      return
    }

    // 1. Delete draft atoms associated with the source
    const { error: deleteAtomsError } = await supabase
      .from('draft_atoms')
      .delete()
      .eq('source_id', sourceId)

    if (deleteAtomsError) {
      alert(`Failed to delete draft atoms: ${deleteAtomsError.message}`)
      return
    }

    // 2. Delete the source itself
    const { error: deleteSourceError } = await supabase
      .from('sources')
      .delete()
      .eq('id', sourceId)
    
    if (deleteSourceError) {
      alert(`Failed to delete source: ${deleteSourceError.message}`)
      return
    }

    alert('Source and draft atoms rejected and deleted.')
    fetchDraftAtoms() // Refresh list
  }

  if (loading) {
    return <p className="p-4 text-gray-900">Loading draft atoms...</p>
  }

  if (error) {
    return <p className="p-4 text-red-500">Error: {error}</p>
  }

  return (
    <div className="container mx-auto p-4 text-gray-900">
      <h2 className="text-2xl font-bold mb-4">Review Draft Atoms</h2>

      {draftAtoms.length === 0 && (
        <p>No unapproved draft atoms to review.</p>
      )}

      {draftAtoms.length > 0 && (
        <div className="space-y-6">
          {groupDraftAtomsBySource(draftAtoms).map(([source, atoms]) => (
            <div key={source.id} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Source: {source.title || source.url}</h3>
              {source.url && (
                <p className="text-sm text-gray-600 mb-4">
                  URL: <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.url}</a>
                </p>
              )}

              <ul className="list-disc pl-5 space-y-2 mb-4">
                {atoms.map((atom) => (
                  <li key={atom.id} className="text-gray-800">
                    {atom.content}
                  </li>
                ))}
              </ul>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleApproveAndCreateStory(source.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve & Create Story
                </button>
                <button
                  onClick={() => handleRejectSource(source.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper function to group draft atoms by their source
function groupDraftAtomsBySource(atoms: (DraftAtom & { source: Source | null })[]): [Source, DraftAtom[]][] {
  const grouped = new Map<string, { source: Source; atoms: DraftAtom[] }>();

  atoms.forEach(atom => {
    if (atom.source) {
      if (!grouped.has(atom.source.id)) {
        grouped.set(atom.source.id, { source: atom.source, atoms: [] });
      }
      grouped.get(atom.source.id)?.atoms.push(atom);
    }
  });

  return Array.from(grouped.values()).map(group => [group.source, group.atoms]);
}
