'use client';

import { useCallback } from 'react';
import { Atom, QuoteContent } from '@/types/atoms';

interface QuoteAtomEditorProps {
  atom: Atom;
  onUpdate: (id: string, updates: Partial<Atom>) => Promise<void>;
}

export default function QuoteAtomEditor({ atom, onUpdate }: QuoteAtomEditorProps) {
  const content = atom.rich_content as QuoteContent;

  const updateField = useCallback((field: keyof QuoteContent, value: string) => {
    const updatedContent = {
      ...content,
      [field]: value,
    } as QuoteContent;

    onUpdate(atom.id, {
      content: updatedContent.text,
      rich_content: updatedContent,
    });
  }, [atom.id, content, onUpdate]);

  return (
    <div className="quote-atom-editor space-y-4">
      {/* Quote Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quote
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-4xl text-gray-200 font-serif leading-none">
            &ldquo;
          </span>
          <textarea
            value={content?.text || ''}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Enter the quote text..."
            rows={4}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg italic resize-y"
          />
        </div>
      </div>

      {/* Attribution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attribution
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">&mdash;</span>
          <input
            type="text"
            value={content?.attribution || ''}
            onChange={(e) => updateField('attribution', e.target.value)}
            placeholder="Who said this? (e.g., John Doe, CEO of Company)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Source URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source URL (optional)
        </label>
        <input
          type="url"
          value={content?.sourceUrl || ''}
          onChange={(e) => updateField('sourceUrl', e.target.value)}
          placeholder="https://source.com/article"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Preview */}
      {content?.text && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-lg italic text-gray-700">
            &ldquo;{content.text}&rdquo;
          </p>
          {content.attribution && (
            <p className="mt-2 text-sm text-gray-500">
              &mdash; {content.attribution}
              {content.sourceUrl && (
                <a
                  href={content.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  (source)
                </a>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
