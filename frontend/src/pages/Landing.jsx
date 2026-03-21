import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Google Fonts ── */
if (!document.getElementById('naomi-fonts')) {
  const l = document.createElement('link')
  l.id = 'naomi-fonts'
  l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap'
  document.head.appendChild(l)
}

/* ── Sphere ── */
function NaomiSphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = 400, H = 400
    canvas.width = W; canvas.height = H
    const cx = W / 2, cy = H / 2, R = 130
    let t = 0

    const colors = [
      { r: 124, g: 106, b: 255 },
      { r: 62,  g: 207, b: 207 },
      { r: 255, g: 106, b: 173 },
    ]

    function lerpColor(a, b, f) {
      return {
        r: Math.round(a.r + (b.r - a.r) * f),
        g: Math.round(a.g + (b.g - a.g) * f),
        b: Math.round(a.b + (b.b - a.b) * f),
      }
    }

    function getColor(t) {
      const N = colors.length
      const i = Math.floor(t % N)
      const f = (t % N) - i
      return lerpColor(colors[i], colors[(i + 1) % N], f)
    }

    function drawSphere(t) {
      ctx.clearRect(0, 0, W, H)
      const POINTS = 7
      const pts = []
      for (let i = 0; i < POINTS; i++) {
        const angle = (i / POINTS) * Math.PI * 2
        const noise =
          Math.sin(angle * 2 + t * 1.1) * 12 +
          Math.sin(angle * 3 - t * 0.7) * 8 +
          Math.sin(angle + t * 1.5) * 6
        const r = R + noise
        pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r })
      }

      ctx.beginPath()
      for (let i = 0; i < POINTS; i++) {
        const p1 = pts[i]
        const p2 = pts[(i + 1) % POINTS]
        if (i === 0) ctx.moveTo(p1.x, p1.y)
        else ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
      }
      ctx.closePath()

      const c1 = getColor(t * 0.18)
      const c2 = getColor(t * 0.18 + 1.3)
      const c3 = getColor(t * 0.18 + 2.6)

      const grd = ctx.createRadialGradient(cx - 30, cy - 40, 20, cx, cy, R + 20)
      grd.addColorStop(0, `rgba(${c1.r},${c1.g},${c1.b},0.95)`)
      grd.addColorStop(0.45, `rgba(${c2.r},${c2.g},${c2.b},0.85)`)
      grd.addColorStop(1, `rgba(${c3.r},${c3.g},${c3.b},0.7)`)
      ctx.fillStyle = grd
      ctx.fill()

      const hl = ctx.createRadialGradient(cx - 44, cy - 52, 2, cx - 30, cy - 36, 58)
      hl.addColorStop(0, 'rgba(255,255,255,0.45)')
      hl.addColorStop(0.5, 'rgba(255,255,255,0.12)')
      hl.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hl
      ctx.fill()

      ctx.save()
      ctx.shadowColor = `rgba(${c1.r},${c1.g},${c1.b},0.6)`
      ctx.shadowBlur = 50
      ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},0.15)`
      ctx.fill()
      ctx.restore()

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.3
        const dr = R * 0.5 + Math.sin(t * 0.8 + i) * R * 0.15
        const px = cx + Math.cos(angle) * dr
        const py = cy + Math.sin(angle) * dr
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fill()
      }
    }

    let raf
    function animate() {
      t += 0.012
      drawSphere(t)
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto', cursor: 'pointer' }}>
      {/* outer ring */}
      <div style={{
        position: 'absolute', inset: -36, borderRadius: '50%',
        border: '1px solid rgba(62,207,207,0.12)',
        animation: 'ringRotate 12s linear infinite reverse'
      }}>
        <div style={{ position: 'absolute', width: 5, height: 5, background: '#3ecfcf', borderRadius: '50%', top: '10%', right: -3, boxShadow: '0 0 8px #3ecfcf' }} />
      </div>
      {/* inner ring */}
      <div style={{
        position: 'absolute', inset: -20, borderRadius: '50%',
        border: '1px solid rgba(124,106,255,0.2)',
        animation: 'ringRotate 8s linear infinite'
      }}>
        <div style={{ position: 'absolute', width: 8, height: 8, background: '#7c6aff', borderRadius: '50%', top: '50%', left: -4, transform: 'translateY(-50%)', boxShadow: '0 0 12px #7c6aff' }} />
      </div>
      <canvas ref={canvasRef} style={{ width: 200, height: 200, display: 'block', borderRadius: '50%' }} />
    </div>
  )
}

/* ── Chat Demo ── */
const CONVERSATION = [
  { type: 'out', text: 'Ciao! Vorrei prenotare una visita per domani mattina 🙂', time: '14:31' },
  { type: 'in',  text: "Ciao! Sono Naomi, l'assistente del Dr. Rossi. Domani mattina abbiamo disponibilità alle 9:00 e alle 11:30. Quale preferisce?", time: '14:31' },
  { type: 'out', text: 'Perfetto, le 9:00 va benissimo!', time: '14:32' },
  { type: 'in',  text: 'Ottimo! Ho confermato la visita per domani alle 9:00. Riceverà un promemoria stasera. Ha bisogno di altro?', time: '14:32' },
]

function DemoChat() {
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    let idx = 0
    let cancelled = false

    function runNext() {
      if (cancelled) return
      if (idx >= CONVERSATION.length) {
        setTimeout(() => { if (!cancelled) { setMessages([]); idx = 0; setTimeout(runNext, 400) } }, 4000)
        return
      }
      const msg = CONVERSATION[idx++]
      if (msg.type === 'in') {
        setTyping(true)
        setTimeout(() => {
          if (cancelled) return
          setTyping(false)
          setMessages(prev => [...prev, msg])
          setTimeout(runNext, 1800)
        }, 1400)
      } else {
        setMessages(prev => [...prev, msg])
        setTimeout(runNext, 1200)
      }
    }

    const t = setTimeout(runNext, 800)
    return () => { cancelled = true; clearTimeout(t) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface2)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6aff,#3ecfcf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>N</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Naomi — Studio Dr. Rossi</div>
          <div style={{ fontSize: 11, color: '#3ecfcf', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, background: '#3ecfcf', borderRadius: '50%', display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            Online ora
          </div>
        </div>
      </div>

      {/* messages */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 320, maxHeight: 320, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.type === 'out' ? 'row-reverse' : 'row', maxWidth: '90%', marginLeft: m.type === 'out' ? 'auto' : 0, animation: 'fadeUp 0.35s ease' }}>
            {m.type === 'in' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6aff,#3ecfcf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2, fontFamily: 'Syne, sans-serif' }}>N</div>
            )}
            <div>
              <div style={{
                padding: '10px 14px', borderRadius: m.type === 'out' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                background: m.type === 'out' ? 'rgba(124,106,255,0.2)' : 'var(--surface2)',
                border: `1px solid ${m.type === 'out' ? 'rgba(124,106,255,0.25)' : 'var(--border)'}`,
                fontSize: 14, lineHeight: 1.5, color: 'var(--text)'
              }}>{m.text}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,239,245,0.25)', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6aff,#3ecfcf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: 'Syne, sans-serif' }}>N</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(240,239,245,0.45)', animation: `typingDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

