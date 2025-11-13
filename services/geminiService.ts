
import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from '../types';
import { RIA_SYSTEM_PROMPT } from '../constants';

// Initialize the AI client placeholder. It will be populated on the first API call.
let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

/**
 * A robust, "bulletproof" function to format chat history.
 * It ensures the history starts with a user message, enforces strict user/model alternation,
 * and guarantees the final message is from the user, preventing common API errors.
 */
const buildHistory = (messages: Message[]) => {
  // 1. Find the first user message. History MUST start with a user.
  const firstUserIndex = messages.findIndex(msg => msg.sender === Sender.USER);
  if (firstUserIndex === -1) {
    // If there are no user messages, we cannot construct a valid history.
    return [];
  }

  // 2. Take only the relevant part of the conversation.
  const relevantMessages = messages.slice(firstUserIndex);

  const history = [];
  let lastSender: Sender | null = null;

  // 3. Iterate and build a clean history, enforcing alternation.
  for (const msg of relevantMessages) {
    // Skip consecutive messages from the same sender to enforce user/model alternation.
    if (msg.sender === lastSender) {
      continue;
    }

    history.push({
      role: msg.sender === Sender.USER ? "user" : "model",
      parts: [{ text: msg.text }],
    });
    lastSender = msg.sender;
  }

  // 4. CRITICAL: The API requires the last message in a multi-turn conversation
  // to be from the 'user'. If our logic resulted in the 'model' being last,
  // it means we're in an invalid state to make a new request.
  if (history.length > 0 && history[history.length - 1].role !== 'user') {
    console.error("buildHistory Error: Invalid turn order. The last message is not from the user.", history);
    // Return empty to signal a logical error upstream.
    return [];
  }

  return history;
};


// The function now takes the full message history as a single argument for reliability.
export const getRiaResponse = async (messages: Message[]): Promise<string> => {
  // --- LAZY INITIALIZATION ---
  if (!ai) {
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
      return "Ой, кажется, у меня возникли технические неполадки. 🤨 Скорее всего, мой создатель забыл добавить секретный ключ в переменные окружения проекта на Vercel. Нужно создать переменную с именем `API_KEY` и вставить в неё ключ. Без него я не могу связаться со своим 'мозгом'. Пожалуйста, проверь это в настройках: Project > Settings > Environment Variables.";
    }
    ai = new GoogleGenAI({ apiKey });
  }

  try {
    // buildHistory now prepares the entire `contents` array with robust checks.
    const contents = buildHistory(messages);

    // If history is empty after processing, it's an invalid state (e.g., chat only contains AI messages or has a logic error).
    if (contents.length === 0) {
      return "Ой, что-то сбилось в нашем диалоге. 😵‍💫 Похоже, я говорю сама с собой. Пожалуйста, отправь сообщение, чтобы мы могли продолжить.";
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: RIA_SYSTEM_PROMPT,
      },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
        return "Ой, кажется, мой ответ был заблокирован фильтрами безопасности. 😬 Давай попробуем перефразировать твой вопрос или обсудить что-то другое.";
    }
    if (!response.text) {
        console.error("Gemini API returned an empty response. Finish Reason:", candidate?.finishReason, "Safety Ratings:", candidate?.safetyRatings);
        return "Прости, дорогая, что-то пошло не так, и я не могу сейчас ответить. Похоже, ответа просто нет. Давай попробуем еще раз через мгновение. 🫂";
    }

    return response.text;
  } catch (error) {
    console.error("Full error object from Gemini API:", JSON.stringify(error, null, 2));
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('permission') || error.message.includes('API key is invalid')) {
            return "Хм, тот ключ, что ты добавил в `API_KEY`, кажется неверным или у него нет нужных прав (возможно, не привязан биллинг в Google Cloud?). Проверь его еще раз, пожалуйста. Он должен быть правильным, чтобы я могла работать. 🤨";
        }
        if (error.message.includes('alternate between user and model')) {
            return "Ой, что-то сбилось в нашем диалоге. 😵‍💫 Похоже на технический сбой. Попробуй обновить страницу, это должно помочь наладить нашу беседу.";
        }
    }
    
    return "Прости, дорогая, что-то пошло не так, и я не могу сейчас ответить. Возможно, наш диалог был прерван фильтрами безопасности. Давай попробуем еще раз через мгновение. 🫂";
  }
};