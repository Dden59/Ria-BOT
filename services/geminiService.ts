
import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from '../types';
import { RIA_SYSTEM_PROMPT } from '../constants';

// Initialize the AI client placeholder. It will be populated on the first API call.
let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

// Function to format chat history for the Gemini API
const buildHistory = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.sender === Sender.USER ? "user" : "model",
    parts: [{ text: msg.text }],
  }));
};

export const getRiaResponse = async (userMessage: string, history: Message[]): Promise<string> => {
  // --- LAZY INITIALIZATION ---
  // If the 'ai' instance doesn't exist yet, try to create it.
  if (!ai) {
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
      return "Ой, кажется, у меня возникли технические неполадки. 🤨 Скорее всего, мой создатель забыл добавить секретный ключ в переменные окружения проекта на Vercel. Нужно создать переменную с именем `API_KEY` и вставить в неё ключ. Без него я не могу связаться со своим 'мозгом'. Пожалуйста, проверь это в настройках: Project > Settings > Environment Variables.";
    }
    // Create the instance now that we know we need it.
    ai = new GoogleGenAI({ apiKey });
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-pro',
      history: buildHistory(history),
      config: {
        systemInstruction: RIA_SYSTEM_PROMPT,
      },
    });

    const response = await chat.sendMessage({ message: userMessage });

    return response.text;
  } catch (error) {
    console.error("Error fetching response from Gemini API:", error);
    // Add a check for authentication errors which are common with invalid keys
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission') || error.message.includes('API key is invalid'))) {
       return "Хм, тот ключ, что ты добавил в `API_KEY`, кажется неверным или у него нет нужных прав (возможно, не привязан биллинг в Google Cloud?). Проверь его еще раз, пожалуйста. Он должен быть правильным, чтобы я могла работать. 🤨";
    }
    return "Прости, дорогая, что-то пошло не так, и я не могу сейчас ответить. Давай попробуем еще раз через мгновение. 🫂";
  }
};