
import React, { useState } from 'react';

interface AvatarProps {
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
        <div className={`rounded-full overflow-hidden flex-shrink-0 bg-rose-300 dark:bg-gray-600 flex items-center justify-center ${className}`}>
            <span className="text-2xl font-bold text-white">R</span>
        </div>
    );
  }

  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-rose-200 dark:bg-gray-700 ${className}`}>
      <img 
        src="/ria-avatar.png" 
        alt="RIA Avatar" 
        className="w-full h-full object-cover"
        onError={() => setImgError(true)} 
      />
    </div>
  );
};
