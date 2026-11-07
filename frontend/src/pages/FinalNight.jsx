import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const COURSE_ORDER = ['antipasto', 'primo', 'secondo', 'dolce']

function useCountUp(from, to, active, ms = 1800) {
  const [v, setV] = useState(from)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    let raf
    const tick = now => {
      const p = Math.min((now - t0) / ms, 1)
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [from, to, active, ms])
  return active ? v : from
}

// Final Night: tutti i dispositivi seguono lo stesso `final_night_state` via Realtime.
// I dati della busta arrivano filtrati per passo da get_envelope: il bonus esiste lato client solo da step >= 5.
export default function FinalNight() {
  const [state, setState] = useState({ step: 0, event_id: null })
  const [env, setEnv] = useState(null)
  const [events, setEvents] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [pick, setPick] = useState('')
  const lastStep = useRef(-1)

  async function loadEnvelope(s) {
    if (!s.event_id || s.step < 1) { setEnv(null); return }
    const { data } = await supabase.rpc('get_envelope', { p_event: s.event_id })
    setEnv(data)
  }

  useEffect(() => {
    const apply = s => {
      if (!s) return
      setState(s)
      if (s.step !== lastStep.current || s.event_id !== state.event_id) { lastStep.current = s.step; loadEnvelope(s) }
    }
    const fetchState = () => supabase.from('final_night_state').select('*').eq('id', 1).single().then(({ data }) => apply(data))
    fetchState()
    const ch = supabase.channel('final-night')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'final_night_state' }, p => apply(p.new))
      .subscribe()
    const poll = setInterval(fetchState, 4000) // rete di sicurezza se il realtime cade
    supabase.auth.getUser().then(({ data }) => setIsAdmin(data.user?.app_metadata?.role === 'admin'))
    supabase.from('events').select('id,title').then(({ data }) => setEvents(data || []))
    return () => { clearInterval(poll); supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { step } = state
  const bonusPts = env?.courses?.find(c => c.course === env.bonus_course)?.points ?? 0
  const doubled = useCountUp(bonusPts, bonusPts * 2, step >= 6)

  async function next() {
    await supabase.rpc('advance_final_night', { p_event: state.event_id || pick })
  }

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', color: '#fff', fontFamily: '"DM Sans", sans-serif', padding: '2rem', textAlign: 'center' }}>
      <style>{`
        @keyframes pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.15) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 10px #ffc83d55 } 50% { box-shadow: 0 0 45px #ffc83dcc } }
        @keyframes beat { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: none } }
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {step < 1 && <h1 style={{ marginTop: '30vh', animation: 'beat 2s infinite' }}>🔒 La busta è ancora chiusa…</h1>}

        {step >= 1 && env && (
          <>
            <h1 style={{ fontSize: 40, animation: 'pop .7s' }}>✉️ {env.couple}</h1>

            {step >= 2 && env.normal?.map(n => (
              <Row key={n.category} label={n.category} value={n.points} />
            ))}

            {step >= 3 && env.courses && COURSE_ORDER.map(c => {
              const pts = env.courses.find(x => x.course === c)?.points ?? 0
              const isBonus = step >= 5 && env.bonus_course === c
              const shown = isBonus && step >= 6 ? doubled : pts
              return (
                <Row key={c} label={c} value={shown} highlight={isBonus}
                  extra={isBonus ? (step >= 6 ? `BONUS X2 · ${pts} → ${pts * 2}` : '⭐ BONUS X2') : null} />
              )
            })}

            {step === 4 && (
              <h2 style={{ marginTop: 32, fontSize: 28, animation: 'beat 1s infinite' }}>
                Quale portata era il BONUS X2?…
              </h2>
            )}

            {step >= 7 && env.total != null && (
              <h2 style={{ marginTop: 32, fontSize: 36, color: '#00D4AA', animation: 'pop .8s' }}>
                Totale cena: {env.total}
              </h2>
            )}
          </>
        )}

        {isAdmin && (
          <div style={{ marginTop: 40, display: 'flex', gap: 8, justifyContent: 'center' }}>
            {!state.event_id && (
              <select value={pick} onChange={e => setPick(e.target.value)} style={{ padding: 10, borderRadius: 8 }}>
                <option value="">Scegli la cena…</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.title || e.id}</option>)}
              </select>
            )}
            <button onClick={next} disabled={!state.event_id && !pick || step >= 7}
              style={{ padding: '10px 22px', borderRadius: 8, border: 0, background: '#00D4AA', fontWeight: 700, cursor: 'pointer' }}>
              Avanti ({step}/7)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, highlight, extra }) {
  return (
    <div style={{
      margin: '12px 0', padding: '14px 20px', borderRadius: 12, display: 'flex', justifyContent: 'space-between',
      textTransform: 'capitalize', fontSize: 20, animation: highlight ? 'glow 1.4s infinite' : 'fadeUp .5s',
      background: highlight ? 'rgba(255,200,61,.15)' : '#12161d', border: `1px solid ${highlight ? '#ffc83d' : '#2a303b'}`,
    }}>
      <span>{label}{extra && <b style={{ marginLeft: 10, color: '#ffc83d' }}>{extra}</b>}</span>
      <b>{value}</b>
    </div>
  )
}
