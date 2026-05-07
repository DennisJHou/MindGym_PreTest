import { useEffect, useRef, useState } from 'react'
import type { NarrativeAnswers } from '../types'
import { DIMENSION_CONFIGS, DIMENSION_ORDER } from '../types'

interface Props {
  initialAnswers: NarrativeAnswers
  startAtLast: boolean
  apiError: string
  onSubmit: (answers: NarrativeAnswers) => void
}

const MIN_CHARS = 30

export default function NarrativeQuiz({ initialAnswers, startAtLast, apiError, onSubmit }: Props) {
  const [step, setStep] = useState(startAtLast ? DIMENSION_ORDER.length - 1 : 0)
  const [answers, setAnswers] = useState<NarrativeAnswers>(initialAnswers)
  const [showHints, setShowHints] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const key = DIMENSION_ORDER[step]
  const cfg = DIMENSION_CONFIGS[key]
  const currentText = answers[key]
  const charCount = currentText.length
  const isEnough = charCount >= MIN_CHARS
  const isLast = step === DIMENSION_ORDER.length - 1
  const progress = (step / DIMENSION_ORDER.length) * 100

  useEffect(() => {
    textareaRef.current?.focus()
    setShowHints(false)
  }, [step])

  function handleChange(val: string) {
    setAnswers((prev) => ({ ...prev, [key]: val }))
  }

  function goNext() {
    if (isLast) {
      onSubmit(answers)
    } else {
      setStep((s) => s + 1)
    }
  }

  function goPrev() {
    if (step > 0) setStep((s) => s - 1)
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-5">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>第 {step + 1} 題，共 {DIMENSION_ORDER.length} 題</span>
          <span className={cfg.textColor}>{cfg.label}</span>
        </div>
        <div className="h-1 rounded-full bg-blue-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${cfg.gradientBar} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2">
        {DIMENSION_ORDER.map((k, i) => {
          const c = DIMENSION_CONFIGS[k]
          const isDone = i < step
          const isCurrent = i === step
          return (
            <div
              key={k}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300
                ${isCurrent ? `${c.bgMed} ${c.textColor} border-2 ${c.borderSolid} scale-110` : ''}
                ${isDone ? `${c.bgLight} ${c.textColor} border ${c.borderLight}` : ''}
                ${!isCurrent && !isDone ? 'bg-slate-100 text-slate-400 border border-slate-200' : ''}
              `}
            >
              {isDone ? '✓' : k}
            </div>
          )
        })}
      </div>

      {/* Question card */}
      <div
        key={step}
        className={`question-animate rounded-2xl border ${cfg.borderLight} ${cfg.bgLight} p-5 space-y-3`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cfg.icon}</span>
          <div>
            <span className={`text-xs font-bold uppercase tracking-widest ${cfg.textColor}`}>
              {cfg.sublabel}
            </span>
            <span className="text-slate-300 mx-2">·</span>
            <span className="text-slate-500 text-xs">{cfg.label}</span>
          </div>
        </div>

        <p className="text-base font-medium leading-relaxed text-slate-700">
          {cfg.question}
        </p>

        {/* Hints toggle */}
        <button
          type="button"
          onClick={() => setShowHints((v) => !v)}
          className={`
            flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
            ${showHints
              ? `${cfg.bgMed} ${cfg.textColor} border ${cfg.borderLight}`
              : `bg-white/70 text-slate-500 border border-slate-200 hover:${cfg.bgLight} hover:${cfg.textColor}`
            }
          `}
        >
          <span>{showHints ? '▾' : '▸'}</span>
          引導提示
        </button>

        {/* Hints list */}
        {showHints && (
          <div className="space-y-2 pt-1">
            {cfg.hints.map((hint, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={`text-xs font-bold mt-0.5 shrink-0 ${cfg.textColor}`}>{i + 1}.</span>
                <p className="text-slate-600 text-sm leading-relaxed">{hint}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={currentText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="請在這裡輸入你的故事或感受，越詳細越好～ AI 會根據你的描述進行深度測驗分析。"
          rows={6}
          className={`
            w-full rounded-xl bg-white border text-slate-700 placeholder-slate-300
            text-sm leading-relaxed p-4 resize-none outline-none transition-all duration-200 shadow-sm
            focus:ring-2 ${cfg.ring}
            ${isEnough ? cfg.borderSolid : 'border-slate-200'}
          `}
        />
        <div className="flex justify-between items-center px-1">
          <span className={`text-xs ${isEnough ? cfg.textColor : 'text-slate-400'}`}>
            {isEnough ? '✓ 字數足夠，可以繼續' : `至少需要 ${MIN_CHARS} 個字（還差 ${MIN_CHARS - charCount} 字）`}
          </span>
          <span className="text-xs text-slate-400 font-mono">{charCount}</span>
        </div>
      </div>

      {/* API Error */}
      {apiError && isLast && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-rose-600 text-sm">
          ⚠️ {apiError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-1">
        <button
          onClick={goPrev}
          disabled={step === 0}
          className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一題
        </button>

        <button
          onClick={goNext}
          disabled={!isEnough}
          className={`
            px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
            ${isEnough
              ? isLast
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-100'
                : `${cfg.bgLight} hover:${cfg.bgMed} ${cfg.textColor} border ${cfg.borderSolid}`
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }
          `}
        >
          {isLast ? '送出並生成報告 →' : '下一題 →'}
        </button>
      </div>
    </div>
  )
}
