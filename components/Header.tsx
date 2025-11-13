import React from 'react';
import { Avatar } from './Avatar';

export const Header: React.FC = () => {
  return (
    <header className="bg-rose-100/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md p-4 flex items-center justify-between border-b border-rose-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10" />
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">RIA</h1>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">Твоя настоящая подруга</div>
    </header>
  );
};
