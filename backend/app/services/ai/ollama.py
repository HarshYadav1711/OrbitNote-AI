import json
import logging

import httpx

from app.config import settings
from app.schemas.ai import ActionItem, AIActionsResult, AISummaryResult, AITitleResult
from app.services.ai.context import note_context_block

logger = logging.getLogger(__name__)


def _parse_json_response(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.rsplit("```", 1)[0].strip()
    return json.loads(text)


async def _generate(prompt: str) -> str | None:
    url = f"{settings.ollama_base_url.rstrip('/')}/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }
    try:
        async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
    except (httpx.HTTPError, json.JSONDecodeError) as exc:
        logger.debug("Ollama request failed: %s", exc)
        return None


async def is_available() -> bool:
    url = f"{settings.ollama_base_url.rstrip('/')}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(url)
            return response.status_code == 200
    except httpx.HTTPError:
        return False


async def generate_summary(
    content: str, title: str, category: str | None = None
) -> AISummaryResult | None:
    ctx = note_context_block(title, category)
    prompt = f"""You are a precise note assistant. Respond with valid JSON only — no markdown fences or commentary.

Task: Summarize the note for quick review.
Output schema: {{"summary": "one paragraph", "bullets": ["takeaway 1", "takeaway 2"]}}

Rules:
- summary: one tight paragraph, max 280 characters, factual only
- bullets: 2–4 distinct takeaways; omit if they repeat the summary
- Use only information present in the note; do not invent names, dates, or outcomes
- Match the tone of the note (meeting notes, journal, checklist, etc.)

{ctx}
---
{content[:6000]}
"""
    raw = await _generate(prompt)
    if not raw:
        return None
    try:
        data = _parse_json_response(raw)
        bullets = [str(b).strip() for b in data.get("bullets", []) if str(b).strip()][:4]
        summary = str(data.get("summary", "")).strip()
        if not summary:
            return None
        return AISummaryResult(summary=summary[:500], bullets=bullets)
    except (json.JSONDecodeError, KeyError, TypeError):
        return None


async def extract_actions(
    content: str, title: str, category: str | None = None
) -> AIActionsResult | None:
    ctx = note_context_block(title, category)
    prompt = f"""You are a precise note assistant. Respond with valid JSON only — no markdown fences or commentary.

Task: Extract actionable tasks from the note.
Output schema: {{"items": [{{"text": "clear imperative task", "done": false}}]}}

Rules:
- Only tasks explicitly stated or strongly implied in the note
- Each text: short and actionable; start with a verb when natural
- Set done to true only if the note shows completion ([x], "done", "completed")
- Max 12 items; return an empty items array if none found
- Skip vague observations that are not tasks

{ctx}
---
{content[:6000]}
"""
    raw = await _generate(prompt)
    if not raw:
        return None
    try:
        data = _parse_json_response(raw)
        items = []
        for entry in data.get("items", []):
            if isinstance(entry, str):
                text = entry.strip()
            else:
                text = str(entry.get("text", "")).strip()
            if text:
                done = bool(entry.get("done")) if isinstance(entry, dict) else False
                items.append(ActionItem(text=text[:200], done=done))
        return AIActionsResult(items=items[:12])
    except (json.JSONDecodeError, KeyError, TypeError):
        return None


async def suggest_title(
    content: str, current_title: str, category: str | None = None
) -> AITitleResult | None:
    ctx = note_context_block(current_title, category)
    prompt = f"""You are a precise note assistant. Respond with valid JSON only — no markdown fences or commentary.

Task: Suggest a specific, scannable note title.
Output schema: {{"title": "suggested title"}}

Rules:
- Max 80 characters
- Specific to the main topic — avoid generic titles ("Notes", "Meeting", "Untitled")
- No quotes, emojis, or trailing punctuation
- Ground the title in the note content; refine the current title if it is vague

{ctx}
---
{content[:4000]}
"""
    raw = await _generate(prompt)
    if not raw:
        return None
    try:
        data = _parse_json_response(raw)
        title = str(data.get("title", "")).strip()
        if not title or title.lower() == "untitled":
            return None
        return AITitleResult(title=title[:80])
    except (json.JSONDecodeError, KeyError, TypeError):
        return None
