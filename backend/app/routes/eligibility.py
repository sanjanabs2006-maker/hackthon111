"""
Eligibility Evaluation Routes
Uses the deterministic Python Rule-Based Engine.
Outputs structured evaluation condition breakdown and farmer values.
"""
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_collection
from app.eligibility.engine import eligibility_engine

eligibility_bp = Blueprint("eligibility", __name__)

DEFAULT_FARMER_ID = "demo_farmer_shivamogga"


def _serialize(doc):
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d["_id"])
        del d["_id"]
    return d


@eligibility_bp.route("/evaluate", methods=["POST"])
@jwt_required(optional=True)
def evaluate_scheme():
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    data = request.get_json(silent=True) or {}
    scheme_id = data.get("scheme_id")

    if not scheme_id:
        return jsonify({"success": False, "message": "scheme_id required"}), 400

    # Fetch farmer profile, land parcels, crops
    profiles = get_collection("farmer_profiles")
    profile = profiles.find_one({"user_id": user_id}) or {}
    land = list(get_collection("farm_land").find({"farmer_id": user_id}))
    crops = list(get_collection("crops").find({"farmer_id": user_id}))

    total_acres = sum(
        (float(l.get("area", 0)) if l.get("unit") == "Acre" else float(l.get("area", 0)) / 40.0) 
        for l in land
    )

    farmer_context = dict(profile)
    farmer_context["total_acres"] = round(total_acres, 2)
    farmer_context["land_records"] = land
    farmer_context["crops"] = crops

    # Fetch scheme
    schemes_col = get_collection("schemes")
    scheme = None
    try:
        scheme = schemes_col.find_one({"_id": ObjectId(scheme_id)})
    except Exception:
        pass
    if not scheme:
        scheme = schemes_col.find_one({"id": scheme_id})

    if not scheme:
        return jsonify({"success": False, "message": "Scheme not found"}), 404

    rules = scheme.get("rules", {"conditions": []})
    result = eligibility_engine.evaluate(farmer_context, scheme, rules)

    # Save assessment history in database
    assessments_col = get_collection("eligibility_assessments")
    record = {
        "farmer_id": user_id,
        "scheme_id": str(scheme.get("_id", scheme_id)),
        "scheme_name": scheme.get("name_en", ""),
        "status": result["status"],
        "summary": result["summary"],
        "breakdown": result["breakdown"],
        "missing_fields": result["missing_fields"],
        "evaluated_at": datetime.utcnow().isoformat()
    }
    inserted = assessments_col.insert_one(record)
    result["assessment_id"] = str(inserted.inserted_id)

    return jsonify({"success": True, "assessment": result})


@eligibility_bp.route("/farm-evaluations", methods=["GET"])
@jwt_required(optional=True)
def evaluate_farm_schemes():
    """
    Evaluates all active government schemes against the farmer's registered land and crops in My Farm.
    """
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    profiles = get_collection("farmer_profiles")
    profile = profiles.find_one({"user_id": user_id}) or {}
    land = list(get_collection("farm_land").find({"farmer_id": user_id}))
    crops = list(get_collection("crops").find({"farmer_id": user_id}))

    total_acres = sum(
        (float(l.get("area", 0)) if l.get("unit") == "Acre" else float(l.get("area", 0)) / 40.0) 
        for l in land
    )

    farmer_context = dict(profile)
    farmer_context["total_acres"] = round(total_acres, 2)
    farmer_context["land_records"] = land
    farmer_context["crops"] = crops

    schemes = list(get_collection("schemes").find({}))
    evaluations = []
    for s in schemes:
        s_id = str(s.get("_id", s.get("id", "")))
        rules = s.get("rules", {"conditions": []})
        res = eligibility_engine.evaluate(farmer_context, s, rules)
        evaluations.append({
            "scheme_id": s_id,
            "name_en": s.get("name_en", ""),
            "name_kn": s.get("name_kn", ""),
            "category": s.get("category", "General"),
            "government": s.get("government", "Central"),
            "benefit_summary": s.get("benefit_summary_en", ""),
            "status": res["status"],
            "summary": res["summary"],
            "conditions_passed": sum(1 for b in res.get("breakdown", []) if b.get("status") == "PASS"),
            "conditions_total": len(res.get("breakdown", []))
        })

    return jsonify({
        "success": True,
        "evaluations": evaluations,
        "farmer_context": {
            "total_acres": round(total_acres, 2),
            "crops_count": len(crops),
            "crops": [c.get("name") for c in crops],
            "district": profile.get("district", "Shivamogga")
        }
    })


@eligibility_bp.route("/assessments/<assessment_id>", methods=["GET"])
@jwt_required(optional=True)
def get_assessment(assessment_id):
    assessments_col = get_collection("eligibility_assessments")
    rec = None
    try:
        rec = assessments_col.find_one({"_id": ObjectId(assessment_id)})
    except Exception:
        pass
    if not rec:
        return jsonify({"success": False, "message": "Assessment record not found"}), 404
    return jsonify({"success": True, "assessment": _serialize(rec)})
