import { useEffect, useState } from 'react'
import type { InMindReport, DimensionKey } from '../types'
import { DIMENSION_CONFIGS, DIMENSION_ORDER } from '../types'

interface Props {
  report: InMindReport
  onRestart: () => void
}

// ── Animated score bar ────────────────────────────────────────────────────────

function AnimatedBar({ score, gradientBar }: { score: number; gradientBar: string }) {
  const [width, setWidth] = useState(0)
  const pct = (score / 5) * 100

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradientBar} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

// ── SVG Pentagon Radar Chart ──────────────────────────────────────────────────

function RadarChart({ scores }: { scores: InMindReport['scores'] }) {
  const cx = 100
  const cy = 105
  const maxR = 75
  const angles = [-90, -18, 54, 126, 198].map((d) => (d * Math.PI) / 180)

  function vertex(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const rings = [0.2, 0.4, 0.6, 0.8, 1.0]

  function polygonPoints(r: number) {
    return angles.map((a) => {
      const v = vertex(a, r)
      return `${v.x},${v.y}`
    }).join(' ')
  }

  const scorePoints = DIMENSION_ORDER.map((k, i) => {
    const r = Math.max(((scores[k] - 1) / 4) * maxR, 4)
    const v = vertex(angles[i], r)
    return `${v.x},${v.y}`
  }).join(' ')

  const labelR = maxR + 18
  const colors = ['#d97706', '#0891b2', '#e11d48', '#7c3aed', '#059669']

  return (
    <svg viewBox="0 0 200 210" className="w-full max-w-[260px] mx-auto">
      {rings.map((pct, i) => (
        <polygon key={i} points={polygonPoints(maxR * pct)} fill="none" stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {angles.map((a, i) => {
        const outer = vertex(a, maxR)
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1" />
      })}
      <polygon points={scorePoints} fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
      {DIMENSION_ORDER.map((k, i) => {
        const r = Math.max(((scores[k] - 1) / 4) * maxR, 4)
        const v = vertex(angles[i], r)
        return <circle key={k} cx={v.x} cy={v.y} r={3.5} fill={colors[i]} />
      })}
      {DIMENSION_ORDER.map((k, i) => {
        const v = vertex(angles[i], labelR)
        return (
          <g key={k}>
            <text x={v.x} y={v.y - 5} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill={colors[i]} fontWeight="700">
              {DIMENSION_CONFIGS[k].icon} {k}
            </text>
            <text x={v.x} y={v.y + 7} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fill="#94a3b8">
              {scores[k].toFixed(1)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Body type config ──────────────────────────────────────────────────────────

const BODY_TYPE_META = {
  C: { label: 'C 型', sublabel: '充電期', color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',    bar: '░░░░░░░░░░' },
  I: { label: 'I 型', sublabel: '穩定期', color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   bar: '████░░░░░░' },
  D: { label: 'D 型', sublabel: '蓬勃期', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: '██████████' },
}

// ── Main report component ─────────────────────────────────────────────────────

export default function InMindReportPage({ report, onRestart }: Props) {
  const {
    scores, individual_analysis, total_score,
    body_type, body_type_label, body_type_context,
    summary_sentence, celeb_match,
    constitution_advice, advanced_analysis,
  } = report

  const bodyMeta = BODY_TYPE_META[body_type]
  const weakKey = constitution_advice.weak_dim as DimensionKey
  const weakCfg = DIMENSION_CONFIGS[weakKey] ?? DIMENSION_CONFIGS['P']

  return (
    <div className="results-animate w-full max-w-lg flex flex-col gap-5 pb-10">

      {/* ── Header ── */}
      <div className="text-center space-y-1 pt-2">
        <div className="text-4xl mb-2">🧠</div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">InMind 心理健康報告</h2>
        <p className="text-slate-400 text-xs">PERMA 正向心理學 · PSY by PSY 心理健身房</p>
      </div>

      {/* ── 1. 綜合性結果 ── */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 shadow-sm p-6 space-y-5">
        {/* Summary sentence */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-indigo-400">你的幸福體質</p>
          <p className="text-slate-800 text-base font-semibold leading-relaxed">
            {summary_sentence}
          </p>
        </div>

        <div className="border-t border-indigo-100" />

        {/* Celebrity match */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-indigo-400">⭐ 與你最相似的名人</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>
            <div className="flex-1">
              <p className="text-lg font-bold text-slate-800">{celeb_match.name}</p>
              <p className="text-slate-500 text-xs">{celeb_match.description}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/70 border border-indigo-100 p-3">
            <p className="text-slate-600 text-sm leading-relaxed">{celeb_match.reason}</p>
          </div>
        </div>
      </div>

      {/* ── 2. 雷達圖 + 總分 ── */}
      <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-5 space-y-4">
        <RadarChart scores={scores} />
        <div className="text-center space-y-1 border-t border-blue-50 pt-4">
          <p className="text-slate-400 text-xs uppercase tracking-widest">幸福指數總分</p>
          <div className="text-4xl font-extrabold text-slate-800 font-mono">
            {total_score.toFixed(1)}
            <span className="text-slate-300 text-xl font-normal"> / 25</span>
          </div>
        </div>
      </div>

      {/* ── 3. CID 心理體型 ── */}
      <div className={`rounded-2xl border ${bodyMeta.border} ${bodyMeta.bg} p-5 space-y-3`}>
        <p className="text-xs uppercase tracking-widest text-slate-400">心理體型（CID）</p>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-black ${bodyMeta.color}`}>{bodyMeta.label}</div>
          <div>
            <p className={`font-semibold text-sm ${bodyMeta.color}`}>{body_type_label}</p>
            <p className="text-slate-400 text-xs">{bodyMeta.sublabel}</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{body_type_context}</p>
        <div className={`font-mono text-lg tracking-widest ${bodyMeta.color} opacity-40`}>
          {bodyMeta.bar}
        </div>
      </div>

      {/* ── 4. 五個向度細項建議與下一步行動 ── */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-400 pl-1">五大指數 · 細項建議與行動</p>

        {DIMENSION_ORDER.map((key) => {
          const cfg = DIMENSION_CONFIGS[key]
          const analysis = individual_analysis[key]
          const isWeak = key === weakKey

          return (
            <div
              key={key}
              className={`rounded-2xl border ${cfg.borderLight} bg-white shadow-sm p-5 space-y-4`}
            >
              {/* Dimension header + score bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <span className={`font-bold text-sm ${cfg.textColor}`}>{cfg.label}</span>
                    <span className="text-slate-400 text-xs">{cfg.sublabel}</span>
                    {isWeak && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200 font-medium">
                        優先加強
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`font-mono font-black text-lg ${cfg.textColor}`}>
                      {scores[key].toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-xs">/ 5</span>
                  </div>
                </div>
                <AnimatedBar score={scores[key]} gradientBar={cfg.gradientBar} />
              </div>

              {/* Psychological insight */}
              <div className="space-y-1">
                <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.textColor}`}>心理解析</p>
                <p className="text-slate-600 text-sm leading-relaxed">{analysis.comment}</p>
              </div>

              {/* Next step action */}
              <div className={`rounded-xl ${cfg.bgLight} border ${cfg.borderLight} p-3 space-y-1`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.textColor}`}>⚡ 下一步行動</p>
                <p className="text-slate-700 text-sm leading-relaxed">{analysis.exercise_suggestion}</p>
              </div>

              {/* For weak dimension: add short-term plan & daily practice */}
              {isWeak && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">💪 加強計畫</p>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                    <p className="text-xs text-slate-500 font-medium">📅 短期（2-4週）</p>
                    <p className="text-slate-700 text-xs leading-relaxed">{constitution_advice.short_term_plan}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                    <p className="text-xs text-slate-500 font-medium">🌱 每日練習</p>
                    <p className="text-slate-700 text-xs leading-relaxed">{constitution_advice.daily_practice}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── 重新測驗 ── */}
      <button
        onClick={onRestart}
        className="w-full py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium mt-2"
      >
        重新測驗
      </button>
    </div>
  )
}
