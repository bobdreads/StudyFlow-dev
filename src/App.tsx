// src/App.tsx
import { useState, useEffect } from 'react'

function App() {
  // Estado para controlar se a sessão de foco está ativa
  const [isSessionActive, setIsSessionActive] = useState(false)
  
  // Estado para rastrear o tempo decorrido em segundos
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Este 'useEffect' controla o cronômetro
  useEffect(() => {
    let interval: number | undefined = undefined

    if (isSessionActive) {
      // Inicia um intervalo que atualiza o timeElapsed a cada segundo
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1)
      }, 1000)
    } else {
      // Se a sessão não está ativa, limpa o intervalo
      clearInterval(interval)
    }

    // Função de "limpeza": é executada quando o componente "desmonta"
    // ou antes de o efeito rodar novamente. Essencial para evitar vazamento de memória.
    return () => clearInterval(interval)
  }, [isSessionActive]) // O efeito depende do estado 'isSessionActive'

  // --- Funções de Controle ---

  const startSession = () => {
    setTimeElapsed(0) // Reseta o timer
    setIsSessionActive(true) // Ativa o modo Hiperfoco
  }

  const stopSession = () => {
    setIsSessionActive(false)
    // No futuro, aqui chamaremos o Módulo 2 (Log de Estudos) [cite: 17]
    console.log(`Sessão finalizada com ${timeElapsed} segundos.`)
  }

  // --- Funções Auxiliares ---

  // Formata os segundos para o formato HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60

    const pad = (num: number) => num.toString().padStart(2, '0')

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  // --- Renderização ---

  if (isSessionActive) {
    // --- MODO HIPERFOCO ---
    //  "uma tela minimalista exibindo apenas o cronômetro correndo 
    // e um botão de 'Pausar/Finalizar'."
    //  (A animação de fundo será adicionada no próximo passo)
    return (
      <div 
        className="flex h-screen w-full flex-col items-center justify-center 
                   bg-gray-900 text-white animate-pulse-bg"
      >
        <div className="text-9xl font-bold font-mono">
          {formatTime(timeElapsed)}
        </div>
        <button
          onClick={stopSession}
          className="mt-12 rounded-lg bg-red-600 px-8 py-4 text-2xl 
                     font-semibold text-white transition hover:bg-red-700"
        >
          Finalizar
        </button>
      </div>
    )
  }

  // --- MODO OCIOSO (IDLE) ---
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center 
                   bg-gray-800 text-white">
      <h1 className="mb-4 text-5xl font-bold">StudyFlow</h1>
      <p className="mb-12 text-xl text-gray-300">Pronto para o foco total?</p>
      
      {/*  "Botão principal para 'Iniciar Sessão'." */}
      <button
        onClick={startSession}
        className="rounded-lg bg-blue-600 px-10 py-5 text-3xl 
                   font-bold text-white transition hover:bg-blue-700"
      >
        Iniciar Sessão
      </button>
    </div>
  )
}

export default App