import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  /** Stroke follows the text colour — set it with a text-* class. */
  className?: string
}

const W = 76
const H = 32
const PAD = 3

/** Tiny smoothed trend line (Catmull-Rom → cubic Bézier), no axes. */
export function Sparkline({ data, className }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const span = Math.max(...data) - min || 1
  const pts = data.map((v, i) => [
    PAD + (i * (W - 2 * PAD)) / (data.length - 1),
    H - PAD - ((v - min) / span) * (H - 2 * PAD),
  ])

  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('overflow-visible', className)}
    >
      <path d={d} />
    </svg>
  )
}
