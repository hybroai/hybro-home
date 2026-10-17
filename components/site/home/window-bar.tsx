/** Title bar with three window dots, used by the terminal and TUI mockups. */
export function WindowBar({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--line)', background: '#16181D' }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#3A3F48' }} />)}
      <span className="mono" style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>{title}</span>
    </div>
  )
}
