// Palette e stile: osteria calda e vintage (marrone scuro, crema, oro opaco).
export const C = {
  bg: '#38302b', card: '#463a32', line: '#6b5a47', field: '#2f2823',
  text: '#fbe9c9', cream: '#ffe7c3', accent: '#ffe7c3', gold: '#c9a566', goldDeep: '#9c8057', mute: '#b8a58a',
}
export const SERIF = '"Cormorant Garamond", Georgia, serif'
export const DISPLAY = '"Cinzel", Georgia, serif'
export const page = { background: C.bg, minHeight: '100vh', color: C.text, fontFamily: SERIF, fontSize: 19, padding: '1.5rem' }
export const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 2, padding: 20, marginBottom: 14 }
export const btn = {
  padding: '14px 24px', borderRadius: 0, border: 0, background: C.cream, color: C.bg, cursor: 'pointer',
  fontFamily: DISPLAY, fontWeight: 500, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase',
}
export const btnGhost = { ...btn, background: 'transparent', color: C.text, border: `1px solid ${C.goldDeep}` }
export const input = {
  width: '100%', padding: 13, borderRadius: 0, border: `1px solid ${C.line}`, background: C.field,
  color: C.text, fontSize: 18, fontFamily: SERIF, marginBottom: 10,
}
