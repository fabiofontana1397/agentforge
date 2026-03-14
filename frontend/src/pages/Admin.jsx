import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'

const NUTRICOACH_PROMPT = `Sei NutriCoach AI, l'assistente nutrizionale digitale dello studio.

Sei stato addestrato sui piani nutrizionali, le ricette, le intolleranze e i dati personali dei pazienti dello studio. Il tuo ruolo è supportare i pazienti H24 come se fossi il loro nutrizionista personale.

COMPORTAMENTO:
- Rispondi sempre in italiano, con tono professionale ma empatico
- Basa ogni risposta ESCLUSIVAMENTE sui documenti caricati per quel paziente
- Se non trovi informazioni nei documenti, dì chiaramente "Non ho questa informazione nel tuo piano — ti consiglio di contattare lo studio"
- Non inventare mai consigli nutrizionali non presenti nei documenti
- Non sostituire mai una visita medica o nutrizionale professionale

COSA PUOI FARE:
- Rispondere a domande sul piano nutrizionale del paziente
- Suggerire ricette presenti nei documenti caricati
- Ricordare le intolleranze e preferenze alimentari del paziente
- Dare consigli su spuntini, pasti e porzioni secondo il piano
- Motivare il paziente a seguire il percorso nutrizionale
- Gestire gli sgarri con empatia senza sensi di colpa
- Rispondere alle FAQ dello studio (orari, contatti, come prenotare)

COSA NON DEVI FARE:
- Non dare consigli medici o diagnosticare condizioni
- Non modificare il piano nutrizionale senza autorizzazione del nutrizionista
- Non condividere dati di un paziente con un altro

Quando un paziente ti scrive, inizia chiedendo il suo nome. Una volta che ti dà il nome, cerca i suoi documenti e rispondi basandoti esclusivamente su quelli. Se non trovi documenti per quel nome, dì "Non ho ancora il tuo piano nutrizionale. Contatta lo studio per fartelo caricare."`

