"""
InMind — 心理健康的 InBody
FastAPI backend · POST /api/report
"""

import math
import os

import anthropic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from supabase import create_client, Client

app = FastAPI(title="InMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5176",
        "https://mind-gym-pre-test.vercel.app",
        "https://mindgym-pretest.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://wnkpndbkzunkjqkcsmae.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_KOs4bePZ_UJbmoChdG904Q_KlBYvgOe")
supabase = None
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase initialization failed: {e}")

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
    score_reason: str = Field(description="Evidence from the user text justifying the score (繁體中文, ≤60字)")
    comment: str = Field(description="Psychological commentary on this dimension, 精簡有力 (繁體中文, ≤60字)")
    exercise_suggestion: str = Field(description="Concrete actionable micro-exercise, 一句話說清楚 (繁體中文, ≤50字)")

class AllDimensionAnalysis(BaseModel):
    P: DimensionAnalysis
    E: DimensionAnalysis
    R: DimensionAnalysis
    M: DimensionAnalysis
    A: DimensionAnalysis

class CelebMatchResponse(BaseModel):
    name: str = Field(description="名人名字 (繁體中文)")
    description: str = Field(description="名人的簡短描述 (繁體中文, ≤50字)")
    reason: str = Field(description="為什麼這位名人最像你 (繁體中文, ≤100字)")

class ConstitutionAdviceResponse(BaseModel):
    weak_dim: str = Field(description="最弱的面向，一個英文字母: P/E/R/M/A")
    short_term_plan: str = Field(description="短期改善計畫 (2-4周) (繁體中文, ≤80字)")
    long_term_plan: str = Field(description="長期鍛鍊計畫 (3個月以上) (繁體中文, ≤100字)")
    daily_practice: str = Field(description="每日可執行的練習 (繁體中文, ≤60字)")

class AdvancedAnalysisResponse(BaseModel):
    complementary_dim: str = Field(description="與最弱面向互補的面向，一個英文字母: P/E/R/M/A")
    synergy_explanation: str = Field(description="兩個面向如何互補 (繁體中文, ≤80字)")
    next_step_action: str = Field(description="具體的下一步行動 (繁體中文, ≤80字)")
    partnership_profile: str = Field(description="什麼樣的人可以與你搭配，創造更多幸福 (繁體中文, ≤100字)")

class InMindLLMResponse(BaseModel):
    scores: PermaScores
    individual_analysis: AllDimensionAnalysis
    summary_sentence: str = Field(description="一句話概述使用者的整體幸福體質樣態，語氣溫暖有力，20-35字 (繁體中文)")
    celeb_match: CelebMatchResponse
    constitution_advice: ConstitutionAdviceResponse
    advanced_analysis: AdvancedAnalysisResponse

# ── System prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """你是 InMind，一位受過正向心理學訓練的 AI 心理評估師。
你的任務是根據使用者針對 PERMA 五個面向所分享的開放式敘事，客觀地評估每個面向的分數，並提供深度的個人化分析。

## 評分標準（1–5 分，以 0.1 分為單位）

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

## 額外任務

除了評分和個別分析外，你還需要提供：

1. **summary_sentence**：用一句話概述使用者的整體幸福體質樣態，語氣溫暖有力，20-35字

2. **celeb_match**：根據使用者的 PERMA 分數模式，找出一位與其特質最相似的名人（可跨文化，如企業家、藝術家、運動員等），說明理由

3. **constitution_advice**：識別最弱的面向，並提供：
   - 短期改善計畫（2-4週內可實施）
   - 長期鍛鍊計畫（3個月以上的持續練習）
   - 每日可執行的微型練習

4. **advanced_analysis**：分析最弱面向與哪個面向最互補，提供：
   - 兩個面向如何互補創造幸福的解釋
   - 具體的下一步行動建議
   - 什麼樣特質的人可以與使用者搭配，協同創造更多幸福

## 輸出規則

- 所有文字欄位使用**繁體中文**
- 保持溫暖、支持性的語調，不帶批判
- 確保所有建議都是切實可行且啟發性的"""

# ── Helper: body type ─────────────────────────────────────────────────────────

def compute_body_type(total: float) -> tuple[str, str, str]:
    """Returns (body_type, label, context)"""
    if total <= 10:
        return (
            "C",
            "棉花糖",
            "你目前的心理能量可能正處於高內耗的狀態，像棉花糖碰到水一樣，外在承擔了許多，但內部的核心支撐力還需要慢慢建立。現在最重要的是找到一個讓你感到安全的角落，讓自己先好好補充能量。",
        )
    elif total <= 17:
        return (
            "I",
            "吐司",
            "你的心理狀態中規中矩、結構穩定，能夠應付日常生活中的挑戰，但在面對更複雜的困境時，還有更多彈性可以被開發。就像一片吐司，加上不同的配料和鍛鍊，你可以變得更豐富有力。",
        )
    else:
        return (
            "D",
            "貝果",
            "你目前的心理狀態紮實而有韌性，像貝果一樣經得起外在壓力的考驗。五大指數都在高水位，你的心理核心肌力強健，具備高度的反脆弱性。繼續保持這份紮實，並將這股力量傳遞給身邊的人。",
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
            max_tokens=5000,
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

        response_data = {
            "scores": scores_dict,
            "individual_analysis": result.individual_analysis.model_dump(),
            "total_score": total,
            "body_type": body_type,
            "body_type_label": body_type_label,
            "body_type_context": body_type_context,
            "balance": balance,
            "percentile": percentile,
            "summary_sentence": result.summary_sentence,
            "celeb_match": result.celeb_match.model_dump(),
            "constitution_advice": result.constitution_advice.model_dump(),
            "advanced_analysis": result.advanced_analysis.model_dump(),
        }

        # Save to Supabase
        supabase_record = {
            "user_responses": answers.model_dump(),
            "score_p": scores_dict.get("P", 0),
            "score_e": scores_dict.get("E", 0),
            "score_r": scores_dict.get("R", 0),
            "score_m": scores_dict.get("M", 0),
            "score_a": scores_dict.get("A", 0),
            "total_score": total,
            "cid_type": body_type,
            "balance_status": balance.get("level", ""),
            "full_report": response_data
        }

        if supabase:
            try:
                db_res = supabase.table("reports").insert(supabase_record).execute()
                if len(db_res.data) > 0:
                    response_data["id"] = db_res.data[0].get("id")
            except Exception as db_err:
                # Supabase error, but don't fail the response
                print(f"Supabase insert failed: {db_err}")

        return response_data

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