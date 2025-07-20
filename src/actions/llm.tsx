import { invoke } from "@tauri-apps/api/core";
import { ConversationManager } from "../utils/conversationManager";
import { textPrompt } from "../utils/prompts";

const conversationManager = new ConversationManager();

export async function sendMessage(userInput: string) {
  conversationManager.addMessage("user", userInput);

  const history = conversationManager.getHistory();

  const messages = history.map((msg) => ({
    role: msg.role === "tars" ? "model" : msg.role,
    parts: msg.parts,
  }));

  const systemInstruction = {
    role: "model",
    parts: [
      {
        text: textPrompt,
      },
    ],
  };

  const finalMessages = [systemInstruction, ...messages];

  try {
    const response = await invoke("send_message_to_gemini", {
      messages: finalMessages,
    });

    conversationManager.addMessage("tars", response as string);

    return response as string;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}