export default function Admin() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [activeTab, setActiveTab] = useState('pazienti')

  // Form nuovo paziente
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientNotes, setNewPatientNotes] = useState('')
  const [addingPatient, setAddingPatient] = useState(false)
  const [savingPatient, setSavingPatient] = useState(false)

  // Paziente selezionato per upload
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [patients, setPatients] = useState([])

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: agentsData } = await supabase
      .from('agents')
      .select('*, documents(*)')
      .eq('professional_id', user.id)

    if (agentsData && agentsData.length > 0) {
      setAgents(agentsData)
      setSelectedAgent(agentsData[0])
      loadPatients(agentsData[0].id)
    } else {
      // Crea automaticamente il NutriCoach se non esiste
      const { data: newAgent } = await supabase.from('agents').insert({
        name: 'NutriCoach AI',
        system_prompt: NUTRICOACH_PROMPT,
        professional_id: user.id,
        is_active: true
      }).select().single()
      if (newAgent) {
        setAgents([{ ...newAgent, documents: [] }])
        setSelectedAgent({ ...newAgent, documents: [] })
      }
    }
    setLoading(false)
  }

  async function loadPatients(agentId) {
    const { data } = await supabase
      .from('patients')
      .select('*, documents(*)')
      .eq('agent_id', agentId)
      .order('name')
    setPatients(data || [])
  }

  async function addPatient() {
    if (!newPatientName.trim() || !selectedAgent) return
    setSavingPatient(true)
    const { data, error } = await supabase.from('patients').insert({
      agent_id: selectedAgent.id,
      name: newPatientName.trim(),
      notes: newPatientNotes.trim()
    }).select().single()
    if (!error) {
      setPatients(prev => [...prev, { ...data, documents: [] }])
      setNewPatientName('')
      setNewPatientNotes('')
      setAddingPatient(false)
    }
    setSavingPatient(false)
  }

  async function deletePatient(patientId) {
    await supabase.from('patients').delete().eq('id', patientId)
    setPatients(prev => prev.filter(p => p.id !== patientId))
    if (selectedPatient?.id === patientId) setSelectedPatient(null)
  }

  async function uploadDocument(file, patientId) {
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('https://wdejuknnshskmzlbcprz.supabase.co/functions/v1/upload-file', {
        method: 'POST', body: formData
      })
      const { file_id, filename } = await res.json()
      await supabase.from('documents').insert({
        agent_id: selectedAgent.id,
        patient_id: patientId,
        filename,
        file_type: file.type,
        anthropic_file_id: file_id
      })
      await loadPatients(selectedAgent.id)
    } catch (e) { console.error(e) }
    setUploadingFile(false)
  }

  async function deleteDocument(docId) {
    await supabase.from('documents').delete().eq('id', docId)
    await loadPatients(selectedAgent.id)
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Caricamento...</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <style>{`
        .admin-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) {
          .admin-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100 }}>

        {/* Header agente */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,163,255,0.08))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🥗</div>
            <div>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>NutriCoach AI</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 6px #00D4AA' }} />
                <span style={{ fontSize: 12, color: '#00D4AA' }}>Attivo · {patients.length} pazienti</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(`/chat/${selectedAgent?.id}`)} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
            Testa la chat →
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
          {[
            { id: 'pazienti', label: '👥 Pazienti', },
            { id: 'documenti', label: '📄 Documenti', },
            { id: 'prompt', label: '⚙️ Istruzioni', },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: activeTab === tab.id ? 'rgba(0,212,170,0.15)' : 'transparent', color: activeTab === tab.id ? '#00D4AA' : 'rgba(255,255,255,0.4)', fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: PAZIENTI */}
        {activeTab === 'pazienti' && (
          <div className="admin-layout">
            {/* Lista pazienti */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Pazienti ({patients.length})</h3>
                <button onClick={() => setAddingPatient(true)} style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                  + Aggiungi
                </button>
              </div>

              {/* Form nuovo paziente */}
              {addingPatient && (
                <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 12, padding: '18px', marginBottom: 12 }}>
                  <input value={newPatientName} onChange={e => setNewPatientName(e.target.value)} placeholder="Nome paziente (es. Mario Rossi)" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: '"DM Sans", sans-serif', outline: 'none', marginBottom: 10 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <input value={newPatientNotes} onChange={e => setNewPatientNotes(e.target.value)} placeholder="Note (es. celiachia, diabete tipo 2...)" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', color: '#fff', fontSize: 14, fontFamily: '"DM Sans", sans-serif', outline: 'none', marginBottom: 12 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={addPatient} disabled={savingPatient || !newPatientName.trim()} style={{ flex: 1, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '10px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', opacity: savingPatient || !newPatientName.trim() ? 0.5 : 1 }}>
                      {savingPatient ? 'Salvataggio...' : 'Salva paziente'}
                    </button>
                    <button onClick={() => { setAddingPatient(false); setNewPatientName(''); setNewPatientNotes('') }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '10px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                      Annulla
                    </button>
                  </div>
                </div>
              )}

              {patients.length === 0 ? (
                <div style={{ border: '2px dashed rgba(255,255,255,0.07)', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 6 }}>Nessun paziente ancora</p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Aggiungi i tuoi pazienti e carica i loro documenti</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {patients.map(patient => (
                    <div key={patient.id} onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)} style={{ background: selectedPatient?.id === patient.id ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.03)', border: selectedPatient?.id === patient.id ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,163,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👤</div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{patient.documents?.length || 0} documenti{patient.notes ? ` · ${patient.notes}` : ''}</p>
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); deletePatient(patient.id) }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.4)', cursor: 'pointer', fontSize: 15, flexShrink: 0, transition: 'color 0.2s' }}
                          onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                          onMouseLeave={e => e.target.style.color = 'rgba(255,100,100,0.4)'}
                        >🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documenti paziente selezionato */}
            <div>
              {selectedPatient ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Documenti di {selectedPatient.name}</h3>
                    <label style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap' }}>
                      {uploadingFile ? '⏳ Caricamento...' : '+ Carica documento'}
                      <input type="file" accept=".pdf,.txt,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadDocument(e.target.files[0], selectedPatient.id) }} />
                    </label>
                  </div>

                  {/* Tipi di documenti suggeriti */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Documenti consigliati</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['Piano nutrizionale', 'Ricettario', 'Anamnesi', 'Intolleranze', 'Obiettivi', 'Lista spesa'].map(tag => (
                        <span key={tag} style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'rgba(0,212,170,0.7)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  {selectedPatient.documents?.length === 0 ? (
                    <div style={{ border: '2px dashed rgba(255,255,255,0.07)', borderRadius: 10, padding: '32px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 4 }}>Nessun documento per {selectedPatient.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Carica il piano nutrizionale, ricette e anamnesi</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedPatient.documents.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px' }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>📄</span>
                          <p style={{ flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</p>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{doc.file_type?.includes('pdf') ? 'PDF' : 'IMG'}</span>
                          <button onClick={() => deleteDocument(doc.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.4)', cursor: 'pointer', fontSize: 15, flexShrink: 0, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,100,100,0.4)'}
                          >🗑️</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ border: '2px dashed rgba(255,255,255,0.06)', borderRadius: 12, padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>👈</div>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>Seleziona un paziente per gestire i suoi documenti</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: DOCUMENTI GENERALI */}
        {activeTab === 'documenti' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>Documenti dello studio</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                Carica qui i documenti generali dello studio: orari, prezzi, FAQ, informazioni sui servizi. L'agente li userà per rispondere alle domande generali di tutti i pazienti.
              </p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                {uploadingFile ? '⏳ Caricamento...' : '📂 Carica documento studio'}
                <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadDocument(e.target.files[0], null) }} />
              </label>
            </div>

            {/* Lista documenti generali */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedAgent?.documents?.filter(d => !d.patient_id).map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 16 }}>📄</span>
                  <p style={{ flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{doc.filename}</p>
                  <button onClick={() => deleteDocument(doc.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,100,100,0.4)', cursor: 'pointer', fontSize: 15, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,100,100,0.4)'}
                  >🗑️</button>
                </div>
              ))}
              {selectedAgent?.documents?.filter(d => !d.patient_id).length === 0 && (
                <div style={{ border: '2px dashed rgba(255,255,255,0.06)', borderRadius: 10, padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Nessun documento dello studio caricato</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROMPT */}
        {activeTab === 'prompt' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>Istruzioni dell'agente</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                Queste sono le istruzioni base del NutriCoach AI. Sono preimpostate da noi per garantire il massimo professionalismo. Puoi aggiungere istruzioni specifiche per il tuo studio in fondo.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px', maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                <pre style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{NUTRICOACH_PROMPT}</pre>
              </div>
              <div style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Le istruzioni base sono protette. Contatta il supporto per personalizzazioni avanzate.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}