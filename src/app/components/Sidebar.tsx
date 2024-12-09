'use client';

import { useNotes } from '@/context/NotesContext';
import { format } from 'date-fns';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { notes, activeNoteId, setActiveNoteId, createNote, deleteNote } = useNotes();

  const handleNewNote = async () => {
    await createNote('', '');
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity lg:hidden z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 h-screen bg-gray-100 dark:bg-gray-800 p-4 
        border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-4 lg:hidden">
          <h2 className="font-bold text-gray-700 dark:text-gray-200">Menu</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <button 
          onClick={handleNewNote}
          className="w-full bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          New Note
        </button>
        
        <div className="space-y-2">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Your Notes</h2>
          {notes.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 italic">No notes yet</div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    if (window.innerWidth < 1024) onClose(); // Close sidebar on mobile after selection
                  }}
                  className={`p-2 rounded cursor-pointer group flex justify-between items-center ${
                    activeNoteId === note.id 
                      ? 'bg-blue-100 dark:bg-blue-900/50' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-gray-900 dark:text-gray-100">
                      {note.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {note.createdAt ? format(note.createdAt, 'MMM d, yyyy') : 'Just now'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete note"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 