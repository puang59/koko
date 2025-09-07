import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { sendMessage } from "./actions/llm";
import ResponseSection from "./components/ResponseSection";
import { fetchClipboard } from "./utils/clipboard";
import { Copyleft } from "lucide-react";

const globalShortcut = "CmdOrCtrl+Shift+U";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState("");

  const handleCopyResponse = useCallback(async () => {
    if (!response.trim()) {
      console.log("No response to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(response);
      console.log("Response copied to clipboard!");
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard");
    }
  }, [response]);

  useEffect(() => {
    console.log("Loading state: ", isLoading);
  }, [isLoading]);

  const handleToggle = async () => {
    try {
      const clipboardText = await fetchClipboard();

      await invoke("toggle_window");

      if (clipboardText.trim()) {
        setContext(clipboardText);
      }
    } catch (error) {
      console.error("Failed to toggle window:", error);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    let response: string = "";

    try {
      setIsLoading(true);
      response = await sendMessage(context, inputValue);
      console.log("Response received:", response);

      setInputValue("");
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsLoading(false);
    }

    setResponse(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      handleToggle();
    }
  };

  useEffect(() => {
    const setupGlobalShortcut = async () => {
      try {
        await register(globalShortcut, async (event: { state: string }) => {
          if (event.state === "Pressed") {
            await handleToggle();
          }
        });

        await register(
          "CmdOrCtrl+Shift+V",
          async (event: { state: string }) => {
            if (event.state === "Pressed") {
              await handleCopyResponse();
            }
          }
        );
      } catch (error) {
        console.error("Failed to register global shortcut:", error);
      }
    };

    setupGlobalShortcut();

    return () => {
      unregister("CmdOrCtrl+Shift+U");
      unregister("CmdOrCtrl+Shift+V");
    };
  }, [handleCopyResponse]);

  const truncate = (str: string, maxLength: number) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  }

  return (
    <main>
      {isLoading && <p>Thinking...</p>}
      {!isLoading && response && (
        <ResponseSection response={response} isCopied={isCopied} />
      )}
      {context && (
        <div
          className="border border-zinc-500"
          style={{
            padding: "5px",
            paddingLeft: "10px",
            width: "60%",
            borderRadius: "5px",
            backgroundColor: "rgba(30, 41, 59, 0.3)",
          }}
        >
          <p className="text-xs">{truncate(context, 30)}</p>
        </div>
      )}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="What's on your mind?"
        className="main-input"
        autoFocus
      />
    </main>
  );
}

export default App;
