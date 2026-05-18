import re

from app.schemas.ai import ActionItem, AIActionsResult, AISummaryResult, AITitleResult

_ACTION_PREFIXES = re.compile(
    r"^(\s*[-*]\s*(\[[ xX]\]\s*)?|(\d+[\.\)]\s*)|(todo|action|task)\s*:\s*)",
    re.IGNORECASE,
)
_ACTION_HINTS = re.compile(
    r"\b(need to|should|must|will|plan to|remember to|follow up|schedule|send|call|"
    r"email|review|finish|complete|prepare|update|create|fix|implement)\b",
    re.IGNORECASE,
)
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _lines(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if line.strip()]


def _first_paragraph(text: str) -> str:
    blocks = [b.strip() for b in re.split(r"\n\s*\n", text.strip()) if b.strip()]
    return blocks[0] if blocks else text.strip()


def _truncate(text: str, max_len: int) -> str:
    text = text.strip()
    if len(text) <= max_len:
        return text
    cut = text[: max_len - 1].rsplit(" ", 1)[0]
    return (cut or text[: max_len - 1]).rstrip() + "…"


def generate_summary(content: str, title: str) -> AISummaryResult:
    text = content.strip()
    if not text:
        return AISummaryResult(summary="No content to summarize yet.", bullets=[])

    paragraph = _first_paragraph(text)
    summary = _truncate(paragraph, 280)

    sentences = [s.strip() for s in _SENTENCE_SPLIT.split(paragraph) if len(s.strip()) > 12]
    bullets: list[str] = []
    for sentence in sentences[1:4]:
        bullets.append(_truncate(sentence, 120))
    if not bullets and len(sentences) == 1 and len(text) > len(paragraph):
        for line in _lines(text)[1:4]:
            bullets.append(_truncate(line, 120))

    if title and title.strip().lower() not in ("untitled", ""):
        bullets = [_truncate(f"Note: {title.strip()}", 80), *bullets[:2]]

    return AISummaryResult(summary=summary, bullets=bullets[:4])


def extract_actions(content: str) -> AIActionsResult:
    items: list[ActionItem] = []
    seen: set[str] = set()

    for line in _lines(content):
        cleaned = _ACTION_PREFIXES.sub("", line).strip()
        if not cleaned:
            continue
        is_explicit = bool(_ACTION_PREFIXES.match(line))
        has_hint = bool(_ACTION_HINTS.search(cleaned))
        if not is_explicit and not has_hint:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        items.append(ActionItem(text=_truncate(cleaned, 200)))

    return AIActionsResult(items=items[:12])


def suggest_title(content: str, current_title: str) -> AITitleResult:
    lines = _lines(content)
    for line in lines:
        if 4 <= len(line) <= 80 and not line.endswith(":"):
            return AITitleResult(title=line)

    words = re.sub(r"\s+", " ", content.strip()).split()
    if words:
        title = " ".join(words[:8])
        return AITitleResult(title=_truncate(title, 80).rstrip("…"))

    if current_title.strip() and current_title.strip().lower() != "untitled":
        return AITitleResult(title=current_title.strip())

    return AITitleResult(title="Untitled")
