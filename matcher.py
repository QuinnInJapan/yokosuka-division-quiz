"""
Yokosuka Division Quiz — Matching Algorithm

Input:  responses dict {question_id: rating (1–5)}
Output: top-N divisions with fit percentage

Axes (each scored –2 to +2):
  A: 人 ↔ 制度   (People vs. Systems)
  B: 現場 ↔ 企画 (Execution vs. Strategy)
  C: 支援 ↔ 規制 (Support vs. Regulation)
  D: 維持 ↔ 革新 (Maintenance vs. Innovation)
  E: 一般 ↔ 専門 (Generalist vs. Specialist)
"""

import json
import math
from pathlib import Path

BASE = Path(__file__).parent

with open(BASE / "questions.json") as f:
    QUESTIONS = {q["id"]: q for q in json.load(f)["questions"]}

with open(BASE / "divisions.json") as f:
    DIVISIONS = json.load(f)["divisions"]

AXES = ["A", "B", "C", "D", "E"]

# Max possible Euclidean distance in 5D space where each axis range is [-2, 2]
MAX_DIST = math.sqrt(5 * (4 ** 2))  # sqrt(80) ≈ 8.944


def score_response(rating: int, reversed: bool) -> float:
    """Map Likert rating 1–5 to axis value –2 to +2."""
    value = rating - 3  # 1→-2, 2→-1, 3→0, 4→+1, 5→+2
    return -value if reversed else value


def compute_axis_scores(responses: dict[str, int]) -> dict[str, float]:
    """
    responses: {question_id: rating (1–5)}
    Returns: {axis: mean_score} for each axis
    """
    axis_scores: dict[str, list[float]] = {ax: [] for ax in AXES}

    for qid, rating in responses.items():
        if qid not in QUESTIONS:
            raise ValueError(f"Unknown question id: {qid}")
        q = QUESTIONS[qid]
        score = score_response(rating, q["reversed"])
        axis_scores[q["axis"]].append(score)

    # Mean per axis; missing axis defaults to 0
    return {
        ax: (sum(scores) / len(scores) if scores else 0.0)
        for ax, scores in axis_scores.items()
    }


def euclidean_distance(user: dict[str, float], division: dict) -> float:
    return math.sqrt(sum((user[ax] - division[ax]) ** 2 for ax in AXES))


def fit_percent(distance: float) -> float:
    return round((1 - distance / MAX_DIST) * 100, 1)


def match(responses: dict[str, int], top_n: int = 3) -> list[dict]:
    """
    Returns top_n divisions sorted by fit (highest first).

    Each result:
      dept      — parent department
      name      — division name (課)
      en        — English name
      fit       — fit percentage (0–100)
      axis_scores — user's axis scores for reference
      profile   — division's axis profile
    """
    user_scores = compute_axis_scores(responses)

    ranked = []
    for div in DIVISIONS:
        dist = euclidean_distance(user_scores, div)
        ranked.append({
            "dept":        div["dept"],
            "name":        div["name"],
            "en":          div["en"],
            "fit":         fit_percent(dist),
            "distance":    round(dist, 4),
            "axis_scores": {ax: round(user_scores[ax], 2) for ax in AXES},
            "profile":     {ax: div[ax] for ax in AXES},
        })

    ranked.sort(key=lambda x: x["distance"])
    return ranked[:top_n]


# ── Demo ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Example: someone who is people-oriented, execution-focused,
    # supportive, stable, and a generalist
    demo_responses = {
        "A1": 5, "A2": 5, "A3": 1, "A4": 1,  # strongly 人
        "B1": 5, "B2": 5, "B3": 1, "B4": 1,  # strongly 現場
        "C1": 5, "C2": 5, "C3": 1, "C4": 1,  # strongly 支援
        "D1": 5, "D2": 5, "D3": 1, "D4": 1,  # strongly 維持
        "E1": 5, "E2": 5, "E3": 1, "E4": 1,  # strongly 一般
    }

    results = match(demo_responses, top_n=3)

    print("=== Top 3 Matches ===\n")
    for i, r in enumerate(results, 1):
        print(f"#{i}  {r['dept']} {r['name']}")
        print(f"    {r['en']}")
        print(f"    Fit: {r['fit']}%")
        print(f"    User:     A={r['axis_scores']['A']:+.1f}  B={r['axis_scores']['B']:+.1f}  "
              f"C={r['axis_scores']['C']:+.1f}  D={r['axis_scores']['D']:+.1f}  E={r['axis_scores']['E']:+.1f}")
        print(f"    Division: A={r['profile']['A']:+d}  B={r['profile']['B']:+d}  "
              f"C={r['profile']['C']:+d}  D={r['profile']['D']:+d}  E={r['profile']['E']:+d}")
        print()
