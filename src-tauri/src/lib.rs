use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize)]
struct Message {
    role: String,
    parts: Vec<MessagePart>,
}

#[derive(Serialize, Deserialize)]
struct MessagePart {
    text: String,
}

#[derive(Serialize, Deserialize)]
struct GeminiRequest {
    contents: Vec<Message>,
}

#[derive(Serialize, Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Serialize, Deserialize)]
struct Candidate {
    content: Content,
}

#[derive(Serialize, Deserialize)]
struct Content {
    parts: Vec<MessagePart>,
}

#[tauri::command]
async fn send_message_to_gemini(messages: Vec<Message>) -> Result<String, String> {
    // Get API key from environment variable
    let api_key = env::var("GOOGLE_API_KEY")
        .map_err(|_| "GOOGLE_API_KEY environment variable not set".to_string())?;
    
    let client = reqwest::Client::new();
    
    let request_body = GeminiRequest {
        contents: messages,
    };
    
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key={}",
        api_key
    );
    
    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    // Log the response status and body for debugging
    let status = response.status();
    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;
    
    if !status.is_success() {
        return Err(format!("API returned error {}: {}", status, response_text));
    }
    
    // Try to parse the response
    let gemini_response: GeminiResponse = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}. Response was: {}", e, response_text))?;
    
    gemini_response
        .candidates
        .first()
        .and_then(|c| c.content.parts.first())
        .map(|p| p.text.clone())
        .ok_or_else(|| format!("No response from Gemini. Full response: {}", response_text))
}

#[tauri::command]
async fn toggle_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    
    if window.is_visible().map_err(|e| e.to_string())? {
        window.hide().map_err(|e| e.to_string())?;
    } else {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env file at startup
    dotenv::dotenv().ok();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![toggle_window, send_message_to_gemini])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
