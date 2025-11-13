import React from 'react';

// Путь к аватару теперь указывает на локальный файл в папке public/images
// Загрузите ваш файл 'ria-avatar.png' именно по этому пути в вашем проекте.
const RIA_AVATAR_URL = '/images/ria-avatar.png';

interface AvatarProps {
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className }) => {
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-rose-200 dark:bg-gray-700 ${className}`}>
      <img src={RIA_AVATAR_URL} alt="Аватар Рии" className="w-full h-full object-cover" />
    </div>
  );
};
