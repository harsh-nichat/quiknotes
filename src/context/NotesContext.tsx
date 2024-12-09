'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  userId: string;
};

type NotesContextType = {
  notes: Note[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  createNote: (title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotes = snapshot.docs
        .map(doc => ({
          id: doc.id,
          title: doc.data().title,
          content: doc.data().content,
          userId: doc.data().userId,
          createdAt: doc.data().createdAt?.toDate()
        }))
        .filter(note => note.userId === user.id) as Note[];
      
      setNotes(newNotes);
    });

    return () => unsubscribe();
  }, [user]);

  const createNote = async (title: string, content: string) => {
    if (!user) {
      console.log('No user found');
      return;
    }

    try {
      console.log('Creating note for user:', user.id);
      const newNote = await addDoc(collection(db, 'notes'), {
        title,
        content,
        userId: user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Note created with ID:', newNote.id);
      setActiveNoteId(newNote.id);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'notes', id));
      if (activeNoteId === id) {
        // If we're deleting the active note, clear the selection
        setActiveNoteId(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <NotesContext.Provider value={{ 
      notes, 
      activeNoteId, 
      setActiveNoteId, 
      createNote,
      deleteNote
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
} 