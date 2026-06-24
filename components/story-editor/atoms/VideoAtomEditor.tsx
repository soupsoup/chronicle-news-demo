'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Atom, VideoContent } from '@/types/atoms';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(
  () => import('react-player').then((mod) => mod.default),
  { ssr: false }
) as React.ComponentType<{
  url: string;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  light?: boolean;
  playing?: boolean;
}>;

interface VideoAtomEditorProps {
  atom: Atom;
  onUpdate: (id: string, updates: Partial<Atom>) => Promise<void>;
}

type VideoProvider = 'youtube' | 'vimeo' | 'twitter' | 'direct';

interface ParsedVideo {
  provider: VideoProvider;
  embedId?: string;
  url: string;
}

function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url) return null;

  const trimmedUrl = url.trim();

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return {
        provider: 'youtube',
        embedId: match[1],
        url: trimmedUrl,
      };
    }
  }

  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = trimmedUrl.match(vimeoPattern);
  if (vimeoMatch) {
    return {
      provider: 'vimeo',
      embedId: vimeoMatch[1],
      url: trimmedUrl,
    };
  }

  // Twitter/X patterns
  const twitterPattern = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const twitterMatch = trimmedUrl.match(twitterPattern);
  if (twitterMatch) {
    return {
      provider: 'twitter',
      embedId: twitterMatch[1],
      url: trimmedUrl,
    };
  }

  // Direct video URL (check for video extensions)
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(trimmedUrl)) {
    return {
      provider: 'direct',
      url: trimmedUrl,
    };
  }

  // Try to use ReactPlayer's canPlay for other URLs
  return {
    provider: 'direct',
    url: trimmedUrl,
  };
}

const providerLabels: Record<VideoProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  twitter: 'Twitter/X',
  direct: 'Direct Video',
};

const providerColors: Record<VideoProvider, string> = {
  youtube: 'bg-red-100 text-red-700',
  vimeo: 'bg-blue-100 text-blue-700',
  twitter: 'bg-sky-100 text-sky-700',
  direct: 'bg-gray-100 text-gray-700',
};

export default function VideoAtomEditor({ atom, onUpdate }: VideoAtomEditorProps) {
  const content = atom.rich_content as VideoContent;
  const [urlInput, setUrlInput] = useState(content?.url || '');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
    setParseError(null);

    if (!newUrl.trim()) {
      onUpdate(atom.id, {
        rich_content: {
          provider: 'youtube',
          url: '',
        } as VideoContent,
      });
      return;
    }

    const parsed = parseVideoUrl(newUrl);
    if (parsed) {
      onUpdate(atom.id, {
        rich_content: {
          provider: parsed.provider,
          embedId: parsed.embedId,
          url: parsed.url,
        } as VideoContent,
      });
    } else {
      setParseError('Could not parse video URL. Please check the format.');
    }
  }, [atom.id, onUpdate]);

  const handleClear = useCallback(() => {
    setUrlInput('');
    setParseError(null);
    onUpdate(atom.id, {
      rich_content: {
        provider: 'youtube',
        url: '',
      } as VideoContent,
    });
  }, [atom.id, onUpdate]);

  return (
    <div className="video-atom-editor space-y-4">
      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="Paste YouTube, Vimeo, Twitter, or direct video URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {urlInput && (
            <button
              onClick={handleClear}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Clear URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Supported: YouTube, Vimeo, Twitter/X, and direct video links (.mp4, .webm)
        </p>
      </div>

      {parseError && (
        <p className="text-sm text-red-600">{parseError}</p>
      )}

      {/* Provider Badge */}
      {content?.url && content.provider && (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${providerColors[content.provider]}`}>
            {providerLabels[content.provider]}
          </span>
          {content.embedId && (
            <span className="text-xs text-gray-400">ID: {content.embedId}</span>
          )}
        </div>
      )}

      {/* Video Preview */}
      {content?.url && (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <ReactPlayer
            url={content.url}
            width="100%"
            height="100%"
            controls
            light={true}
            playing={false}
          />
        </div>
      )}

      {/* Placeholder when no URL */}
      {!content?.url && (
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-2 text-sm">Paste a video URL above to preview</p>
          </div>
        </div>
      )}
    </div>
  );
}
