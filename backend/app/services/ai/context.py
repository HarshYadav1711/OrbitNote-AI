"""Shared note context helpers for AI prompts and fallbacks."""


def note_context_block(title: str, category: str | None) -> str:
    lines = [f"Title: {title.strip() or 'Untitled'}"]
    if category and category.strip():
        lines.append(f"Category: {category.strip()}")
    return "\n".join(lines)


def normalize_category(category: str | None) -> str | None:
    if category is None:
        return None
    stripped = category.strip()
    return stripped or None
