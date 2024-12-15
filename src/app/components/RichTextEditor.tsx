'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="sticky bottom-0 border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex gap-1 items-center flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4 text-black dark:text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4 text-black dark:text-white" />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4 text-black dark:text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4 text-black dark:text-white" />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4 text-black dark:text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4 text-black dark:text-white" />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Quote"
      >
        <Quote className="w-4 h-4 text-black dark:text-white" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
        title="Code Block"
      >
        <Code className="w-4 h-4 text-black dark:text-white" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        bulletList: {},
        orderedList: {},
        codeBlock: {},
        blockquote: {},
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg !text-black dark:!text-gray-100 max-w-none focus:outline-none min-h-[200px] px-4 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <MenuBar editor={editor} />
    </div>
  );
}
