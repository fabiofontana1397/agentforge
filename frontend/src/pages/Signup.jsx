import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      navigate('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) { setError(error.message); setLoading(false); return }
      navigate('/welcome')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', display: 'flex', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 0.7 } }
        input { outline: none; }
        input:focus { border-color: rgba(0,212,170,0.6) !important; box-shadow: 0 0 0 3px rgba(0,212,170,0.1) !important; }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,163,255,0.08) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite 1s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, width: '100%' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>
          </div>

          {/* Titolo */}
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 8, lineHeight: 1.2 }}>
            {isLogin ? 'Bentornato.' : 'Inizia oggi.'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 40 }}>
            {isLogin ? 'Accedi al tuo account NutriAgentAI' : 'Crea il tuo account e configura il tuo primo agente AI'}
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 8 }}>NOME COMPLETO</label>
                <input
                  type="text"
                  placeholder="Es. Marco Bianchi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 15, fontFamily: '"DM Sans", sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 8 }}>EMAIL</label>
              <input
                type="email"
                placeholder="marco@tuostudio.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 15, fontFamily: '"DM Sans", sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 8 }}>PASSWORD</label>
              <input
                type="password"
                placeholder="Almeno 8 caratteri"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 15, fontFamily: '"DM Sans", sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 8, padding: '12px 16px', color: '#ff6b6b', fontSize: 14 }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '16px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', marginTop: 8, boxShadow: '0 0 30px rgba(0,212,170,0.25)', transition: 'transform 0.2s, opacity 0.2s', opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) e.target.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              {loading ? 'Caricamento...' : isLogin ? 'Accedi →' : 'Crea account →'}
            </button>
          </div>

          {/* Switch */}
          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}{' '}
            <span onClick={() => { setIsLogin(!isLogin); setError('') }} style={{ color: '#00D4AA', cursor: 'pointer', fontWeight: 600 }}>
              {isLogin ? 'Registrati' : 'Accedi'}
            </span>
          </p>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            Registrandoti accetti i Termini di servizio e la Privacy Policy
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, background: 'linear-gradient(160deg, rgba(0,212,170,0.06) 0%, rgba(0,163,255,0.06) 100%)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>

        <div style={{ maxWidth: 400, width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 100, padding: '6px 14px', marginBottom: 32, animation: 'float 3s ease-in-out infinite' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#00D4AA', fontWeight: 600 }}>Setup in 30 minuti</span>
          </div>

          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 32 }}>
            Il tuo studio lavora.<br /><span style={{ color: '#00D4AA' }}>Anche quando dormi.</span>
          </h2>

          {[
            { icon: '🤖', title: 'Agenti AI personalizzati', desc: 'Addestrati con i tuoi protocolli e documenti' },
            { icon: '💬', title: 'Chat su WhatsApp', desc: 'I pazienti scrivono dove sono già abituati' },
            { icon: '📄', title: 'RAG avanzato', desc: "Legge i tuoi PDF e risponde come se fossi tu" },
            { icon: '⏱️', title: 'Risparmia 10+ ore/settimana', desc: 'Niente più messaggi ripetitivi H24' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{item.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}