import React from 'react'
import { theme as T } from '@/styles/theme'

export default function Card({ title, children, actions, style, variant, className }: {
  title?: string
  children: React.ReactNode
  actions?: React.ReactNode
  style?: React.CSSProperties
  variant?: 'default' | 'flat' | 'bordered'
  className?: string
}) {
  const borderStyle = variant === 'flat'
    ? { border: 'none', boxShadow: 'none' }
    : { border: `1px solid ${T.border}`, boxShadow: T.shadowSm }

  return (
    <div style={{
      background: T.surface,
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem',
      ...borderStyle,
      ...style,
    }}
    className={className}
    >
      {(title || actions) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '0.85rem', paddingBottom: '0.65rem',
          borderBottom: `1px solid ${T.borderLt}`,
        }}>
          {title && <h3 style={{
            margin: 0, fontSize: '0.88rem', fontWeight: 700,
            color: T.ink, letterSpacing: '-0.01em',
          }}>{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
