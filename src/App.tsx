import { useState } from 'react'
import type { AppScreen, NarrativeAnswers, InMindReport } from './types'
import LandingPage from './components/IntroScreen'
import NarrativeQuiz from './components/QuestionnaireScreen'
import InMindReportPage from './components/ResultsScreen'

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-8 px-4">
      {/* Pulsing logo */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-indigo-200 animate-ping" />
        <div className="absolute w-16 h-16 rounded-full bg-indigo-100 animate-pulse" />
        <span className="relative text-4xl">🧠</span>
      </div>

      {/* Text */}
      <div className="text-center space-y-2">
        <p className="text-slate-700 font-semibold tracking-widest text-sm uppercase">
          InMind AI 正在分析
        </p>
        <p className="text-slate-400 text-xs max-w-xs">
          根據你的敘事，進行 PERMA 深度評估中⋯⋯
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-400"
            style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%           { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
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
      const res = await fetch('/api/report', {
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
