import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { page, card, btn, C } from '../lib/ui'

const CATEGORIE = [
  ['mise_en_place', 'Mise en place e benvenuto'],
  ['antipasto', 'Antipasto'], ['primo', 'Primo'], ['secondo', 'Secondo'], ['dolce', 'Dolce'],
  ['budget', 'Rispetto del budget'], ['tempistiche', 'Rispetto tempistiche'],
]
const fmt = d => new Date(d).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' })

// Pagina pubblica della cena + votazione. Non mostra MAI il bonus (nemmeno se è stato scelto).
export default function Cena() {
  const { eventId } = useParams()
  const [ev, setEv] = useState(null)
  const [user, setUser] = useState(undefined)
  const [isHost, setIsHost] = useState(false)
  const [voted, setVoted] = useState(false)
  const [scores, setScores] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)
      const { data } = await supabase.from('events').select('id,title,starts_at,couples(name,user_id)').eq('id', eventId).maybeSingle()
      setEv(data)
      if (user && data) {
        setIsHost(data.couples?.user_id === user.id)
        const { data: mine } = await supabase.from('votes').select('category').eq('event_id', eventId)
        setVoted((mine || []).length > 0)
      }
    })()
  }, [eventId])

  async function submit() {
    setMsg('')
    const rows = CATEGORIE.map(([k]) => ({ event_id: eventId, category: k, score: scores[k] }))
    if (rows.some(r => !r.score)) return setMsg('Dai un voto a tutte le categorie.')
    const { error } = await supabase.from('votes').insert(rows)
    if (error) setMsg(error.message); else setVoted(true)
  }

  if (ev === null) return <div style={page}>Cena non trovata. <Link to="/" style={{ color: C.accent }}>Home</Link></div>
  if (!ev) return <div style={page}>Caricamento…</div>
  const started = new Date(ev.starts_at) <= new Date()

  return (
    <div style={page}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link to="/" style={{ color: C.mute }}>← Tutte le cene</Link>
        <h1 style={{ fontSize: 30, margin: '12px 0 4px' }}>{ev.title || 'Cena'}</h1>
        <p style={{ color: C.mute, marginBottom: 20 }}>{ev.couples?.name} · {fmt(ev.starts_at)}</p>

        {user === null && <div style={card}>Per votare <Link to={`/accesso?next=/cena/${eventId}`} style={{ color: C.accent }}>accedi</Link>.</div>}

        {isHost && (
          <div style={card}>
            Sei la coppia ospitante: non puoi votare la tua cena.
            {!started && <div style={{ marginTop: 10 }}><Link to={`/bonus/${eventId}`} style={{ color: C.accent }}>Scegli o controlla il bonus segreto →</Link></div>}
          </div>
        )}

        {user && !isHost && !started && <div style={card}>Il voto si apre all’inizio della cena.</div>}
        {user && !isHost && started && voted && <div style={{ ...card, borderColor: C.accent }}>✅ Hai già votato. Grazie!</div>}

        {user && !isHost && started && !voted && (
          <div style={card}>
            <b>Il tuo voto (1–10)</b>
            {CATEGORIE.map(([k, label]) => (
              <div key={k} style={{ marginTop: 14 }}>
                <div style={{ marginBottom: 6 }}>{label}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} onClick={() => setScores(s => ({ ...s, [k]: n }))} style={{
                      width: 38, height: 38, borderRadius: 8, cursor: 'pointer', color: scores[k] === n ? '#000' : '#fff',
                      background: scores[k] === n ? C.accent : '#0c1016', border: `1px solid ${C.line}` }}>{n}</button>
                  ))}
                </div>
              </div>
            ))}
            <button style={{ ...btn, width: '100%', marginTop: 20 }} onClick={submit}>Invia il voto</button>
            <p style={{ color: C.mute, fontSize: 13, marginTop: 8 }}>Il voto non si può modificare dopo l’invio.</p>
            {msg && <p style={{ color: '#ff6b6b', marginTop: 8 }}>{msg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
