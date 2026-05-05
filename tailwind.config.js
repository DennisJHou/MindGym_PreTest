/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    // Dimension text colours
    'text-amber-400', 'text-cyan-400', 'text-rose-400', 'text-violet-400', 'text-emerald-400',
    'text-amber-600', 'text-cyan-600', 'text-rose-600', 'text-violet-600', 'text-emerald-600',
    // Dimension bg colours (solid + translucent)
    'bg-amber-500', 'bg-cyan-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-amber-500/10', 'bg-cyan-500/10', 'bg-rose-500/10', 'bg-violet-500/10', 'bg-emerald-500/10',
    'bg-amber-500/20', 'bg-cyan-500/20', 'bg-rose-500/20', 'bg-violet-500/20', 'bg-emerald-500/20',
    // Dimension border colours
    'border-amber-500/30', 'border-cyan-500/30', 'border-rose-500/30', 'border-violet-500/30', 'border-emerald-500/30',
    'border-amber-500', 'border-cyan-500', 'border-rose-500', 'border-violet-500', 'border-emerald-500',
    // Gradient stops
    'from-amber-500', 'to-amber-300',
    'from-cyan-500',  'to-cyan-300',
    'from-rose-500',  'to-rose-300',
    'from-violet-500','to-violet-300',
    'from-emerald-500','to-emerald-300',
    // Button selected states
    'bg-amber-500', 'bg-cyan-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500',
    // Ring colours
    'ring-amber-500/50', 'ring-cyan-500/50', 'ring-rose-500/50', 'ring-violet-500/50', 'ring-emerald-500/50',
  ],
  theme: { extend: {} },
  plugins: [],
}
