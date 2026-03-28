import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'warning' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const colors: Record<string, { bg: string; hover: string }> = {
  primary: { bg: '#3b82f6', hover: '#2563eb' },
  danger: { bg: '#ef4444', hover: '#dc2626' },
  success: { bg: '#22c55e', hover: '#16a34a' },
  warning: { bg: '#f59e0b', hover: '#d97706' },
  ghost: { bg: 'transparent', hover: '#f3f4f6' },
}

const sizes: Record<string, React.CSSProperties> = {
  sm: { padding: '0.25rem 0.75rem', fontSize: '0.8rem' },
  md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
  lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
}

export default function Button({ variant = 'primary', size = 'md', loading, children, style, disabled, ...props }: ButtonProps) {
  const c = colors[variant]
  const s = sizes[size]
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...s,
        background: c.bg,
        color: variant === 'ghost' ? '#374151' : '#fff',
        border: variant === 'ghost' ? '1px solid #d1d5db' : 'none',
        borderRadius: '4px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        fontWeight: 500,
        ...style,
      }}
    >
      {loading ? '...' : children}
    </button>
  )
}
