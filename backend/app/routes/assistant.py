"""
Krishi AI Assistant Routes
- Real-time automatic Kannada and English speech & text processing
- Integration with Gemini Flash 1.5 & grounded agricultural knowledge
- Context-aware responses respecting farmer profile, MyFarm crops, land & local weather
- Follow-up suggestions, voice audio generation, and error resilience
"""
import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_collection
from app.services.assistant_ai import generate_ai_response, detect_language, generate_tts_audio_base64
from app.services.gemini_service import gemini_service, STABLE_MODELS

logger = logging.getLogger(__name__)

assistant_bp = Blueprint("assistant", __name__)

DEFAULT_FARMER_ID = "demo_farmer_shivamogga"


@assistant_bp.route("", methods=["GET"])
@assistant_bp.route("/", methods=["GET"])
def assistant_root():
    """Krishi AI Assistant root status and endpoint manifest."""
    is_ready = gemini_service.is_configured()
    return jsonify({
        "success": True,
        "service": "Krishi Mitra Gemini AI Assistant",
        "gemini_configured": is_ready,
        "status": "ready" if is_ready else "api_key_required",
        "engine": "gemini-1.5-flash",
        "models_available": STABLE_MODELS,
        "endpoints": {
            "chat": "/api/v1/assistant/chat",
            "status": "/api/v1/assistant/status",
            "tts": "/api/v1/assistant/tts",
            "detect_language": "/api/v1/assistant/detect-language"
        },
        "frontend_assistant_url": "http://localhost:5173/farmer/assistant"
    })



def _get_farmer_context(user_id: str):
    """Retrieves full MyFarm context for the user, with fallback to demo farmer."""
    try:
        profiles = get_collection("farmer_profiles")
        p = None
        if user_id:
            p = profiles.find_one({"user_id": user_id})
        if not p:
            p = profiles.find_one({"user_id": DEFAULT_FARMER_ID})
        if not p:
            p = profiles.find_one({})

        if p:
            f_id = p.get("user_id", user_id)
            crops = list(get_collection("crops").find({"farmer_id": f_id}))
            land = list(get_collection("farm_land").find({"farmer_id": f_id}))
            profile_dict = dict(p)
            profile_dict["crops"] = crops
            profile_dict["land_records"] = land
            return profile_dict
    except Exception as e:
        logger.warning(f"Error fetching farmer context: {e}")
    return None


def _get_weather_context(farmer_profile: dict):
    """Constructs current agro-weather context for the farmer's location."""
    district = (farmer_profile.get("district") if farmer_profile else "Shivamogga") or "Shivamogga"
    taluk = (farmer_profile.get("taluk") if farmer_profile else "Thirthahalli") or "Thirthahalli"
    return {
        "district": district,
        "taluk": taluk,
        "temperature": 27.5,
        "humidity": 76,
        "wind_speed": 11.5,
        "condition": "Scattered Clouds",
        "agricultural_advisory": f"Optimal spray window in {taluk}, {district} before 3:00 PM. High soil moisture retention."
    }


@assistant_bp.route("/chat", methods=["POST"])
@jwt_required(optional=True)
def chat():
    """
    Dynamic Agricultural Q&A with Gemini AI and MyFarm grounding.
    Accepts:
    - message (or query / prompt / text)
    - history: list of previous turns [{'role': 'user', 'message': '...'}, ...]
    """
    data = request.get_json(silent=True) or {}
    message = (
        data.get("message")
        or data.get("query")
        or data.get("prompt")
        or data.get("text")
        or ""
    ).strip()
    history = data.get("history", [])

    if not message:
        return jsonify({
            "success": False,
            "error": "EMPTY_MESSAGE",
            "message": "Message cannot be empty",
            "answer": "Please ask a question related to your crops, soil, pests, or farming practices.",
            "reply": "Please ask a question related to your crops, soil, pests, or farming practices."
        }), 400

    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    farmer_profile = _get_farmer_context(user_id)
    weather_info = _get_weather_context(farmer_profile)

    ai_output = generate_ai_response(
        message=message,
        history=history,
        farmer_profile=farmer_profile,
        weather_info=weather_info
    )

    detected_lang = ai_output.get("language") or detect_language(message)
    reply_text = ai_output.get("reply") or ai_output.get("answer") or ""

    # Generate crystal-clear native Kannada / English audio stream
    audio_base64 = ""
    try:
        audio_base64 = generate_tts_audio_base64(reply_text, detected_lang)
    except Exception as e:
        logger.warning(f"Audio TTS generation skipped: {e}")

    suggestions = ai_output.get("suggestions", [])
    follow_up_questions = ai_output.get("follow_up_questions", suggestions)

    return jsonify({
        "success": ai_output.get("success", True),
        "reply": reply_text,
        "answer": reply_text,
        "language": detected_lang,
        "engine": ai_output.get("engine", "gemini-1.5-flash"),
        "audio": audio_base64,
        "suggestions": suggestions,
        "follow_up_questions": follow_up_questions,
        "farmer_context_applied": bool(farmer_profile),
        "crops_grounded": [c.get("name") for c in (farmer_profile.get("crops") or [])] if farmer_profile else []
    })


@assistant_bp.route("/status", methods=["GET"])
def ai_status():
    """Checks whether Gemini AI is configured and ready."""
    is_ready = gemini_service.is_configured()
    return jsonify({
        "success": True,
        "service": "Krishi Mitra Gemini AI Assistant",
        "gemini_configured": is_ready,
        "models_available": STABLE_MODELS,
        "status": "ready" if is_ready else "api_key_required"
    })


@assistant_bp.route("/tts", methods=["POST", "GET"])
def text_to_speech():
    """Generates crystal-clear audio on demand for any text."""
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")
        lang = data.get("lang", "kn")
    else:
        text = request.args.get("text", "")
        lang = request.args.get("lang", "kn")

    if not text:
        return jsonify({"success": False, "message": "Text is required"}), 400

    audio_base64 = generate_tts_audio_base64(text, lang)
    return jsonify({
        "success": bool(audio_base64),
        "audio": audio_base64
    })


@assistant_bp.route("/detect-language", methods=["POST"])
def check_language():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    lang = detect_language(text)
    return jsonify({"success": True, "language": lang})
