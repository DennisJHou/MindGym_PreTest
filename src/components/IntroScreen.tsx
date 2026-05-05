import { DIMENSION_CONFIGS, DIMENSION_ORDER } from '../types'

interface Props {
  onStart: () => void
}

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="intro-animate w-full max-w-lg flex flex-col items-center gap-8 px-2">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-5xl mb-2">🧠</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
          InMind
          <br />
          心理健康的 InBody
        </h1>
        <p className="text-indigo-500 text-sm font-medium tracking-wide">
          PSY by PSY 心理健身房｜免費檢測活動
        </p>
      </div>

      {/* Marketing copy */}
      <div className="w-full rounded-2xl bg-white border border-blue-100 shadow-sm p-6 space-y-3">
        <p className="text-slate-600 text-sm leading-relaxed">
          身體的組成有虛胖和精壯，<strong className="text-slate-800">心理幸福感也一樣！</strong>
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          讀懂心理 InBody，才能更加靠近你自己！
        </p>
        <p className="text-indigo-500 text-sm font-medium">
          用三分鐘，測量你的內在幸福力～
        </p>
      </div>

      {/* PERMA dimension cards */}
      <div className="w-full space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-400 pl-1">測量五大心理指數</p>
        {DIMENSION_ORDER.map((key) => {
          const cfg = DIMENSION_CONFIGS[key]
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white border ${cfg.borderLight} shadow-sm`}
            >
              <span className="text-xl">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <span className={`font-semibold text-sm ${cfg.textColor}`}>{cfg.label}</span>
                <span className="text-slate-400 text-xs ml-2">{cfg.sublabel}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bgMed} ${cfg.textColor} border ${cfg.borderLight} font-mono font-bold`}>
                {key}
              </span>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors font-bold text-white tracking-wide shadow-lg shadow-indigo-200 text-base"
      >
        開始心理檢測
      </button>

      <p className="text-slate-400 text-xs text-center pb-2">
        約需 3 分鐘 · 共 5 題開放式問答 · 完全匿名
      </p>
    </div>
  )
}
