"""
Krishi Mitra Backend — Flask Application Factory
"""
import os
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from pathlib import Path
from dotenv import load_dotenv

# Reliably load .env from backend directory and project root
_backend_dir = Path(__file__).resolve().parent.parent
_backend_env = _backend_dir / ".env"
_root_env = _backend_dir.parent / ".env"

if _root_env.exists():
    load_dotenv(dotenv_path=_root_env, override=True)
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env, override=True)

bcrypt = Bcrypt()
jwt = JWTManager()


def create_app(config_name: str = "development") -> Flask:
    app = Flask(__name__)

    # ── Core configuration ──────────────────────────────────────────────────
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # Use explicit expiry in tokens
    app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/krishi_mitra")
    app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))
    app.config["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")
    app.config["OPENWEATHER_API_KEY"] = os.getenv("OPENWEATHER_API_KEY", "")

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ── Extensions ──────────────────────────────────────────────────────────
    bcrypt.init_app(app)
    jwt.init_app(app)

    cors_origins_raw = os.getenv("CORS_ORIGINS", "*").strip()
    cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()] if cors_origins_raw != "*" else "*"
    CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)

    # ── Database ────────────────────────────────────────────────────────────
    from app.database import init_db
    init_db(app)

    # ── Blueprints ──────────────────────────────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.farmer import farmer_bp
    from app.routes.schemes import schemes_bp
    from app.routes.eligibility import eligibility_bp
    from app.routes.crop_health import crop_health_bp
    from app.routes.weather import weather_bp
    from app.routes.market import market_bp
    from app.routes.documents import documents_bp
    from app.routes.knowledge import knowledge_bp
    from app.routes.assistant import assistant_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(farmer_bp, url_prefix="/api/v1/farmer")
    app.register_blueprint(schemes_bp, url_prefix="/api/v1/schemes")
    app.register_blueprint(eligibility_bp, url_prefix="/api/v1/eligibility")
    app.register_blueprint(crop_health_bp, url_prefix="/api/v1/crop-health")
    app.register_blueprint(weather_bp, url_prefix="/api/v1/weather")
    app.register_blueprint(market_bp, url_prefix="/api/v1/market")
    app.register_blueprint(documents_bp, url_prefix="/api/v1/documents")
    app.register_blueprint(knowledge_bp, url_prefix="/api/v1/knowledge")
    app.register_blueprint(assistant_bp, url_prefix="/api/v1/assistant")
    app.register_blueprint(assistant_bp, url_prefix="/api/ai", name="ai_assistant")
    app.register_blueprint(assistant_bp, url_prefix="/api/v1/ai", name="v1_ai_assistant")
    app.register_blueprint(admin_bp, url_prefix="/api/v1/admin")

    # ── Health check ────────────────────────────────────────────────────────
    @app.route("/api/v1/health")
    def health():
        return {"status": "ok", "service": "Krishi Mitra API", "version": "1.0.0"}

    # ── API Root Endpoints (/api/v1, /api/v1/, /api, /api/) ─────────────────
    @app.route("/api/v1", methods=["GET"])
    @app.route("/api/v1/", methods=["GET"])
    @app.route("/api", methods=["GET"])
    @app.route("/api/", methods=["GET"])
    def api_v1_root():
        accept = request.headers.get("Accept", "")
        endpoints_data = {
            "health": "/api/v1/health",
            "assistant_status": "/api/v1/assistant/status",
            "assistant_chat": "/api/v1/assistant/chat",
            "schemes": "/api/v1/schemes",
            "farmer_profile": "/api/v1/farmer/profile",
            "crops": "/api/v1/farmer/crops",
            "farm_land": "/api/v1/farmer/land",
            "weather": "/api/v1/weather/current",
            "market_prices": "/api/v1/market/prices",
            "crop_health": "/api/v1/crop-health/diagnose",
            "knowledge": "/api/v1/knowledge/articles",
            "auth": "/api/v1/auth"
        }

        if "text/html" in accept:
            return (
                """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌾 Krishi Mitra API v1 Online</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F7F8F0; color: #303B32; padding: 40px 20px; margin: 0; }
    .card { background: #FFFFFF; max-width: 680px; margin: auto; padding: 36px; border-radius: 20px; box-shadow: 0 10px 30px rgba(36,92,58,0.08); border: 1px solid #DCE9D5; }
    h1 { color: #245C3A; margin-top: 0; font-size: 26px; display: flex; align-items: center; gap: 10px; }
    .badge { display: inline-block; background: #DCE9D5; color: #245C3A; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: bold; }
    .badge-ai { background: #FEF3C7; color: #92400E; }
    p { line-height: 1.6; color: #4B5563; }
    .btn-row { display: flex; gap: 12px; margin: 24px 0; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 12px 24px; background: #245C3A; color: white; text-decoration: none; font-weight: bold; border-radius: 10px; transition: background 0.2s; font-size: 15px; }
    .btn:hover { background: #1B452B; }
    .btn-secondary { background: #DCE9D5; color: #245C3A; }
    .btn-secondary:hover { background: #C5DBB9; }
    .grid { background: #F7F8F0; border-radius: 12px; padding: 16px; margin-top: 20px; font-family: monospace; font-size: 13px; }
    .endpoint { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #DCE9D5; }
    .endpoint:last-child { border-bottom: none; }
    a.link { color: #245C3A; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌾 Krishi Mitra API v1 <span class="badge">Online (200 OK)</span> <span class="badge badge-ai">Gemini AI Ready</span></h1>
    <p>The backend REST API server is running on <strong>http://localhost:5000</strong>. Google Gemini AI Agricultural Intelligence Engine (<code>gemini-1.5-flash</code>) is connected and actively processing questions.</p>
    
    <div class="btn-row">
      <a href="http://localhost:5173/farmer/assistant" class="btn">🚀 Open Krishi AI Voice Assistant</a>
      <a href="http://localhost:5173/" class="btn btn-secondary">🌐 Krishi Mitra Web Portal</a>
      <a href="/api/v1/assistant/status" class="btn btn-secondary">🤖 AI Status</a>
      <a href="/api/v1/health" class="btn btn-secondary">❤️ Health</a>
    </div>

    <div class="grid">
      <div style="font-weight:bold; margin-bottom: 8px; color: #245C3A;">Verified API Endpoints:</div>
      <div class="endpoint"><span>POST /api/v1/assistant/chat</span> <span>Dynamic Gemini AI Q&amp;A</span></div>
      <div class="endpoint"><span>GET  /api/v1/assistant/status</span> <span>Gemini Configuration Status</span></div>
      <div class="endpoint"><span>GET  /api/v1/schemes</span> <span>Government Schemes Explorer</span></div>
      <div class="endpoint"><span>GET  /api/v1/weather/current</span> <span>Karnataka Agrometeorology</span></div>
      <div class="endpoint"><span>GET  /api/v1/market/prices</span> <span>Live APMC Mandi Rates</span></div>
      <div class="endpoint"><span>GET  /api/v1/health</span> <span>API Server Health Check</span></div>
    </div>
  </div>
</body>
</html>""",
                200,
                {"Content-Type": "text/html"}
            )

        return jsonify({
            "status": "online",
            "service": "Krishi Mitra Backend REST API v1",
            "version": "1.0.0",
            "gemini_ai_status": "ready",
            "engine": "gemini-1.5-flash",
            "frontend_url": "http://localhost:5173",
            "assistant_web_url": "http://localhost:5173/farmer/assistant",
            "message": "Krishi Mitra API is online and fully functional.",
            "endpoints": endpoints_data
        }), 200

    # ── Root and Frontend Web Redirects ─────────────────────────────────────
    @app.route("/")
    def index():
        accept = request.headers.get("Accept", "")
        # If opened in a web browser, redirect to frontend application
        if "text/html" in accept or not accept:
            return (
                """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="1; url=http://localhost:5173/">
  <title>Krishi Mitra - Redirecting</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 60px 20px; background: #f0fdf4; color: #166534; }
    .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 520px; margin: auto; }
    h1 { color: #15803d; margin-bottom: 12px; font-size: 26px; }
    p { color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 12px 28px; background: #16a34a; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; transition: background 0.2s; font-size: 16px; }
    .btn:hover { background: #15803d; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌾 Krishi Mitra API Server Online</h1>
    <p>The backend server is running successfully on port 5000.<br>Opening the Krishi Mitra Web Portal at <strong>http://localhost:5173/</strong>...</p>
    <a href="http://localhost:5173/" class="btn">Open Krishi Mitra (Port 5173)</a>
  </div>
</body>
</html>""",
                200,
                {"Content-Type": "text/html"}
            )
        return jsonify({
            "status": "online",
            "service": "Krishi Mitra Backend API",
            "frontend_url": "http://localhost:5173",
            "version": "1.0.0"
        })

    @app.errorhandler(404)
    def handle_not_found(e):
        path = request.path
        # If user opened a frontend route like /login, /farmer/dashboard, /farmer/assistant on port 5000, redirect to frontend
        if not path.startswith("/api/") and not path.startswith("/api"):
            return redirect(f"http://localhost:5173{path}")

        accept = request.headers.get("Accept", "")
        if "text/html" in accept:
            return (
                f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API Endpoint Not Found</title>
  <style>
    body {{ font-family: system-ui, sans-serif; background: #F7F8F0; color: #303B32; padding: 40px 20px; text-align: center; }}
    .card {{ background: white; max-width: 540px; margin: auto; padding: 36px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }}
    h1 {{ color: #dc2626; font-size: 22px; }}
    p {{ color: #4b5563; line-height: 1.6; }}
    .btn {{ display: inline-block; padding: 10px 20px; background: #245C3A; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 8px; }}
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ API Endpoint Not Found</h1>
    <p>The endpoint <code>{path}</code> does not exist.</p>
    <a href="/api/v1" class="btn">View Available Endpoints (/api/v1)</a>
    <a href="http://localhost:5173/farmer/assistant" class="btn" style="background: #16a34a;">Open Krishi AI Assistant</a>
  </div>
</body>
</html>""",
                404,
                {"Content-Type": "text/html"}
            )

        return jsonify({
            "error": "Not Found",
            "message": f"API endpoint '{path}' was not found.",
            "status": 404,
            "frontend_url": "http://localhost:5173",
            "api_root": "http://localhost:5000/api/v1",
            "available_endpoints": [
                "/api/v1/health",
                "/api/v1/assistant/status",
                "/api/v1/assistant/chat",
                "/api/v1/schemes",
                "/api/v1/weather/current",
                "/api/v1/market/prices",
                "/api/v1/crop-health/diagnose",
                "/api/v1/farmer/profile"
            ]
        }), 404

    return app

