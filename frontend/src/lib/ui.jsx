export const C = { bg: '#080A0E', card: '#12161d', line: '#2a303b', accent: '#00D4AA', gold: '#ffc83d', mute: '#9aa' }
export const page = { background: C.bg, minHeight: '100vh', color: '#fff', fontFamily: '"DM Sans", sans-serif', padding: '1.5rem' }
export const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 14 }
export const btn = { padding: '12px 20px', borderRadius: 10, border: 0, background: C.accent, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 15 }
export const btnGhost = { ...btn, background: 'transparent', color: '#fff', border: `1px solid ${C.line}` }
export const input = { width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${C.line}`, background: '#0c1016', color: '#fff', fontSize: 16, marginBottom: 10 }
