
import React, { useState, useEffect } from 'react';

interface DebugInfoProps {
  isOpen: boolean;
  lastError: string | null;
  onClose: () => void;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ isOpen, lastError, onClose }) => {
  const [location, setLocation] = useState('');
  const [referrer, setReferrer] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocation(window.location.href);
      setReferrer(document.referrer || 'N/A (прямой переход)');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-end animate-fade-in" onClick={onClose}>
      <div 
        className="w-full bg-gray-800 text-white p-4 pt-3 rounded-t-2xl shadow-lg border-t border-gray-600"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-yellow-300">Панель отладки</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="space-y-3 text-sm font-mono break-all bg-gray-900/50 p-3 rounded-lg">
          <div>
            <p className="font-sans font-semibold text-gray-300">Текущий URL:</p>
            <p className="text-cyan-300">{location}</p>
          </div>
          <div>
            <p className="font-sans font-semibold text-gray-300">HTTP Referrer:</p>
            <p className="text-cyan-300 font-bold">{referrer}</p>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              ↑ Этот адрес (или его шаблон, например `*.telegram.org/*`) должен быть разрешен в 
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline"> настройках API ключа</a>.
            </p>
          </div>
          {lastError && (
            <div>
              <p className="font-sans font-semibold text-gray-300">Последняя ошибка API:</p>
              <p className="text-red-400">{lastError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
