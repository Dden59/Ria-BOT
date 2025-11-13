import React from 'react';
import { Avatar } from './Avatar';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative transform transition-all duration-300 scale-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Закрыть">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <Avatar className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Продолжите диалог</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Вы достигли дневного лимита сообщений. Оформите подписку, чтобы получить безлимитный доступ к Ри.
        </p>
        <div className="bg-rose-50 dark:bg-gray-700 border border-rose-200 dark:border-gray-600 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Премиум-подписка включает:</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Безлимитные диалоги</li>
            <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Приоритетный доступ к новым функциям</li>
            <li className="flex items-center"><span className="text-purple-500 mr-2">✓</span> Поддержка развития Ри ❤️</li>
          </ul>
        </div>
        <button 
          onClick={onSubscribe}
          className="w-full bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-600 transition-transform transform hover:scale-105"
        >
          Подписаться - 490 ₽/месяц
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Доступен 3-дневный пробный период за 1 ₽. Вы можете отменить подписку в любое время.
        </p>
      </div>
    </div>
  );
};
