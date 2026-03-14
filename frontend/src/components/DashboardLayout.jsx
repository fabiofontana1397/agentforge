import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '🤖', label: 'Crea Agente', path: '/dashboard/crea' },
  { icon: '🗂️', label: 'I miei Agenti', path: '/dashboard/agenti' },
  { icon: '📊', label: 'Analytics', path: '/dashboard/analytics' },
  { icon: '📄', label: 'Documenti', path: '/dashboard/documenti' },
  { icon: '💬', label: 'WhatsApp', path: '/dashboard/whatsapp' },
  { icon: '💳', label: 'Abbonamento', path: '/dashboard/abbonamento' },
]

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080A0E', fontFamily: '"DM Sans", sans-serif', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: collapsed ? 72 : 240, flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden' }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', height: 72 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌿</div>
          {!collapsed && <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px' : '10px 14px', borderRadius: 10, background: active ? 'rgba(0,212,170,0.1)' : 'transparent', border: active ? '1px solid rgba(0,212,170,0.2)' : '1px solid transparent', color: active ? '#00D4AA' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: active ? 600 : 400, textAlign: 'left', width: '100%', transition: 'all 0.2s', whiteSpace: 'nowrap', justifyContent: collapsed ? 'center' : 'flex-start' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </button>
            )
          })}
        </nav>

        {/* Collapse button */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px' : '10px 14px', borderRadius: 10, background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: 13, width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
          >
            <span style={{ fontSize: 16 }}>{collapsed ? '→' : '←'}</span>
            {!collapsed && 'Comprimi'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <div style={{ height: 72, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 8px #00D4AA' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Agente attivo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TopbarBtn icon="❓" label="Supporto" onClick={() => {}} />
            <TopbarBtn icon="⚙️" label="Impostazioni" onClick={() => navigate('/dashboard/impostazioni')} />
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <button onClick={() => navigate('/dashboard/profilo')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
              <span>Profilo</span>
            </button>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'rgba(255,100,100,0.7)', fontFamily: '"DM Sans", sans-serif', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.1)'; e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.7)' }}
            >Esci</button>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          {children}
        </div>

      </div>
    </div>
  )
}

function TopbarBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontFamily: '"DM Sans", sans-serif', fontSize: 13, transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
    >
      <span>{icon}</span>{label}
    </button>
  )
}