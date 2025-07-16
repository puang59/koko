import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    try {
      await invoke("toggle_window");
    } catch (error) {
      console.error("Failed to toggle window:", error);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      // Your submit logic here
      console.log("Submitting:", inputValue);
      // Clear input after successful submit
      setInputValue("");
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsLoading(false);
    }
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
      <h1>TARS</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="What's on your mind?"
        className="main-input"
        autoFocus
      />

      <button onClick={handleSubmit} disabled={!inputValue.trim() || isLoading}>
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Sending...</span>
          </div>
        ) : (
          "Send"
        )}
      </button>
    </main>
  );
}

export default App;
