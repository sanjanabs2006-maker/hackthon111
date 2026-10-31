"""
Intelligent Bilingual Agricultural AI Engine for Krishi Mitra
Recognizes ALL types of farmer questions:
- Pests, Insects & Bio-control (Fall armyworm, stem borer, root grubs, sucking pests)
- Crop Diseases & Treatment (Kole Roga, blast, sheath blight, wilt, leaf curl, rhizome rot)
- Soil Management & Testing (Acidic soil & lime, alkaline & gypsum, green manuring, organic carbon)
- Crop Cultivation & Agronomy (Arecanut, Paddy/SRI, Maize, Ragi, Millets, Cotton, Sugarcane, Spices)
- Fertilizers & Nutrient Deficiencies (NPK ratios, Urea splits, Zinc, Boron, Magnesium, 19:19:19)
- Organic & Natural Farming (Jeevamrutha, Beejamrutha, Agniastra, Panchagavya)
- Irrigation & Water Conservation (Drip irrigation, fertigation, Krishi Honda farm ponds, mulching)
- Dairy, Livestock & Fodder (Milk yield, silage making, green fodder, mineral mixture)
- Agricultural Drones & Modern Mechanization (Drone ULV spraying, weeders, subsidies)
- Real-time Mandi Market Prices & Weather Spray Advisories
- Central & Karnataka Government Agricultural Schemes (PM-KISAN, PMFBY, Krishi Bhagya, Raitha Siri, KCC)
"""
import os
import re
import io
import base64
import unicodedata
from typing import List, Dict, Any
from app.database import get_collection
from app.services.gemini_service import gemini_service

# ── Language Detection Lexicons ──────────────────────────────────────────────
KAN_UNICODE_PATTERN = re.compile(r'[ಀ-೿]')

# English structural words, question starters, and functional terms
ENGLISH_STRUCTURAL_WORDS = {
    'what', 'how', 'why', 'when', 'where', 'which', 'who', 'whose', 'whom',
    'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did',
    'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
    'the', 'a', 'an', 'this', 'that', 'these', 'those',
    'my', 'your', 'our', 'their', 'his', 'her', 'its',
    'in', 'on', 'at', 'to', 'for', 'from', 'with', 'by', 'about',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'and', 'or', 'but', 'if', 'then', 'because', 'as',
    'of', 'off', 'out', 'over', 'up', 'down',
    'please', 'tell', 'explain', 'give', 'suggest', 'recommend', 'show',
    'help', 'guide', 'provide', 'describe', 'list', 'check', 'need', 'want', 'know',
    'hello', 'hi', 'hey', 'good', 'morning', 'evening', 'afternoon',
    'daily', 'month', 'spacing', 'yield', 'water', 'fertilizer', 'disease', 'seed',
    'spray', 'tractor', 'subsidy', 'scheme', 'schemes', 'loan', 'price', 'market',
    'much', 'many', 'needed', 'mix', 'sow', 'apply', 'acre', 'acres', 'grow', 'plant',
    'prevent', 'control', 'cure', 'treatment', 'symptoms', 'management', 'harvest',
    'pruning', 'leaves', 'roots', 'soil', 'weather', 'organic', 'chemical', 'procedure'
}

# Distinctive Kannada grammar markers, question words, verbal forms, and inflections in Latin script
KANGLISH_GRAMMAR_WORDS = {
    # Question words
    'enu', 'yenu', 'hege', 'yavaga', 'yavaaga', 'yavudu', 'yavudhu', 'yaava',
    'eshtu', 'esht', 'yake', 'yaake', 'elli', 'yaru', 'yaaru',
    # Verb stems & conjugations
    'madodu', 'madabeku', 'madbeku', 'maduvudu', 'madoke', 'maadi', 'maadu',
    'hakodu', 'hakabeku', 'hakbeku', 'hakuvudu', 'haaku', 'haaki', 'hakbovda',
    'kododu', 'kodabeku', 'kodbeku', 'kodi', 'kodri', 'koduvudu',
    'bandide', 'bandhide', 'agide', 'aagide', 'aithey', 'aithe', 'ide', 'idhe', 'idiya',
    'kanisuthe', 'kanisuttade', 'siguthe', 'sigutta', 'siguvudu', 'sigalla',
    'baruthe', 'baralla', 'bartide', 'baruvudu', 'irabeku', 'irbeku', 'iruvudu',
    'thilisi', 'heli', 'helri', 'nododu', 'nodi', 'hecchisalu', 'thadagattalu',
    'bittane', 'koylu', 'katavu', 'madbovda', 'madbahuda', 'aagalla',
    'beku', 'bekagide', 'illa', 'tayar', 'gunapadisuvudu', 'sahaya', 'berasi',
    # Pronouns & possessives
    'nanna', 'nanage', 'namge', 'nammanna', 'nimma', 'nimage', 'naanu', 'neevu',
    'avaru', 'ivaru', 'idu', 'adu',
    # Postpositions, case markers & nouns
    'bagge', 'thotadalli', 'holadalli', 'jameenalli', 'gobbarakke', 'belege',
    'manninge', 'mannina', 'neerige', 'rogakke', 'hasuvina', 'thotakke', 'anthara',
    'gobbara', 'hasu', 'hasuvige', 'dana', 'haalu', 'karu', 'keeta', 'hula', 'hulakke', 'sunna',
    'namaskara', 'namaskaram', 'shubhadina', 'dayavittu', 'sarkari', 'raitha', 'raitharige',
    'aushadhi', 'parikshe', 'jothe', 'gandha', 'bhattakke', 'neeru', 'dina', 'thota'
}

