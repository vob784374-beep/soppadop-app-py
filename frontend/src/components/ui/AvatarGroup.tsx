import { theme as T } from '@/styles/theme'
import Avatar from './Avatar'

interface AvatarGroupProps {
  users?: Array<{ username?: string }>
  maxDisplay?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export default function AvatarGroup({ users, maxDisplay = 4, size = 'sm' }: AvatarGroupProps) {
  if (!users || users.length === 0) {
    return (
      <span style={{ color: T.muted, fontSize: '0.85rem' }}>
        No users
      </span>
    )
  }

  const displayUsers = users.slice(0, maxDisplay)
  const remaining = users.length - displayUsers.length

  const containerSize = {
    xs: { gap: -6 },
    sm: { gap: -8 },
    md: { gap: -10 },
    lg: { gap: -12 },
  }[size]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}>
      <div style={{
        display: 'flex',
      }}>
        {displayUsers.map((user, i) => (
          <div
            key={i}
            style={{
              marginLeft: i > 0 ? containerSize.gap : 0,
              transition: 'margin 0.2s',
            }}
          >
            <Avatar name={user.username} size={size} />
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span
          style={{
            width: sizeMap[size].size,
            height: sizeMap[size].size,
            borderRadius: '50%',
            backgroundColor: T.bgSubtle,
            border: `1px solid ${T.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: sizeMap[size].fontSize,
            color: T.muted,
            fontWeight: 600,
            marginLeft: 4,
          }}
        >
          +{remaining}
        </span>
      )}
    </div>
  )
}

const sizeMap = {
  xs: { size: 20, fontSize: '0.65rem' },
  sm: { size: 28, fontSize: '0.7rem' },
  md: { size: 36, fontSize: '0.8rem' },
  lg: { size: 44, fontSize: '0.95rem' },
}
