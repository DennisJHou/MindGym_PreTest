import { useEffect, useState } from 'react'
import type { InMindReport } from '../types'
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
    <div className="h-2 rounded-full bg-blue-100 overflow-hidden">
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

  const dimKeys = DIMENSION_ORDER
  const scorePoints = dimKeys.map((k, i) => {
    const r = Math.max(((scores[k] - 1) / 4) * maxR, 4)
    const v = vertex(angles[i], r)
    return `${v.x},${v.y}`
  }).join(' ')

  const labelR = maxR + 18
  const colors = ['#d97706', '#0891b2', '#e11d48', '#7c3aed', '#059669']

  return (
    <svg viewBox="0 0 200 210" className="w-full max-w-[260px] mx-auto">
      {/* Grid rings */}
      {rings.map((pct, i) => (
        <polygon
          key={i}
          points={polygonPoints(maxR * pct)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {angles.map((a, i) => {
        const outer = vertex(a, maxR)
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        )
      })}

      {/* Score area */}
      <polygon
        points={scorePoints}
        fill="rgba(99,102,241,0.12)"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Score dots */}
      {dimKeys.map((k, i) => {
        const r = Math.max(((scores[k] - 1) / 4) * maxR, 4)
        const v = vertex(angles[i], r)
        return (
          <circle key={k} cx={v.x} cy={v.y} r={3.5} fill={colors[i]} />
        )
      })}

      {/* Labels */}
      {dimKeys.map((k, i) => {
        const v = vertex(angles[i], labelR)
        return (
          <g key={k}>
            <text
              x={v.x}
              y={v.y - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill={colors[i]}
              fontWeight="700"
            >
              {DIMENSION_CONFIGS[k].icon} {k}
            </text>
            <text
              x={v.x}
              y={v.y + 7}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6.5"
              fill="#94a3b8"
            >
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
  C: {
    label: 'C 型',
    sublabel: '充電中',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    bar: '░░░░░░░░░░',
  },
  I: {
    label: 'I 型',
    sublabel: '穩定中',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: '████░░░░░░',
  },
  D: {
    label: 'D 型',
    sublabel: '蓬勃中',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    bar: '██████████',
  },
}

const BALANCE_COLOR = {
  unbalanced: 'text-rose-600',
  moderate: 'text-amber-600',
  balanced: 'text-emerald-600',
}

const BALANCE_LABEL = {
  unbalanced: '⚠️ 較不均衡',
  moderate: '〜 中等均衡',
  balanced: '✓ 均衡狀態',
}

// ── Main report component ─────────────────────────────────────────────────────

export default function InMindReportPage({ report, onRestart }: Props) {
  const { scores, individual_analysis, total_score, body_type, body_type_label, body_type_context, balance, percentile } = report
  const bodyMeta = BODY_TYPE_META[body_type]
  const maxKey = balance.max_dim
  const minKey = balance.min_dim
  const maxCfg = DIMENSION_CONFIGS[maxKey]
  const minCfg = DIMENSION_CONFIGS[minKey]

  return (
    <div className="results-animate w-full max-w-lg flex flex-col gap-5 pb-10">

      {/* ── Header ── */}
      <div className="text-center space-y-1 pt-2">
        <div className="text-4xl mb-2">🧠</div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">InMind 心理健康報告</h2>
        <p className="text-slate-400 text-xs">PERMA 正向心理學 · PSY by PSY 心理健身房</p>
      </div>

      {/* ── Radar + Total Score ── */}
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

      {/* ── PERMA Score Bars ── */}
      <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-5 space-y-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">各指數明細</p>
        {DIMENSION_ORDER.map((key) => {
          const cfg = DIMENSION_CONFIGS[key]
          const score = scores[key]
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{cfg.icon}</span>
                  <span className={`text-sm font-medium ${cfg.textColor}`}>{cfg.label}</span>
                  <span className="text-slate-400 text-xs">{cfg.sublabel}</span>
                </div>
                <span className={`font-mono text-sm font-bold ${cfg.textColor}`}>
                  {score.toFixed(1)}
                </span>
              </div>
              <AnimatedBar score={score} gradientBar={cfg.gradientBar} />
            </div>
          )
        })}
      </div>

      {/* ── Body Type ── */}
      <div className={`rounded-2xl border ${bodyMeta.border} ${bodyMeta.bg} p-5 space-y-3`}>
        <p className="text-xs uppercase tracking-widest text-slate-400">心理體型</p>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-black ${bodyMeta.color}`}>{bodyMeta.label}</div>
          <div>
            <p className={`font-semibold text-sm ${bodyMeta.color}`}>{body_type_label}</p>
            <p className="text-slate-400 text-xs">{bodyMeta.sublabel}</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{body_type_context}</p>
        <div className={`font-mono text-lg tracking-widest ${bodyMeta.color} opacity-50`}>
          {bodyMeta.bar}
        </div>
      </div>

      {/* ── Balance Assessment ── */}
      <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400">指數均衡度</p>
          <span className={`text-xs font-semibold ${BALANCE_COLOR[balance.level]}`}>
            {BALANCE_LABEL[balance.level]}
          </span>
        </div>

        <div className="flex gap-3 text-sm">
          <div className={`flex-1 rounded-xl ${maxCfg.bgLight} border ${maxCfg.borderLight} p-3 text-center`}>
            <p className="text-slate-400 text-xs mb-1">最高指數</p>
            <p className="text-lg">{maxCfg.icon}</p>
            <p className={`font-semibold text-xs ${maxCfg.textColor}`}>{maxCfg.label}</p>
          </div>
          <div className="flex items-center text-slate-400 text-xs flex-col justify-center gap-1">
            <span className="font-mono font-bold text-slate-600">Δ {balance.delta.toFixed(1)}</span>
            <span>差距</span>
          </div>
          <div className={`flex-1 rounded-xl ${minCfg.bgLight} border ${minCfg.borderLight} p-3 text-center`}>
            <p className="text-slate-400 text-xs mb-1">最低指數</p>
            <p className="text-lg">{minCfg.icon}</p>
            <p className={`font-semibold text-xs ${minCfg.textColor}`}>{minCfg.label}</p>
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed">{balance.assessment}</p>
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
          <p className="text-indigo-600 text-xs leading-relaxed">💡 {balance.advice}</p>
        </div>
      </div>

      {/* ── Individual Analysis ── */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-slate-400 pl-1">各指數深度分析</p>
        {DIMENSION_ORDER.map((key) => {
          const cfg = DIMENSION_CONFIGS[key]
          const analysis = individual_analysis[key]
          return (
            <div
              key={key}
              className={`rounded-2xl border ${cfg.borderLight} bg-white shadow-sm p-5 space-y-3`}
            >
              {/* Dimension header */}
              <div className="flex items-center gap-2">
                <span className="text-xl">{cfg.icon}</span>
                <div>
                  <span className={`font-bold text-sm ${cfg.textColor}`}>{cfg.label}</span>
                  <span className="text-slate-400 text-xs ml-2">{cfg.sublabel}</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className={`font-mono font-black text-lg ${cfg.textColor}`}>
                    {scores[key].toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-xs">/ 5</span>
                </div>
              </div>

              {/* Score reason */}
              <div className={`rounded-lg ${cfg.bgLight} border ${cfg.borderLight} p-3`}>
                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wide">評分依據</p>
                <p className="text-slate-600 text-xs leading-relaxed">{analysis.score_reason}</p>
              </div>

              {/* Comment */}
              <div>
                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wide">心理解析</p>
                <p className="text-slate-600 text-sm leading-relaxed">{analysis.comment}</p>
              </div>

              {/* Exercise suggestion */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-slate-400 text-xs mb-1 uppercase tracking-wide">⚡ 心理練習</p>
                <p className="text-slate-600 text-xs leading-relaxed">{analysis.exercise_suggestion}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Percentile ── */}
      <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-5 space-y-4">
        <p className="text-xs uppercase tracking-widest text-slate-400">百分等級對照</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { label: '一般大眾', value: percentile.general, color: 'text-indigo-600' },
            { label: '青年族群', value: percentile.youth, color: 'text-violet-600' },
          ] as const).map(({ label, value, color }) => (
            <div key={label} className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center space-y-1">
              <p className="text-slate-500 text-xs">{label}</p>
              <p className={`text-3xl font-black font-mono ${color}`}>
                {value}
                <span className="text-lg font-normal text-slate-400"> PR</span>
              </p>
              <p className="text-slate-400 text-xs">
                贏過 {value}% 的人
              </p>
            </div>
          ))}
        </div>
        <p className="text-slate-300 text-xs text-center">
          * 以標準常態分佈模型模擬推估，僅供參考
        </p>
      </div>

      {/* ── Restart ── */}
      <button
        onClick={onRestart}
        className="w-full py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium mt-2"
      >
        重新檢測
      </button>
    </div>
  )
}
