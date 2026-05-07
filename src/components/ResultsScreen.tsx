import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import type { InMindReport, DimensionKey } from '../types'
import { DIMENSION_CONFIGS, DIMENSION_ORDER } from '../types'
import ShareCard from './ShareCard'

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
              {DIMENSION_CONFIGS[k].icon} {DIMENSION_CONFIGS[k].label}
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
  C: {
    emoji: '🍡',
    name: '棉花糖',
    inbody: '泡芙人',
    trait: '高內耗・低核心力',
    symbol: '體積很大，但一碰就縮小。承擔了許多生活負荷，但內部缺乏核心支撐力，遇到壓力時心理韌性容易迅速瓦解。',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    tagBg: 'bg-rose-100',
  },
  I: {
    emoji: '🍞',
    name: '吐司',
    inbody: '一般人',
    trait: '功能正常・缺乏彈性',
    symbol: '穩定但缺乏韌性。中規中矩，能應付日常生活，但面對複雜困境時支撐力有限，尚有很大的成長空間。',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    tagBg: 'bg-amber-100',
  },
  D: {
    emoji: '🥯',
    name: '貝果',
    inbody: '運動員',
    trait: '高核心力・低內耗',
    symbol: '極強的咬勁與紮實度。經得起外在壓力，紮實的心理核心能提供強大支撐，具備高度的反脆弱性。',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    tagBg: 'bg-emerald-100',
  },
}

// ── Main report component ─────────────────────────────────────────────────────

