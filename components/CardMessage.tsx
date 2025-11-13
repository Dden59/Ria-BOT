import React from 'react';
import { Message } from '../types';
import { TAROT_CARDS } from '../constants';

interface CardMessageProps {
  message: Message;
}

export const CardMessage: React.FC<CardMessageProps> = ({ message }) => {
  if (!message.card) return null;

  const cardDetails = TAROT_CARDS.find(c => c.name === message.card?.name);

  if (!cardDetails) {
    // Fallback for an unknown card
    return (
        <div className="self-start w-full max-w-md lg:max-w-lg">
             <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl p-5 shadow-sm">
                <p className="whitespace-pre-wrap">{message.text}</p>
             </div>
        </div>
    );
  }

  return (
    <div className="self-start w-full max-w-md lg:max-w-lg p-1 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 shadow-lg animate-fade-in">
        <div className="bg-rose-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl p-5">
            <div className="text-center mb-4">
                <p className="text-sm font-medium text-purple-500 dark:text-purple-300 mb-2">Твоя карта дня</p>
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${cardDetails.color} flex items-center justify-center text-5xl shadow-inner mb-3`}>
                    {cardDetails.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{cardDetails.name}</h3>
            </div>
            <hr className="border-rose-200 dark:border-gray-600 my-4" />
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{message.text}</p>
        </div>
    </div>
  );
};
