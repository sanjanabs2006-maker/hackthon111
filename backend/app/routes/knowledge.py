"""
Krishi Knowledge Hub Routes
- Agricultural learning resources in Kannada & English
- Categories: Crop cultivation, Soil, Irrigation, Pest, Disease, Horticulture
- Bookmark support
"""
from bson import ObjectId
from flask import Blueprint, request, jsonify
from app.database import get_collection

knowledge_bp = Blueprint("knowledge", __name__)


def _serialize(doc):
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d["_id"])
        del d["_id"]
    return d


@knowledge_bp.route("/articles", methods=["GET"])
def get_articles():
    category = request.args.get("category", "").strip()
    search = request.args.get("search", "").strip().lower()

    col = get_collection("knowledge_articles")
    all_articles = [ _serialize(a) for a in col.find({}) ]

    filtered = []
    for a in all_articles:
        if category and category != "All" and a.get("category") != category:
            continue
        if search:
            tags_str = " ".join(a.get("tags", []))
            match = (
                search in a.get("title_en", "").lower() or
                search in a.get("title_kn", "").lower() or
                search in a.get("summary_en", "").lower() or
                search in a.get("summary_kn", "").lower() or
                search in a.get("content_en", "").lower() or
                search in a.get("content_kn", "").lower() or
                search in a.get("category", "").lower() or
                search in tags_str.lower()
            )
            if not match:
                continue
        filtered.append(a)

    return jsonify({"success": True, "articles": filtered, "total": len(filtered)})


@knowledge_bp.route("/articles/<article_id>", methods=["GET"])
def get_article(article_id):
    col = get_collection("knowledge_articles")
    art = None
    try:
        art = col.find_one({"_id": ObjectId(article_id)})
    except Exception:
        pass
    if not art:
        art = col.find_one({"id": article_id})
    if not art:
        art = col.find_one({"_id": article_id})
    if not art:
        return jsonify({"success": False, "message": "Article not found"}), 404
    return jsonify({"success": True, "article": _serialize(art)})


@knowledge_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = [
        "Crop cultivation",
        "Soil management",
        "Irrigation",
        "Fertilizer management",
        "Pest management",
        "Disease management",
        "Horticulture",
        "Organic farming",
        "Dairy and livestock",
        "Agricultural technology"
    ]
    return jsonify({"success": True, "categories": categories})

