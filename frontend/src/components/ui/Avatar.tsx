import { theme as T } from '@/styles/theme'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const initialsFromName = (name?: string): string => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const sizeMap = {
  xs: { size: 20, fontSize: '0.65rem' },
  sm: { size: 28, fontSize: '0.7rem' },
  md: { size: 36, fontSize: '0.8rem' },
  lg: { size: 44, fontSize: '0.95rem' },
}

export default function Avatar({ src, alt, name, size = 'md' }: AvatarProps) {
  const s = sizeMap[size]
  const initials = initialsFromName(name)

  const commonStyle = {
    width: s.size,
    height: s.size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: s.fontSize,
    fontWeight: 700,
    color: '#fff',
    backgroundColor: T.primary,
    flexShrink: 0,
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'avatar'}
        style={{
          ...commonStyle,
          objectFit: 'cover',
        }}
      />
    )
  }

  return (
    <div style={commonStyle} title={name}>
      {initials}
    </div>
  )
}
