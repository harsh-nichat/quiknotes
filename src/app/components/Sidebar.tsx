'use client';

import { useNotes } from '@/context/NotesContext';
import type { Note } from '../../types/note';
import { format } from 'date-fns';
import { TrashIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { 
    notes, 
    activeNoteId, 
    setActiveNoteId, 
    createNote, 
    deleteNote,
    searchNotes,
    togglePinNote,
    searchQuery,
    filteredNotes 
  } = useNotes();

  // Sort notes: pinned first, then by date
  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      // First sort by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const handleNewNote = async () => {
    await createNote('', '');
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const renderNotesList = (notesList: Note[], isPinnedSection = false) => (
    <div className="space-y-2">
      {isPinnedSection && <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Pinned Notes</h3>}
      {notesList.map((note) => (
        <div
          key={note.id}
          className={`p-2 rounded cursor-pointer group 
            ${activeNoteId === note.id 
              ? 'bg-blue-100 dark:bg-blue-900/50' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <div 
            onClick={() => {
              setActiveNoteId(note.id);
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex justify-between items-center"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-gray-900 dark:text-gray-100">
                {note.title || 'Untitled'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {note.createdAt ? format(note.createdAt, 'MMM d, yyyy') : 'Just now'}
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Star button clicked for note:', note.id);
                  togglePinNote(note.id);
                }}
                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                title={note.isPinned ? "Unpin note" : "Pin note"}
              >
                {note.isPinned ? (
                  <StarIconSolid className="h-4 w-4 text-yellow-500" />
                ) : (
                  <StarIcon className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                )}
              </button>
              <button
                onClick={(e) => handleDelete(e, note.id)}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Delete note"
              >
                <TrashIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const displayedNotes = searchQuery ? filteredNotes : notes;
  const sortedNotes = sortNotes(displayedNotes);
  const pinnedNotes = sortedNotes.filter(note => note.isPinned);
  const unpinnedNotes = sortedNotes.filter(note => !note.isPinned);

  return (
    <div
      className={`fixed md:relative top-0 left-0 h-screen bg-gray-100 dark:bg-gray-800 w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              New Note
            </button>
            <button onClick={onClose} className="md:hidden">
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full px-3 py-2 rounded border text-black dark:text-gray-100 dark:border-gray-600 dark:bg-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => searchNotes(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Pinned Notes
              </h3>
              {renderNotesList(pinnedNotes)}
            </div>
          )}
          
          {/* Other Notes Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {pinnedNotes.length > 0 ? 'Other Notes' : 'Notes'}
            </h3>
            {renderNotesList(unpinnedNotes)}
          </div>
        </div>
      </div>
    </div>
  );
}