export default function InMindReportPage({ report, onRestart }: Props) {
  const {
    scores, individual_analysis, total_score,
    body_type, body_type_context,
    summary_sentence, celeb_match,
    constitution_advice, balance, advanced_analysis, take_action,
  } = report

  const bodyMeta = BODY_TYPE_META[body_type]
  const weakKey = constitution_advice.weak_dim as DimensionKey
  const maxCfg = DIMENSION_CONFIGS[balance.max_dim]
  const minCfg = DIMENSION_CONFIGS[balance.min_dim]

  const shareCardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleDownloadShare() {
    if (!shareCardRef.current || isGenerating) return
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2.77, // renders at ~1080×1920
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = 'inmind-心理體質.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setIsGenerating(false)
    }
  }

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

      {/* ── 3. 心理體型 ── */}
      <div className={`rounded-2xl border ${bodyMeta.border} ${bodyMeta.bg} p-5 space-y-4`}>
        <p className="text-xs uppercase tracking-widest text-slate-400">心理體型</p>

        {/* Name + InBody tag */}
        <div className="flex items-center gap-4">
          <span className="text-5xl">{bodyMeta.emoji}</span>
          <div className="space-y-1">
            <p className={`text-2xl font-black ${bodyMeta.color}`}>{bodyMeta.name}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${bodyMeta.tagBg} ${bodyMeta.color} font-medium`}>
              InBody 對應：{bodyMeta.inbody}
            </span>
          </div>
        </div>

        {/* Trait tag */}
        <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${bodyMeta.tagBg} ${bodyMeta.color}`}>
          {bodyMeta.trait}
        </div>

        {/* Psychological symbol */}
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">心理象徵</p>
          <p className="text-slate-600 text-sm leading-relaxed">{bodyMeta.symbol}</p>
        </div>

        {/* Personalized AI context */}
        <div className={`rounded-xl ${bodyMeta.tagBg} border ${bodyMeta.border} p-3`}>
          <p className="text-xs text-slate-500 mb-1 font-medium">你目前的狀態</p>
          <p className={`text-sm leading-relaxed ${bodyMeta.color}`}>{body_type_context}</p>
        </div>
      </div>

      {/* ── 4. 指數均衡分析 ── */}
      <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-5 space-y-5">
        <p className="text-xs uppercase tracking-widest text-slate-400">指數均衡分析</p>

        {/* Max vs Min visual */}
        <div className="flex items-center gap-3">
          <div className={`flex-1 rounded-xl ${maxCfg.bgLight} border ${maxCfg.borderLight} p-3 text-center space-y-1`}>
            <p className="text-slate-400 text-xs">最高指數</p>
            <p className="text-2xl">{maxCfg.icon}</p>
            <p className={`font-bold text-sm ${maxCfg.textColor}`}>{maxCfg.label}</p>
            <p className={`font-mono font-black text-lg ${maxCfg.textColor}`}>{scores[balance.max_dim].toFixed(1)}</p>
          </div>
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="text-slate-300 text-xl">↕</span>
            <span className="font-bold text-slate-700 text-sm">{balance.delta.toFixed(1)}</span>
            <span className="text-slate-400 text-xs">差異</span>
          </div>
          <div className={`flex-1 rounded-xl ${minCfg.bgLight} border ${minCfg.borderLight} p-3 text-center space-y-1`}>
            <p className="text-slate-400 text-xs">最低指數</p>
            <p className="text-2xl">{minCfg.icon}</p>
            <p className={`font-bold text-sm ${minCfg.textColor}`}>{minCfg.label}</p>
            <p className={`font-mono font-black text-lg ${minCfg.textColor}`}>{scores[balance.min_dim].toFixed(1)}</p>
          </div>
        </div>

        {/* Gap meaning */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">差距的意義</p>
          <p className="text-slate-600 text-sm leading-relaxed">{balance.assessment}</p>
        </div>

        {/* Complementary person */}
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">🤝 你的互補對象</p>
          <p className="text-slate-600 text-sm leading-relaxed">{advanced_analysis.synergy_explanation}</p>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-indigo-500">他們的特質與如何找到他們</p>
            <p className="text-slate-600 text-sm leading-relaxed">{advanced_analysis.partnership_profile}</p>
          </div>
        </div>

        {/* Encouragement */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-emerald-700 text-sm leading-relaxed font-medium">
            🌱 {advanced_analysis.next_step_action}
          </p>
          <p className="text-emerald-600 text-xs mt-2 leading-relaxed">
            身邊就有這樣的人——可能是朋友、同事，或還未深入認識的人。主動靠近他，你們的幸福感加在一起，會比各自單獨擁有時還要更大。
          </p>
        </div>
      </div>

      {/* ── 5. 五個向度細項建議與下一步行動 ── */}
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

              {/* Bullet list */}
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className={`mt-1 shrink-0 text-xs font-black ${cfg.textColor}`}>•</span>
                  <p className="text-slate-600 text-sm leading-relaxed">{analysis.comment}</p>
                </li>
                <li className={`flex items-start gap-2 rounded-xl ${cfg.bgLight} px-3 py-2`}>
                  <span className="mt-0.5 shrink-0 text-sm">⚡</span>
                  <p className="text-slate-700 text-sm leading-relaxed">{analysis.exercise_suggestion}</p>
                </li>
                {isWeak && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-sm">📅</span>
                      <p className="text-slate-600 text-xs leading-relaxed">{constitution_advice.short_term_plan}</p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-sm">🌱</span>
                      <p className="text-slate-600 text-xs leading-relaxed">{constitution_advice.daily_practice}</p>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )
        })}
      </div>

      {/* ── 6. Take Action ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 space-y-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-slate-400">Take Action</p>
          <p className="text-white font-bold text-base">每天一個微習慣</p>
        </div>

        {/* Daily habit highlight */}
        <div className="rounded-xl bg-indigo-500/20 border border-indigo-400/30 p-4">
          <p className="text-indigo-300 text-xs font-semibold mb-2 uppercase tracking-wide">⚡ 從今天開始</p>
          <p className="text-white text-sm leading-relaxed font-medium">{take_action.daily_habit}</p>
        </div>

        {/* Progress timeline */}
        <div className="space-y-0">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-3">堅持之後，你會發現⋯</p>

          {[
            { label: '第 3 天', text: take_action.after_3_days,  dot: 'bg-slate-500' },
            { label: '第 1 週', text: take_action.after_1_week,  dot: 'bg-indigo-400' },
            { label: '第 2 週', text: take_action.after_2_weeks, dot: 'bg-violet-400' },
            { label: '第 1 個月', text: take_action.after_1_month, dot: 'bg-emerald-400' },
          ].map(({ label, text, dot }, i, arr) => (
            <div key={label} className="flex gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dot}`} />
                {i < arr.length - 1 && <div className="w-px flex-1 bg-slate-700 my-1" />}
              </div>
              {/* Content */}
              <div className={`pb-4 ${i < arr.length - 1 ? '' : 'pb-0'}`}>
                <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
                <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 分享到 IG ── */}
      <div className="space-y-3 mt-2">
        <button
          onClick={handleDownloadShare}
          disabled={isGenerating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              產生圖片中⋯
            </>
          ) : (
            <>
              <span>📲</span>
              下載分享卡片（9:16）
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-400">儲存後可直接分享到 Instagram 限時動態</p>

        {/* ── 重新測驗 ── */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
        >
          重新測驗
        </button>
      </div>

      {/* Hidden share card — captured by html2canvas */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
        <ShareCard ref={shareCardRef} report={report} />
      </div>
    </div>
  )
}
