
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DebugInfo } from './components/DebugInfo';
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
  const [showDebug, setShowDebug] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const mainAppRef = useRef<HTMLDivElement>(null);

  // Effect for initializing app and handling viewport/theme integration
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        text: "Привет! Я Ри. Твоя лучшая подруга, которая всегда рядом и не боится рубить правду-матку. Что у тебя на душе? Давай-ка разберемся вместе. 💅",
        sender: Sender.AI,
      },
    ]);

    const tg = window.Telegram?.WebApp;

    const applyTheme = () => {
      document.documentElement.classList.toggle('dark', tg?.colorScheme === 'dark');
    };

    const updateViewportHeight = () => {
      if (mainAppRef.current) {
        // Use Telegram's stable height if available, otherwise fall back to window's innerHeight
        // This solves the 100vh issue on mobile browsers.
        const vh = tg?.viewportStableHeight || window.innerHeight;
        mainAppRef.current.style.height = `${vh}px`;
      }
    };

    if (tg) {
      tg.ready();
      tg.expand();
      tg.onEvent('themeChanged', applyTheme);
      tg.onEvent('viewportChanged', updateViewportHeight);
    }
    
    // Listen to window resize for non-Telegram environments
    window.addEventListener('resize', updateViewportHeight);
    
    // Initial setup
    applyTheme();
    updateViewportHeight();
    
    // Cleanup listeners on component unmount
    return () => {
        if (tg) {
            tg.offEvent('themeChanged', applyTheme);
            tg.offEvent('viewportChanged', updateViewportHeight);
        }
        window.removeEventListener('resize', updateViewportHeight);
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
    
    const cardRequestContext: Message[] = [{
      id: 'temp-card-prompt',
      text: `Моя карта дня сегодня – «${card.name}». Расскажи, что она значит для меня, в своем стиле.`,
      sender: Sender.USER
    }];
    
    const response = await getRiaResponse(cardRequestContext);

    if (response.rawError) {
      setLastError(response.rawError);
    }

    const cardMessage: Message = {
      id: `card-${Date.now()}`,
      text: response.text,
      sender: Sender.AI,
      card: { name: card.name },
    };
    
    setMessages(prev => [...prev, cardMessage]);
    
    if (!response.rawError) {
      try {
        localStorage.setItem('ria-card-of-the-day', JSON.stringify({
          date: today,
          cardName: card.name,
          interpretation: response.text,
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
    
    const updatedMessages = [...messages, userMessage];

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
    
    const response = await getRiaResponse(updatedMessages);

    if (response.rawError) {
      setLastError(response.rawError);
    }

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      text: response.text,
      sender: Sender.AI,
    };

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
    <div ref={mainAppRef} className="w-screen bg-rose-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col font-sans overflow-hidden">
      <Header onDrawCard={handleDrawCard} onToggleDebug={() => setShowDebug(true)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </main>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
      <DebugInfo 
        isOpen={showDebug}
        lastError={lastError}
        onClose={() => setShowDebug(false)}
      />
    </div>
  );
};

export default App;