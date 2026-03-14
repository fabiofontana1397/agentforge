import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          AgentForge
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Crea agenti AI personalizzati per il tuo studio professionale
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
        >
          Inizia gratis →
        </button>
      </div>
    </div>
  )
}

export default Home