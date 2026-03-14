import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Chat() {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [allDocuments, setAllDocuments] = useState([])
  const [patients, setPatients] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [patientName, setPatientName] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadAgent() {
    const { data: agentData } = await supabase
      .from('agents').select('*').eq('id', agentId).single()
    setAgent(agentData)

    const { data: docsData } = await supabase
      .from('documents').select('*').eq('agent_id', agentId)
    setAllDocuments(docsData || [])

    const { data: patientsData } = await supabase
      .from('patients').select('*, documents(*)').eq('agent_id', agentId)
    setPatients(patientsData || [])

    if (agentData) {
      setMessages([{
        role: 'assistant',
        content: `Ciao! Sono ${agentData.name}, il tuo assistente nutrizionale personale. 🌿\n\nPer fornirti le informazioni più accurate sul tuo piano nutrizionale, potresti dirmi il tuo nome?`
      }])
    }
  }

  function findPatientDocuments(name) {
    const lowerName = name.toLowerCase().trim()
    const patient = patients.find(p =>
      p.name.toLowerCase().includes(lowerName) ||
      lowerName.includes(p.name.toLowerCase())
    )
    if (patient) {
      setPatientName(patient.name)
      return patient.documents || []
    }
    return []
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const chatHistory = updatedMessages.filter(m =>
        !(m.role === 'assistant' && m.content.includes('il tuo nome?'))
      )

      // Cerca il paziente se non è ancora stato identificato
      let docsToUse = []
      if (!patientName) {
        docsToUse = findPatientDocuments(input)
      } else {
        const patient = patients.find(p => p.name.toLowerCase() === patientName.toLowerCase())
        docsToUse = patient?.documents || []
      }

      // Documenti generali dello studio (senza patient_id)
      const generalDocs = allDocuments.filter(d => !d.patient_id)
      const allDocsToUse = [...generalDocs, ...docsToUse]

      const apiMessages = chatHistory.map((msg, i) => {
        if (i === 0 && msg.role === 'user' && allDocsToUse.length > 0) {
          const content = []
          allDocsToUse.forEach(doc => {
            if (doc.file_type?.includes('image')) {
              content.push({ type: 'image', source: { type: 'file', file_id: doc.anthropic_file_id } })
            } else {
              content.push({ type: 'document', source: { type: 'file', file_id: doc.anthropic_file_id } })
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
console.log('Risposta Anthropic:', JSON.stringify(data))
if (data.content && data.content[0] && data.content[0].text) {
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: data.content[0].text
  }])
} else {
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: 'Errore nella risposta. Riprova.'
  }])
}
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Errore nella risposta. Riprova.'
      }])
    }
    setLoading(false)
  }

  if (!agent) return (
    <div style={{ minHeight: '100vh', background: '#080A0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: '"DM Sans", sans-serif' }}>Caricamento...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080A0E', display: 'flex', flexDirection: 'column', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(8,10,14,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard/agenti')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '6px 12px', fontSize: 13, fontFamily: '"DM Sans", sans-serif' }}>← Indietro</button>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🥗</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: '"Playfair Display", serif' }}>{agent.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 6px #00D4AA' }} />
              <span style={{ fontSize: 11, color: '#00D4AA' }}>{patientName ? `Paziente: ${patientName}` : 'In attesa del nome paziente'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌿</div>
          <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 14, fontWeight: 700, color: '#fff' }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>
        </div>
      </div>

      {/* Messaggi */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>🥗</div>
            )}
            <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #00D4AA, #00A3FF)' : 'rgba(255,255,255,0.07)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)', color: msg.role === 'user' ? '#000' : '#fff', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🥗</div>
            <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', animation: `bounce 1s ease infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <style>{`@keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }`}</style>

      {/* Input */}
      <div style={{ background: 'rgba(8,10,14,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
        <input
          type="text"
          placeholder={patientName ? `Scrivi a ${patientName}...` : 'Scrivi il tuo nome per iniziare...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 15, fontFamily: '"DM Sans", sans-serif', outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <button onClick={sendMessage} disabled={loading} style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          ➤
        </button>
      </div>
    </div>
  )
}