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
          PSY by PSY 心理健身房｜免費測驗活動
        </p>
      </div>

      {/* What you'll get */}
      <div className="w-full rounded-2xl bg-indigo-50 border border-indigo-200 shadow-sm p-6 space-y-4">
        <p className="text-indigo-900 text-sm font-semibold text-center">測驗完成後，你會獲得：</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">🧬</span>
            <div className="flex-1">
              <p className="text-slate-800 text-xs font-medium">幸福體質分析</p>
              <p className="text-slate-600 text-xs">了解自己的心理體型與幸福特質</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">⭐</span>
            <div className="flex-1">
              <p className="text-slate-800 text-xs font-medium">明星配對</p>
              <p className="text-slate-600 text-xs">發現與你最相似的名人是誰</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">📊</span>
            <div className="flex-1">
              <p className="text-slate-800 text-xs font-medium">五大指數排名</p>
              <p className="text-slate-600 text-xs">看見你的強項與需要加強的面向</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none mt-0.5">💡</span>
            <div className="flex-1">
              <p className="text-slate-800 text-xs font-medium">個性化建議</p>
              <p className="text-slate-600 text-xs">得到專為你量身訂做的提升方案</p>
            </div>
          </div>
        </div>
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
        開始心理測驗
      </button>

      <p className="text-slate-400 text-xs text-center pb-2">
        約需 3 分鐘 · 共 5 題開放式問答 · 完全匿名
      </p>
    </div>
  )
}
