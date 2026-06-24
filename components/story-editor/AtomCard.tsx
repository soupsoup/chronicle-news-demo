'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Atom } from '@/types/atoms';
import TextAtomEditor from './atoms/TextAtomEditor';
import ImageAtomEditor from './atoms/ImageAtomEditor';
import VideoAtomEditor from './atoms/VideoAtomEditor';
import QuoteAtomEditor from './atoms/QuoteAtomEditor';

interface AtomCardProps {
  atom: Atom;
  onUpdate: (id: string, updates: Partial<Atom>) => Promise<void>;
  onPublish: (id: string, sendPush: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const atomTypeLabels = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  quote: 'Quote',
};

const atomTypeColors = {
  text: 'bg-blue-100 text-blue-700',
  image: 'bg-green-100 text-green-700',
  video: 'bg-purple-100 text-purple-700',
  quote: 'bg-amber-100 text-amber-700',
};

export default function AtomCard({ atom, onUpdate, onPublish, onDelete }: AtomCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sendPush, setSendPush] = useState(atom.send_push ?? false);
  const [publishing, setPublishing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: atom.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(atom.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const renderEditor = () => {
    switch (atom.type) {
      case 'text':
        return <TextAtomEditor atom={atom} onUpdate={onUpdate} />;
      case 'image':
        return <ImageAtomEditor atom={atom} onUpdate={onUpdate} />;
      case 'video':
        return <VideoAtomEditor atom={atom} onUpdate={onUpdate} />;
      case 'quote':
        return <QuoteAtomEditor atom={atom} onUpdate={onUpdate} />;
      default:
        return <div className="text-gray-500">Unknown atom type</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm transition-shadow ${
        isDragging ? 'shadow-lg opacity-90 z-50' : 'hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-gray-50 rounded-t-lg">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          aria-label="Drag to reorder"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </button>

        {/* Type Badge */}
        <span className={`px-2 py-1 text-xs font-medium rounded ${atomTypeColors[atom.type]}`}>
          {atomTypeLabels[atom.type]}
        </span>

        {/* Position */}
        <span className="text-xs text-gray-400">#{atom.position + 1}</span>

        {!atom.is_published && (
          <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
            Draft
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Related Stories */}
        {atom.relatedStories && atom.relatedStories.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Also in:</span>
            {atom.relatedStories.map((story) => (
              <a
                key={story.story_id}
                href={`/stories/${story.story_id}/edit`}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                title={story.title}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="truncate max-w-[150px]">{story.title}</span>
              </a>
            ))}
          </div>
        )}

        {/* Source Link (if available) */}
        {atom.source_url && (
          <a
            href={atom.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px]"
            title={atom.source_title || atom.source_url}
          >
            {atom.source_title || 'Source'}
          </a>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`p-1 rounded transition-colors ${
            showDeleteConfirm
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
          title={showDeleteConfirm ? 'Click again to confirm delete' : 'Delete atom'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        {renderEditor()}
      </div>

      {/* Publish controls */}
      {!atom.is_published && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-t bg-gray-50 rounded-b-lg">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={sendPush}
              onChange={(e) => setSendPush(e.target.checked)}
            />
            Send push alert
          </label>
          <button
            onClick={async () => {
              setPublishing(true);
              try {
                await onPublish(atom.id, sendPush);
              } finally {
                setPublishing(false);
              }
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      )}
    </div>
  );
}
