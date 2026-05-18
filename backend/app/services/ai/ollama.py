import json
import logging

import httpx

from app.config import settings
from app.schemas.ai import ActionItem, AIActionsResult, AISummaryResult, AITitleResult

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


async def generate_summary(content: str, title: str) -> AISummaryResult | None:
    prompt = f"""Summarize the note below as JSON only.
Return: {{"summary": "one concise paragraph", "bullets": ["key point 1", "key point 2"]}}
Keep summary under 280 characters. Max 4 bullets. Be factual; do not invent details.

Title: {title or "Untitled"}
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


async def extract_actions(content: str) -> AIActionsResult | None:
    prompt = f"""Extract action items from the note below as JSON only.
Return: {{"items": [{{"text": "action description", "done": false}}]}}
Only include tasks explicitly stated or clearly implied. Max 12 items. No fluff.

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


async def suggest_title(content: str, current_title: str) -> AITitleResult | None:
    prompt = f"""Suggest a short note title from the content below as JSON only.
Return: {{"title": "suggested title"}}
Title must be under 80 characters, specific, and grounded in the content. No quotes or emojis.

Current title: {current_title or "Untitled"}
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
