import React from 'react'

// Estas são as "propriedades" que o App.tsx vai passar para este componente
interface SettingsProps {
  // Os valores atuais
  focoTime: number
  pausaTime: number
  
  // As funções para atualizar os valores (no App.tsx)
  setFocoTime: (timeInSeconds: number) => void
  setPausaTime: (timeInSeconds: number) => void
  
  // A função para voltar à tela inicial
  onClose: () => void
}

// Nota: O tempo é passado em segundos, mas exibimos em minutos
function Settings({
  focoTime,
  pausaTime,
  setFocoTime,
  setPausaTime,
  onClose,
}: SettingsProps) {

  // Funções de "wrapper" para lidar com a conversão Minutos <-> Segundos
  const handleFocoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value)
    if (!isNaN(minutes) && minutes > 0) {
      setFocoTime(minutes * 60)
    }
  }

  const handlePausaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value)
    if (!isNaN(minutes) && minutes > 0) {
      setPausaTime(minutes * 60)
    }
  }

  return (
    // Card de Glassmorphism para as Configurações
    <div
      className="flex flex-col w-[500px]
                 rounded-2xl border border-white/20 bg-white/10 
                 p-8 text-white shadow-xl backdrop-blur-lg"
    >
      <h2 className="mb-6 text-3xl font-bold">Configurações</h2>

      {/* Campo de Tempo de Foco */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-white/80">
          Tempo de Foco (minutos)
        </label>
        <input
          type="number"
          value={focoTime / 60} // Converte segundos para minutos
          onChange={handleFocoChange}
          min="1"
          className="w-full rounded-lg border-none bg-white/20 p-3 
                     text-white placeholder-white/50 
                     focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      {/* Campo de Tempo de Pausa */}
      <div className="mb-8">
        <label className="mb-1 block text-sm font-medium text-white/80">
          Tempo de Pausa (minutos)
        </label>
        <input
          type="number"
          value={pausaTime / 60} // Converte segundos para minutos
          onChange={handlePausaChange}
          min="1"
          className="w-full rounded-lg border-none bg-white/20 p-3 
                     text-white placeholder-white/50 
                     focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      {/* Botão para fechar */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold 
                     shadow-lg transition hover:bg-blue-700"
        >
          Salvar e Voltar
        </button>
      </div>
    </div>
  )
}

export default Settings