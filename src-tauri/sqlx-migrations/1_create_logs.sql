CREATE TABLE IF NOT EXISTS study_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    modo TEXT NOT NULL,
    materia TEXT,
    topico TEXT,
    tempo_foco_seg INTEGER NOT NULL,
    tempo_pausa_seg INTEGER NOT NULL,
    contagem_pausa INTEGER NOT NULL
);