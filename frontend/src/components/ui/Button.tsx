import React from 'react'
import { theme as T } from '@/styles/theme'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants: Record<string, { bg: string; hover: string; text: string; border: string }> = {
  primary: { bg: T.primary,      hover: T.primaryHover,  text: '#fff',          border: T.primary },
  danger:  { bg: T.rose,         hover: T.roseHover,     text: '#fff',          border: T.rose },
  success: { bg: T.emerald,      hover: T.emeraldHover,  text: '#fff',          border: T.emerald },
  warning: { bg: T.amber,        hover: T.amberHover,    text: '#fff',          border: T.amber },
  ghost:   { bg: 'transparent',  hover: T.bgSubtle,      text: T.inkSoft,       border: T.border },
  outline: { bg: 'transparent',  hover: T.primarySoft,   text: T.primary,       border: T.primaryRing },
}

const sizes: Record<string, React.CSSProperties> = {
  sm: { padding: '0.25rem 0.65rem', fontSize: '0.72rem' },
  md: { padding: '0.4rem 0.9rem',   fontSize: '0.8rem' },
  lg: { padding: '0.6rem 1.3rem',   fontSize: '0.88rem' },
}

export default function Button({ variant = 'primary', size = 'md', loading, children, style, disabled, ...props }: ButtonProps) {
  const v = variants[variant]
  const s = sizes[size]
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...s,
        background: v.bg,
        color: v.text,
        border: `1px solid ${v.border}`,
        borderRadius: '7px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        ...style,
      }}
    >
      {loading ? '...' : children}
    </button>
  )
}
