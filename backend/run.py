"""
Entrypoint to run the Krishi Mitra Flask Backend Server.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Explicitly resolve and load the backend .env file
backend_dir = Path(__file__).resolve().parent
backend_env = backend_dir / ".env"
root_env = backend_dir.parent / ".env"

if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)

# Diagnostic: Verify GEMINI_API_KEY detection on startup
raw_key = os.getenv("GEMINI_API_KEY", "").strip()
if raw_key:
    masked = raw_key[:6] + "..." + raw_key[-4:] if len(raw_key) > 10 else (raw_key[:4] + "***")
    print(f"✅ Backend environment loaded from: {backend_env}")
    print(f"🔑 GEMINI_API_KEY detected: {masked}")
else:
    print(f"⚠️ Backend environment loaded from: {backend_env} (GEMINI_API_KEY is not set)")

from app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Krishi Mitra API server starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
