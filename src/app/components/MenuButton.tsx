'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';

type MenuButtonProps = {
  onClick: () => void;
};

export default function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle menu"
    >
      <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
    </button>
  );
} 