
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SubscriptionModal } from './components/SubscriptionModal';
import { getRiaResponse } from './services/geminiService';
import { Message, Sender, SubscriptionStatus, SubscriptionTier } from './types';
import { FREE_TIER_MESSAGE_LIMIT, TAROT_CARDS } from './constants';

// Make Telegram's WebApp type available globally
declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

// A helper to get today's date as a string in YYYY-MM-DD format, respecting local timezone
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: SubscriptionTier.FREE,
    messagesSentToday: 0,
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const mainAppRef = useRef<HTMLDivElement>(null);

  // Effect for initializing app and Telegram integration
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        text: "Привет! Я Ри. Твоя лучшая подруга, которая всегда рядом и не боится рубить правду-матку. Что у тебя на душе? Давай-ка разберемся вместе. 💅",
        sender: Sender.AI,
      },
    ]);

    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const applyTheme = () => {
        document.documentElement.classList.toggle('dark', tg.colorScheme === 'dark');
      };
      
      const setViewportHeight = () => {
        if (mainAppRef.current) {
          mainAppRef.current.style.height = `${tg.viewportStableHeight}px`;
        }
      };

      tg.onEvent('themeChanged', applyTheme);
      tg.onEvent('viewportChanged', setViewportHeight);
      
      applyTheme();
      setViewportHeight();
    }
  }, []);
  
  // Effect for managing subscription state with localStorage
  useEffect(() => {
    try {
      const storedSub = localStorage.getItem('ria-subscription-status');
      const today = getTodayDateString();
      if (storedSub) {
        const subData = JSON.parse(storedSub);
        if (subData.date !== today) {
          // Reset daily message count if it's a new day
          const newSub = { ...subData, messagesSentToday: 0, date: today };
          setSubscription(newSub);
          localStorage.setItem('ria-subscription-status', JSON.stringify(newSub));
        } else {
          setSubscription(subData);
        }
      } else {
        // Initialize for a new user
        const initialSub = { tier: SubscriptionTier.FREE, messagesSentToday: 0, date: today };
        setSubscription(initialSub);
        localStorage.setItem('ria-subscription-status', JSON.stringify(initialSub));
      }
    } catch (error) {
      console.error("Failed to manage subscription state from localStorage:", error);
       // Fallback to initial state if localStorage fails
       const today = getTodayDateString();
       const initialSub = { tier: SubscriptionTier.FREE, messagesSentToday: 0, date: today };
       setSubscription(initialSub);
    }
  }, []);

  const handleDrawCard = async () => {
    if (isLoading) return;

    const today = getTodayDateString();
    let storedCard = null;

    try {
      const storedCardJSON = localStorage.getItem('ria-card-of-the-day');
      if (storedCardJSON) {
        storedCard = JSON.parse(storedCardJSON);
      }
    } catch (error) {
      console.warn("Could not read 'ria-card-of-the-day' from localStorage:", error);
    }

    if (storedCard && storedCard.date === today) {
      const cardMessage: Message = {
        id: `card-${Date.now()}`,
        text: storedCard.interpretation,
        sender: Sender.AI,
        card: { name: storedCard.cardName },
      };
      setMessages(prev => [...prev, cardMessage]);
      return;
    }

    setIsLoading(true);

    const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    
    // Create an isolated, single-message history for the card request to ensure reliability.
    const cardRequestContext: Message[] = [{
      id: 'temp-card-prompt',
      text: `Моя карта дня сегодня – «${card.name}». Расскажи, что она значит для меня, в своем стиле.`,
      sender: Sender.USER
    }];
    
    const interpretation = await getRiaResponse(cardRequestContext);

    // Check if the response is one of the known error messages to prevent caching them.
    const isErrorResponse = interpretation.includes('что-то пошло не так') || 
                            interpretation.includes('технические неполадки') ||
                            interpretation.includes('ключ, что ты добавил') ||
                            interpretation.includes('сбилось в нашем диалоге');

    const cardMessage: Message = {
      id: `card-${Date.now()}`,
      text: interpretation,
      sender: Sender.AI,
      card: { name: card.name },
    };
    
    setMessages(prev => [...prev, cardMessage]);
    
    // Only cache the interpretation if the API call was successful.
    if (!isErrorResponse) {
      try {
        localStorage.setItem('ria-card-of-the-day', JSON.stringify({
          date: today,
          cardName: card.name,
          interpretation: interpretation,
        }));
      } catch (error) {
        console.warn("Could not write 'ria-card-of-the-day' to localStorage:", error);
      }
    }

    setIsLoading(false);
  };

  const handleSendMessage = async (text: string) => {
    // Temporarily disabled subscription check to focus on growth
    // if (subscription.tier === SubscriptionTier.FREE && subscription.messagesSentToday >= FREE_TIER_MESSAGE_LIMIT) {
    //   setShowSubscriptionModal(true);
    //   return;
    // }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender: Sender.USER,
    };
    
    // Create the new, full history in a local variable to avoid stale state issues.
    const updatedMessages = [...messages, userMessage];

    // Update the UI immediately with the user's message.
    setMessages(updatedMessages);
    setIsLoading(true);

    if (window.Telegram && window.Telegram.WebApp) {
        try {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        } catch(e) {
            console.warn('Haptic feedback failed', e)
        }
    }

    if (subscription.tier === SubscriptionTier.FREE) {
        const newCount = subscription.messagesSentToday + 1;
        const newSub = { ...subscription, messagesSentToday: newCount, date: getTodayDateString() };
        setSubscription(newSub);
        try {
          localStorage.setItem('ria-subscription-status', JSON.stringify(newSub));
        } catch (error) {
          console.warn("Could not update subscription status in localStorage:", error);
        }
    }
    
    // Pass the complete, up-to-date history to the service.
    const aiResponseText = await getRiaResponse(updatedMessages);

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      text: aiResponseText,
      sender: Sender.AI,
    };

    // Update the UI with the AI's response.
    setMessages((prevMessages) => [...prevMessages, aiMessage]);
    setIsLoading(false);
  };

  const handleSubscribe = () => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      // NOTE: This invoice link must be generated by your backend. This is a placeholder.
      const invoiceLink = 'https://t.me/invoice/example';

      tg.openInvoice(invoiceLink, (status: 'paid' | 'cancelled' | 'failed' | 'pending') => {
        if (status === 'paid') {
          tg.HapticFeedback.notificationOccurred('success');
          const newSub = { ...subscription, tier: SubscriptionTier.PREMIUM };
          setSubscription(newSub);
          localStorage.setItem('ria-subscription-status', JSON.stringify(newSub));
          setShowSubscriptionModal(false);
        } else if (status === 'cancelled' || status === 'failed') {
          tg.HapticFeedback.notificationOccurred(status === 'cancelled' ? 'warning' : 'error');
        }
      });
    } else {
      alert("Подписка доступна только через приложение Telegram.");
    }
  };

  return (
    <div ref={mainAppRef} className="h-screen w-screen bg-rose-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col font-sans overflow-hidden">
      <Header onDrawCard={handleDrawCard} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </main>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default App;