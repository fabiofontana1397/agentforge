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
    <div className="camp" style={{ background: '#38302b', minHeight: '100vh', color: '#fbe9c9', padding: '2rem', fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 19 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Bonus segreto X2</h1>
        <p style={{ color: '#b8a58a', marginBottom: 24 }}>
          Scegli la portata che varrà il doppio. La scelta resta segreta fino alla Final Night
          e, una volta confermata, non si può più cambiare.
        </p>

        {locked === null && !error && <p>Caricamento…</p>}
        {error && locked === null && <p><a href={`/accesso?next=/bonus/${eventId}`} style={{ color: '#ffe7c3' }}>Accedi →</a></p>}
        {locked && (
          <div style={{ padding: 20, borderRadius: 2, border: '1px solid #ffe7c3', background: 'rgba(255,231,195,.08)' }}>
            🔒 Scelta registrata e congelata. Sarà svelata alla Final Night.
          </div>
        )}
        {locked === false && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {COURSES.map(c => (
                <button key={c} onClick={() => setPick(c)} style={{
                  padding: 18, borderRadius: 2, textTransform: 'capitalize', fontSize: 18, cursor: 'pointer',
                  color: '#fbe9c9', background: pick === c ? 'rgba(255,231,195,.15)' : '#463a32',
                  border: `1px solid ${pick === c ? '#ffe7c3' : '#6b5a47'}`,
                }}>{c}</button>
              ))}
            </div>
            <button disabled={!pick || busy} onClick={() => window.confirm('Confermi? Non potrai più cambiare.') && confirm()}
              style={{ marginTop: 20, width: '100%', padding: 14, borderRadius: 2, border: 0, fontWeight: 700,
                background: pick ? '#ffe7c3' : '#6b5a47', color: '#38302b', cursor: pick ? 'pointer' : 'not-allowed' }}>
              Conferma e congela
            </button>
          </>
        )}
        {error && <p style={{ color: '#ff9b86', marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  )
}
