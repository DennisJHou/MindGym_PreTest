// ── PERMA Dimension Keys ──────────────────────────────────────────────────────

export type DimensionKey = 'P' | 'E' | 'R' | 'M' | 'A'

export const DIMENSION_ORDER: DimensionKey[] = ['P', 'E', 'R', 'M', 'A']

// ── Dimension Display Config ──────────────────────────────────────────────────

export interface DimensionConfig {
  key: DimensionKey
  icon: string
  label: string        // e.g. '情緒存款'
  sublabel: string     // e.g. 'Positive Emotion'
  question: string     // Full narrative question
  textColor: string
  bgLight: string
  bgMed: string
  borderLight: string
  borderSolid: string
  gradientBar: string  // e.g. 'from-amber-500 to-amber-300'
  ring: string
}

// All class strings must be complete literals so Tailwind's safelist picks them up
export const DIMENSION_CONFIGS: Record<DimensionKey, DimensionConfig> = {
  P: {
    key: 'P',
    icon: '☀️',
    label: '情緒力',
    sublabel: 'Positive Emotion',
    question:
      '你還記得上一次開心是什麼時候嗎？請分享你上一次發自內心感到愉悅的經驗，越詳細越好～',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-500/10',
    bgMed: 'bg-amber-500/20',
    borderLight: 'border-amber-500/30',
    borderSolid: 'border-amber-500',
    gradientBar: 'from-amber-500 to-amber-300',
    ring: 'ring-amber-500/50',
  },
  E: {
    key: 'E',
    icon: '🌊',
    label: '投入力',
    sublabel: 'Engagement',
    question:
      '你曾經全神貫注的做一件事嗎？這件事情你經常做嗎？請分享你做這件事的經驗與感受～',
    textColor: 'text-cyan-600',
    bgLight: 'bg-cyan-500/10',
    bgMed: 'bg-cyan-500/20',
    borderLight: 'border-cyan-500/30',
    borderSolid: 'border-cyan-500',
    gradientBar: 'from-cyan-500 to-cyan-300',
    ring: 'ring-cyan-500/50',
  },
  R: {
    key: 'R',
    icon: '🧲',
    label: '連結力',
    sublabel: 'Relationships',
    question:
      '在你的生活中，有哪些人會在你需要時支持你？哪些人會讓你感覺他/她是愛你的？請分享他們愛你的方式或最讓你印象深刻的故事？',
    textColor: 'text-rose-600',
    bgLight: 'bg-rose-500/10',
    bgMed: 'bg-rose-500/20',
    borderLight: 'border-rose-500/30',
    borderSolid: 'border-rose-500',
    gradientBar: 'from-rose-500 to-rose-300',
    ring: 'ring-rose-500/50',
  },
  M: {
    key: 'M',
    icon: '🏔',
    label: '意義力',
    sublabel: 'Meaning',
    question:
      '你覺得你的生活是有目的、有意義的嗎？你通常都怎樣完成、實現你的生活的目的或意義？',
    textColor: 'text-violet-600',
    bgLight: 'bg-violet-500/10',
    bgMed: 'bg-violet-500/20',
    borderLight: 'border-violet-500/30',
    borderSolid: 'border-violet-500',
    gradientBar: 'from-violet-500 to-violet-300',
    ring: 'ring-violet-500/50',
  },
  A: {
    key: 'A',
    icon: '⚡',
    label: '成就力',
    sublabel: 'Accomplishment',
    question:
      '在過去三個月，哪些事件讓你感覺你離你的目標越來越近，或是越來越遠？',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-500/10',
    bgMed: 'bg-emerald-500/20',
    borderLight: 'border-emerald-500/30',
    borderSolid: 'border-emerald-500',
    gradientBar: 'from-emerald-500 to-emerald-300',
    ring: 'ring-emerald-500/50',
  },
}

// ── API Shapes ────────────────────────────────────────────────────────────────

export interface NarrativeAnswers {
  P: string
  E: string
  R: string
  M: string
  A: string
}

export interface PermaScores {
  P: number
  E: number
  R: number
  M: number
  A: number
}

export interface DimensionAnalysis {
  score_reason: string
  comment: string
  exercise_suggestion: string
}

export interface BalanceInfo {
  max_dim: DimensionKey
  min_dim: DimensionKey
  delta: number
  level: 'unbalanced' | 'moderate' | 'balanced'
  assessment: string
  advice: string
}

export interface PercentileInfo {
  general: number
  youth: number
}

export interface InMindReport {
  scores: PermaScores
  individual_analysis: Record<DimensionKey, DimensionAnalysis>
  total_score: number
  body_type: 'C' | 'I' | 'D'
  body_type_label: string
  body_type_context: string
  balance: BalanceInfo
  percentile: PercentileInfo
}

// ── App State ─────────────────────────────────────────────────────────────────

export type AppScreen = 'landing' | 'quiz' | 'loading' | 'report'
