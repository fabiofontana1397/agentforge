import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const COURSES = ['antipasto', 'primo', 'secondo', 'dolce']

// Scelta segreta del BONUS X2 da parte della coppia ospitante.
// La portata scelta NON viene mai riletta né mostrata dopo la conferma.
export default function SecretBonus() {
  const { eventId } = useParams()
  const [locked, setLocked] = useState(null)
  const [pick, setPick] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.rpc('has_secret_bonus', { p_event: eventId }).then(({ data, error }) => {
      if (error) setError(error.message.includes('permission denied') ? 'Devi accedere per scegliere il bonus.' : error.message)
      else setLocked(!!data)
    })
  }, [eventId])

  async function confirm() {
    setBusy(true)
    setError('')
    const { error } = await supabase.rpc('set_secret_bonus', { p_event: eventId, p_course: pick })
    setBusy(false)
    if (error) setError(error.message)
    else { setPick(null); setLocked(true) }
  }

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', color: '#fff', padding: '2rem', fontFamily: '"DM Sans", sans-serif' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Bonus segreto X2</h1>
        <p style={{ color: '#9aa', marginBottom: 24 }}>
          Scegli la portata che varrà il doppio. La scelta resta segreta fino alla Final Night
          e, una volta confermata, non si può più cambiare.
        </p>

        {locked === null && !error && <p>Caricamento…</p>}
        {error && locked === null && <p><a href={`/accesso?next=/bonus/${eventId}`} style={{ color: '#00D4AA' }}>Accedi →</a></p>}
        {locked && (
          <div style={{ padding: 20, borderRadius: 12, border: '1px solid #00D4AA', background: 'rgba(0,212,170,.08)' }}>
            🔒 Scelta registrata e congelata. Sarà svelata alla Final Night.
          </div>
        )}
        {locked === false && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {COURSES.map(c => (
                <button key={c} onClick={() => setPick(c)} style={{
                  padding: 18, borderRadius: 12, textTransform: 'capitalize', fontSize: 18, cursor: 'pointer',
                  color: '#fff', background: pick === c ? 'rgba(0,212,170,.2)' : '#12161d',
                  border: `1px solid ${pick === c ? '#00D4AA' : '#2a303b'}`,
                }}>{c}</button>
              ))}
            </div>
            <button disabled={!pick || busy} onClick={() => window.confirm('Confermi? Non potrai più cambiare.') && confirm()}
              style={{ marginTop: 20, width: '100%', padding: 14, borderRadius: 12, border: 0, fontWeight: 700,
                background: pick ? '#00D4AA' : '#2a303b', color: '#000', cursor: pick ? 'pointer' : 'not-allowed' }}>
              Conferma e congela
            </button>
          </>
        )}
        {error && <p style={{ color: '#ff6b6b', marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  )
}
