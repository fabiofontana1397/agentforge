import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { page, card, btn, input, C } from '../lib/ui'

export default function Accesso() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [nuovo, setNuovo] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    const { data, error } = nuovo
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMsg(error.message)
    if (nuovo && !data.session) return setMsg('Controlla la tua email e conferma l’account, poi accedi.')
    nav(params.get('next') || '/')
  }

  return (
    <div className="camp" style={page}>
      <form onSubmit={submit} style={{ ...card, maxWidth: 420, margin: '10vh auto 0' }}>
        <h1 style={{ fontSize: 26, marginBottom: 16 }}>{nuovo ? 'Crea account' : 'Accedi'}</h1>
        <input style={input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={input} type="password" placeholder="Password (min. 6 caratteri)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        <button style={{ ...btn, width: '100%' }}>{nuovo ? 'Registrati' : 'Entra'}</button>
        {msg && <p style={{ color: msg.startsWith('Controlla') ? C.accent : '#ff9b86', marginTop: 12 }}>{msg}</p>}
        <p style={{ marginTop: 16, color: C.mute, textAlign: 'center', cursor: 'pointer' }} onClick={() => setNuovo(!nuovo)}>
          {nuovo ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
        </p>
      </form>
    </div>
  )
}
