'use client';

import { useEffect } from 'react';
import { useNotes } from '@/context/NotesContext';

export default function KeyboardShortcuts() {
  const { createNote, activeNoteId, notes, setActiveNoteId } = useNotes();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N: New note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNote('', '');
      }

      // Cmd/Ctrl + F: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
      }

      // Cmd/Ctrl + Arrow keys: Navigate between notes
      if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIndex = notes.findIndex(note => note.id === activeNoteId);
        if (currentIndex === -1) return;

        const newIndex = e.key === 'ArrowUp' 
          ? Math.max(0, currentIndex - 1)
          : Math.min(notes.length - 1, currentIndex + 1);
        
        setActiveNoteId(notes[newIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, activeNoteId, notes, setActiveNoteId]);

  return null;
} 