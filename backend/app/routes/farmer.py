"""
Farmer Profile & Digital Farm Management Routes
- Single Source of Truth for Farm DNA: Land Parcels, Crops, Irrigation, Soil
- Full persistent CRUD on MongoDB with guest/demo & authenticated farmer support
"""
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_collection

farmer_bp = Blueprint("farmer", __name__)

DEFAULT_FARMER_ID = "demo_farmer_shivamogga"


def _serialize(doc):
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d["_id"])
        del d["_id"]
    return d


@farmer_bp.route("/profile", methods=["GET"])
@jwt_required(optional=True)
def get_profile():
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    profiles = get_collection("farmer_profiles")
    users = get_collection("users")
    
    user = None
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass

    profile = profiles.find_one({"user_id": user_id})
    
    if not profile:
        profile = {
            "user_id": user_id,
            "farmer_name": user.get("name") if user else "Suresh Gowda",
            "state": "Karnataka",
            "district": "Shivamogga",
            "taluk": "Thirthahalli",
            "village": "Agumbe",
            "fruits_id": "KA-FRUITS-2026-8819",
            "soil_type": "Red Loam",
            "annual_income_bracket": "< ₹1.5 Lakh",
            "social_category": "General",
            "phone": user.get("phone") if user else "9845012345",
            "completeness_score": 85,
            "created_at": datetime.utcnow().isoformat()
        }
        res = profiles.insert_one(profile)
        profile["_id"] = res.inserted_id

        # Seed initial land parcel if empty
        if get_collection("farm_land").count_documents({"farmer_id": user_id}) == 0:
            get_collection("farm_land").insert_one({
                "farmer_id": user_id,
                "survey_number": "142",
                "hissa_number": "2A",
                "area": 2.5,
                "unit": "Acre",
                "ownership_type": "Owned",
                "irrigation_type": "Borewell",
                "soil_type": "Red Loam",
                "created_at": datetime.utcnow().isoformat()
            })

        # Seed initial crops if empty
        if get_collection("crops").count_documents({"farmer_id": user_id}) == 0:
            get_collection("crops").insert_one({
                "farmer_id": user_id,
                "name": "Arecanut",
                "variety": "Mohitnagar / Mangala",
                "area": 1.5,
                "unit": "Acre",
                "season": "Perennial",
                "sowing_date": "2024-06-15",
                "status": "Growing",
                "created_at": datetime.utcnow().isoformat()
            })
            get_collection("crops").insert_one({
                "farmer_id": user_id,
                "name": "Paddy",
                "variety": "Jyothi (IET 1444)",
                "area": 1.0,
                "unit": "Acre",
                "season": "Kharif",
                "sowing_date": "2026-06-20",
                "status": "Harvest Ready",
                "created_at": datetime.utcnow().isoformat()
            })

    # Attach live land & crops from MongoDB
    land = [ _serialize(l) for l in get_collection("farm_land").find({"farmer_id": user_id}) ]
    crops = [ _serialize(c) for c in get_collection("crops").find({"farmer_id": user_id}) ]

    p_dict = _serialize(profile)
    p_dict["land_records"] = land
    p_dict["crops"] = crops
    
    # Calculate Farm DNA metrics dynamically
    total_acres = sum(
        (float(l.get("area", 0)) if l.get("unit") == "Acre" else float(l.get("area", 0)) / 40.0) 
        for l in land
    )
    p_dict["total_acres"] = round(total_acres, 2)
    p_dict["crop_diversity_count"] = len(crops)
    
    return jsonify({"success": True, "profile": p_dict})


@farmer_bp.route("/profile", methods=["PUT"])
@jwt_required(optional=True)
def update_profile():
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    data = request.get_json(silent=True) or {}
    profiles = get_collection("farmer_profiles")
    existing = profiles.find_one({"user_id": user_id}) or {}
    
    update_data = {
        "farmer_name": data.get("farmer_name", existing.get("farmer_name", "Suresh Gowda")).strip(),
        "district": data.get("district", existing.get("district", "Shivamogga")).strip(),
        "taluk": data.get("taluk", existing.get("taluk", "Thirthahalli")).strip(),
        "village": data.get("village", existing.get("village", "Agumbe")).strip(),
        "fruits_id": data.get("fruits_id", existing.get("fruits_id", "KA-FRUITS-2026-8819")).strip(),
        "soil_type": data.get("soil_type", existing.get("soil_type", "Red Loam")),
        "annual_income_bracket": data.get("annual_income_bracket", existing.get("annual_income_bracket", "< ₹1.5 Lakh")),
        "social_category": data.get("social_category", existing.get("social_category", "General")),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    profiles.update_one({"user_id": user_id}, {"$set": update_data})
    return jsonify({"success": True, "message": "Farmer profile updated successfully", "profile": update_data})


@farmer_bp.route("/farm/land", methods=["POST"])
@jwt_required(optional=True)
def add_land():
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    data = request.get_json(silent=True) or {}
    
    area_val = float(data.get("area", 1.0))
    parcel = {
        "farmer_id": user_id,
        "survey_number": str(data.get("survey_number", "")).strip(),
        "hissa_number": str(data.get("hissa_number", "")).strip(),
        "area": area_val,
        "unit": data.get("unit", "Acre"),
        "ownership_type": data.get("ownership_type", "Owned"),
        "irrigation_type": data.get("irrigation_type", "Borewell"),
        "soil_type": data.get("soil_type", "Red Loam"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = get_collection("farm_land").insert_one(parcel)
    parcel["_id"] = res.inserted_id
    return jsonify({"success": True, "land": _serialize(parcel)}), 201


@farmer_bp.route("/farm/land/<land_id>", methods=["DELETE"])
@jwt_required(optional=True)
def delete_land(land_id):
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    query = {"farmer_id": user_id}
    try:
        query["_id"] = ObjectId(land_id)
    except Exception:
        query["_id"] = land_id
    get_collection("farm_land").delete_one(query)
    return jsonify({"success": True, "message": "Land parcel removed"})


@farmer_bp.route("/farm/crops", methods=["POST"])
@jwt_required(optional=True)
def add_crop():
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    data = request.get_json(silent=True) or {}
    
    crop = {
        "farmer_id": user_id,
        "name": data.get("name", "").strip(),
        "variety": data.get("variety", "").strip(),
        "area": float(data.get("area", 1.0)),
        "unit": data.get("unit", "Acre"),
        "season": data.get("season", "Kharif"),
        "sowing_date": data.get("sowing_date", datetime.utcnow().strftime("%Y-%m-%d")),
        "status": data.get("status", "Growing"),
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = get_collection("crops").insert_one(crop)
    crop["_id"] = res.inserted_id
    return jsonify({"success": True, "crop": _serialize(crop)}), 201


@farmer_bp.route("/farm/crops/<crop_id>", methods=["DELETE"])
@jwt_required(optional=True)
def delete_crop(crop_id):
    user_id = get_jwt_identity() or DEFAULT_FARMER_ID
    query = {"farmer_id": user_id}
    try:
        query["_id"] = ObjectId(crop_id)
    except Exception:
        query["_id"] = crop_id
    get_collection("crops").delete_one(query)
    return jsonify({"success": True, "message": "Crop record removed"})
