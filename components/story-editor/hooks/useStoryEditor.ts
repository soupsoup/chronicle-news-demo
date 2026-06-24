'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Atom,
  Story,
  AtomType,
  RichContent,
  TextContent,
  ImageContent,
  VideoContent,
  QuoteContent
} from '@/types/atoms';

interface UseStoryEditorOptions {
  storyId: string;
  autoSaveDelay?: number;
}

interface UseStoryEditorReturn {
  story: Story | null;
  atoms: Atom[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateStory: (updates: Partial<Story>) => Promise<void>;
  addAtom: (type: AtomType, position?: number) => Promise<Atom | null>;
  updateAtom: (id: string, updates: Partial<Atom>) => Promise<void>;
  publishAtom: (id: string, sendPush: boolean) => Promise<void>;
  deleteAtom: (id: string) => Promise<void>;
  reorderAtoms: (activeId: string, overId: string) => Promise<void>;
  saveAll: () => Promise<void>;
}

function createDefaultContent(type: AtomType): RichContent {
  switch (type) {
    case 'text':
      return { html: '', plainText: '' } as TextContent;
    case 'image':
      return { url: '', alt: '' } as ImageContent;
    case 'video':
      return { provider: 'youtube', url: '' } as VideoContent;
    case 'quote':
      return { text: '', attribution: '' } as QuoteContent;
  }
}

export function useStoryEditor({
  storyId,
  autoSaveDelay = 2000
}: UseStoryEditorOptions): UseStoryEditorReturn {
  const [story, setStory] = useState<Story | null>(null);
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingUpdates = useRef<Map<string, Partial<Atom>>>(new Map());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch story and atoms
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (storyError) throw storyError;
        setStory(storyData);

        // Fetch atoms with linked atom info
        const { data: atomsData, error: atomsError } = await supabase
          .from('atoms')
          .select(`
            *,
            linked_atom:linked_atom_id (
              id,
              story_id,
              stories (
                id,
                title
              )
            )
          `)
          .eq('story_id', storyId)
          .order('position', { ascending: true });

        if (atomsError) throw atomsError;
        
        // Fetch related stories for each atom
        if (atomsData) {
          const atomsWithRelatedStories = await Promise.all(
            atomsData.map(async (atom) => {
              const { data: relatedStories, error } = await supabase.rpc(
                'get_related_stories_for_atom',
                { p_atom_id: atom.id }
              );

              if (error) {
                console.error(`Error fetching related stories for atom ${atom.id}:`, error);
                return { ...atom, relatedStories: [] };
              }
              return { ...atom, relatedStories };
            })
          );
          setAtoms(atomsWithRelatedStories || []);
        } else {
          setAtoms([]);
        }

      } catch (err) {
        console.error('Error fetching story data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load story');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [storyId]);

  // Debounced save
  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (pendingUpdates.current.size === 0) return;

