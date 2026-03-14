import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'

export default function Admin() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)

  useEffect(() => { loadAgents() }, [])

  async function loadAgents() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('agents').select('*, documents(*)').eq('professional_id', user.id)
    setAgents(data || [])
    setLoading(false)
  }

  async function createAgent() {
    if (!name.trim() || !prompt.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('agents').insert({
      name, system_prompt: prompt, professional_id: user.id, is_active: true
    }).select().single()
    if (!error) {
      setAgents(prev => [...prev, { ...data, documents: [] }])
      setSelectedAgent({ ...data, documents: [] })
      setCreating(false)
      setName('')
      setPrompt('')
    }
    setSaving(false)
  }

  async function uploadDocument(agentId, file) {
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('https://wdejuknnshskmzlbcprz.supabase.co/functions/v1/upload-file', {
        method: 'POST', body: formData
      })
      const { file_id, filename } = await res.json()
      await supabase.from('documents').insert({
        agent_id: agentId, filename, file_type: file.type, anthropic_file_id: file_id
      })
      await loadAgents()
    } catch (e) { console.error(e) }
    setUploadingFile(false)
  }

  async function deleteDocument(docId) {
    await supabase.from('documents').delete().eq('id', docId)
    await loadAgents()
  }

  const showPanel = creating || selectedAgent

  return (
    <DashboardLayout>
      <style>{`
        .agents-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .agents-list-only { display: block; }
        @media (max-width: 768px) {
          .agents-layout { grid-template-columns: 1fr !important; }
          
        }
      `}</style>

      <div style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 4 }}>I miei Agenti</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Crea e gestisci i tuoi assistenti AI</p>
          </div>
          <button onClick={() => { setCreating(true); setSelectedAgent(null) }} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', boxShadow: '0 0 20px rgba(0,212,170,0.2)', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            + Nuovo agente
          </button>
        </div>

        <div className={showPanel ? 'agents-layout' : ''}>

          {/* LISTA AGENTI */}
          <div>
            {loading ? (
              <p style={{ color: 'rgba(255,255,255,0.3)' }}>Caricamento...</p>
            ) : agents.length === 0 && !creating ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 24 }}>Nessun agente creato ancora</p>
                <button onClick={() => setCreating(true)} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                  Crea il tuo primo agente →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agents.map(agent => (
                  <div key={agent.id} onClick={() => { setSelectedAgent(agent); setCreating(false) }} style={{ background: selectedAgent?.id === agent.id ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.03)', border: selectedAgent?.id === agent.id ? '1px solid rgba(0,212,170,0.35)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,163,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{agent.documents?.length || 0} documenti</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: agent.is_active ? '#00D4AA' : '#666' }} />
                          <span style={{ fontSize: 11, color: agent.is_active ? '#00D4AA' : 'rgba(255,255,255,0.3)' }}>{agent.is_active ? 'Attivo' : 'Inattivo'}</span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); navigate(`/chat/${agent.id}`) }} style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap' }}>
                          Chat →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PANNELLO DESTRA */}
          {creating && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 16, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700 }}>Nuovo agente</h2>
                <button onClick={() => setCreating(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Nome agente</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Es. NutriCoach AI" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '13px 14px', color: '#fff', fontSize: 15, fontFamily: '"DM Sans", sans-serif', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Istruzioni</label>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Es. Sei un assistente nutrizionale esperto. Rispondi sempre in italiano, sii empatico e professionale. Usa le informazioni dei documenti caricati per dare risposte personalizzate..." rows={7} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '13px 14px', color: '#fff', fontSize: 14, fontFamily: '"DM Sans", sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>Scrivi come deve comportarsi il tuo agente con i pazienti</p>
                </div>
                <button onClick={createAgent} disabled={saving || !name.trim() || !prompt.trim()} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '15px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', opacity: saving || !name.trim() || !prompt.trim() ? 0.5 : 1, transition: 'opacity 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { if (!saving) e.target.style.transform = 'scale(1.02)' }}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  {saving ? 'Creazione in corso...' : 'Crea agente →'}
                </button>
              </div>
            </div>
          )}

          {/* DETTAGLIO AGENTE */}
          {selectedAgent && !creating && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 16, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
                <div>
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{selectedAgent.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 6px #00D4AA' }} />
                    <span style={{ fontSize: 12, color: '#00D4AA' }}>Attivo</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setSelectedAgent(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  <button onClick={() => navigate(`/chat/${selectedAgent.id}`)} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap' }}>
                    Apri chat →
                  </button>
                </div>
              </div>

              {/* System prompt */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Istruzioni</p>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px', maxHeight: 120, overflowY: 'auto' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6 }}>{selectedAgent.system_prompt}</p>
                </div>
              </div>

              {/* Documenti */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Documenti ({selectedAgent.documents?.length || 0})</p>
                  <label style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap' }}>
                    {uploadingFile ? '⏳ Caricamento...' : '+ Aggiungi'}
                    <input type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadDocument(selectedAgent.id, e.target.files[0]) }} />
                  </label>
                </div>

                {selectedAgent.documents?.length === 0 ? (
                  <div style={{ border: '2px dashed rgba(255,255,255,0.07)', borderRadius: 10, padding: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Nessun documento caricato</p>
                    <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12, marginTop: 4 }}>Carica PDF, protocolli o piani nutrizionali</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {selectedAgent.documents.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px' }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>📄</span>
                        <p style={{ flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</p>
                        <button onClick={() => deleteDocument(doc.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.4)', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0, transition: 'color 0.2s' }}
                          onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                          onMouseLeave={e => e.target.style.color = 'rgba(255,100,100,0.4)'}
                        >🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
