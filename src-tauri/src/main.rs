// src-tauri/src/main.rs

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// --- 1. Importações (ATUALIZADAS) ---
use tauri::Manager;
use tauri::{AppHandle, State};
// ATUALIZAÇÃO: Importar ConnectOptions e FromStr
use sqlx::{
    sqlite::{SqlitePoolOptions, SqliteConnectOptions},
    Pool, Sqlite
};
use std::str::FromStr; // Para converter o caminho em opções de conexão

// --- 2. Nosso Estado de Banco de Dados ---
struct DbPool {
    pool: Pool<Sqlite>,
}

// --- 3. Função de Setup do Banco de Dados (ATUALIZADA) ---
async fn setup_database(app: &AppHandle) -> Result<Pool<Sqlite>, Box<dyn std::error::Error>> {
    let app_data_dir = app.path()
        .app_data_dir()
        .expect("Falha ao encontrar a pasta de dados do app");
    
    std::fs::create_dir_all(&app_data_dir)?;

    let db_path = app_data_dir.join("studyflow.db");
    
    // ATUALIZAÇÃO: Não usamos mais a URL "sqlite://..."
    let db_path_str = db_path.to_str().expect("Caminho do DB inválido");
    println!("Iniciando banco de dados em: {}", db_path_str);

    // ATUALIZAÇÃO: Usar SqliteConnectOptions para garantir a criação do arquivo
    let connect_options = SqliteConnectOptions::from_str(db_path_str)?
        .create_if_missing(true); // <-- A MÁGICA: "Crie o arquivo se não existir"

    // Conectar usando as opções explícitas
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await?;

    // Rodar migrações (Isso agora deve encontrar o arquivo)
    println!("Rodando migrações do banco de dados...");
    sqlx::migrate!("./sqlx-migrations")
        .run(&pool)
        .await?;
    println!("Migrações concluídas.");

    Ok(pool)
}

// --- 4. Nosso Comando (Sem mudanças) ---
#[tauri::command(rename_all = "camelCase")]
async fn add_study_log(
    modo: String,
    materia: String,
    topico: String,
    tempo_foco_seg: i64,
    tempo_pausa_seg: i64,
    contagem_pausa: i64,
    db_state: State<'_, DbPool>,
) -> Result<(), String> {
    
    let insert_query = "
        INSERT INTO study_logs (modo, materia, topico, tempo_foco_seg, tempo_pausa_seg, contagem_pausa)
        VALUES ($1, $2, $3, $4, $5, $6)
    ";

    match sqlx::query(insert_query)
        .bind(modo)
        .bind(materia)
        .bind(topico)
        .bind(tempo_foco_seg)
        .bind(tempo_pausa_seg)
        .bind(contagem_pausa)
        .execute(&db_state.pool)
        .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Falha ao inserir log: {}", e)),
    }
}

// --- 5. Main (Sem mudanças) ---
#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();
            tokio::spawn(async move {
                let pool = setup_database(&app_handle)
                    .await
                    .expect("Falha ao configurar o banco de dados");
                
                app_handle.manage(DbPool { pool });
            });
            Ok(())
        })
        
        .invoke_handler(tauri::generate_handler![
            add_study_log
        ])
        
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}