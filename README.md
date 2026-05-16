# InMind — 心理健康的 InBody

A positive-psychology assessment app that scores your well-being across the **PERMA** five dimensions and generates a personalized psychological report.

Live demo: [mind-gym-pre-test.vercel.app](https://mind-gym-pre-test.vercel.app)

---

## What It Does

Users answer five open-ended narrative questions — one per PERMA dimension (Positive Emotion, Engagement, Relationships, Meaning, Accomplishment). Claude AI reads the narratives, scores each dimension 1–5, and assembles a full report that includes:

- Radar chart of PERMA scores
- **Psychological body type** — 棉花糖 / 吐司 / 貝果 (based on total score)
- Per-dimension analysis: scoring rationale, psychological commentary, micro-exercise
- Balance assessment and targeted improvement plan
- Population percentile (general & youth cohort)
- Celebrity archetype match from a fixed pool of 10 Taiwanese public figures

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| AI | Anthropic Claude (`claude-sonnet-4-5`) via structured output |
| Database | Supabase (stores every report) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

---

## Project Structure

```
├── src/
│   ├── App.tsx                  # Screen router + API call
│   ├── components/
│   │   ├── IntroScreen.tsx      # Landing page
│   │   ├── QuestionnaireScreen.tsx  # PERMA narrative quiz
│   │   └── ResultsScreen.tsx    # Full report UI
│   ├── data/                    # Static data / question copy
│   └── types/                   # TypeScript interfaces
├── app.py                       # FastAPI backend (single file)
├── public/assets/               # Images (logo, celebrity photos, food icons)
└── vercel.json                  # Proxies /api/* → Render backend
```

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- An Anthropic API key

### Frontend

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy and fill in credentials
cp .env.example .env   # set ANTHROPIC_API_KEY (and optionally SUPABASE_URL / SUPABASE_KEY)

python app.py
# → http://localhost:8000
```

The frontend reads `VITE_API_URL` to locate the backend. For local full-stack development, create `.env.local` in the project root:

```
VITE_API_URL=http://localhost:8000
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_KEY` | No | Supabase publishable key |
| `PORT` | No | HTTP port (default `8000`, set by Render automatically) |

### Frontend (`.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `""` (same origin) | Backend base URL |

---

## API

### `POST /api/report`

**Request body**

```json
{
  "P": "描述你最近感受到正向情緒的經驗…",
  "E": "描述你最近完全投入一件事的經驗…",
  "R": "描述你與重要他人的關係狀態…",
  "M": "描述你感受到生命意義的時刻…",
  "A": "描述你最近完成某件事的成就感…"
}
```

Each field must be at least 10 characters. Returns the full `InMindReport` object on success.

---

## Deployment

The project ships as two separate services:

- **Vercel** hosts the static React build. `vercel.json` rewrites `/api/*` to the Render backend URL so the frontend never needs CORS configuration in production.
- **Render** runs `uvicorn app:app` as a web service. Set the environment variables listed above in the Render dashboard.

---

## PERMA Model

Based on Martin Seligman's *Flourish* (2011). Each dimension is scored by the AI on four axes: intensity, frequency, granularity, and emotional tone. Scores are aggregated into a 5–25 total that maps to a psychological body type — a metaphor borrowed from the body composition concept in sports science.
