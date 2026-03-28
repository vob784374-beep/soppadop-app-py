import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>{label}</label>}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          borderRadius: '4px',
          fontSize: '0.875rem',
          boxSizing: 'border-box' as const,
          ...style,
        }}
      />
      {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  )
}
