import React from 'react'

export default function Card({ title, children, actions, style }: {
  title?: string
  children: React.ReactNode
  actions?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', ...style }}>
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {title && <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
