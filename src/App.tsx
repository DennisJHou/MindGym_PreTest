import { useState, useEffect, useRef } from 'react'
import type { AppScreen, NarrativeAnswers, InMindReport } from './types'
import LandingPage from './components/IntroScreen'
import NarrativeQuiz from './components/QuestionnaireScreen'
import InMindReportPage from './components/ResultsScreen'

// ── Loading Screen ────────────────────────────────────────────────────────────

const LOADING_STAGES: { pct: number; label: string; detail: string }[] = [
  { pct:  5, label: '連線中',           detail: '正在安全連線到 InMind 分析伺服器…' },
  { pct: 18, label: '解讀情緒力',       detail: '☀️ AI 正在閱讀你分享的正向情緒故事…' },
  { pct: 32, label: '解讀投入力',       detail: '🌊 分析你的心流體驗與專注模式…' },
  { pct: 46, label: '解讀連結力',       detail: '🧲 評估你的人際支持與連結深度…' },
  { pct: 59, label: '解讀意義力',       detail: '🏔 探索你的生命目的與價值觀…' },
  { pct: 71, label: '解讀成就力',       detail: '⚡ 衡量你的目標進展與行動動能…' },
  { pct: 81, label: '配對明星人物',     detail: '⭐ 在資料庫中尋找與你最相似的名人…' },
  { pct: 89, label: '生成個人化建議',   detail: '💡 根據你的體質量身打造提升方案…' },
  { pct: 96, label: '整合完整報告',     detail: '📊 將所有分析結果彙整成你的 InMind 報告…' },
  { pct: 99, label: '即將完成',         detail: '🎉 你的心理幸福力報告即將出爐！' },
]

const TICK_MS = 120

function LoadingScreen() {
  const [pct, setPct] = useState(0)
  const [stageIdx, setStageIdx] = useState(0)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    frameRef.current = setInterval(() => {
      setPct((prev) => {
        const target = LOADING_STAGES[stageIdx]?.pct ?? 99
        if (prev >= target) return prev
        // Slow down as we approach the target
        const gap = target - prev
        const step = Math.max(0.3, gap * 0.04)
        return Math.min(prev + step, target)
      })
    }, TICK_MS)
    return () => { if (frameRef.current) clearInterval(frameRef.current) }
  }, [stageIdx])

  useEffect(() => {
    const target = LOADING_STAGES[stageIdx]?.pct ?? 99
    if (pct >= target && stageIdx < LOADING_STAGES.length - 1) {
      const t = setTimeout(() => setStageIdx((i) => i + 1), 300)
      return () => clearTimeout(t)
    }
  }, [pct, stageIdx])

  const stage = LOADING_STAGES[stageIdx]
  const displayPct = Math.round(pct)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col items-center justify-center gap-8 px-6">
      {/* Pulsing logo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-indigo-200 animate-ping opacity-50" />
        <div className="absolute w-16 h-16 rounded-full bg-indigo-100 animate-pulse" />
        <span className="relative text-4xl">🧠</span>
      </div>

      {/* Stage label + detail */}
      <div className="text-center space-y-2 min-h-[56px]">
        <p className="text-slate-700 font-semibold text-sm tracking-wide">
          {stage.label}
        </p>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          {stage.detail}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm space-y-2">
        <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className="text-xs text-slate-400">InMind AI 分析中</span>
          <span className="text-xs font-mono font-semibold text-indigo-500">{displayPct}%</span>
        </div>
      </div>

      {/* Stage pills */}
      <div className="flex gap-1.5 flex-wrap justify-center max-w-sm">
        {LOADING_STAGES.slice(0, -1).map((s, i) => (
          <span
            key={i}
            className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-300 ${
              i < stageIdx
                ? 'bg-indigo-100 text-indigo-600'
                : i === stageIdx
                ? 'bg-indigo-500 text-white font-medium'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]   = useState<AppScreen>('landing')
  const [answers, setAnswers] = useState<NarrativeAnswers>({ P: '', E: '', R: '', M: '', A: '' })
  const [report,  setReport]  = useState<InMindReport | null>(null)
  const [apiError, setApiError] = useState<string>('')

  function handleStart() {
    setAnswers({ P: '', E: '', R: '', M: '', A: '' })
    setApiError('')
    setScreen('quiz')
  }

  async function handleSubmit(finalAnswers: NarrativeAnswers) {
    setAnswers(finalAnswers)
    setScreen('loading')
    setApiError('')

    try {
      const baseUrl = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${baseUrl}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }

      setReport(data as InMindReport)
      setScreen('report')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知錯誤，請重試'
      setApiError(msg)
      setScreen('quiz')
    }
  }

  function handleRestart() {
    setReport(null)
    setAnswers({ P: '', E: '', R: '', M: '', A: '' })
    setApiError('')
    setScreen('landing')
  }

  if (screen === 'loading') return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col items-center pt-8 pb-16 px-4">
      {screen === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      {screen === 'quiz' && (
        <NarrativeQuiz
          initialAnswers={answers}
          startAtLast={Boolean(apiError)}
          apiError={apiError}
          onSubmit={handleSubmit}
        />
      )}
      {screen === 'report' && report && (
        <InMindReportPage report={report} onRestart={handleRestart} />
      )}
    </div>
  )
}
