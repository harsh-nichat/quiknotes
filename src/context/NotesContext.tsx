'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import type { Note } from '@/types/note';

type NotesContextType = {
  notes: Note[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  createNote: (title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => void;
  togglePinNote: (id: string) => Promise<void>;
  searchQuery: string;
  filteredNotes: Note[];
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newNotes = snapshot.docs
          .map(doc => ({
            id: doc.id,
            title: doc.data().title || '',
            content: doc.data().content || '',
            userId: doc.data().userId,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            isPinned: doc.data().isPinned || false,
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          }))
          .filter(note => note.userId === user.id);
        
        const sortedNotes = [...newNotes].sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        
        setNotes(sortedNotes);
        if (!searchQuery) {
          setFilteredNotes(sortedNotes);
        } else {
          const filtered = sortedNotes.filter(note => 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredNotes(filtered);
        }
      },
      (error) => {
        console.error('Error fetching notes:', error);
      }
    );

    return () => unsubscribe();
  }, [user, searchQuery]);

  const createNote = async (title: string, content: string) => {
    if (!user) {
      console.log('No user found');
      return;
    }

    try {
      console.log('Creating note for user:', user.id);
      const noteData = {
        title,
        content,
        userId: user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPinned: false
      };

      const newNote = await addDoc(collection(db, 'notes'), noteData);
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

  const searchNotes = (query: string) => {
    setSearchQuery(query);
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNotes(filtered);
  };

  const togglePinNote = async (id: string) => {
    if (!user) {
      console.log('No user found');
      return;
    }
    
    try {
      const noteRef = doc(db, 'notes', id);
      const note = notes.find(n => n.id === id);
      console.log('Current note:', note); // Debug log

      if (note) {
        const newPinnedState = !note.isPinned;
        console.log('Toggling pin state to:', newPinnedState); // Debug log
        
        await updateDoc(noteRef, {
          isPinned: newPinnedState,
          updatedAt: serverTimestamp(),
        });
        
        // Update local state immediately for better UX
        setNotes(notes.map(n => 
          n.id === id 
            ? {...n, isPinned: newPinnedState} 
            : n
        ));

        console.log(`Note ${id} ${newPinnedState ? 'pinned' : 'unpinned'}`);
      } else {
        console.log('Note not found:', id); // Debug log
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  return (
    <NotesContext.Provider value={{ 
      notes, 
      activeNoteId, 
      setActiveNoteId, 
      createNote,
      deleteNote,
      searchNotes,
      togglePinNote,
      searchQuery,
      filteredNotes,
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