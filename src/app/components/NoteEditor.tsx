'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotes } from '@/context/NotesContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import RichTextEditor from './RichTextEditor';

export default function NoteEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { notes, activeNoteId } = useNotes();
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const lastSavedContentRef = useRef<string>('');

  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find(n => n.id === activeNoteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content || '');
        lastSavedContentRef.current = note.content || '';
        if (!note.title && titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }
    } else {
      setTitle('');
      setContent('');
      lastSavedContentRef.current = '';
    }
  }, [activeNoteId, notes]);

  const saveNote = useCallback(async () => {
    if (!activeNoteId || isSaving) return;

    const noteExists = notes.some(note => note.id === activeNoteId);
    if (!noteExists) {
      setTitle('');
      setContent('');
      lastSavedContentRef.current = '';
      return;
    }

    // Only save if content has changed
    if (content === lastSavedContentRef.current) {
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
      lastSavedContentRef.current = content;
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700">
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold p-2 focus:outline-none 
          !text-black dark:!text-gray-100 bg-transparent placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <RichTextEditor content={content} onChange={setContent} />
      </div>
    </div>
  );
}