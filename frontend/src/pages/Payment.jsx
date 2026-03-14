import { useNavigate } from 'react-router-dom'

export default function Payment() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#080A0E', minHeight: '100vh', fontFamily: 'sans-serif', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: '2rem' }}>

      <div style={{ fontSize: 48 }}>💳</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center' }}>Pagamento</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 400 }}>
        Integrazione Stripe in arrivo. Per ora clicca Continua per accedere alla configurazione del tuo agente.
      </p>
      <button
        onClick={() => navigate('/signup')}
        style={{ background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', color: '#000', border: 'none', padding: '16px 48px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
      >
        Continua →
      </button>

    </div>
  )
}