import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

function App() {
  const handleToggle = async () => {
    try {
      await invoke("toggle_window");
    } catch (error) {
      console.error("Failed to toggle window:", error);
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
      <div>koko</div>
      <div style={{ fontSize: "12px", marginTop: "10px", opacity: 0.7 }}>
        <kbd>⌘⇧U</kbd> to toggle
      </div>
    </main>
  );
}

export default App;
