import { useState, useEffect, useRef } from 'react'
import type { AppScreen, NarrativeAnswers, InMindReport } from './types'
import LandingPage from './components/IntroScreen'
import NarrativeQuiz from './components/QuestionnaireScreen'
import InMindReportPage from './components/ResultsScreen'

// ── Loading Screen ────────────────────────────────────────────────────────────

const SCORING_PHASES = [
  '正在閱讀你的回答…',
  '分析情緒語意…',
  '對照 PERMA 模型…',
  '生成你的報告…',
]

function LoadingScreen() {
  const [phase, setPhase] = useState(0)
  const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    frameRef.current = setInterval(
      () => setPhase((p) => (p + 1) % SCORING_PHASES.length),
      1400,
    )
    return () => { if (frameRef.current) clearInterval(frameRef.current) }
  }, [])

  return (
    <div
      className="screen-enter"
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#fff',
      }}
    >
      <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 24 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed #EAEAEA',
            animation: 'spin360 12s linear infinite',
          }}
        />
        <img
          src="/assets/bagel.png"
          alt=""
          style={{
            position: 'absolute',
            inset: 14,
            width: 132,
            height: 132,
            objectFit: 'contain',
            animation: 'pulse 1.6s ease-in-out infinite',
            filter: 'drop-shadow(0 8px 16px rgba(201,148,99,.3))',
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: 'Inter',
          fontWeight: 700,
          letterSpacing: 1.6,
          color: '#E26D5C',
          marginBottom: 8,
        }}
      >
        ANALYZING · PERMA
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: -0.2,
          color: '#151515',
          marginBottom: 6,
        }}
      >
        {SCORING_PHASES[phase]}
      </div>
      <div style={{ fontSize: 12, color: '#959595' }}>大約再等 10 秒…</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#E26D5C',
              animation: `pulse 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
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

  return (
    <div
      className="inmind-scroll"
      style={{ minHeight: '100vh', background: '#fff' }}
    >
      {screen === 'landing' && <LandingPage onStart={handleStart} />}
      {screen === 'quiz' && (
        <NarrativeQuiz
          initialAnswers={answers}
          startAtLast={Boolean(apiError)}
          apiError={apiError}
          onSubmit={handleSubmit}
        />
      )}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'report' && report && (
        <InMindReportPage report={report} onRestart={handleRestart} />
      )}
    </div>
  )
}
