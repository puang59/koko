import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { generateResponse } from "./actions/llm";
import ResponseSection from "./components/ResponseSection";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Loading state: ", isLoading);
  }, [isLoading]);

  const handleToggle = async () => {
    try {
      await invoke("toggle_window");
    } catch (error) {
      console.error("Failed to toggle window:", error);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;
    let response: string = "";

    try {
      setIsLoading(true);
      response = await generateResponse(inputValue);
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
        await register(
          "CmdOrCtrl+Shift+U",
          async (event: { state: string }) => {
            if (event.state === "Pressed") {
              await handleToggle();
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
    };
  }, []);

  return (
    <main>
      {isLoading ? <p>Thinking...</p> : <ResponseSection response={response} />}
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
