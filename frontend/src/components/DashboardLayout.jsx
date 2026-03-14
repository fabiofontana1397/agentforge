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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        .sidebar { display: flex; }
        .topbar-actions-full { display: flex; }
        .mobile-menu-btn { display: none; }
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .topbar-actions-full { display: none !important; }
          .mobile-nav { display: flex !important; }
          .page-pad { padding: 20px 16px !important; }
        }
      `}</style>

      {/* SIDEBAR — solo desktop */}
      <div className="sidebar" style={{ width: 220, flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', height: 72 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌿</div>
          <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 16, fontWeight: 700 }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: active ? 'rgba(0,212,170,0.1)' : 'transparent', border: active ? '1px solid rgba(0,212,170,0.2)' : '1px solid transparent', color: active ? '#00D4AA' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: active ? 600 : 400, textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>
        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'transparent', border: '1px solid transparent', color: 'rgba(255,100,100,0.6)', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: 14, width: '100%', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.08)'; e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.6)' }}
          >
            <span style={{ fontSize: 18 }}>🚪</span> Esci
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* TOPBAR */}
        <div style={{ height: 72, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          {/* Mobile: hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 8 }}>
            <div style={{ width: 22, height: 2, background: '#fff', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <div style={{ width: 22, height: 2, background: '#fff', opacity: mobileMenuOpen ? 0 : 1, transition: 'all 0.3s' }} />
            <div style={{ width: 22, height: 2, background: '#fff', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>

          {/* Logo mobile */}
          <div className="mobile-menu-btn" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌿</div>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 16, fontWeight: 700 }}>NutriAgent<span style={{ color: '#00D4AA' }}>AI</span></span>
          </div>

          {/* Desktop status */}
          <div className="topbar-actions-full" style={{ alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', boxShadow: '0 0 8px #00D4AA' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Agente attivo</span>
          </div>

          {/* Desktop actions */}
          <div className="topbar-actions-full" style={{ alignItems: 'center', gap: 8 }}>
            <TopbarBtn icon="❓" label="Supporto" onClick={() => {}} />
            <TopbarBtn icon="⚙️" label="Impostazioni" onClick={() => {}} />
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontSize: 13, transition: 'all 0.2s' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4AA, #00A3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
              <span>Profilo</span>
            </button>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'rgba(255,100,100,0.7)', fontFamily: '"DM Sans", sans-serif', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,60,60,0.1)'; e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.7)' }}
            >Esci</button>
          </div>

          {/* Mobile logout */}
          <button className="mobile-menu-btn" onClick={handleLogout} style={{ display: 'none', background: 'transparent', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'rgba(255,100,100,0.7)', fontFamily: '"DM Sans", sans-serif', fontSize: 13 }}>
            Esci
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="mobile-nav" style={{ flexDirection: 'column', background: 'rgba(8,10,14,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', gap: 4, zIndex: 50 }}>
            {navItems.map(item => {
              const active = location.pathname === item.path
              return (
                <button key={item.path} onClick={() => { navigate(item.path); setMobileMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: active ? 'rgba(0,212,170,0.1)' : 'transparent', border: active ? '1px solid rgba(0,212,170,0.2)' : '1px solid transparent', color: active ? '#00D4AA' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: 15, fontWeight: active ? 600 : 400, textAlign: 'left', width: '100%' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        )}

        {/* PAGE CONTENT */}
        <div className="page-pad" style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
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