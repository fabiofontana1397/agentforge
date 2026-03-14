import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`
    }}>{children}</div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.3s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
    >
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>{q}</span>
        <span style={{ color: '#00D4AA', fontSize: 20, transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: 16 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <p style={{ padding: '0 28px 22px', color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.65 }}>{a}</p>
      </div>
    </div>
  )
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 1.5rem', background: scrolled ? 'rgba(8,10,14,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.4s ease', height: '72px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>
        </div>
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {['Demo', 'Agenti', 'Prezzi', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14, fontFamily: '"DM Sans", sans-serif', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
            >{item}</a>
          ))}
          <a href="/payment" style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: '"DM Sans", sans-serif' }}>Inizia gratis →</a>
        </div>
        <button className="nav-mobile-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5 }}>
          <div style={{ width: 24, height: 2, background: '#fff', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <div style={{ width: 24, height: 2, background: '#fff', opacity: menuOpen ? 0 : 1, transition: 'all 0.3s' }} />
          <div style={{ width: 24, height: 2, background: '#fff', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>
      {menuOpen && (
        <div style={{ position: 'absolute', top: 72, left: 0, right: 0, background: 'rgba(8,10,14,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Demo', 'Agenti', 'Prezzi', 'FAQ'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 16, fontFamily: '"DM Sans", sans-serif', fontWeight: 500, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{item}</a>
          ))}
          <a href="/payment" style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', padding: '14px', borderRadius: 8, fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', textAlign: 'center', marginTop: 8 }}>Inizia gratis →</a>
        </div>
      )}
    </nav>
  )
}

function DemoMockup() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [typing, setTyping] = useState(false)

  const files = [
    { name: 'piano_mario_rossi.pdf', icon: '📄', size: '245 KB' },
    { name: 'protocollo_intolleranze.pdf', icon: '📄', size: '128 KB' },
    { name: 'ricette_vegane.pdf', icon: '📄', size: '892 KB' },
  ]

  const conversation = [
    { role: 'user', text: 'Ciao! Ho la celiachia, cosa posso mangiare a colazione?' },
    { role: 'bot', text: 'In base al tuo piano: fiocchi di riso con latte vegetale, frutta fresca e caffè d\'orzo. Evita frumento, orzo e segale. 🌿' },
    { role: 'user', text: 'Perfetto! E per lo spuntino?' },
    { role: 'bot', text: '30g di noci o mandorle, oppure yogurt senza glutine con miele. Controlla sempre l\'etichetta! ✅' },
  ]

  useEffect(() => {
    let cancelled = false
    async function runDemo() {
      while (!cancelled) {
        setUploadedFiles([])
        setChatMessages([])
        setTyping(false)
        for (let i = 0; i < files.length; i++) {
          if (cancelled) return
          await new Promise(r => setTimeout(r, 800))
          setUploadedFiles(prev => [...prev, files[i]])
        }
        await new Promise(r => setTimeout(r, 600))
        for (let i = 0; i < conversation.length; i++) {
          if (cancelled) return
          const msg = conversation[i]
          if (msg.role === 'bot') {
            setTyping(true)
            await new Promise(r => setTimeout(r, 1500))
            if (cancelled) return
            setTyping(false)
            setChatMessages(prev => [...prev, msg])
          } else {
            setChatMessages(prev => [...prev, msg])
          }
          await new Promise(r => setTimeout(r, 1000))
        }
        await new Promise(r => setTimeout(r, 4000))
      }
    }
    runDemo()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="demo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
          <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: '"DM Sans", sans-serif' }}>Pannello Admin</span>
        </div>
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 11, color: '#00D4AA', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>📂 Documenti pazienti</p>
          <div style={{ border: '2px dashed rgba(0,212,170,0.3)', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 14, background: 'rgba(0,212,170,0.04)' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>📂 Trascina i file qui</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {uploadedFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{f.name}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{f.size}</p>
                </div>
                <span style={{ color: '#00D4AA', fontSize: 14 }}>✓</span>
              </div>
            ))}
            {uploadedFiles.length < files.length && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #00D4AA', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Caricamento...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ background: '#075E54', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4AA, #075E54)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌿</div>
          <div>
            <p style={{ fontSize: 14, color: '#fff', fontWeight: 700, fontFamily: '"DM Sans", sans-serif' }}>NutriCoach AI</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>● Online</p>
          </div>
        </div>
        <div style={{ padding: 16, minHeight: 220, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {chatMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>In attesa dei documenti...</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.role === 'user' ? '#005C4B' : 'rgba(255,255,255,0.1)', fontSize: 13, color: '#fff', lineHeight: 1.5, fontFamily: '"DM Sans", sans-serif' }}>
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '10px 16px', borderRadius: '12px 12px 12px 2px', background: 'rgba(255,255,255,0.1)', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', animation: `bounce 1s ease infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ background: '#1A2332', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: '8px 14px', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: '"DM Sans", sans-serif' }}>Scrivi un messaggio...</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#00D4AA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>➤</div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
      `}</style>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  const problems = [
    { icon: '📱', title: 'WhatsApp H24', desc: 'Messaggi a ogni ora con domande sempre uguali. "Cosa mangio stasera?" alle 22:47.' },
    { icon: '🔄', title: 'Ripeti sempre le stesse cose', desc: 'Spieghi la dieta mediterranea per la centesima volta. Il tuo tempo vale di più.' },
    { icon: '👻', title: 'Pazienti che spariscono', desc: "Tra una visita e l'altra, perdi il contatto. Senza supporto abbandonano." },
    { icon: '📋', title: 'Pre-screening manuale', desc: 'Ore a raccogliere anamnesi di base che un agente potrebbe fare automaticamente.' },
    { icon: '🏠', title: 'FAQ dello studio', desc: 'Orari, prezzi, come prenotare. Domande banali che occupano il tuo calendario.' },
    { icon: '😓', title: 'Pazienti che non seguono', desc: 'Senza supporto quotidiano, la motivazione crolla. Il paziente smette. Tu perdi il cliente.' },
  ]

  const agents = [
    { icon: '🥗', name: 'NutriCoach AI', tag: 'Benessere quotidiano', desc: 'Supporta i pazienti ogni giorno: consigli alimentari, gestione degli sgarri, motivazione. Disponibile 24/7.', features: ['Consigli nutrizionali personalizzati', 'Gestione sgarri senza sensi di colpa', 'Supporto motivazionale quotidiano', 'Risposte basate sui tuoi protocolli'] },
    { icon: '📋', name: 'Segreteria AI', tag: 'Operatività studio', desc: "Gestisce l'operatività dello studio: raccoglie anamnesi, risponde alle FAQ, smista le richieste.", features: ['Raccolta anamnesi automatica', 'FAQ studio (orari, prezzi, servizi)', 'Pre-screening nuovi pazienti', 'Smistamento appuntamenti'] },
    { icon: '💪', name: 'Wellness Coach AI', tag: 'Supporto psicologico', desc: 'Affianca i pazienti nel rapporto emotivo con il cibo: mindful eating, gestione dello stress alimentare.', features: ['Mindful eating e consapevolezza', 'Gestione stress e emotional eating', 'Tecniche di motivazione', 'Journaling alimentare guidato'] },
  ]

  const plans = [
    { name: 'Starter', setup: '€99', monthly: '€29', tag: null, features: ['1 agente AI', '500 conversazioni/mese', '10 documenti', 'Supporto email'], cta: 'Inizia con Starter' },
    { name: 'Pro', setup: '€199', monthly: '€59', tag: '⭐ Più scelto', features: ['2 agenti AI', 'Conversazioni illimitate', '50 documenti', 'Analytics avanzate', 'Supporto prioritario'], cta: 'Inizia con Pro' },
    { name: 'Studio', setup: '€399', monthly: '€99', tag: null, features: ['3 agenti AI', 'Tutto illimitato', 'Widget per il tuo sito', 'Onboarding 1:1', 'Supporto telefonico'], cta: 'Inizia con Studio' },
  ]

  const faqs = [
    { q: 'Devo saper programmare?', a: 'No. La configurazione è completamente visuale. Se sai usare WhatsApp, sai usare NutriAgentAI.' },
    { q: 'I miei documenti sono al sicuro?', a: "Sì. I tuoi file sono cifrati e accessibili solo al tuo account. Non vengono usati per addestrare l'AI." },
    { q: 'I pazienti capiscono che parlano con un AI?', a: 'Puoi scegliere: l\'agente può presentarsi come assistente AI oppure come "assistente dello studio". Decidi tu.' },
    { q: 'Posso disdire quando voglio?', a: 'Sì. Nessun vincolo, nessuna penale. Disdici in qualsiasi momento dal pannello.' },
    { q: 'Quante domande può gestire al giorno?', a: 'Il piano Pro e Studio gestiscono conversazioni illimitate. Il piano Starter 500/mese.' },
    { q: 'Come funziona il setup iniziale?', a: 'Paghi il costo di setup una tantum, ricevi accesso immediato. In 30 minuti il tuo agente è operativo.' },
  ]

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', fontFamily: '"DM Sans", sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-12px) } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }
        @keyframes gradient-shift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
          .problems-grid { grid-template-columns: 1fr !important; }
          .agents-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-section { padding: 100px 1.2rem 60px !important; }
          .section-pad { padding: 60px 1.2rem !important; }
          .steps-content { padding-bottom: 32px !important; }
          .faq-pad { padding: 60px 1.2rem !important; }
        }
      `}</style>

      <NavBar />

      {/* HERO */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '120px 2rem 80px' }}>
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)', animation: 'pulse-glow 4s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,163,255,0.1) 0%, transparent 70%)', animation: 'pulse-glow 5s ease-in-out infinite 1s', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 100, padding: '8px 18px', marginBottom: 36, animation: 'float 3s ease-in-out infinite' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', display: 'inline-block', boxShadow: '0 0 8px #00D4AA' }} />
            <span style={{ fontSize: 13, color: '#00D4AA', fontWeight: 600 }}>Powered by Claude AI · Anthropic</span>
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 7vw, 82px)', fontWeight: 900, lineHeight: 1.08, color: '#fff', marginBottom: 12, letterSpacing: '-2px' }}>
            Il tuo studio nutrizionale<br />
            <span style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #00D4AA 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient-shift 4s ease infinite' }}>lavora anche di notte.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 620, margin: '28px auto 48px' }}>
            Agenti AI personalizzati con i tuoi protocolli e documenti. I pazienti chattano su WhatsApp. Tu recuperi ore di lavoro ogni settimana.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/payment')} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '16px 36px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', boxShadow: '0 0 40px rgba(0,212,170,0.3)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >Crea il tuo agente gratis →</button>
            <a href="#demo" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '16px 32px', borderRadius: 10, fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Guarda la demo ▼</a>
          </div>
          <p style={{ marginTop: 36, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Setup in 30 minuti · Nessuna competenza tecnica · Disdici quando vuoi</p>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="section-pad" style={{ padding: '100px 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ color: '#00D4AA', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Come funziona</p>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(26px, 4vw, 52px)', color: '#fff', fontWeight: 700, letterSpacing: '-1px' }}>Dalla configurazione alla chat WhatsApp</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 16 }}>Carica i documenti → l'agente risponde automaticamente su WhatsApp</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}><DemoMockup /></FadeIn>
        </div>
      </section>

      {/* PROBLEMS */}
      <section className="section-pad" style={{ padding: '100px 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#00D4AA', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Il problema</p>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(26px, 4vw, 52px)', color: '#fff', fontWeight: 700, letterSpacing: '-1px' }}>Riconosci la tua settimana?</h2>
            </div>
          </FadeIn>
          <div className="problems-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {problems.map((p, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px', transition: 'border-color 0.3s, background 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'; e.currentTarget.style.background = 'rgba(0,212,170,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{p.icon}</div>
                  <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: '"Playfair Display", serif' }}>{p.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="agenti" className="section-pad" style={{ padding: '100px 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#00D4AA', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>I tuoi agenti</p>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(26px, 4vw, 52px)', color: '#fff', fontWeight: 700, letterSpacing: '-1px' }}>Tre assistenti. Zero straordinari.</h2>
            </div>
          </FadeIn>
          <div className="agents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {agents.map((a, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '36px 32px', transition: 'border-color 0.3s, transform 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,163,255,0.2))', border: '1px solid rgba(0,212,170,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{a.icon}</div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>{a.name}</h3>
                      <span style={{ fontSize: 11, color: '#00D4AA', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{a.tag}</span>
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.65, marginBottom: 24 }}>{a.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {a.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#00D4AA', fontSize: 14 }}>✓</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="prezzi" className="section-pad" style={{ padding: '100px 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#00D4AA', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Prezzi</p>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(26px, 4vw, 52px)', color: '#fff', fontWeight: 700, letterSpacing: '-1px' }}>Semplice. Trasparente. Senza sorprese.</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 15 }}>Setup una tantum + abbonamento mensile. Disdici quando vuoi.</p>
            </div>
          </FadeIn>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {plans.map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div style={{ background: plan.tag ? 'linear-gradient(160deg, rgba(0,212,170,0.08), rgba(0,163,255,0.08))' : 'rgba(255,255,255,0.03)', border: plan.tag ? '1px solid rgba(0,212,170,0.35)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '36px 28px', position: 'relative', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {plan.tag && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', padding: '5px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{plan.tag}</div>}
                  <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: '"Playfair Display", serif', marginBottom: 6 }}>{plan.name}</h3>
                  <div style={{ marginBottom: 8 }}><span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Setup </span><span style={{ fontSize: 22, color: '#fff', fontWeight: 700 }}>{plan.setup}</span></div>
                  <div style={{ marginBottom: 28 }}><span style={{ fontSize: 36, color: plan.tag ? '#00D4AA' : '#fff', fontWeight: 700, fontFamily: '"Playfair Display", serif' }}>{plan.monthly}</span><span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/mese</span></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#00D4AA', fontSize: 14 }}>✓</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/payment')} style={{ width: '100%', background: plan.tag ? 'linear-gradient(135deg, #00D4AA, #00A3FF)' : 'rgba(255,255,255,0.08)', color: plan.tag ? '#000' : '#fff', border: 'none', padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.target.style.opacity = '0.85'}
                    onMouseLeave={e => e.target.style.opacity = '1'}
                  >{plan.cta}</button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="faq-pad" style={{ padding: '100px 2rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#00D4AA', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>FAQ</p>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(26px, 4vw, 52px)', color: '#fff', fontWeight: 700, letterSpacing: '-1px' }}>Domande frequenti</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((f, i) => <FadeIn key={i} delay={i * 0.06}><FAQItem q={f.q} a={f.a} /></FadeIn>)}
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="section-pad" style={{ padding: '100px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,212,170,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <FadeIn>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(30px, 5vw, 64px)', color: '#fff', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
              Inizia oggi.<br /><span style={{ color: '#00D4AA' }}>I tuoi pazienti ti aspettano.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(14px, 2vw, 18px)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.6 }}>Configura il tuo primo agente in 30 minuti. I clienti lo usano direttamente su WhatsApp.</p>
            <button onClick={() => navigate('/payment')} style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '18px 48px', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', boxShadow: '0 0 60px rgba(0,212,170,0.35)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >Crea il tuo agente gratis →</button>
            <p style={{ marginTop: 20, color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Setup in 30 min · Disdici quando vuoi · Supporto in italiano</p>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌿</div>
          <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>© 2025 NutriAgentAI · Powered by Anthropic Claude · Made in Italy 🇮🇹</p>
      </footer>
    </div>
  )
}
