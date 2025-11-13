import React from 'react';

// Вы можете заменить эту ссылку на любое другое изображение для аватара Рии
const RIA_AVATAR_URL = 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJjY29sWVl2dGNVVEp6WUpUNkVwSkhIU3hWRSJ9';

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
