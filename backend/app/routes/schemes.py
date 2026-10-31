"""
Government Schemes Explorer Routes:
- Search, filter by Category, Central / Karnataka Level, Active Status
- Robust keyword and tokenized matching (e.g. 'government schemes', 'subsidy', 'yojana')
- Official source verification references & document requirements
"""
import re
from bson import ObjectId
from flask import Blueprint, request, jsonify
from app.database import get_collection

schemes_bp = Blueprint("schemes", __name__)


def _serialize(doc):
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d["_id"])
        del d["_id"]
    return d


@schemes_bp.route("", methods=["GET"])
def get_schemes():
    category = request.args.get("category", "").strip()
    level = request.args.get("level", "").strip()
    search = request.args.get("search", "").strip().lower()

    col = get_collection("schemes")
    all_schemes = [ _serialize(s) for s in col.find({}) ]

    # Ignored generic stop-words when searching agricultural catalog
    STOP_WORDS = {"government", "goverment", "schemes", "scheme", "nschemes", "karnataka", "yojana", "all"}
    search_tokens = [w for w in re.split(r"[\s,]+", search) if w and len(w) > 1]
    significant_tokens = [w for w in search_tokens if w not in STOP_WORDS]

    filtered = []
    for s in all_schemes:
        # Category filter
        if category and category.lower() != "all" and s.get("category", "").lower() != category.lower():
            continue

        # Level filter
        if level and level.lower() != "all" and s.get("government_level", "").lower() != level.lower():
            continue

        # Search filter
        if search:
            # If search is purely generic words like "government schemes", show all matching level/category
            if not significant_tokens:
                filtered.append(s)
                continue

            # Otherwise, check significant tokens
            text_corpus = (
                f"{s.get('name_en', '')} {s.get('name_kn', '')} {s.get('category', '')} "
                f"{s.get('government_level', '')} {s.get('benefit_description_en', '')} "
                f"{s.get('department', '')} {s.get('subsidy_or_financial', '')} "
                f"{' '.join(s.get('required_documents', []))}"
            ).lower()

            matches_any = any(token in text_corpus for token in significant_tokens)
            if not matches_any:
                continue

        filtered.append(s)

    # Fallback: if search was too specific and gave 0 results, return all schemes so user is never left with an empty screen
    if not filtered and (search or category != "All" or level != "All"):
        # return all schemes with a notice
        return jsonify({
            "success": True, 
            "schemes": all_schemes, 
            "total": len(all_schemes),
            "notice": "Showing all schemes as no exact match was found for your query."
        })

    return jsonify({"success": True, "schemes": filtered, "total": len(filtered)})


@schemes_bp.route("/<scheme_id>", methods=["GET"])
def get_scheme_detail(scheme_id):
    col = get_collection("schemes")
    scheme = None
    try:
        scheme = col.find_one({"_id": ObjectId(scheme_id)})
    except Exception:
        pass
    if not scheme:
        scheme = col.find_one({"id": scheme_id})

    if not scheme:
        return jsonify({"success": False, "message": "Scheme not found"}), 404

    return jsonify({"success": True, "scheme": _serialize(scheme)})


@schemes_bp.route("/recommended", methods=["GET"])
def get_recommended():
    col = get_collection("schemes")
    featured = [ _serialize(s) for s in col.find({"source_verified": True}, limit=6) ]
    if not featured:
        featured = [ _serialize(s) for s in col.find({}, limit=6) ]
    return jsonify({"success": True, "recommendations": featured})
