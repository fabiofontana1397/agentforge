import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

const pages = {
  analytics: {
    icon: '📊',
    title: 'Analytics',
    desc: 'Monitora le conversazioni, i pazienti attivi e le performance dei tuoi agenti AI in tempo reale.',
    features: ['Conversazioni per agente', 'Pazienti attivi questo mese', 'Domande più frequenti', 'Ore risparmiate stimate'],
    color: '#00A3FF'
  },
  documenti: {
    icon: '📄',
    title: 'Documenti',
    desc: 'Gestisci tutti i documenti caricati per i tuoi agenti — piani nutrizionali, protocolli, FAQ e molto altro.',
    features: ['Visualizza tutti i documenti', 'Filtra per agente', 'Sostituisci documenti obsoleti', 'Controlla quali file usa ogni agente'],
    color: '#A78BFA'
  },
  whatsapp: {
    icon: '💬',
    title: 'Integrazione WhatsApp',
    desc: 'Connetti il tuo numero WhatsApp Business e lascia che i tuoi pazienti chattino direttamente con il tuo agente AI.',
    features: ['Connetti numero WhatsApp Business', 'Configura messaggio di benvenuto', 'Gestisci conversazioni attive', 'Vedi storico messaggi'],
    color: '#25D366'
  },
  abbonamento: {
    icon: '💳',
    title: 'Abbonamento',
    desc: 'Gestisci il tuo piano, visualizza le fatture e aggiorna il metodo di pagamento.',
    features: ['Piano attivo e scadenza', 'Storico fatture', 'Cambia piano', 'Gestisci metodo di pagamento'],
    color: '#F59E0B'
  },
}

export default function Placeholder({ page }) {
  const navigate = useNavigate()
  const info = pages[page] || pages.analytics

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 40 }}>

        {/* Icon */}
        <div style={{ width: 80, height: 80, borderRadius: 20, background: `${info.color}18`, border: `1px solid ${info.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24 }}>
          {info.icon}
        </div>

        {/* Titolo */}
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12, color: '#fff' }}>
          {info.title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.65, maxWidth: 520, marginBottom: 40 }}>
          {info.desc}
        </p>

        {/* Features */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px', marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>Funzionalità in arrivo</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {info.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: `${info.color}18`, border: `1px solid ${info.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, opacity: 0.6 }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge coming soon */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 18px', marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: info.color, boxShadow: `0 0 8px ${info.color}` }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>In sviluppo — disponibile a breve</span>
        </div>

        {/* Back button */}
        <div>
          <button onClick={() => navigate('/dashboard')} style={{ background: `linear-gradient(135deg, ${info.color}, #00A3FF)`, color: '#000', border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            ← Torna alla Dashboard
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}