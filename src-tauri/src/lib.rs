// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod secrets;

use std::sync::Arc;

use secrets::{Secrets, SecretsError};
use serde::Serialize;
use tauri::Manager;

/// Example Tauri command invoked from the frontend.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct SecretsStatus {
    initialized: bool,
}

#[tauri::command]
fn secrets_status(_secrets: tauri::State<'_, Arc<Secrets>>) -> SecretsStatus {
    // Reaching this command means `setup` succeeded, so the root key is loaded.
    SecretsStatus { initialized: true }
}

#[tauri::command]
fn secrets_export(
    passphrase: String,
    secrets: tauri::State<'_, Arc<Secrets>>,
) -> Result<String, SecretsError> {
    secrets.export(&passphrase)
}

#[tauri::command]
fn secrets_import(
    armor: String,
    passphrase: String,
    overwrite: bool,
    secrets: tauri::State<'_, Arc<Secrets>>,
) -> Result<(), SecretsError> {
    secrets.import(&armor, &passphrase, overwrite)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let secrets = Secrets::load_or_init()?;
            app.manage(Arc::new(secrets));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            secrets_status,
            secrets_export,
            secrets_import,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
