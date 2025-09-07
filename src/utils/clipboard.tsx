import { readText } from "@tauri-apps/plugin-clipboard-manager";

export const fetchClipboard = async (): Promise<string> => {
  try {
    const response = await readText();
    console.log("Clipboard content:", response);
    return response;
  } catch (error) {
    console.error("Failed to read clipboard:", error);
    return "";
  }
};
