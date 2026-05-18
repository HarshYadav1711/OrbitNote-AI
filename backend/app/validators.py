import re

# URL-safe tokens from secrets.token_urlsafe(32) — allow a little slack for encoding
SHARE_TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,128}$")