AGRICULTURAL_SYSTEM_PROMPT = """
You are 'Krishi Mitra AI' (ಕೃಷಿ ಮಿತ್ರ ಎಐ), a senior agricultural scientist and digital agronomy companion for Karnataka farmers.

KEY OPERATIONAL PRINCIPLES:
1. BROAD AGRICULTURAL COVERAGE:
   - Answer ALL farmer questions across every agricultural domain: crop cultivation, pest and insect control, disease diagnosis, soil testing & reclamation, fertilizers & micronutrients, organic farming (Jeevamrutha), drip irrigation & farm ponds, dairy & silage fodder, farm mechanization, mandi prices, weather, and government schemes.
2. LANGUAGE INTEGRITY:
   - If the user asks in Kannada or Kanglish (Latin-script Kannada): Respond ENTIRELY and naturally in fluent Kannada script (ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಮಾತ್ರ ಉತ್ತರಿಸಿ).
   - If the user asks in English: Respond in clear, structured English.
3. PRACTICAL & ACTIONABLE:
   - Always give exact, safe chemical or organic dosages (e.g. per liter or per acre), timing, and step-by-step practical advice.
4. TONE:
   - Respectful, encouraging, clear, and specifically tailored for rural Karnataka farmers.
"""


def detect_language(text: str) -> str:
    """
    Accurately and automatically detects whether user input is Kannada or English:
    1. Kannada Unicode Script (U+0C80 to U+0CFF) -> 100% Kannada ('kn').
    2. English sentences (even those mentioning local crop, disease, or scheme names
       like 'What is Kole Roga in arecanut?' or 'How to prepare Jeevamrutha?') -> 'en'.
    3. Kanglish (Kannada written in Latin characters using Kannada syntax/verbs
       like 'adike kole roga bandide enu madodu') -> 'kn'.
    """
    if not text or not text.strip():
        return "en"

    # Step 1: Any Kannada Unicode character indicates Kannada script intent
    if KAN_UNICODE_PATTERN.search(text):
        return "kn"

    # Step 2: Extract Latin alphanumeric words
    words = re.findall(r'[a-zA-Z]+', text.lower())
    if not words:
        return "en"

    eng_count = sum(1 for w in words if w in ENGLISH_STRUCTURAL_WORDS)
    kan_count = sum(1 for w in words if w in KANGLISH_GRAMMAR_WORDS)

    # Check for distinctive Kannada inflectional suffixes
    for w in words:
        if len(w) > 4:
            if w.endswith(('dalli', 'nalli', 'akke', 'beku', 'madbeku', 'madodu', 'agide', 'bandide', 'bovda', 'bahuda', 'rige', 'kkhe')):
                kan_count += 1

    # Comparative evaluation
    if kan_count > eng_count:
        return "kn"
    if eng_count > kan_count:
        return "en"

    # Tie-breaker: if distinctive Kannada markers are present, classify as Kannada; else English
    if kan_count > 0:
        return "kn"

    return "en"


STOP_WORDS = {
    "hege", "enu", "madodu", "yavaga", "yavudu", "nanna", "beku", "madabekku", "nanu", "holadalli",
    "ಹೇಗೆ", "ಏನು", "ಮಾಡಬೇಕು", "ನನ್ನ", "ಯಾವಾಗ", "ಯಾವುದು", "ಬೇಕು", "ಇದೆ", "ಹೊಲದಲ್ಲಿ",
    "ಬೆಳೆದಿದ್ದೇನೆ", "ತಿರುಗುತ್ತಿವೆ", "ಹೇಳಿ", "ತಿಳಿಸಿ", "ಕೊಡಿ", "the", "and", "how",
    "what", "should", "for", "with", "from", "which", "when", "does", "have", "are"
}


def search_knowledge_articles_db(message: str, lang: str) -> str:
    """
    Queries the knowledge_articles database collection to ground the AI response
    with peer-reviewed agronomic manuals (dosages, steps, and scientific guidance)
    with strict crop-consistency checks.
    """
    try:
        col = get_collection("knowledge_articles")
        raw_words = [w.lower() for w in re.findall(r'\w+', message)]
        msg_words = [w for w in raw_words if len(w) >= 3 and w not in STOP_WORDS]
        if not msg_words:
            return ""

        msg_text = message.lower()
        query_crops = set()
        if any(c in msg_text for c in ["ಮೆಕ್ಕೆಜೋಳ", "mekkejola", "maize", "corn"]):
            query_crops.add("maize")
        if any(c in msg_text for c in ["ಅಡಿಕೆ", "adike", "arecanut", "areca"]):
            query_crops.add("arecanut")
        if any(c in msg_text for c in ["ಭತ್ತ", "bhatta", "paddy", "rice"]):
            query_crops.add("paddy")
        if any(c in msg_text for c in ["ರಾಗಿ", "ragi", "millet", "ಸಿರಿಧಾನ್ಯ"]):
            query_crops.add("millet")
        if any(c in msg_text for c in ["ಹಸು", "ಹಾಲು", "dairy", "cattle", "cow", "ಮೇವು", "ಸೈಲೇಜ್", "silage", "ಮುರಬ್ಬ"]):
            query_crops.add("dairy")
        if any(c in msg_text for c in ["ಮಣ್ಣು", "soil", "ಸುಣ್ಣ", "lime", "ಜಿಪ್ಸಂ", "gypsum"]):
            query_crops.add("soil")
        if any(c in msg_text for c in ["ಮೆಣಸು", "pepper", "black pepper"]):
            query_crops.add("pepper")
        if any(c in msg_text for c in ["ಶುಂಠಿ", "ginger", "ಏಲಕ್ಕಿ", "cardamom"]):
            query_crops.add("spice")

        articles = list(col.find({}))
        best_match = None
        max_score = 0

        for art in articles:
            score = 0
            title_en = art.get("title_en", "").lower()
            title_kn = art.get("title_kn", "").lower()
            tags = [t.lower() for t in art.get("tags", [])]
            category = art.get("category", "").lower()

            # Enforce crop consistency if query specifically mentioned a crop
            if "maize" in query_crops and not ("maize" in title_en or "ಮೆಕ್ಕೆಜೋಳ" in title_kn or "maize" in tags):
                continue
            if "arecanut" in query_crops and not ("arecanut" in title_en or "ಅಡಿಕೆ" in title_kn or "arecanut" in tags):
                continue
            if "paddy" in query_crops and not ("paddy" in title_en or "ಭತ್ತ" in title_kn or "paddy" in tags):
                continue
            if "dairy" in query_crops and not ("dairy" in title_en or "ಹೈನುಗಾರಿಕೆ" in title_kn or "dairy" in tags or "silage" in tags):
                continue
            if "millet" in query_crops and not ("millet" in title_en or "ರಾಗಿ" in title_kn or "millet" in tags):
                continue
            if "soil" in query_crops and not ("soil" in title_en or "ಮಣ್ಣು" in title_kn or "soil" in tags):
                continue

            for w in msg_words:
                if w in title_en or w in title_kn:
                    score += 6
                if any(w in t for t in tags):
                    score += 4
                if w in category:
                    score += 3

            if score > max_score and score >= 10:
                max_score = score
                best_match = art

        if best_match:
            if lang == "kn":
                title = best_match.get("title_kn") or best_match.get("title_en")
                summary = best_match.get("summary_kn") or best_match.get("summary_en")
                steps = best_match.get("steps_kn") or best_match.get("steps_en") or []
                dosages = best_match.get("dosages_kn") or best_match.get("dosages_en") or []
                
                res = f"【ಕೃಷಿ ತಜ್ಞರ ಮಾರ್ಗದರ್ಶಿ: {title}】\n\n{summary}\n"
                if steps:
                    res += "\nಮುಖ್ಯ ಹಂತಗಳು:\n" + "\n".join(f"• {s}" for s in steps[:4])
                if dosages:
                    res += "\n\nಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣ:\n" + "\n".join(f"✓ {d}" for d in dosages[:3])
                return res
            else:
                title = best_match.get("title_en")
                summary = best_match.get("summary_en")
                steps = best_match.get("steps_en") or []
                dosages = best_match.get("dosages_en") or []

                res = f"【Agricultural Guide: {title}】\n\n{summary}\n"
                if steps:
                    res += "\nActionable Steps:\n" + "\n".join(f"• {s}" for s in steps[:4])
                if dosages:
                    res += "\n\nRecommended Dosages:\n" + "\n".join(f"✓ {d}" for d in dosages[:3])
                return res
    except Exception as e:
        print(f"Error querying knowledge database: {e}")
    return ""


