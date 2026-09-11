import type { LilyPad } from '../../models/frogPond'

interface FrogPondProps {
  pads: LilyPad[]
  current: number
  shares: number[] | null
}

const PAD_WIDTH = 'clamp(30px, 9vw, 64px)'
const PAD_HEIGHT = 'clamp(18px, 5vw, 38px)'

export function FrogPond({ pads, current, shares }: FrogPondProps) {
  const maxShare = shares ? Math.max(...shares) : 0
  const frog = pads[current]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '2.1',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)',
        overflow: 'hidden',
      }}
    >
      {pads.map((pad) => {
        const share = shares ? shares[pad.id] : null
        const intensity = share !== null ? Math.min(1, share / (maxShare || 1)) : 0
        return (
          <div
            key={pad.id}
            style={{
              position: 'absolute',
              left: `${6 + pad.x * 88}%`,
              top: `${12 + pad.y * 68}%`,
              width: PAD_WIDTH,
              height: PAD_HEIGHT,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: '#a0af84',
              border: '2px solid #426a5a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {share !== null && (
              <div
                style={{
                  width: 'clamp(18px, 5vw, 32px)',
                  height: 'clamp(18px, 5vw, 32px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  background: 'var(--color-accent-2)',
                  opacity: 0.35 + intensity * 0.65,
                }}
              >
                {share.toFixed(1)}%
              </div>
            )}
          </div>
        )
      })}
      <div
        style={{
          position: 'absolute',
          left: `${6 + frog.x * 88}%`,
          top: `${12 + frog.y * 68}%`,
          transform: 'translate(-50%, -78%)',
          fontSize: 'clamp(18px, 6vw, 28px)',
          transition: 'left 0.4s ease, top 0.4s ease',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
          pointerEvents: 'none',
        }}
      >
        🐸
      </div>
    </div>
  )
}
