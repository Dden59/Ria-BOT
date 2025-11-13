import React from 'react';
import { BOT_USERNAME } from '../constants';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export const ReferralButton: React.FC = () => {
  const handleInvite = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      alert("Эта функция доступна только в приложении Telegram.");
      return;
    }

    const userId = tg.initDataUnsafe?.user?.id;
    if (!userId) {
      tg.showAlert("Не удалось получить ваш ID для создания ссылки. Попробуйте перезапустить приложение.");
      return;
    }

    if (!BOT_USERNAME || BOT_USERNAME === 'YOUR_BOT_USERNAME_HERE') {
      tg.showAlert('Имя бота еще не указано разработчиком. Функция приглашения временно недоступна.');
      return;
    }
    
    const link = `https://t.me/${BOT_USERNAME}?start=${userId}`;
    
    navigator.clipboard.writeText(link).then(() => {
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert("Пригласительная ссылка скопирована! 💌\n\nОтправь её друзьям, чтобы они тоже могли пообщаться с Ри.");
    }).catch(err => {
        console.error('Clipboard write failed: ', err);
        tg.showAlert("Ой, не удалось скопировать ссылку. Пожалуйста, попробуйте еще раз.");
    });
  };

  return (
    <button 
      onClick={handleInvite}
      className="flex-shrink-0 flex items-center justify-center space-x-2 bg-rose-200/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-rose-200 dark:hover:bg-gray-700 transition-colors duration-200 border border-transparent"
      aria-label="Пригласить друга"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      <span className="hidden sm:inline font-medium text-sm">Пригласить друга</span>
    </button>
  );
};
