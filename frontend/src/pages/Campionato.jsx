import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { page, card, btn, btnGhost, input, C, DISPLAY } from '../lib/ui'

const fmt = d => new Date(d).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })

// Home del campionato: elenco cene, la mia coppia, crea una cena.
export default function Campionato() {
  const nav = useNavigate()
  const [user, setUser] = useState(undefined)
  const [couple, setCouple] = useState(null)
  const [events, setEvents] = useState([])
  const [coupleName, setCoupleName] = useState('')
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [err, setErr] = useState('')

  const [tick, setTick] = useState(0)
  const load = () => setTick(t => t + 1)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)
      const { data: ev } = await supabase.from('events').select('id,title,starts_at,couples(name)').order('starts_at')
      setEvents(ev || [])
      if (user) {
        const { data: c } = await supabase.from('couples').select('*').eq('user_id', user.id).maybeSingle()
        setCouple(c)
      }
    })()
  }, [tick])

  async function createCouple(e) {
    e.preventDefault(); setErr('')
    const { error } = await supabase.from('couples').insert({ name: coupleName, user_id: user.id })
    if (error) setErr(error.message); else { setCoupleName(''); load() }
  }
  async function createEvent(e) {
    e.preventDefault(); setErr('')
    const { data, error } = await supabase.from('events')
      .insert({ host_couple_id: couple.id, title, starts_at: new Date(when).toISOString() }).select('id').single()
    if (error) setErr(error.message)
    else nav(`/bonus/${data.id}`) // subito alla scelta del bonus segreto
  }
  async function logout() { await supabase.auth.signOut(); setUser(null); setCouple(null) }

  return (
    <div className="camp" style={page}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '-1.5rem -1.5rem 32px', padding: '22px 1.5rem',
          background: 'linear-gradient(#fbe9c9, #ffe7c3)', color: C.bg }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 600, letterSpacing: '0.16em' }}>CAMPIONATO</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 11, letterSpacing: '0.3em', color: C.goldDeep }}>DELLE CENE</div>
          </div>
          {user ? <button style={{ ...btnGhost, color: C.bg, borderColor: C.goldDeep, padding: '10px 16px' }} onClick={logout}>Esci</button>
                : user === null && <button style={{ ...btn, background: C.bg, color: C.cream, padding: '10px 16px' }} onClick={() => nav('/accesso')}>Accedi</button>}
        </div>

        <h2 style={{ fontSize: 15, letterSpacing: '0.3em', marginBottom: 10 }}>Quattro portate</h2>
        <h1 style={{ fontSize: 36, marginBottom: 14 }}>Un solo vincitore</h1>
        <p style={{ color: C.mute, marginBottom: 24 }}>
          Ogni coppia ospita una cena, tutti votano antipasto, primo, secondo e dolce. E c’è un bonus segreto che raddoppia una portata…
        </p>

        {user === null && (
          <div style={card}>Accedi o registrati per votare le cene e organizzare la tua. <Link to="/accesso" style={{ color: C.accent }}>Accedi →</Link></div>
        )}

        {user && !couple && (
          <form onSubmit={createCouple} style={card}>
            <b>Registra la tua coppia</b>
            <input style={{ ...input, marginTop: 10 }} placeholder="Nome della coppia (es. Rossi)" value={coupleName} onChange={e => setCoupleName(e.target.value)} required />
            <button style={btn}>Registra coppia</button>
          </form>
        )}

        {user && couple && (
          <form onSubmit={createEvent} style={card}>
            <b>Organizza la tua cena ({couple.name})</b>
            <input style={{ ...input, marginTop: 10 }} placeholder="Titolo (es. Cena da Rossi)" value={title} onChange={e => setTitle(e.target.value)} required />
            <input style={input} type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} required />
            <button style={btn}>Crea cena e scegli il bonus segreto</button>
          </form>
        )}
        {err && <p style={{ color: '#ff9b86' }}>{err}</p>}

        <h2 style={{ margin: '28px 0 12px' }}>Le cene</h2>
        {events.length === 0 && <p style={{ color: C.mute }}>Nessuna cena in programma.</p>}
        {events.map(e => (
          <Link key={e.id} to={`/cena/${e.id}`} style={{ ...card, display: 'block', color: C.text, textDecoration: 'none' }}>
            <b>{e.title || 'Cena'}</b>
            <div style={{ color: C.mute, marginTop: 4 }}>{e.couples?.name} · {fmt(e.starts_at)}</div>
          </Link>
        ))}

        <Link to="/final-night" style={{ ...btn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 28, background: C.gold }}>
          Final Night
        </Link>
      </div>
    </div>
  )
}