/* ── Main Landing ── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--black)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontWeight: 300, lineHeight: 1.6, overflowX: 'hidden', minHeight: '100vh' }}>
      <style>{`
        :root {
          --black: #050507;
          --surface: #0d0d12;
          --surface2: #13131a;
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.15);
          --text: #f0eff5;
          --muted: rgba(240,239,245,0.45);
          --accent1: #7c6aff;
          --accent2: #3ecfcf;
          --accent3: #ff6aad;
          --glow1: rgba(124,106,255,0.35);
          --glow2: rgba(62,207,207,0.25);
          --glow3: rgba(255,106,173,0.2);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-track { background: #050507 } ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px }

        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:0.5; transform:scale(0.7) } }
        @keyframes ringRotate { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes scrollDrop { 0% { transform:scaleY(0); transform-origin:top } 50% { transform:scaleY(1); transform-origin:top } 51% { transform:scaleY(1); transform-origin:bottom } 100% { transform:scaleY(0); transform-origin:bottom } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes typingDot { 0%,100% { transform:translateY(0); opacity:0.4 } 50% { transform:translateY(-4px); opacity:1 } }

        .nav-link { color: var(--muted); text-decoration:none; font-size:14px; font-weight:400; transition:color 0.2s; }
        .nav-link:hover { color: var(--text); }
        .nav-cta { padding:9px 20px; background:transparent; border:1px solid var(--border-hover); border-radius:8px; color:var(--text); font-family:Inter,sans-serif; font-size:14px; font-weight:400; cursor:pointer; transition:all 0.2s; text-decoration:none; display:inline-block; }
        .nav-cta:hover { background:rgba(255,255,255,0.06); border-color:var(--accent1); }

        .btn-primary { padding:14px 32px; background:linear-gradient(135deg,var(--accent1),#5b4bd4); border:none; border-radius:10px; color:#fff; font-family:Inter,sans-serif; font-size:15px; font-weight:500; cursor:pointer; transition:all 0.25s; text-decoration:none; position:relative; overflow:hidden; display:inline-block; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 12px 40px var(--glow1); }
        .btn-ghost { padding:14px 32px; background:transparent; border:1px solid var(--border-hover); border-radius:10px; color:var(--text); font-family:Inter,sans-serif; font-size:15px; font-weight:400; cursor:pointer; transition:all 0.2s; text-decoration:none; display:inline-flex; align-items:center; gap:8px; }
        .btn-ghost:hover { background:rgba(255,255,255,0.05); border-color:var(--accent2); color:var(--accent2); }

        .client-pill { padding:6px 16px; border:1px solid var(--border); border-radius:100px; font-size:13px; color:var(--muted); background:rgba(255,255,255,0.02); transition:all 0.2s; }
        .client-pill:hover { border-color:var(--border-hover); color:var(--text); }

        .step-card { position:relative; padding:40px 36px; background:var(--surface); border:1px solid var(--border); transition:all 0.3s; overflow:hidden; }
        .step-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--glow1),transparent 60%); opacity:0; transition:opacity 0.3s; }
        .step-card:hover { border-color:var(--border-hover); }
        .step-card:hover::before { opacity:1; }

        .feat-card { background:var(--surface2); padding:36px 32px; transition:background 0.3s; }
        .feat-card:hover { background:#181820; }

        .footer-link { font-size:13px; color:var(--muted); text-decoration:none; transition:color 0.2s; }
        .footer-link:hover { color:var(--text); }

        .price-cta-outline { width:100%; padding:14px; border-radius:10px; font-family:Inter,sans-serif; font-size:15px; font-weight:500; cursor:pointer; transition:all 0.2s; background:transparent; border:1px solid var(--border-hover); color:var(--text); }
        .price-cta-outline:hover { background:rgba(255,255,255,0.05); border-color:var(--accent2); }
        .price-cta-solid { width:100%; padding:14px; border-radius:10px; font-family:Inter,sans-serif; font-size:15px; font-weight:500; cursor:pointer; transition:all 0.2s; background:linear-gradient(135deg,var(--accent1),#5b4bd4); border:none; color:#fff; }
        .price-cta-solid:hover { transform:translateY(-1px); box-shadow:0 8px 30px var(--glow1); }

        @media (max-width: 900px) {
          .nav-links-wrap { display: none !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .features-header { grid-template-columns: 1fr !important; gap: 24px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .demo-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 600px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .step-card { border-radius: 0 !important; }
          .step-card:first-child { border-radius: 16px 16px 0 0 !important; }
          .step-card:last-child { border-radius: 0 0 16px 16px !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(5,5,7,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#7c6aff,#3ecfcf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Naomi</div>
        <ul className="nav-links-wrap" style={{ display: 'flex', gap: 32, listStyle: 'none' }}>
          {[['Come funziona', '#come-funziona'], ['Funzionalità', '#funzionalita'], ['Prezzi', '#prezzi']].map(([label, href]) => (
            <li key={label}><a href={href} className="nav-link">{label}</a></li>
          ))}
        </ul>
        <a href="#prezzi" className="nav-cta">Inizia gratis</a>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
        {/* bg glow */}
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,106,255,0.35) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* badge */}
        <div style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: '1px solid rgba(124,106,255,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 400, color: 'var(--accent1)', background: 'rgba(124,106,255,0.08)', marginBottom: 40, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent1)', animation: 'pulseDot 2s ease-in-out infinite', display: 'inline-block' }} />
          Disponibile ora — Agente AI
        </div>

        {/* sphere */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: 56 }}>
          <NaomiSphere />
        </div>

        <p style={{ position: 'relative', zIndex: 2, fontSize: 13, fontWeight: 400, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Incontra Naomi</p>

        <h1 style={{ position: 'relative', zIndex: 2, fontFamily: 'Syne, sans-serif', fontSize: 'clamp(44px,7vw,88px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 28, maxWidth: 900 }}>
          La segretaria AI<br />
          che <span style={{ background: 'linear-gradient(135deg,#7c6aff 0%,#3ecfcf 50%,#ff6aad 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>non dorme mai</span>
        </h1>

        <p style={{ position: 'relative', zIndex: 2, fontSize: 18, fontWeight: 300, color: 'var(--muted)', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.65 }}>
          Naomi risponde ai tuoi clienti su WhatsApp, gestisce appuntamenti e risponde alle domande — 24 ore su 24, esattamente come faresti tu.
        </p>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/payment')}>Attiva Naomi gratis</button>
          <a href="#demo" className="btn-ghost">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/></svg>
            Guarda il demo
          </a>
        </div>

        {/* scroll hint */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom,#7c6aff,transparent)', animation: 'scrollDrop 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── CLIENTS ── */}
      <div style={{ padding: '32px 48px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 12 }}>Perfetta per</span>
        {['Studi medici', 'Nutrizionisti', 'Avvocati', 'Personal trainer', 'Parrucchieri', 'Ristoranti', 'Centri estetici'].map(p => (
          <span key={p} className="client-pill">{p}</span>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="come-funziona" style={{ padding: '120px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent1)', marginBottom: 16 }}>Come funziona</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 20 }}>Attiva Naomi<br />in tre passi</div>
          <p style={{ fontSize: 17, fontWeight: 300, color: 'var(--muted)', maxWidth: 500, lineHeight: 1.6 }}>Nessuna competenza tecnica richiesta. In meno di 30 minuti Naomi è pronta a rispondere ai tuoi clienti.</p>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 2 }}>
          {[
            { n: '01', t: 'Raccontaci la tua attività', d: 'Compila un semplice form con i tuoi servizi, orari e informazioni. Puoi anche caricare documenti e brochure.' },
            { n: '02', t: 'Naomi impara e si adatta', d: 'In pochi minuti il tuo agente personale viene addestrato su tutte le informazioni che hai fornito.' },
            { n: '03', t: 'Collega WhatsApp e vai', d: 'Naomi inizia a rispondere ai tuoi clienti. Tu ricevi solo le conversazioni che richiedono la tua attenzione.' },
          ].map((s, i) => (
            <div key={i} className="step-card" style={{ borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : 0 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 56, fontWeight: 800, lineHeight: 1, color: 'rgba(124,106,255,0.15)', marginBottom: 20, position: 'relative', zIndex: 1 }}>{s.n}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 12, position: 'relative', zIndex: 1 }}>{s.t}</div>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funzionalita" style={{ padding: '120px 48px', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="features-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 80 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent1)', marginBottom: 16 }}>Funzionalità</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' }}>Tutto quello che ti serve, già dentro</div>
            </div>
            <p style={{ fontSize: 17, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.6 }}>Naomi non è un semplice chatbot. È un agente intelligente addestrato sulla tua attività, disponibile ogni ora del giorno.</p>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { icon: '💬', color: 'purple', t: 'Chat WhatsApp nativa', d: 'I tuoi clienti scrivono dove già si trovano. Nessuna app da installare, nessun link da condividere.' },
              { icon: '🧠', color: 'teal',   t: 'Memoria contestuale', d: 'Naomi ricorda le conversazioni precedenti e risponde con coerenza, come farebbe un vero assistente.' },
              { icon: '📄', color: 'pink',   t: 'Documenti e knowledge base', d: 'Carica PDF, listini prezzi, protocolli. Naomi li legge e li usa per rispondere in modo preciso.' },
              { icon: '🕐', color: 'teal',   t: 'Disponibile H24', d: 'Risponde alle 2 di notte, nel weekend, in ogni momento. I clienti non aspettano più.' },
              { icon: '✏️', color: 'purple', t: 'Personalizzabile al 100%', d: 'Tono di voce, nome, argomenti trattati, limiti di risposta. Tutto configurabile dal tuo pannello.' },
              { icon: '📊', color: 'pink',   t: 'Dashboard e statistiche', d: 'Monitora le conversazioni, vedi le domande più frequenti e ottimizza Naomi nel tempo.' },
            ].map((f, i) => {
              const bg = f.color === 'purple' ? 'rgba(124,106,255,0.15)' : f.color === 'teal' ? 'rgba(62,207,207,0.15)' : 'rgba(255,106,173,0.15)'
              return (
                <div key={i} className="feat-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 20, background: bg }}>{f.icon}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{f.t}</div>
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{f.d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DEMO CHAT ── */}
      <section id="demo" style={{ padding: '120px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="demo-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent1)', marginBottom: 16 }}>Demo live</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 16 }}>Come risponde Naomi ai tuoi clienti</div>
            <p style={{ fontSize: 17, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 40 }}>Ogni risposta è personalizzata sulla tua attività. Naomi conosce i tuoi servizi, i tuoi orari e il tuo modo di comunicare.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { bg: 'rgba(124,106,255,0.15)', icon: '⚡', t: 'Risposta in meno di 2 secondi', s: 'I tuoi clienti non aspettano mai' },
                { bg: 'rgba(62,207,207,0.15)',  icon: '🎯', t: 'Risposta accurata al 95%', s: 'Solo sulle informazioni che hai fornito' },
                { bg: 'rgba(255,106,173,0.15)', icon: '🔒', t: 'Dati protetti e privati', s: 'Nessuna condivisione con terze parti' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{r.t}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{r.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DemoChat />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="prezzi" style={{ padding: '120px 48px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent1)', marginBottom: 16, display: 'inline-block' }}>Prezzi</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 16 }}>Semplice, trasparente,<br />senza sorprese</div>
            <p style={{ fontSize: 17, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.6 }}>14 giorni di prova gratuita su tutti i piani. Nessuna carta di credito richiesta.</p>
          </div>
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: 'var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            {/* Starter */}
            <div style={{ background: 'var(--surface2)', padding: '48px 40px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Starter</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>€49</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>al mese · dopo 14 giorni gratis</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {['1 agente Naomi attivo', 'WhatsApp Business integrato', 'Fino a 500 messaggi/mese', 'Caricamento documenti (5 file)', 'Dashboard base'].map(f => (
                  <li key={f} style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(62,207,207,0.15)', border: '1px solid rgba(62,207,207,0.4)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#3ecfcf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="price-cta-outline" onClick={() => navigate('/payment')}>Inizia gratis</button>
            </div>
            {/* Pro */}
            <div style={{ background: '#0f0f18', padding: '48px 40px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 24, right: 24, padding: '4px 12px', background: 'rgba(124,106,255,0.2)', border: '1px solid rgba(124,106,255,0.4)', borderRadius: 100, fontSize: 11, color: 'var(--accent1)', letterSpacing: '0.05em' }}>Più popolare</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--accent1)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6, background: 'linear-gradient(135deg,#7c6aff,#3ecfcf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>€99</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>al mese · dopo 14 giorni gratis</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {['3 agenti Naomi attivi', 'WhatsApp + Web widget', 'Messaggi illimitati', 'Documenti illimitati', 'Dashboard avanzata + analytics', 'Priorità nel supporto'].map(f => (
                  <li key={f} style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(62,207,207,0.15)', border: '1px solid rgba(62,207,207,0.4)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#3ecfcf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="price-cta-solid" onClick={() => navigate('/payment')}>Inizia gratis</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{ padding: '120px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,106,255,0.35) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em', maxWidth: 700, margin: '0 auto 20px' }}>
          Pronto a non perdere<br />più nessun cliente?
        </div>
        <p style={{ position: 'relative', fontSize: 17, fontWeight: 300, color: 'var(--muted)', maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.6 }}>Naomi è pronta in 30 minuti. Attiva la prova gratuita oggi.</p>
        <div style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/payment')}>Attiva Naomi gratis</button>
          <a href="mailto:info@naomi.ai" className="btn-ghost">Parla con noi</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 48px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg,#7c6aff,#3ecfcf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Naomi</div>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>© 2025 Naomi AI. Tutti i diritti riservati.</span>
        <ul style={{ display: 'flex', gap: 24, listStyle: 'none' }}>
          {['Privacy', 'Termini', 'Contatti'].map(l => (
            <li key={l}><a href="#" className="footer-link">{l}</a></li>
          ))}
        </ul>
      </footer>
    </div>
  )
}
