// src/App.tsx
import { useState, useEffect } from 'react'
import Settings from './Settings'
import { invoke } from '@tauri-apps/api/core'

// --- Tipos de Estado (Sem mudanças) ---
type SessionState = 'idle' | 'running' | 'paused'
type SessionMode = 'manual' | 'pomodoro'
type PomodoroPhase = 'foco' | 'pausa'
type AppView = 'home' | 'settings'

function App() {
  // --- Estados (Sem mudanças) ---
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [showLogModal, setShowLogModal] = useState(false)
  const [sessionMode, setSessionMode] = useState<SessionMode>('manual')

  const [focoTimeConfig, setFocoTimeConfig] = useState(25 * 60)
  const [pausaTimeConfig, setPausaTimeConfig] = useState(5 * 60)

  // --- Estados de Métrica (Resetados no início) ---
  const [timeElapsed, setTimeElapsed] = useState(0)     // Tempo de Foco
  const [totalPauseTime, setTotalPauseTime] = useState(0) // Tempo de Pausa/Break
  const [pauseCount, setPauseCount] = useState(0)         // Contagem de Pausa/Break

  const [timeLeft, setTimeLeft] = useState(focoTimeConfig)
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('foco')

  const [logMateria, setLogMateria] = useState('')
  const [logTopico, setLogTopico] = useState('')


  // --- useEffect (Timer Principal: Foco e Pausa Pomodoro) ---
  // Este timer lida com o tempo 'running'
  useEffect(() => {
    let interval: number | undefined = undefined

    if (sessionState === 'running') {
      interval = setInterval(() => {
        if (sessionMode === 'manual') {
          // Modo Manual: Só acumula tempo de foco
          setTimeElapsed((prevTime) => prevTime + 1)
        } 
        
        else if (sessionMode === 'pomodoro') {
          // Modo Pomodoro: Decrementa o timer principal
          setTimeLeft((prevTime) => prevTime - 1)
          
          if (pomodoroPhase === 'foco') {
            // Se estiver em Foco, acumula tempo de foco
            setTimeElapsed((prevTime) => prevTime + 1)
          } else {
            // ATUALIZADO: Se estiver em Pausa (Break Oficial),
            // acumula o tempo de pausa para o log
            setTotalPauseTime((prevTime) => prevTime + 1)
          }
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionState, sessionMode, pomodoroPhase])

  
  // --- useEffect (Timer de Pausa do Usuário - MODO MANUAL) ---
  // Este timer lida com o tempo 'paused' (pausa do usuário)
  useEffect(() => {
    let pauseInterval: number | undefined = undefined

    // Roda se estiver pausado, no modo Manual, e o modal não estiver aberto
    if (
      sessionState === 'paused' &&
      sessionMode === 'manual' && 
      !showLogModal
    ) {
      pauseInterval = setInterval(() => {
        // ATUALIZADO: Só acumula tempo de pausa se for MODO MANUAL
        setTotalPauseTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    // Se a pausa for no modo Pomodoro, o tempo não é acumulado,
    // (como você pediu: "sem contabilizar a pausa no meio disso")
    
    return () => clearInterval(pauseInterval)
  }, [sessionState, showLogModal, sessionMode]) // sessionMode adicionado


  // --- useEffect (Troca de Fase Pomodoro) ---
  // (ATUALIZADO: agora também conta as pausas)
  useEffect(() => {
    if (sessionMode !== 'pomodoro' || timeLeft > 0) return

    if (pomodoroPhase === 'foco') {
      // Foco -> Pausa
      setPomodoroPhase('pausa')
      setTimeLeft(pausaTimeConfig)
      // ATUALIZADO: Conta a pausa oficial do Pomodoro
      setPauseCount((prevCount) => prevCount + 1)
    } else {
      // Pausa -> Foco
      setPomodoroPhase('foco')
      setTimeLeft(focoTimeConfig)
    }
  }, [timeLeft, sessionMode, pomodoroPhase, focoTimeConfig, pausaTimeConfig])
  
  // --- Funções de Controle (ATUALIZADAS) ---
  
  // Reseta todas as métricas
  const resetAllMetrics = () => {
    setTimeElapsed(0)
    setTotalPauseTime(0)
    setPauseCount(0)
  }
  
  const startManualSession = () => {
    setSessionMode('manual')
    setSessionState('running')
    resetAllMetrics()
  }
  
  const startPomodoroSession = () => {
    setSessionMode('pomodoro')
    setPomodoroPhase('foco')
    setTimeLeft(focoTimeConfig)
    setSessionState('running')
    resetAllMetrics()
  }

  const stopSession = () => {
    setSessionState('paused')
    setShowLogModal(true)
    setLogMateria('')
    setLogTopico('')
  }

  // ATUALIZADO: Só conta pausas do usuário no modo MANUAL
  const pauseSession = () => {
    setSessionState('paused')
    if (sessionMode === 'manual') {
      setPauseCount((prevCount) => prevCount + 1)
    }
    // Se for modo Pomodoro, a pausa do usuário não é contada
  }

  const resumeSession = () => { setSessionState('running') }

  const cancelAndGoHome = () => {
    setSessionState('idle')
    resetAllMetrics() // Reseta tudo
    setTimeLeft(focoTimeConfig)
    setPomodoroPhase('foco')
  }

  // --- Funções do Módulo 2 (Log) (ATUALIZADAS) ---
  const handleSaveLog = async () => {
    
    try {
      // ATUALIZAÇÃO: As chaves aqui agora são camelCase
      // para corresponder ao que o Rust espera
      await invoke("add_study_log", {
        modo: sessionMode,
        materia: logMateria,
        topico: logTopico,
        tempoFocoSeg: timeElapsed,     // <-- Mudou de tempo_foco_seg
        tempoPausaSeg: totalPauseTime, // <-- Mudou de tempo_pausa_seg
        contagemPausa: pauseCount,     // <-- Mudou de contagem_pausa
      });

      // AGORA VOCÊ DEVE VER ISSO!
      console.log("Log salvo no banco de dados com sucesso!");

    } catch (err) {
      // Se ainda falhar, veremos o erro específico aqui
      console.error("Falha ao salvar o log no banco de dados:", err);
    }

    // Resetar a UI (sem mudanças)
    setShowLogModal(false)
    setSessionState('idle')
    resetAllMetrics() 
  }

  const handleCancelLog = () => {
    setShowLogModal(false)
    setSessionState('running')
  }

  // --- Funções Auxiliares de Formatação (Sem mudanças) ---
  const formatTime = (timeInSeconds: number) => {
    const t = Math.max(0, timeInSeconds)
    const hours = Math.floor(t / 3600)
    const minutes = Math.floor((t % 3600) / 60)
    const seconds = t % 60
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
      {/* --- Ícones de Navegação (Sem mudanças) --- */}
      {currentView === 'home' && sessionState !== 'idle' && !showLogModal && (
        <button
          onClick={cancelAndGoHome}
          className="absolute top-6 left-6 text-white/50 transition
                     hover:text-white"
          title="Voltar à Tela Inicial (Cancela Sessão)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      {currentView === 'home' && sessionState === 'idle' && (
        <button
          onClick={() => setCurrentView('settings')}
          className="absolute top-6 right-6 text-white/50 transition
                     hover:text-white"
          title="Configurações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
            <path d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
            <path fillRule="evenodd" d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* --- Renderização Condicional da View --- */}
      {currentView === 'home' ? (
        <>
          {/* --- MÓDULO 1: OCIOSO (Sem mudanças) --- */}
          {sessionState === 'idle' ? (
            <div
              className="flex flex-col items-center justify-center 
                         rounded-2xl border border-white/20 bg-white/10 
                         p-16 shadow-xl backdrop-blur-lg"
            >
              <h1 className="mb-4 text-5xl font-bold text-white">StudyFlow</h1>
              <p className="mb-12 text-xl text-white/80">
                Escolha seu modo de foco.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={startManualSession}
                  className="rounded-lg bg-white/20 px-8 py-5 text-2xl 
                             font-bold text-white shadow-lg transition 
                             hover:bg-white/30"
                >
                  Iniciar (Manual)
                </button>
                <button
                  onClick={startPomodoroSession}
                  className="rounded-lg bg-white/20 px-8 py-5 text-2xl 
                             font-bold text-white shadow-lg transition 
                             hover:bg-white/30"
                >
                  Iniciar (Pomodoro)
                </button>
              </div>
            </div>
          ) : (
            
            // --- MÓDULO 1: FOCO (ATUALIZADO) ---
            <div
              className="flex flex-col items-center justify-center 
                         w-[600px] h-[450px]
                         rounded-2xl border border-white/20 bg-white/10 
                         p-12 shadow-xl backdrop-blur-lg"
            >
              <div className="mb-4 text-center">
                <div className="text-2xl font-semibold text-white">
                  {sessionMode === 'manual' ? 'Modo Manual' : 'Modo Pomodoro'}
                </div>
                {sessionMode === 'pomodoro' && (
                  <div
                    className={`text-xl font-medium ${
                      pomodoroPhase === 'foco' ? 'text-green-300' : 'text-yellow-300'
                    }`}
                  >
                    {pomodoroPhase === 'foco' ? 'FOCO' : 'PAUSA'}
                  </div>
                )}
              </div>

              <div
                className={`mb-8 h-2 w-32 rounded-full ${
                  sessionState === 'running' ? 'bg-white/50 animate-pulse-bg-simple' : 'bg-white/30'
                }`}
              />

              {/* Timer Principal */}
              <div className="font-mono text-9xl font-bold text-white">
                {sessionMode === 'manual'
                  ? formatTime(timeElapsed)  // Foco Manual
                  : formatTime(timeLeft)      // Foco/Pausa Pomodoro
                }
              </div>

              {/* NOVO: Timer de Pausa Visual (Só para Modo Manual) */}
              {sessionState === 'paused' && sessionMode === 'manual' && (
                <div className="mt-2 font-mono text-2xl text-yellow-300">
                  Pausa: {formatTime(totalPauseTime)}
                </div>
              )}

              {/* Botões de Controle */}
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

          {/* --- MÓDULO 2: Modal de Log (Sem mudanças) --- */}
          {/* (Os valores de totalPauseTime e pauseCount 
              já estarão corretos no modal) */}
          {showLogModal && (
            <div
              className="absolute inset-0 flex items-center 
                         justify-center bg-black/75 backdrop-blur-sm"
            >
              <div
                className="flex flex-col rounded-2xl border border-white/20 
                           bg-white/20 p-8 text-white shadow-xl w-[500px]"
              >
                <h2 className="mb-4 text-3xl font-bold">Fim da Sessão</h2>
                
                <div className="mb-6 space-y-2 text-lg">
                  <p>
                    Tempo de Foco:
                    <strong className="ml-2 font-bold">
                      {formatTimeForLog(timeElapsed)}
                    </strong>
                  </p>
                  <p className="text-base text-white/80">
                    Tempo em Pausa:
                    <strong className="ml-2 font-normal text-white">
                      {formatTimeForLog(totalPauseTime)}
                    </strong>
                  </p>
                  <p className="text-base text-white/80">
                    Nº de Pausas:
                    <strong className="ml-2 font-normal text-white">
                      {pauseCount}
                    </strong>
                  </p>
                </div>
                
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
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleCancelLog}
                    className="rounded-lg bg-white/20 px-6 py-2 font-semibold 
                               transition hover:bg-white/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveLog}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-semibold 
                               shadow-lg transition hover:bg-blue-700"
                  >
                    Salvar Log
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // --- Renderiza a View de Configurações (Sem mudanças) ---
        <Settings
          focoTime={focoTimeConfig}
          pausaTime={pausaTimeConfig}
          setFocoTime={setFocoTimeConfig}
          setPausaTime={setPausaTimeConfig}
          onClose={() => setCurrentView('home')}
        />
      )}
    </main>
  )
}

export default App