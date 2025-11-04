import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SubscriptionModal } from './components/SubscriptionModal';
import { getRiaResponse } from './services/geminiService';
import { Message, Sender, SubscriptionStatus, SubscriptionTier } from './types';
import { FREE_TIER_MESSAGE_LIMIT } from './constants';

// Make Telegram's WebApp type available globally
declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: SubscriptionTier.FREE,
    messagesSentToday: 0,
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // Welcome message from RIA
    setMessages([
      {
        id: 'welcome-1',
        text: "Привет! Я Ри. Твоя лучшая подруга, которая всегда рядом и не боится рубить правду-матку. Что у тебя на душе? Давай-ка разберемся вместе. 💅",
        sender: Sender.AI,
      },
    ]);

    // Telegram Mini App integration
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const applyTheme = () => {
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      tg.onEvent('themeChanged', applyTheme);
      applyTheme();
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    // if (subscription.tier === SubscriptionTier.FREE && subscription.messagesSentToday >= FREE_TIER_MESSAGE_LIMIT) {
    //   setShowSubscriptionModal(true);
    //   return;
    // }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: Sender.USER,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    if (window.Telegram && window.Telegram.WebApp) {
        try {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        } catch(e) {
            console.warn('Haptic feedback failed', e)
        }
    }

    // if (subscription.tier === SubscriptionTier.FREE) {
    //     setSubscription(prev => ({ ...prev, messagesSentToday: prev.messagesSentToday + 1}));
    // }

    const aiResponseText = await getRiaResponse(text, messages);

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      text: aiResponseText,
      sender: Sender.AI,
    };

    setMessages((prevMessages) => [...prevMessages, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-rose-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </main>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
};

export default App;