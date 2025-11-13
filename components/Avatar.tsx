
import React from 'react';

interface AvatarProps {
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className }) => {
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-rose-200 dark:bg-gray-700 ${className}`}>
      <img src="/ria-avatar.png" alt="RIA Avatar" className="w-full h-full object-cover" />
    </div>
  );
};