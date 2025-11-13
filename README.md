# 🚀 StudyFlow

O centro de comando para estudantes de alta performance, unindo foco profundo (via timers) com retenção de longo prazo (via revisão espaçada inteligente).

Este é um projeto de aplicação desktop (Tauri + React) para gerenciar sessões de estudo (Foco) e conectá-las a um sistema de registro (Log) para futuras revisões.

---

## 🛠️ Stack Tecnológica

* **Framework:** [Tauri](https://tauri.app/) (Backend em Rust + Frontend em WebView)
* **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (com design Glassmorphism)

---

## Features Atuais (v0.1.0-alpha)

* **Módulo 1: Sessão de Foco**
    * Modo de Sessão: Cronômetro Manual (contagem progressiva).
    * Controles: Iniciar, Pausar, Retomar e Finalizar.
    * Interface: Design Glassmorphism com fundo gradiente.
* **Módulo 2: Log de Estudos**
    * Modal "Fim de Sessão" que abre ao clicar em "Finalizar".
    * Campos para registrar Matéria/Curso e Tópico da Sessão.
    * O tempo da sessão é preenchido automaticamente.
    * **Fluxo de "Cancelar":** Se o usuário cancelar o log, o timer retoma a contagem de onde parou.
    * **Fluxo de "Salvar":** Salva o log no console e retorna à tela inicial.

---

## 🗺️ Roadmap Futuro

Baseado no [Documento de Escopo](Escopo%20e%20Visão%20-%20StudyFlow.pdf):

* [ ] **Módulo 1:** Implementar Modo Pomodoro.
* [ ] **Módulo 3:** Implementar o Sistema de Revisão Espaçada (SQLite + Rust).
* [ ] **Módulo 4:** Painel de Revisões (Dashboard).
* [ ] **Módulo 5:** Planejador de Estudos (Calendário).
* [ ] **Módulo 6:** Dashboard de Desempenho (Gráficos).
* [ ] **Módulo 7:** Gamificação.
* [ ] **Módulo 8:** Integrações e Sincronização.

---

## ⚡ Como Rodar (Desenvolvimento)

1.  Garanta que todos os [pré-requisitos do Tauri](https://tauri.app/v1/guides/getting-started/prerequisites) (Rust, Node.js, etc.) estejam instalados.
2.  Clone o repositório.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Rode o ambiente de desenvolvimento do Tauri:
    ```bash
    npm run tauri dev
    ```