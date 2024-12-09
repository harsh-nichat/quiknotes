'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotes } from '@/context/NotesContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function NoteEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { notes, activeNoteId } = useNotes();
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        if (!note.title && titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNoteId, notes]);

  const saveNote = useCallback(async () => {
    if (!activeNoteId || isSaving) return;

    const noteExists = notes.some(note => note.id === activeNoteId);
    if (!noteExists) {
      setTitle('');
      setContent('');
      return;
    }

    try {
      setIsSaving(true);
      const noteRef = doc(db, 'notes', activeNoteId);
      await updateDoc(noteRef, {
        title,
        content,
        updatedAt: new Date(),
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const typedError = error as { code: string };
        if (typedError.code !== 'not-found') {
          console.error('Error saving note:', typedError);
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [activeNoteId, title, content, isSaving, notes]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeNoteId && (title || content)) {
        saveNote();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, saveNote, activeNoteId]);

  if (!activeNoteId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Select a note or create a new one to get started
      </div>
    );
  }

  return (
    <div className="p-4">
      <input
        ref={titleInputRef}
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl font-bold mb-4 p-4 border dark:border-gray-700 focus:outline-none focus:border-blue-500 
        text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
      />
      
      <textarea
        placeholder="Start writing your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-[calc(100vh-200px)] p-4 focus:outline-none resize-none text-gray-900 dark:text-gray-100 
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700"
      />
    </div>
  );
} 