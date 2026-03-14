import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Chat() {
  const { agentId } = useParams()
  const [agent, setAgent] = useState(null)
  const [documents, setDocuments] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadAgent() {
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()
    setAgent(agentData)

    const { data: docsData } = await supabase
      .from('documents')
      .select('*')
      .eq('agent_id', agentId)
    setDocuments(docsData || [])

    if (agentData) {
      setMessages([{
        role: 'assistant',
        content: `Ciao! Sono ${agentData.name}. Come posso aiutarti oggi?`
      }])
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      // Prendi solo i messaggi reali (escludi il benvenuto)
      const chatHistory = updatedMessages.filter(m =>
        !(m.role === 'assistant' && m.content.startsWith('Ciao! Sono'))
      )

      // Aggiungi i documenti al primo messaggio utente
      const apiMessages = chatHistory.map((msg, i) => {
        if (i === 0 && msg.role === 'user' && documents.length > 0) {
          const content = []
          documents.forEach(doc => {
            if (doc.file_type?.includes('image')) {
              content.push({
                type: 'image',
                source: { type: 'file', file_id: doc.anthropic_file_id }
              })
            } else {
              content.push({
                type: 'document',
                source: { type: 'file', file_id: doc.anthropic_file_id }
              })
            }
          })
          content.push({ type: 'text', text: msg.content })
          return { role: 'user', content }
        }
        return msg
      })

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'files-api-2025-04-14',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: agent.system_prompt,
          messages: apiMessages
        })
      })

      const data = await response.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Errore nella risposta. Riprova.'
      }])
    }
    setLoading(false)
  }

  if (!agent) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Caricamento agente...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-green-600">● Online</p>
          {documents.length > 0 && (
            <p className="text-sm text-gray-400">
              📄 {documents.length} documento{documents.length > 1 ? 'i' : ''} caricato{documents.length > 1 ? 'i' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl text-sm text-gray-400">
              Sto scrivendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
        <input
          type="text"
          placeholder="Scrivi un messaggio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          Invia
        </button>
      </div>

    </div>
  )
}

export default Chat