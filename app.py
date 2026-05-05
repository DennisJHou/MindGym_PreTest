"""
InMind — 心理健康的 InBody
FastAPI backend · POST /api/report
"""

import math

import anthropic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

app = FastAPI(title="InMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()

# ── Request body ──────────────────────────────────────────────────────────────

class NarrativeAnswers(BaseModel):
    P: str = Field(description="Positive Emotion narrative")
    E: str = Field(description="Engagement narrative")
    R: str = Field(description="Relationships narrative")
    M: str = Field(description="Meaning narrative")
    A: str = Field(description="Accomplishment narrative")

# ── LLM output schema ─────────────────────────────────────────────────────────

class PermaScores(BaseModel):
    P: float = Field(ge=1, le=5, description="Positive Emotion score 1-5")
    E: float = Field(ge=1, le=5, description="Engagement score 1-5")
    R: float = Field(ge=1, le=5, description="Relationships score 1-5")
    M: float = Field(ge=1, le=5, description="Meaning score 1-5")
    A: float = Field(ge=1, le=5, description="Accomplishment score 1-5")

class DimensionAnalysis(BaseModel):
    score_reason: str = Field(description="Evidence from the user text justifying the score (繁體中文, ≤80字)")
    comment: str = Field(description="Psychological commentary on this dimension (繁體中文, ≤100字)")
    exercise_suggestion: str = Field(description="Concrete actionable micro-exercise (繁體中文, ≤80字)")

class AllDimensionAnalysis(BaseModel):
    P: DimensionAnalysis
    E: DimensionAnalysis
    R: DimensionAnalysis
    M: DimensionAnalysis
    A: DimensionAnalysis

class InMindLLMResponse(BaseModel):
    scores: PermaScores
    individual_analysis: AllDimensionAnalysis

# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """你是 InMind，一位受過正向心理學訓練的 AI 心理評估師。
你的任務是根據使用者針對 PERMA 五個面向所分享的開放式敘事，客觀地評估每個面向的分數。

## 評分標準（1–5 分，可給 0.5 分）

每個面向請從四個維度綜合評估：
1. **強度（Intensity）**：敘述中情緒/體驗的深度與鮮明程度
2. **頻率（Frequency）**：描述的事件或狀態是否經常發生
3. **細節度（Granularity）**：具體描述越豐富，代表真實體驗越深刻
4. **情感基調（Tone）**：正向、中性或負向的整體語氣

## 評分尺度

- 1.0：幾乎沒有此面向，或明確描述缺乏
- 2.0：偶爾出現，整體偏低，體驗稀薄
- 3.0：中等程度，有感受但不算深刻
- 4.0：明顯感受，狀態良好，描述具體生動
- 5.0：非常強烈，此面向蓬勃豐盛，細節豐富充沛

## 輸出規則

- 所有文字欄位使用**繁體中文**
- score_reason：引用使用者文字中的具體線索支持評分
- comment：提供心理學角度的洞察與解讀
- exercise_suggestion：給出一個今天就能執行的微型心理練習
- 保持溫暖、支持性的語調，不帶批判"""

# ── Helper: body type ─────────────────────────────────────────────────────────

def compute_body_type(total: float) -> tuple[str, str, str]:
    """Returns (body_type, label, context)"""
    if total <= 10:
        return (
            "C",
            "C 型 ── 充電期",
            "你目前的心理幸福感能量較低，可能正處於疲憊、迷茫或復原的階段。這不代表你不夠努力——有時候，放慢腳步本身就是一種勇氣。現在最重要的是找到一個讓你感到安全、舒適的角落，讓自己先充電。",
        )
    elif total <= 17:
        return (
            "I",
            "I 型 ── 穩定期",
            "你的心理狀態整體平穩，有一定的幸福資源基礎，但各面向仍有成長的空間。就像肌力訓練一樣，穩定是進步的起點——只要持續練習，你的內在幸福力會越來越強。",
        )
    else:
        return (
            "D",
            "D 型 ── 蓬勃期",
            "你目前的心理幸福感豐厚而充實！五大指數都在高水位，你正處於一個積極、有活力的人生階段。繼續保持，並留意將這份能量傳遞給身邊的人。",
        )

# ── Helper: balance ───────────────────────────────────────────────────────────

_DIM_LABELS = {"P": "情緒力", "E": "投入力", "R": "連結力", "M": "意義力", "A": "成就力"}

def compute_balance(scores: dict) -> dict:
    max_dim = max(scores, key=lambda k: scores[k])
    min_dim = min(scores, key=lambda k: scores[k])
    delta = round(scores[max_dim] - scores[min_dim], 2)

    if delta > 2:
        level = "unbalanced"
        assessment = f"你的「{_DIM_LABELS[max_dim]}」與「{_DIM_LABELS[min_dim]}」之間落差達 {delta:.1f} 分，顯示五大指數分佈較不均衡，部分面向需要優先強化。"
        advice = f"建議優先關注「{_DIM_LABELS[min_dim]}」，每天花 5 分鐘進行一個針對此面向的微型練習，持續累積就會看到變化。"
    elif delta >= 1:
        level = "moderate"
        assessment = f"各指數之間有一定落差（{delta:.1f} 分），整體均衡度中等。「{_DIM_LABELS[min_dim]}」仍有明顯的成長空間。"
        advice = f"試著在本週為「{_DIM_LABELS[min_dim]}」安排一項具體的小行動，讓五大指數更趨均衡發展。"
    else:
        level = "balanced"
        assessment = f"你的五大指數分佈相當均衡，最大差距僅 {delta:.1f} 分。心理幸福力的各個面向發展健康而全面。"
        advice = "繼續維持這樣均衡的生活型態！均衡的心理幸福力往往比單一面向的高峰更加持久且穩健。"

    return {
        "max_dim": max_dim,
        "min_dim": min_dim,
        "delta": delta,
        "level": level,
        "assessment": assessment,
        "advice": advice,
    }

# ── Helper: percentile (mock normal distribution) ─────────────────────────────

def _normal_cdf(x: float, mu: float, sigma: float) -> float:
    """Standard normal CDF approximation using math.erf."""
    return 0.5 * (1 + math.erf((x - mu) / (sigma * math.sqrt(2))))

def compute_percentile(total: float) -> dict:
    # General population: μ=14, σ=3.5  (scale 5–25)
    general_pr = round(_normal_cdf(total, mu=14.0, sigma=3.5) * 100)
    # Youth population (18-35): slightly lower μ=13, σ=3.8
    youth_pr = round(_normal_cdf(total, mu=13.0, sigma=3.8) * 100)

    return {
        "general": max(1, min(99, general_pr)),
        "youth": max(1, min(99, youth_pr)),
    }

# ── Route ─────────────────────────────────────────────────────────────────────

@app.post("/api/report")
async def generate_report(answers: NarrativeAnswers):
    # Validate minimum content
    for field, text in answers.model_dump().items():
        if len(text.strip()) < 10:
            return JSONResponse(
                content={"error": f"「{_DIM_LABELS[field]}」的回答過短，請提供更多描述。"},
                status_code=400,
            )

    user_content = f"""以下是使用者針對 PERMA 五個面向所分享的敘事：

【P — 正向情緒】
{answers.P}

【E — 投入／心流】
{answers.E}

【R — 人際關係】
{answers.R}

【M — 意義感】
{answers.M}

【A — 成就感】
{answers.A}

請根據以上敘事，評估每個面向的分數（1–5 分），並為每個面向提供評分依據、心理解析與心理練習建議。"""

    try:
        response = client.messages.parse(
            model="claude-sonnet-4-5",
            max_tokens=3000,
            temperature=0.2,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
            output_format=InMindLLMResponse,
        )

        result = response.parsed_output
        if result is None:
            return JSONResponse(
                content={"error": "AI 回應解析失敗，請稍後重試"},
                status_code=500,
            )

        scores_dict = result.scores.model_dump()
        total = round(sum(scores_dict.values()), 2)

        body_type, body_type_label, body_type_context = compute_body_type(total)
        balance = compute_balance(scores_dict)
        percentile = compute_percentile(total)

        return {
            "scores": scores_dict,
            "individual_analysis": result.individual_analysis.model_dump(),
            "total_score": total,
            "body_type": body_type,
            "body_type_label": body_type_label,
            "body_type_context": body_type_context,
            "balance": balance,
            "percentile": percentile,
        }

    except anthropic.AuthenticationError:
        return JSONResponse(
            content={"error": "API 金鑰無效，請檢查 ANTHROPIC_API_KEY 環境變數"},
            status_code=401,
        )
    except anthropic.RateLimitError:
        return JSONResponse(
            content={"error": "請求過於頻繁，請稍後再試"},
            status_code=429,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": f"分析失敗：{str(e)}"},
            status_code=500,
        )

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    # 讀取 Render 分配的 PORT，找不到則預設 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)