      setSaving(true);
      try {
        const updates = Array.from(pendingUpdates.current.entries());
        pendingUpdates.current.clear();

        for (const [atomId, atomUpdates] of updates) {
          const { error } = await supabase
            .from('atoms')
            .update(atomUpdates)
            .eq('id', atomId);

          if (error) throw error;
        }
      } catch (err) {
        console.error('Error saving atoms:', err);
        setError(err instanceof Error ? err.message : 'Failed to save');
      } finally {
        setSaving(false);
      }
    }, autoSaveDelay);
  }, [autoSaveDelay]);

  // Update story metadata
  const updateStory = useCallback(async (updates: Partial<Story>) => {
    if (!story) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', storyId);

      if (error) throw error;
      setStory(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating story:', err);
      setError(err instanceof Error ? err.message : 'Failed to update story');
    } finally {
      setSaving(false);
    }
  }, [story, storyId]);

  // Add new atom
  const addAtom = useCallback(async (type: AtomType, position?: number): Promise<Atom | null> => {
    const insertPosition = position ?? atoms.length;

    try {
      // Shift existing atoms if inserting in middle
      if (insertPosition < atoms.length) {
        const atomsToUpdate = atoms.filter(a => a.position >= insertPosition);
        for (const atom of atomsToUpdate) {
          await supabase
            .from('atoms')
            .update({ position: atom.position + 1 })
            .eq('id', atom.id);
        }
      }

      const newAtom = {
        story_id: storyId,
        type,
        content: '',
        rich_content: createDefaultContent(type),
        position: insertPosition,
        is_published: false,
        send_push: true,
      };

      const { data, error } = await supabase
        .from('atoms')
        .insert(newAtom)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAtoms(prev => {
        const updated = prev.map(a =>
          a.position >= insertPosition
            ? { ...a, position: a.position + 1 }
            : a
        );
        return [...updated, data].sort((a, b) => a.position - b.position);
      });

      return data;
    } catch (err) {
      console.error('Error adding atom:', err);
      setError(err instanceof Error ? err.message : 'Failed to add atom');
      return null;
    }
  }, [atoms, storyId]);

  // Update atom (with debounced save)
  const updateAtom = useCallback(async (id: string, updates: Partial<Atom>) => {
    // Update local state immediately
    setAtoms(prev => prev.map(atom =>
      atom.id === id ? { ...atom, ...updates } : atom
    ));

    // Queue for save
    const existing = pendingUpdates.current.get(id) || {};
    pendingUpdates.current.set(id, { ...existing, ...updates });

    scheduleSave();
  }, [scheduleSave]);

  // Publish atom and optionally send push
  const publishAtom = useCallback(async (id: string, sendPush: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('atoms')
        .update({ is_published: true, send_push: sendPush })
        .eq('id', id);

      if (error) throw error;

      setAtoms(prev => prev.map(atom =>
        atom.id === id ? { ...atom, is_published: true, send_push: sendPush } : atom
      ));
    } catch (err) {
      console.error('Error publishing atom:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish atom');
    } finally {
      setSaving(false);
    }
  }, []);

  // Delete atom
  const deleteAtom = useCallback(async (id: string) => {
    const atomToDelete = atoms.find(a => a.id === id);
    if (!atomToDelete) return;

    try {
      const { error } = await supabase
        .from('atoms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update positions for atoms after the deleted one
      const atomsToUpdate = atoms.filter(a => a.position > atomToDelete.position);
      for (const atom of atomsToUpdate) {
        await supabase
          .from('atoms')
          .update({ position: atom.position - 1 })
          .eq('id', atom.id);
      }

      // Update local state
      setAtoms(prev =>
        prev
          .filter(a => a.id !== id)
          .map(a => a.position > atomToDelete.position
            ? { ...a, position: a.position - 1 }
            : a
          )
      );
    } catch (err) {
      console.error('Error deleting atom:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete atom');
    }
  }, [atoms]);

  // Reorder atoms (for drag and drop)
  const reorderAtoms = useCallback(async (activeId: string, overId: string) => {
    const activeIndex = atoms.findIndex(a => a.id === activeId);
    const overIndex = atoms.findIndex(a => a.id === overId);

    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;

    // Calculate new order
    const reordered = [...atoms];
    const [moved] = reordered.splice(activeIndex, 1);
    reordered.splice(overIndex, 0, moved);

    // Assign new positions
    const updatedAtoms = reordered.map((atom, index) => ({
      ...atom,
      position: index
    }));

    // Update local state immediately
    setAtoms(updatedAtoms);

    // Persist to database
    try {
      for (const atom of updatedAtoms) {
        if (atom.position !== atoms.find(a => a.id === atom.id)?.position) {
          await supabase
            .from('atoms')
            .update({ position: atom.position })
            .eq('id', atom.id);
        }
      }
    } catch (err) {
      console.error('Error reordering atoms:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder atoms');
      // Revert on error
      setAtoms(atoms);
    }
  }, [atoms]);

  // Force save all pending changes
  const saveAll = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (pendingUpdates.current.size === 0) return;

    setSaving(true);
    try {
      const updates = Array.from(pendingUpdates.current.entries());
      pendingUpdates.current.clear();

      for (const [atomId, atomUpdates] of updates) {
        const { error } = await supabase
          .from('atoms')
          .update(atomUpdates)
          .eq('id', atomId);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error saving all:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
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
  };
}
