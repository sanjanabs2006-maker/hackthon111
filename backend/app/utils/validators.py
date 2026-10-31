"""
Utility validators for Krishi Mitra backend.
"""
import re


def validate_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password(password: str) -> bool:
    return isinstance(password, str) and len(password) >= 6


def sanitize_string(s: str, max_len: int = 500) -> str:
    if not isinstance(s, str):
        return ""
    return s.strip()[:max_len]


def allowed_file(filename: str, allowed_extensions: set = None) -> bool:
    if allowed_extensions is None:
        allowed_extensions = {"pdf", "jpg", "jpeg", "png"}
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions

