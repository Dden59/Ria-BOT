
import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from '../types';
import { RIA_SYSTEM_PROMPT } from '../constants';

// Initialize the AI client placeholder. It will be populated on the first API call.
let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

// A robust function to format chat history correctly for the Gemini API
const buildHistory = (messages: Message[]) => {
  // The API requires a history that alternates between 'user' and 'model' roles.
  // We must find the first user message and build a valid, alternating sequence from there.
  const validMessages: Message[] = [];
  let expectedSender = Sender.USER;

  // Find the index of the very first message sent by the user.
  const firstUserIndex = messages.findIndex(m => m.sender === Sender.USER);

  // If no user message exists, the history for the API is empty.
  if (firstUserIndex === -1) {
    return [];
  }

  // Iterate from the first user message to the end of the array.
  for (let i = firstUserIndex; i < messages.length; i++) {
    const message = messages[i];
    // Add the message to our valid list only if it's the one we expect.
    if (message.sender === expectedSender) {
      validMessages.push(message);
      // Flip the expected sender for the next turn.
      expectedSender = expectedSender === Sender.USER ? Sender.AI : Sender.USER;
    }
  }

  // Convert the valid messages to the format the API requires.
  return validMessages.map(msg => ({
    role: msg.sender === Sender.USER ? "user" : "model",
    parts: [{ text: msg.text }],
  }));
};

export const getRiaResponse = async (userMessage: string, history: Message[]): Promise<string> => {
  // --- LAZY INITIALIZATION ---
  if (!ai) {
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
      return "Ой, кажется, у меня возникли технические неполадки. 🤨 Скорее всего, мой создатель забыл добавить секретный ключ в переменные окружения проекта на Vercel. Нужно создать переменную с именем `API_KEY` и вставить в неё ключ. Без него я не могу связаться со своим 'мозгом'. Пожалуйста, проверь это в настройках: Project > Settings > Environment Variables.";
    }
    ai = new GoogleGenAI({ apiKey });
  }

  try {
    // The full content passed to the API includes the validated history and the new user message.
    const contents = [
      ...buildHistory(history),
      { role: "user", parts: [{ text: userMessage }] }
    ];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: contents,
      config: {
        systemInstruction: RIA_SYSTEM_PROMPT,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching response from Gemini API:", error);
    
    if (error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('permission') || error.message.includes('API key is invalid')) {
            return "Хм, тот ключ, что ты добавил в `API_KEY`, кажется неверным или у него нет нужных прав (возможно, не привязан биллинг в Google Cloud?). Проверь его еще раз, пожалуйста. Он должен быть правильным, чтобы я могла работать. 🤨";
        }
        if (error.message.includes('alternate between user and model')) {
            return "Ой, что-то сбилось в нашем диалоге. 😵‍💫 Похоже на технический сбой. Попробуй обновить страницу, это должно помочь наладить нашу беседу.";
        }
    }
    
    return "Прости, дорогая, что-то пошло не так, и я не могу сейчас ответить. Давай попробуем еще раз через мгновение. 🫂";
  }
};
