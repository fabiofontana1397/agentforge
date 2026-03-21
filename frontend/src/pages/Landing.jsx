import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Fonts ── */
const fontLink = document.createElement('link')
fontLink.rel = 'stylesheet'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap'
document.head.appendChild(fontLink)

/* ── Animated Sphere ── */
function NaomiSphere({ size = 340 }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.34

    function drawFrame(t) {
      ctx.clearRect(0, 0, size, size)

      /* outer glow ring */
      const glowR = r + 28 + Math.sin(t * 0.8) * 8
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, glowR + 20)
      glowGrad.addColorStop(0, 'rgba(124,58,237,0)')
      glowGrad.addColorStop(0.5, 'rgba(124,58,237,0.12)')
      glowGrad.addColorStop(1, 'rgba(124,58,237,0)')
      ctx.beginPath()
      ctx.arc(cx, cy, glowR + 20, 0, Math.PI * 2)
      ctx.fillStyle = glowGrad
      ctx.fill()

      /* blob shape via bezier */
      const pts = 6
      ctx.beginPath()
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * Math.PI * 2
        const wobble = r + Math.sin(t * 1.1 + i * 1.3) * r * 0.07 + Math.cos(t * 0.7 + i * 0.9) * r * 0.05
        const x = cx + Math.cos(angle) * wobble
        const y = cy + Math.sin(angle) * wobble
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      /* gradient fill cycling colors */
      const hue1 = (t * 15) % 360
      const hue2 = (hue1 + 140) % 360
      const hue3 = (hue1 + 220) % 360
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r * 1.1)
      grad.addColorStop(0, `hsla(${hue1},80%,75%,1)`)
      grad.addColorStop(0.45, `hsla(${hue2},90%,55%,1)`)
      grad.addColorStop(1, `hsla(${hue3},85%,40%,1)`)
      ctx.fillStyle = grad
      ctx.fill()

      /* inner highlight */
      const hlGrad = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.38, 0, cx, cy, r)
      hlGrad.addColorStop(0, 'rgba(255,255,255,0.45)')
      hlGrad.addColorStop(0.4, 'rgba(255,255,255,0.08)')
      hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hlGrad
      ctx.fill()

      /* floating particles */
      for (let i = 0; i < 5; i++) {
        const pa = t * 0.4 + i * 1.26
        const pr = r * (0.55 + i * 0.07)
        const px = cx + Math.cos(pa) * pr
        const py = cy + Math.sin(pa) * pr
        const ps = 2.5 + Math.sin(t + i) * 1.2
        ctx.beginPath()
        ctx.arc(px, py, ps, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fill()
      }
    }

    function loop() {
      timeRef.current += 0.016
      drawFrame(timeRef.current)
      animRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animRef.current)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block', filter: 'drop-shadow(0 0 60px rgba(124,58,237,0.5))' }}
    />
  )
}

/* ── Navbar ── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 2rem',
      background: scrolled ? 'rgba(8,10,14,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.4s ease', height: 72
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', maxWidth: 1200, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F472B6)', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>naomi</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {['Come funziona', 'Prezzi', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >{item}</a>
          ))}
          <button onClick={() => navigate('/payment')}
            style={{ background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', letterSpacing: '0.3px' }}>
            Inizia gratis →
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ── Chat Demo ── */
const CHAT_MESSAGES = [
  { role: 'user', text: 'Ciao, vorrei prenotare un taglio per sabato' },
  { role: 'naomi', text: 'Ciao! Sono Naomi 👋 Sabato ho disponibile alle 10:00 o alle 15:30. Quale preferisci?' },
  { role: 'user', text: 'Alle 15:30 perfetto' },
  { role: 'naomi', text: 'Perfetto! Ho confermato il tuo appuntamento per sabato alle 15:30. Ti mando un promemoria venerdì 😊' },
]

function ChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    let i = 0
    function showNext() {
      if (i >= CHAT_MESSAGES.length) {
        setTimeout(() => { setVisibleCount(0); i = 0; setTimeout(showNext, 600) }, 2000)
        return
      }
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setVisibleCount(prev => prev + 1)
        i++
        setTimeout(showNext, 1200)
      }, 900)
    }
    const t = setTimeout(showNext, 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', maxWidth: 420, width: '100%', fontFamily: 'DM Sans, sans-serif' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F472B6)', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }} />
        <div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Naomi</div>
          <div style={{ color: '#00D4AA', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', display: 'inline-block' }} />
            Online
          </div>
        </div>
      </div>

      {/* messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180 }}>
        {CHAT_MESSAGES.slice(0, visibleCount).map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.3s ease' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user' ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${m.role === 'user' ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: '#fff', fontSize: 13, lineHeight: 1.5
            }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px 14px 14px 4px', width: 'fit-content' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', animation: `bounce 1s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Feature Card ── */
function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16, padding: '28px 24px', transition: 'all 0.3s ease', cursor: 'default'
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 16, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.65 }}>{desc}</div>
    </div>
  )
}

/* ── FAQ Item ── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${open ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.3s' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', color: '#fff', fontSize: 15, fontWeight: 600 }}>{q}</span>
        <span style={{ color: '#7C3AED', fontSize: 22, transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 16 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <p style={{ padding: '0 28px 22px', color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>{a}</p>
      </div>
    </div>
  )
}

/* ── Main Landing ── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0) } 40% { transform:translateY(-6px) } }
        @keyframes pulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-track { background: #080A0E } ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px }
      `}</style>

      <NavBar />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 2rem 60px', position: 'relative' }}>
        {/* background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, padding: '6px 14px', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>AI Receptionist sempre attiva</span>
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(42px, 5vw, 68px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24, color: '#fff' }}>
              Incontra<br />
              <span style={{ background: 'linear-gradient(135deg,#7C3AED,#F472B6,#00D4AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Naomi</span>
            </h1>

            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
              La tua segretaria AI che risponde ai clienti su WhatsApp, gestisce prenotazioni e risponde alle domande — <strong style={{ color: 'rgba(255,255,255,0.8)' }}>24 ore su 24, 7 giorni su 7</strong>.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/payment')}
                style={{ background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 32px rgba(124,58,237,0.4)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Prova gratis 14 giorni →
              </button>
              <a href="#come-funziona"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, fontFamily: 'DM Sans, sans-serif', padding: '16px 0', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
              >
                Scopri come funziona ↓
              </a>
            </div>

            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[['500+', 'Clienti gestiti/mese'], ['< 30min', 'Setup iniziale'], ['24/7', 'Sempre attiva']].map(([n, l]) => (
                <div key={n}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff' }}>{n}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* sphere + chat */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <NaomiSphere size={280} />
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* ── COME FUNZIONA ── */}
      <section id="come-funziona" style={{ padding: '100px 2rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7C3AED', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>Come funziona</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
              Operativa in 30 minuti
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              { n: '01', title: 'Raccontaci la tua attività', desc: 'Compili un form con orari, servizi, prezzi e FAQ. Naomi impara tutto in pochi minuti.' },
              { n: '02', title: 'Naomi si connette a WhatsApp', desc: 'Colleghi il tuo numero WhatsApp Business. Nessuna app da installare, nessuna configurazione tecnica.' },
              { n: '03', title: 'I tuoi clienti iniziano a scrivere', desc: 'Naomi risponde istantaneamente a ogni messaggio. Tu vedi tutto dalla dashboard.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '40px 32px', background: i === 1 ? 'rgba(124,58,237,0.06)' : 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : 0, position: 'relative' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: i === 1 ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)', marginBottom: 16, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{s.title}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 2rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7C3AED', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>Funzionalità</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
              Tutto quello di cui hai bisogno
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            <FeatureCard icon="💬" title="WhatsApp nativo" desc="I tuoi clienti scrivono dove già sono abituati. Nessuna app da scaricare, zero attrito." />
            <FeatureCard icon="🧠" title="Addestrata sulla tua attività" desc="Naomi conosce i tuoi servizi, prezzi, orari e policy meglio di un dipendente nuovo." />
            <FeatureCard icon="📅" title="Gestione prenotazioni" desc="Prenota, sposta e cancella appuntamenti in modo autonomo, sincronizzato con il tuo calendario." />
            <FeatureCard icon="📊" title="Dashboard in tempo reale" desc="Vedi tutte le conversazioni, intervieni quando serve, analizza i messaggi più frequenti." />
            <FeatureCard icon="🌍" title="Multilingua" desc="Naomi risponde in italiano, inglese e molte altre lingue — perfetta per attività turistiche." />
            <FeatureCard icon="⚡" title="Setup in 30 minuti" desc="Zero codice, zero tecnici. Compila il form e sei operativo prima di pranzo." />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="prezzi" style={{ padding: '100px 2rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7C3AED', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>Prezzi</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>
              Semplice e trasparente
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 12 }}>14 giorni di prova gratuita. Nessuna carta di credito richiesta.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Starter */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Starter</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: '#fff' }}>€49</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>/mese</span>
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32 }}>Perfetto per liberi professionisti</p>
              {['1 numero WhatsApp', '500 messaggi/mese', 'Dashboard base', 'Support via email'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ color: '#7C3AED', fontSize: 14 }}>✓</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/payment')}
                style={{ width: '100%', marginTop: 32, padding: '14px', background: 'transparent', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 10, color: '#7C3AED', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
              >
                Inizia prova gratuita
              </button>
            </div>

            {/* Pro */}
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(135deg,#7C3AED,#F472B6)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, fontFamily: 'Syne, sans-serif' }}>PIÙ POPOLARE</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: '#fff' }}>€99</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>/mese</span>
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32 }}>Ideale per piccole imprese</p>
              {['3 numeri WhatsApp', 'Messaggi illimitati', 'Dashboard avanzata', 'Prenotazioni automatiche', 'Support prioritario', 'Personalizzazione avanzata'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ color: '#7C3AED', fontSize: 14 }}>✓</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/payment')}
                style={{ width: '100%', marginTop: 32, padding: '14px', background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 24px rgba(124,58,237,0.35)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Inizia prova gratuita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '80px 2rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7C3AED', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>FAQ</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Domande frequenti</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FAQItem q="Naomi funziona con il mio WhatsApp attuale?" a="Sì. Usi il tuo numero WhatsApp Business esistente. Naomi risponde al posto tuo e puoi sempre intervenire manualmente dalla dashboard." />
            <FAQItem q="Devo avere competenze tecniche?" a="Zero. Il setup è un form: inserisci le info della tua attività e sei operativo. Nessun codice, nessuna integrazione complicata." />
            <FAQItem q="Cosa succede dopo i 14 giorni di prova?" a="Scegli il piano più adatto e continui senza interruzioni. Nessun addebito automatico senza conferma." />
            <FAQItem q="Posso personalizzare come risponde Naomi?" a="Sì. Puoi caricare documenti, FAQ, listini prezzi e istruzioni specifiche. Naomi si adatta al tuo stile di comunicazione." />
            <FAQItem q="Quanti clienti può gestire contemporaneamente?" a="Illimitati. Naomi risponde a tutte le conversazioni in parallelo, senza tempi di attesa." />
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section style={{ padding: '100px 2rem', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <NaomiSphere size={120} />
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginTop: 32, marginBottom: 16 }}>
            Inizia oggi.<br />
            <span style={{ background: 'linear-gradient(135deg,#7C3AED,#F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Gratis.</span>
          </h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 36 }}>14 giorni di prova. Nessuna carta. Attivazione in 30 minuti.</p>
          <button onClick={() => navigate('/payment')}
            style={{ background: 'linear-gradient(135deg,#7C3AED,#00D4AA)', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 48px rgba(124,58,237,0.4)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Prova Naomi gratis →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F472B6)' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>naomi</span>
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © 2025 Naomi AI · Privacy · Termini
        </div>
      </footer>
    </div>
  )
}
