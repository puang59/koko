import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { sendMessage } from "./actions/llm";
import { FileText, X } from "lucide-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import ResponseSection from "./components/ResponseSection";
import { fetchClipboard } from "./utils/clipboard";

const globalShortcut = "CmdOrCtrl+Shift+U";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [lastClearedContext, setLastClearedContext] = useState("");
  const lastClearedRef = useRef("");
  const lastAcceptedRef = useRef("");

  const normalizeContext = (text: string) =>
    text.normalize("NFC").replace(/\s+/g, " ").trim();

  const handleCopyResponse = useCallback(async () => {
    if (!response.trim()) {
      console.log("No response to copy");
      return;
    }

    try {
      await writeText(response);
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

      const trimmed = normalizeContext(clipboardText);
      if (!trimmed) return;
      if (trimmed === lastClearedRef.current) return;
      if (trimmed === context) return;
      if (trimmed && trimmed !== lastClearedContext) {
        // Accept new context and clear the last-cleared marker so future repeats are allowed
        setContext(trimmed);
        setLastClearedContext("");
        lastAcceptedRef.current = trimmed;
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

    // In-app Cmd+C: if window is focused, let Cmd+C copy the response
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const isCmd = isMac ? e.metaKey : e.ctrlKey;
      if (isCmd && (e.key === "c" || e.key === "C")) {
        // Only handle when nothing is selected in the input
        const selection = window.getSelection?.()?.toString();
        if (!selection && response.trim()) {
          e.preventDefault();
          handleCopyResponse();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unregister("CmdOrCtrl+Shift+U");
      unregister("CmdOrCtrl+Shift+V");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleCopyResponse, response]);

  const truncate = (str: string, maxLength: number) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  };

  return (
    <main>
      {isLoading && <p>Thinking...</p>}
      {!isLoading && response && (
        <ResponseSection response={response} isCopied={isCopied} />
      )}
      {context && (
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => {
            const norm = normalizeContext(context);
            setLastClearedContext(norm);
            lastClearedRef.current = norm;
            setContext("");
          }}
          style={{
            position: "relative",
            width: "60%",
            cursor: "pointer",
            borderRadius: 4,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: isHovering
              ? "rgba(63, 63, 70, 0.7)"
              : "rgba(39, 39, 42, 0.6)",
            border: `1px solid ${
              isHovering ? "rgba(161,161,170,0.8)" : "rgba(113,113,122,0.7)"
            }`,
            boxShadow: isHovering ? "0 0 0 1px rgba(161,161,170,0.3)" : "none",
            transition:
              "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
          }}
        >
          {isHovering ? (
            <X size={14} style={{ color: "#ffffff" }} />
          ) : (
            <FileText size={14} style={{ color: "#d4d4d8" }} />
          )}
          <p style={{ fontSize: 12, color: "#e4e4e7", margin: 0 }}>
            {truncate(context, 30)}
          </p>
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
