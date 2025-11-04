
import React from 'react';
import { Message as MessageType, Sender } from '../types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  const userStyles = 'bg-purple-500 text-white self-end rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl';
  const aiStyles = 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 self-start rounded-tr-2xl rounded-tl-2xl rounded-br-2xl shadow-sm';

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md lg:max-w-lg px-5 py-3 ${isUser ? userStyles : aiStyles}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};