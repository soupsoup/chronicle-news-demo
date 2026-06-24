'use client';

import { useState, useCallback, useRef } from 'react';
import { Atom, ImageContent } from '@/types/atoms';
import { useMediaUpload } from '../hooks/useMediaUpload';

interface ImageAtomEditorProps {
  atom: Atom;
  onUpdate: (id: string, updates: Partial<Atom>) => Promise<void>;
}

export default function ImageAtomEditor({ atom, onUpdate }: ImageAtomEditorProps) {
  const content = atom.rich_content as ImageContent;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, error: uploadError, upload, deleteMedia } = useMediaUpload();

  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    const result = await upload(file);
    if (result) {
      onUpdate(atom.id, {
        rich_content: {
          ...content,
          url: result.url,
          storageKey: result.storageKey,
        } as ImageContent,
      });
    }
  }, [atom.id, content, onUpdate, upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback(async () => {
    if (content.storageKey) {
      await deleteMedia(content.storageKey);
    }
    onUpdate(atom.id, {
      rich_content: {
        url: '',
        alt: content.alt || '',
        caption: content.caption,
      } as ImageContent,
    });
  }, [atom.id, content, deleteMedia, onUpdate]);

  const updateField = useCallback((field: keyof ImageContent, value: string) => {
    onUpdate(atom.id, {
      rich_content: {
        ...content,
        [field]: value,
      } as ImageContent,
    });
  }, [atom.id, content, onUpdate]);

  return (
    <div className="image-atom-editor space-y-4">
      {/* Image Preview/Upload Area */}
      {content?.url ? (
        <div className="relative group">
          <img
            src={content.url}
            alt={content.alt || 'Atom image'}
            className="w-full max-h-80 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-gray-800 rounded-md mr-2 hover:bg-gray-100"
            >
              Replace
            </button>
            <button
              onClick={handleRemoveImage}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
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
                Drag and drop an image, or click to select
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
        onChange={handleInputChange}
        className="hidden"
      />

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={content?.alt || ''}
          onChange={(e) => updateField('alt', e.target.value)}
          placeholder="Describe the image for accessibility"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Caption (optional)
        </label>
        <input
          type="text"
          value={content?.caption || ''}
          onChange={(e) => updateField('caption', e.target.value)}
          placeholder="Image caption"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>
    </div>
  );
}
