'use client'

import { use } from 'react'
import StoryEditor from '@/components/story-editor/StoryEditor'

interface EditStoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-gray-50">
      <StoryEditor storyId={id} />
    </div>
  )
}
