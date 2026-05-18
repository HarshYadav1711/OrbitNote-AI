import re

from app.schemas.ai import ActionItem, AIActionsResult, AISummaryResult, AITitleResult
from app.services.ai.context import normalize_category

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
_HEADING = re.compile(r"^#{1,3}\s+(.+)$")
_LIST_ITEM = re.compile(r"^[-*]\s+(?!\[[ xX]\])(.+)$")


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


def _sentence_case(text: str) -> str:
    text = text.strip()
    if not text:
        return text
    return text[0].upper() + text[1:]


def _heading_bullets(text: str) -> list[str]:
    bullets: list[str] = []
    for line in _lines(text):
        match = _HEADING.match(line)
        if match:
            heading = match.group(1).strip()
            if 3 < len(heading) <= 120:
                bullets.append(_truncate(heading, 120))
        if len(bullets) >= 3:
            break
    return bullets


def _list_bullets(text: str) -> list[str]:
    bullets: list[str] = []
    for line in _lines(text):
        match = _LIST_ITEM.match(line)
        if match:
            item = match.group(1).strip()
            if len(item) > 8 and not _ACTION_HINTS.search(item):
                bullets.append(_truncate(item, 120))
        if len(bullets) >= 3:
            break
    return bullets


def generate_summary(
    content: str, title: str, category: str | None = None
) -> AISummaryResult:
    text = content.strip()
    cat = normalize_category(category)
    if not text:
        return AISummaryResult(
            summary="Add some content to your note and try again.", bullets=[]
        )

    paragraph = _first_paragraph(text)
    summary = _sentence_case(_truncate(paragraph, 280))

    bullets = _heading_bullets(text) or _list_bullets(text)
    if not bullets:
        sentences = [
            s.strip() for s in _SENTENCE_SPLIT.split(paragraph) if len(s.strip()) > 12
        ]
        for sentence in sentences[1:4]:
            bullets.append(_truncate(sentence, 120))
        if not bullets and len(sentences) == 1 and len(text) > len(paragraph):
            for line in _lines(text)[1:4]:
                bullets.append(_truncate(line, 120))

    if cat:
        bullets = [f"Category: {cat}", *bullets[:3]]
    elif title and title.strip().lower() not in ("untitled", ""):
        bullets = [f"About: {title.strip()}", *bullets[:3]]

    return AISummaryResult(summary=summary, bullets=bullets[:4])


def extract_actions(content: str, title: str, category: str | None = None) -> AIActionsResult:
    _ = title, category
    explicit: list[ActionItem] = []
    implied: list[ActionItem] = []
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
        item = ActionItem(text=_sentence_case(_truncate(cleaned, 200)))
        if is_explicit:
            explicit.append(item)
        else:
            implied.append(item)

    items = (explicit + implied)[:12]
    return AIActionsResult(items=items)


def suggest_title(
    content: str, current_title: str, category: str | None = None
) -> AITitleResult:
    cat = normalize_category(category)
    lines = _lines(content)

    for line in lines:
        heading = _HEADING.match(line)
        if heading:
            candidate = heading.group(1).strip()
            if 4 <= len(candidate) <= 80:
                return AITitleResult(title=candidate)

    for line in lines:
        if line.startswith("#"):
            continue
        if 4 <= len(line) <= 80 and not line.endswith(":"):
            if not line.isupper() or len(line) > 40:
                return AITitleResult(title=line)

    words = re.sub(r"\s+", " ", content.strip()).split()
    if words and cat:
        topic = " ".join(words[:6])
        candidate = f"{cat}: {topic}"
        return AITitleResult(title=_truncate(candidate, 80).rstrip("…"))

    if words:
        title = " ".join(words[:8])
        return AITitleResult(title=_truncate(title, 80).rstrip("…"))

    if current_title.strip() and current_title.strip().lower() != "untitled":
        return AITitleResult(title=current_title.strip())

    if cat:
        return AITitleResult(title=cat)

    return AITitleResult(title="Untitled")
