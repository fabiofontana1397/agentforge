import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DashboardLayout from '../components/DashboardLayout'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('agents').select('*').eq('professional_id', user?.id)
      setAgents(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { icon: '🤖', label: 'Agenti attivi', value: agents.length, sub: 'configurati', color: '#00D4AA' },
    { icon: '💬', label: 'Conversazioni', value: '—', sub: 'questo mese', color: '#00A3FF' },
    { icon: '👥', label: 'Pazienti', value: '—', sub: 'hanno chattato', color: '#A78BFA' },
    { icon: '⏱️', label: 'Ore risparmiate', value: '—', sub: 'stimate', color: '#F59E0B' },
  ]

  const quickActions = [
    { icon: '🤖', title: 'Crea nuovo agente', desc: 'Configura un nuovo assistente AI', path: '/dashboard/crea', primary: true },
    { icon: '📄', title: 'Carica documenti', desc: 'Aggiungi PDF e protocolli', path: '/dashboard/documenti', primary: false },
    { icon: '💬', title: 'Configura WhatsApp', desc: 'Connetti il tuo numero', path: '/dashboard/whatsapp', primary: false },
    { icon: '📊', title: 'Vedi Analytics', desc: 'Statistiche conversazioni', path: '/dashboard/analytics', primary: false },
  ]

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'Benvenuto'

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100 }}>

        {/* Greeting */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 6 }}>
            Ciao, {name}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Ecco una panoramica del tuo studio AI.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px', transition: 'border-color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${s.color}44`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: s.color, marginBottom: 2 }}>{loading ? '...' : s.value}</div>
              <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>Azioni rapide</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{ background: a.primary ? 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,163,255,0.15))' : 'rgba(255,255,255,0.03)', border: a.primary ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', color: '#fff', fontFamily: '"DM Sans", sans-serif' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = a.primary ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = a.primary ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)' }}
              >
                <div style={{ fontSize: 24, marginBottom: 10 }}>{a.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* I miei agenti */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>I miei agenti</h2>
            <button onClick={() => navigate('/dashboard/agenti')} style={{ background: 'transparent', border: 'none', color: '#00D4AA', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>Vedi tutti →</button>
          </div>

          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Caricamento...</div>
          ) : agents.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 16, padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginBottom: 20 }}>Non hai ancora creato nessun agente</p>
              <button onClick={() => navigate('/dashboard/crea')} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                Crea il tuo primo agente →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {agents.map(agent => (
                <div key={agent.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,163,255,0.2))', border: '1px solid rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{agent.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: agent.is_active ? '#00D4AA' : '#666' }} />
                        <span style={{ fontSize: 12, color: agent.is_active ? '#00D4AA' : 'rgba(255,255,255,0.3)' }}>{agent.is_active ? 'Attivo' : 'Inattivo'}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{agent.system_prompt}</p>
                  <button onClick={() => navigate(`/chat/${agent.id}`)} style={{ width: '100%', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,170,0.1)' }}
                  >Apri chat →</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}