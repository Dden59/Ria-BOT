import { Message } from '../types';

// This function now acts as a client to our own backend endpoint,
// which securely handles the Gemini API call.
export const getRiaResponse = async (messages: Message[]): Promise<{ text: string; rawError?: string; }> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    // The backend function is designed to always return a JSON body, even for errors.
    const data = await response.json();

    if (!response.ok) {
      console.error("Serverless function error response:", data);
      return {
        text: data.text || `Ошибка сервера: ${response.status} ${response.statusText}`,
        rawError: data.rawError || JSON.stringify(data),
      };
    }

    return {
      text: data.text,
      rawError: data.rawError, // The backend might pass through rawError even on success (e.g., safety blocks)
    };

  } catch (error) {
    console.error("Network error or failed to fetch from /api/generate:", error);
    const rawError = error instanceof Error ? error.message : String(error);
    return {
      text: "Ой, не могу связаться со своим 'мозгом'. 🧠 Проверь, пожалуйста, свое интернет-соединение. Если с ним все в порядке, возможно, на сервере ведутся технические работы. Попробуй через минутку. 🫂",
      rawError: `Fetch failed: ${rawError}`,
    };
  }
};
