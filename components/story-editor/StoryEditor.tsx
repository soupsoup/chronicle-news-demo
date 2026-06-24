'use client';

import { useState, useRef } from 'react';
import { useStoryEditor } from './hooks/useStoryEditor';
import { useMediaUpload } from './hooks/useMediaUpload';
import AtomList from './AtomList';
import AddAtomButton from './AddAtomButton';
import { Story } from '@/types/atoms';

interface StoryEditorProps {
  storyId: string;
}

export default function StoryEditor({ storyId }: StoryEditorProps) {
  const {
    story,
    atoms,
    loading,
    saving,
    error,
    updateStory,
    addAtom,
    updateAtom,
    publishAtom,
    deleteAtom,
    reorderAtoms,
    saveAll,
  } = useStoryEditor({ storyId });

  const { uploading, progress, error: uploadError, upload } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storyForm, setStoryForm] = useState({
    title: '',
    summary: '',
    category: '',
    status: 'draft',
    image_url: '',
    image_credit: '',
  });
  const [formInitialized, setFormInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Initialize form when story loads
  if (story && !formInitialized) {
    setStoryForm({
      title: story.title || '',
      summary: story.summary || '',
      category: story.category || '',
      status: story.status || 'draft',
      image_url: story.image_url || '',
      image_credit: story.image_credit || '',
    });
    setFormInitialized(true);
  }

  const handleStoryFieldChange = (field: keyof Story, value: string) => {
    setStoryForm(prev => ({ ...prev, [field]: value }));
    updateStory({ [field]: value });
  };

  const handleImageUpload = async (file: File) => {
    const result = await upload(file);
    if (result) {
      setStoryForm(prev => ({ ...prev, image_url: result.url }));
      updateStory({ image_url: result.url });
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setStoryForm(prev => ({ ...prev, image_url: '' }));
    updateStory({ image_url: '' });
  };

  const handleGenerateSummary = async () => {
    if (!storyForm.title || atoms.length === 0) {
      setSummaryError('Add a title and at least one atom before generating a summary');
      return;
    }

    setGeneratingSummary(true);
    setSummaryError(null);

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: storyForm.title,
          atoms: atoms.map(a => ({
            type: a.type,
            content: a.content,
            rich_content: a.rich_content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setStoryForm(prev => ({ ...prev, summary: data.summary }));
      updateStory({ summary: data.summary });
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading story...</span>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Story not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with save status */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Story</h1>
        <div className="flex items-center gap-4">
          {saving && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              Saving...
            </span>
          )}
          {!saving && (
            <span className="text-sm text-green-600">All changes saved</span>
          )}
          <button
            onClick={saveAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Now
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Story Metadata Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Story Details</h2>

        <div className="space-y-4">
          {/* Lead Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Image <span className="text-red-500">*</span>
            </label>
            {storyForm.image_url ? (
              <div className="relative group">
                <img
                  src={storyForm.image_url}
                  alt="Lead image"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md mr-2 hover:bg-gray-100"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleImageDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {uploading ? (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">Uploading... {progress}%</p>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop a lead image, or click to select
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      JPEG, PNG, GIF, WebP up to 10MB
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageInputChange}
              className="hidden"
            />
            {uploadError && (
              <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            )}
            {/* Photo Credit */}
            <div className="mt-2">
              <label htmlFor="image_credit" className="block text-sm font-medium text-gray-700 mb-1">
                Photo Credit
              </label>
              <input
                type="text"
                id="image_credit"
                value={storyForm.image_credit}
                onChange={(e) => handleStoryFieldChange('image_credit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Photo by John Doe / Reuters"
              />
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={storyForm.title}
              onChange={(e) => handleStoryFieldChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Story title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                Summary
              </label>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={generatingSummary || !storyForm.title || atoms.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingSummary ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"/>
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
            <textarea
              id="summary"
              value={storyForm.summary}
              onChange={(e) => handleStoryFieldChange('summary', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief summary of the story"
            />
            {summaryError && (
              <p className="mt-1 text-sm text-red-600">{summaryError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={storyForm.category}
                onChange={(e) => handleStoryFieldChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Technology, Politics"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={storyForm.status}
                onChange={(e) => handleStoryFieldChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Atoms Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Atoms ({atoms.length})
          </h2>
          <AddAtomButton onAdd={addAtom} />
        </div>

        {atoms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No atoms yet. Add your first atom to get started.</p>
            <AddAtomButton onAdd={addAtom} variant="large" />
          </div>
        ) : (
          <AtomList
            atoms={atoms}
            onUpdate={updateAtom}
            onPublish={publishAtom}
            onDelete={deleteAtom}
            onReorder={reorderAtoms}
          />
        )}
      </div>
    </div>
  );
}