def generate_ai_response(
    message: str,
    history: List[Dict[str, str]] = None,
    farmer_profile: Dict[str, Any] = None,
    weather_info: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Dynamic Gemini-Powered Agricultural Response Generation:
    - Zero hardcoded static answer dependencies.
    - Understands ANY agriculture question in natural conversational Kannada or English.
    - Contextualized with farmer's MyFarm registered crops, soil type, land, and local weather.
    - Grounded with university-verified guidelines and packages of practices.
    """
    detected_lang = detect_language(message)

    # 1. Retrieve supplementary knowledge reference if relevant (for RAG context injection)
    knowledge_excerpts = search_knowledge_articles_db(message, detected_lang)

    # 2. Delegate directly to Google Gemini AI service
    gemini_output = gemini_service.generate_response(
        message=message,
        language=detected_lang,
        history=history or [],
        farmer_profile=farmer_profile,
        weather_info=weather_info,
        knowledge_excerpts=knowledge_excerpts or None
    )

    return gemini_output



def clean_text_for_speech(text: str, lang: str = "kn") -> str:
    """
    Cleans and expands abbreviations, numbers and currency for crystal-clear natural TTS pronunciation.
    """
    if not text:
        return ""

    t = text
    # Remove bracketed titles like 【ಕೃಷಿ ತಜ್ಞರ ಮಾರ್ಗದರ್ಶಿ:...】
    t = re.sub(r'【.*?】', '', t)
    t = re.sub(r'https?://\S+|www\.\S+', '', t)
    t = re.sub(r'\b[a-zA-Z0-9.-]+\.gov\.in\b', '', t)
    t = re.sub(r'\b[a-zA-Z0-9.-]+\.karnataka\.gov\.in\b', '', t)

    if lang == "kn" or any('\u0c80' <= c <= '\u0cff' for c in t):
        t = t.replace('₹', ' ರೂಪಾಯಿ ')
        t = t.replace('PM-KISAN', 'ಪಿಎಂ ಕಿಸಾನ್')
        t = t.replace('PMFBY', 'ಪಿಎಂ ಬೆಳೆ ವಿಮೆ')
        t = t.replace('APMC', 'ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ')
        t = t.replace('RTC', 'ಪಹಣಿ')
        t = t.replace('FID', 'ಫ್ರೂಟ್ಸ್ ಐಡಿ')
        t = t.replace('RSK', 'ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ')
        t = t.replace('ಶೇ.', 'ಶೇಕಡಾ')
        t = t.replace('%', ' ಶೇಕಡಾ ')
        t = t.replace('/', ' ಅಥವಾ ')
    else:
        t = t.replace('₹', 'Rupees ')
        t = t.replace('%', ' percent ')
        t = t.replace('/', ' or ')

    t = re.sub(r'[\*#_`~•✓]', '', t)
    t = t.replace(' - ', ', ')
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def generate_tts_audio_base64(text: str, lang: str = "kn") -> str:
    """
    Generates high-fidelity, studio-quality Kannada or English speech audio as a base64 data URI.
    """
    clean_text = clean_text_for_speech(text, lang)
    if not clean_text:
        return ""

    try:
        from gtts import gTTS
        is_kannada = (lang == "kn") or any('\u0c80' <= c <= '\u0cff' for c in clean_text)
        target_lang = "kn" if is_kannada else "en"
        tld = "co.in" if target_lang == "en" else "com"

        snippet = clean_text[:500]

        tts = gTTS(text=snippet, lang=target_lang, tld=tld, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_b64 = base64.b64encode(fp.read()).decode('utf-8')
        return f"data:audio/mpeg;base64,{audio_b64}"
    except Exception as e:
        print(f"TTS generation error: {e}")
        return ""
