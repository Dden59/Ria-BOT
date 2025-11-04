import { GoogleGenAI } from "@google/genai";
import { Message, Sender } from '../types';
import { RIA_SYSTEM_PROMPT } from '../constants';

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Function to format chat history for the Gemini API
const buildHistory = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.sender === Sender.USER ? "user" : "model",
    parts: [{ text: msg.text }],
  }));
};

export const getRiaResponse = async (userMessage: string, history: Message[]): Promise<string> => {
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
    return "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment. 🫂";
  }
};
