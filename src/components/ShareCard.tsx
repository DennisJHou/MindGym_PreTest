import { forwardRef } from 'react'
import type { InMindReport } from '../types'
import { DIMENSION_CONFIGS, DIMENSION_ORDER } from '../types'

interface Props {
  report: InMindReport
}

const BODY_TYPE_META = {
  C: { emoji: '🍡', name: '棉花糖', trait: '高內耗・低核心力', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
  I: { emoji: '🍞', name: '吐司',   trait: '功能正常・缺乏彈性', color: '#d97706', bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)' },
  D: { emoji: '🥯', name: '貝果',   trait: '高核心力・低內耗', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
}

const SCORE_COLORS: Record<string, string> = {
  P: '#d97706',
  E: '#0891b2',
  R: '#e11d48',
  M: '#7c3aed',
  A: '#059669',
}

const ShareCard = forwardRef<HTMLDivElement, Props>(({ report }, ref) => {
  const { scores, total_score, body_type, celeb_match, summary_sentence } = report
  const meta = BODY_TYPE_META[body_type]

  return (
    <div
      ref={ref}
      style={{
        width: 390,
        height: 693,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        fontFamily: '-apple-system, "PingFang TC", "Noto Sans TC", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 28px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -40, left: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, zIndex: 1 }}>
        <span style={{ fontSize: 14, color: '#818cf8', fontWeight: 700, letterSpacing: '0.1em' }}>PSY by PSY</span>
        <span style={{ color: '#334155', fontSize: 12 }}>·</span>
        <span style={{ fontSize: 12, color: '#64748b', letterSpacing: '0.05em' }}>InMind 心理健康報告</span>
      </div>

      {/* Body type — main hero */}
      <div style={{ textAlign: 'center', marginBottom: 16, zIndex: 1 }}>
        <div style={{ fontSize: 72, lineHeight: 1.1, marginBottom: 8 }}>{meta.emoji}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.15em', marginBottom: 4 }}>我的心理體型</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: meta.color, letterSpacing: '0.02em' }}>{meta.name}</div>
        <div style={{
          display: 'inline-block', marginTop: 6,
          padding: '3px 12px', borderRadius: 20,
          background: meta.bg, border: `1px solid ${meta.border}`,
          fontSize: 11, color: meta.color, fontWeight: 600,
        }}>
          {meta.trait}
        </div>
      </div>

      {/* Summary sentence */}
      <div style={{
        width: '100%', marginBottom: 14,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1,
      }}>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: 12, lineHeight: 1.7, textAlign: 'center' }}>
          {summary_sentence}
        </p>
      </div>

      {/* Celebrity match */}
      <div style={{
        width: '100%', marginBottom: 16,
        padding: '10px 14px',
        background: 'rgba(99,102,241,0.12)',
        borderRadius: 12, border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 1,
      }}>
        <span style={{ fontSize: 24 }}>🎬</span>
        <div>
          <div style={{ fontSize: 10, color: '#a5b4fc', letterSpacing: '0.1em', marginBottom: 2 }}>⭐ 與我最相似的名人</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0' }}>{celeb_match.name}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{celeb_match.description}</div>
        </div>
      </div>

      {/* PERMA scores */}
      <div style={{ width: '100%', marginBottom: 16, zIndex: 1 }}>
        <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.12em', marginBottom: 8, textAlign: 'center' }}>
          PERMA 五大幸福指數
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DIMENSION_ORDER.map(key => {
            const cfg = DIMENSION_CONFIGS[key]
            const score = scores[key]
            const pct = ((score - 1) / 4) * 100
            const color = SCORE_COLORS[key]
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{cfg.icon}</span>
                <span style={{ fontSize: 10, color: '#94a3b8', width: 36 }}>{cfg.label}</span>
                <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 99,
                    background: color, minWidth: 4,
                  }} />
                </div>
                <span style={{ fontSize: 11, color, fontWeight: 700, fontVariantNumeric: 'tabular-nums', width: 24, textAlign: 'right' }}>
                  {score.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total score */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 4,
        marginBottom: 20, zIndex: 1,
      }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>幸福指數總分</span>
        <span style={{ fontSize: 28, fontWeight: 900, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
          {total_score.toFixed(1)}
        </span>
        <span style={{ fontSize: 13, color: '#475569' }}>/ 25</span>
      </div>

      {/* Footer CTA */}
      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1,
      }}>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 4 }} />
        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em' }}>
          了解你的心理體質
        </span>
        <span style={{ fontSize: 10, color: '#475569' }}>psybypsy.com · InMind 心理健身房測驗</span>
      </div>
    </div>
  )
})

ShareCard.displayName = 'ShareCard'
export default ShareCard
