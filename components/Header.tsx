
import React from 'react';
import { Avatar } from './Avatar';
import { ReferralButton } from './ReferralButton';

interface HeaderProps {
  onDrawCard: () => void;
  onToggleDebug: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDrawCard, onToggleDebug }) => {
  return (
    <header className="bg-rose-100/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md p-4 flex items-center justify-between border-b border-rose-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10" />
        <div>
          <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">RIA</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Твоя настоящая подруга</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
         <button
          onClick={onDrawCard}
          className="flex-shrink-0 flex items-center justify-center space-x-2 bg-rose-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-rose-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent"
          aria-label="Карта дня"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
           <span className="hidden sm:inline font-medium text-sm">Карта дня</span>
        </button>
        <ReferralButton />
        <button
          onClick={onToggleDebug}
          className="flex-shrink-0 flex items-center justify-center bg-rose-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 p-2.5 rounded-lg hover:bg-rose-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent"
          aria-label="Показать отладочную информацию"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};