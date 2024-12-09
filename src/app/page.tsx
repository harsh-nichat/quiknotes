'use client'
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { NotesProvider } from '@/context/NotesContext';
import ThemeToggle from './components/ThemeToggle';
import MenuButton from './components/MenuButton';
import { useState } from 'react';

// Dynamic imports with no-ssr
const Sidebar = dynamic(() => import('./components/Sidebar'), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});
const NoteEditor = dynamic(() => import('./components/NoteEditor'), { 
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="bg-white dark:bg-gray-900">
      <SignedOut>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Welcome</h1>
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <NotesProvider>
          <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <MenuButton onClick={() => setIsSidebarOpen(true)} />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiknotes</h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserButton />
                  </div>
                </div>
                <NoteEditor />
              </div>
            </div>
          </div>
        </NotesProvider>
      </SignedIn>
    </main>
  );
}