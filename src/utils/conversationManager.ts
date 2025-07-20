import { getUserId } from "./userIdentifier";

interface Message {
  role: "user" | "tars";
  parts: { text: string }[];
  timestamp: number;
}

export class ConversationManager {
  private userId: string;
  private storageKey: string;

  constructor() {
    this.userId = getUserId();
    this.storageKey = `conversation_${this.userId}`;
  }

  getHistory(): Message[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  addMessage(role: "user" | "tars", text: string): void {
    const history = this.getHistory();
    const newMessage: Message = {
      role,
      parts: [{ text }],
      timestamp: Date.now(),
    };
    history.push(newMessage);
    localStorage.setItem(this.storageKey, JSON.stringify(history));
  }

  clearHistory(): void {
    localStorage.removeItem(this.storageKey);
  }

  getGeminiFormat(): Array<{ role: string; parts: { text: string }[] }> {
    return this.getHistory().map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));
  }
}
