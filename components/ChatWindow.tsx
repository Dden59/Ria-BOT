
import React, { useEffect, useRef } from 'react';
import { Message as MessageType } from '../types';
import { Message } from './Message';
import { CardMessage } from './CardMessage';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
      <div className="flex flex-col space-y-4">
        {messages.map((msg) => (
          msg.card ? <CardMessage key={msg.id} message={msg} /> : <Message key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="self-start flex items-center space-x-2">
            <div className="bg-white dark:bg-gray-700 text-gray-800 self-start rounded-tr-2xl rounded-tl-2xl rounded-br-2xl shadow-sm px-5 py-3">
              <div className="flex items-center justify-center space-x-1">
                 <div className="w-2 h-2 bg-rose-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-rose-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-rose-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
