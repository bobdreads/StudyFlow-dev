// src/App.tsx
import { useState, useEffect } from 'react'

type SessionState = 'idle' | 'running' | 'paused'

function App() {
  // --- Estados (Sem mudanças) ---
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showLogModal, setShowLogModal] = useState(false)
  const [logMateria, setLogMateria] = useState('')
  const [logTopico, setLogTopico] = useState('')

  // --- useEffect (Timer) (Sem mudanças) ---
  useEffect(() => {
    let interval: number | undefined = undefined
    if (sessionState === 'running') {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionState])

  // --- Funções de Controle da Sessão (Sem mudanças) ---
  const startSession = () => {
    setTimeElapsed(0)
    setSessionState('running')
  }

  // (Sem mudanças aqui, 'stopSession' já pausa o timer)
  const stopSession = () => {
    setSessionState('paused') // Perfeito, congela o timer
    setShowLogModal(true)
    setLogMateria('')
    setLogTopico('')
  }

  const pauseSession = () => {
    setSessionState('paused')
  }

  const resumeSession = () => {
    setSessionState('running')
  }

  // --- Funções do Módulo 2 (Log) ATUALIZADAS ---

  // "Salvar" agora cuida do seu próprio reset
  const handleSaveLog = () => {
    console.log('--- NOVO LOG SALVO ---')
    console.log(`Tempo: ${timeElapsed}s`)
    console.log(`Matéria: ${logMateria}`)
    console.log(`Tópico: ${logTopico}`)
    
    // Fecha o modal e reseta o app
    setShowLogModal(false)
    setSessionState('idle') // Vai para a tela inicial
  }

  // NOVA FUNÇÃO para "Cancelar"
  const handleCancelLog = () => {
    // Fecha o modal e retoma o timer
    setShowLogModal(false)
    setSessionState('running') // Volta a contar
  }

  // A função antiga 'closeLogModal' não é mais necessária

  // --- Funções Auxiliares de Formatação (Sem mudanças) ---
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = timeInSeconds % 60
    const pad = (num: number) => num.toString().padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  const formatTimeForLog = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    let parts = []
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`)
    if (hours === 0 && minutes === 0) {
      const seconds = timeInSeconds % 60
      parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`)
    }
    return parts.join(' e ') || '0 segundos'
  }

  // --- Renderização ---
  return (
    <main
      className="flex h-screen w-full items-center justify-center 
                 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
    >
      {/* --- MÓDULO 1: Foco ou Ocioso (Sem mudanças) --- */}
      {sessionState === 'idle' ? (
        <div
          className="flex flex-col items-center justify-center 
                     rounded-2xl border border-white/20 bg-white/10 
                     p-16 shadow-xl backdrop-blur-lg"
        >
          <h1 className="mb-4 text-5xl font-bold text-white">StudyFlow</h1>
          <p className="mb-12 text-xl text-white/80">Pronto para o foco total?</p>
          <button
            onClick={startSession}
            className="rounded-lg bg-white/20 px-10 py-5 text-3xl 
                       font-bold text-white shadow-lg transition 
                       hover:bg-white/30"
          >
            Iniciar Sessão
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center 
                     w-[600px] h-[400px]
                     rounded-2xl border border-white/20 bg-white/10 
                     p-12 shadow-xl backdrop-blur-lg"
        >
          <div
            className={`mb-8 h-2 w-32 rounded-full bg-white/50 ${
              sessionState === 'running' ? 'animate-pulse-bg-simple' : ''
            }`}
          />
          <div className="font-mono text-9xl font-bold text-white">
            {formatTime(timeElapsed)}
          </div>
          <div className="mt-12 flex gap-4">
            {sessionState === 'running' ? (
              <button
                onClick={pauseSession}
                className="rounded-lg bg-yellow-500/80 px-8 py-4 text-2xl 
                           font-semibold text-white shadow-lg transition 
                           hover:bg-yellow-600/80"
              >
                Pausar
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="rounded-lg bg-green-500/80 px-8 py-4 text-2xl 
                           font-semibold text-white shadow-lg transition 
                           hover:bg-green-600/80"
                disabled={showLogModal}
              >
                Retomar
              </button>
            )}
            <button
              onClick={stopSession}
              className="rounded-lg bg-red-600/80 px-8 py-4 text-2xl 
                         font-semibold text-white shadow-lg transition 
                         hover:bg-red-700/80"
              disabled={showLogModal}
            >
              Finalizar
            </button>
          </div>
        </div>
      )}

      {/* --- MÓDULO 2: Modal de Log de Estudos --- */}
      {showLogModal && (
        // Overlay de fundo
        <div
          className="absolute inset-0 flex items-center 
                     justify-center bg-black/90 backdrop-blur-sm"
        >
          {/* Card do Modal */}
          <div
            className="flex flex-col rounded-2xl border border-white/20 
                       bg-white/20 p-8 text-white shadow-xl w-[500px]"
          >
            <h2 className="mb-4 text-3xl font-bold">Fim da Sessão</h2>
            <p className="mb-6 text-lg">
              Tempo da Sessão:
              <strong className="ml-2 font-bold">
                {formatTimeForLog(timeElapsed)}
              </strong>
            </p>

            {/* Campos de Input (Sem mudanças) */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-white/80">
                Matéria / Curso
              </label>
              <input
                type="text"
                value={logMateria}
                onChange={(e) => setLogMateria(e.target.value)}
                placeholder="Ex: Curso SMC"
                className="w-full rounded-lg border-none bg-white/20 p-3 
                           text-white placeholder-white/50 
                           focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="mb-8">
              <label className="mb-1 block text-sm font-medium text-white/80">
                Tópico da Sessão
              </label>
              <input
                type="text"
                value={logTopico}
                onChange={(e) => setLogTopico(e.target.value)}
                placeholder="Ex: Orderblock e Fair Value Gap"
                className="w-full rounded-lg border-none bg-white/20 p-3 
                           text-white placeholder-white/50 
                           focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            {/* BOTÕES DO MODAL ATUALIZADOS */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelLog} // <-- MUDANÇA AQUI
                className="rounded-lg bg-white/20 px-6 py-2 font-semibold 
                           transition hover:bg-white/30"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLog} // <-- (Sem mudança aqui)
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold 
                           shadow-lg transition hover:bg-blue-700"
              >
                Salvar Log
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App