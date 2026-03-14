import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  const steps = [
    { n: '01', icon: '🤖', title: 'Crea il tuo agente', desc: 'Dai un nome al tuo assistente AI e scrivi le istruzioni su come deve comportarsi con i pazienti.', action: 'Inizia ora', path: '/dashboard/crea' },
    { n: '02', icon: '📄', title: 'Carica i documenti', desc: 'Carica piani nutrizionali, protocolli e FAQ. Il tuo agente li leggerà e risponderà basandosi su di essi.', action: 'Vai ai documenti', path: '/dashboard/documenti' },
    { n: '03', icon: '💬', title: 'Connetti WhatsApp', desc: 'Collega il tuo numero WhatsApp Business. I pazienti potranno chattare direttamente con il tuo agente.', action: 'Configura WhatsApp', path: '/dashboard/whatsapp' },
  ]

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', fontFamily: '"DM Sans", sans-serif', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 0.7 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,163,255,0.06) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite 1s', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 760, width: '100%', position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>
            <span style={{ fontSize: 14 }}>🎉</span>
            <span style={{ fontSize: 13, color: '#00D4AA', fontWeight: 600 }}>Account creato con successo!</span>
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
            Benvenuto in<br /><span style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NutriAgentAI</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
            Il tuo studio è a tre passi dall'avere un assistente AI disponibile 24/7 su WhatsApp.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 28px', transition: 'border-color 0.3s, background 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.25)'; e.currentTarget.style.background = 'rgba(0,212,170,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              {/* Number */}
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Playfair Display", serif', fontSize: 18, fontWeight: 700, color: '#00D4AA', flexShrink: 0 }}>{s.n}</div>
              {/* Icon */}
              <div style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 4, fontFamily: '"Playfair Display", serif' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
              {/* CTA */}
              <button onClick={() => navigate(s.path)} style={{ background: i === 0 ? 'linear-gradient(135deg, #00D4AA, #00A3FF)' : 'rgba(255,255,255,0.07)', color: i === 0 ? '#000' : 'rgba(255,255,255,0.6)', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.target.style.opacity = '0.8'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >{s.action} →</button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 14, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', textDecoration: 'underline' }}>
            Vai alla dashboard →
          </button>
        </div>

      </div>
    </div>
  )
}