'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

const BUCKET_NAME = 'atom-media';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface UploadResult {
  url: string;
  storageKey: string;
}

interface UseMediaUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  upload: (file: File) => Promise<UploadResult | null>;
  deleteMedia: (storageKey: string) => Promise<boolean>;
}

export function useMediaUpload(): UseMediaUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setError(null);
    setProgress(0);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return null;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

      setProgress(25);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(75);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      setProgress(100);

      return {
        url: urlData.publicUrl,
        storageKey: data.path,
      };
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteMedia = useCallback(async (storageKey: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storageKey]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  }, []);

  return {
    uploading,
    progress,
    error,
    upload,
    deleteMedia,
  };
}
