import { theme as T } from '@/styles/theme'

interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
  disabled?: boolean
}

export default function Switch({ checked, onChange, size = 'md', disabled }: SwitchProps) {
  const handleToggle = () => {
    if (disabled) return
    onChange?.(!checked)
  }

  const trackStyle = {
    sm: { width: 32, height: 18, knobSize: 14, knobOffset: 2, translateOn: 'translate-x-3.5' },
    md: { width: 40, height: 22, knobSize: 18, knobOffset: 2, translateOn: 'translate-x-4.5' }
  }[size]

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      style={{
        width: trackStyle.width,
        height: trackStyle.height,
        borderRadius: 999,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        background: checked ? T.primary : T.border,
        position: 'relative',
        opacity: disabled ? 0.5 : 1,
      }}
      aria-checked={checked}
      type="button"
    >
      <div
        style={{
          width: trackStyle.knobSize,
          height: trackStyle.knobSize,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: trackStyle.knobOffset,
          left: trackStyle.knobOffset,
          transform: checked ? trackStyle.translateOn : 'translateX(0)',
          transition: 'transform 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}
