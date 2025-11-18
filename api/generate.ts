import { GoogleGenAI } from "@google/genai";
import { RIA_SYSTEM_PROMPT } from "../constants";
import { Message, Sender } from "../types";

export const config = {
  runtime: 'edge',
};

/**
 * A robust, "bulletproof" function to format chat history.
 * It ensures the history starts with a user message, enforces strict user/model alternation,
 * and guarantees the final message is from the user, preventing common API errors.
 */
const buildHistory = (messages: Message[]) => {
  const firstUserIndex = messages.findIndex(msg => msg.sender === Sender.USER);
  if (firstUserIndex === -1) {
    return [];
  }
  const relevantMessages = messages.slice(firstUserIndex);
  const history = [];
  let lastSender: Sender | null = null;
  for (const msg of relevantMessages) {
    if (msg.sender === lastSender) {
      continue;
    }
    history.push({
      role: msg.sender === Sender.USER ? "user" : "model",
      parts: [{ text: msg.text }],
    });
    lastSender = msg.sender;
  }
  if (history.length > 0 && history[history.length - 1].role !== 'user') {
    console.error("buildHistory Error: Invalid turn order. The last message is not from the user.", history);
    return [];
  }
  return history;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid "messages" in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
      const body = JSON.stringify({
        text: "Ой, кажется, у меня возникли технические неполадки. 🤨 Скорее всего, мой создатель забыл добавить секретный ключ в переменные окружения проекта на Vercel. Нужно создать переменную с именем `API_KEY` и вставить в неё ключ. Без него я не могу связаться со своим 'мозгом'. Пожалуйста, проверь это в настройках: Project > Settings > Environment Variables.",
        rawError: "API_KEY environment variable not set."
      });
      return new Response(body, {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const contents = buildHistory(messages as Message[]);

    if (contents.length === 0) {
      const body = JSON.stringify({
        text: "Ой, что-то сбилось в нашем диалоге. 😵‍💫 Похоже, я говорю сама с собой. Пожалуйста, отправь сообщение, чтобы мы могли продолжить.",
        rawError: "buildHistory returned an empty array, indicating no user messages or invalid turn order."
      });
      return new Response(body, {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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
      const body = JSON.stringify({
        text: "Ой, кажется, мой ответ был заблокирован фильтрами безопасности. 😬 Давай попробуем перефразировать твой вопрос или обсудить что-то другое.",
        rawError: `API call blocked for safety. Finish Reason: SAFETY. Ratings: ${JSON.stringify(candidate?.safetyRatings)}`
      });
      return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!response.text) {
      const rawError = `Gemini API returned an empty response. Finish Reason: ${candidate?.finishReason}, Safety Ratings: ${JSON.stringify(candidate?.safetyRatings)}`;
      console.error(rawError);
      const body = JSON.stringify({
        text: "Прости, дорогая, что-то пошло не так, и я не могу сейчас ответить. Похоже, ответа просто нет. Давай попробуем еще раз через мгновение. 🫂",
        rawError: rawError,
      });
      return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const body = JSON.stringify({ text: response.text });
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Full error object from API call:", JSON.stringify(error, null, 2));
    const rawError = error instanceof Error ? error.message : String(error);
    
    let userMessage = "Прости, дорогая, что-то пошло не так, и я не могу сейчас ответить. Возможно, наш диалог был прерван фильтрами безопасности. Давай попробуем еще раз через мгновение. 🫂";

    if (error instanceof Error) {
        if (rawError.includes('API key not valid') || rawError.includes('permission') || rawError.includes('API key is invalid')) {
            userMessage = "Хм, тот ключ, что ты добавил в `API_KEY`, кажется неверным или у него нет нужных прав (возможно, не привязан биллинг в Google Cloud?). Проверь его еще раз, пожалуйста. Он должен быть правильным, чтобы я могла работать. 🤨";
        }
        if (rawError.includes('alternate between user and model')) {
            userMessage = "Ой, что-то сбилось в нашем диалоге. 😵‍💫 Похоже на технический сбой. Попробуй обновить страницу, это должно помочь наладить нашу беседу.";
        }
    }

    const body = JSON.stringify({ text: userMessage, rawError });
    return new Response(body, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
