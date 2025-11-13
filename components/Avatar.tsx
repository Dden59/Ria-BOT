import React from 'react';

interface AvatarProps {
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className }) => {
  return (
    // Replaced image with a fallback initial to prevent broken image icon
    // when the image file is not available in the project structure.
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-rose-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
      <span className="text-xl font-bold text-rose-500 dark:text-rose-300">R</span>
    </div>
  );
};