"""
Authentication routes — register, login, refresh, logout, /me
"""
from datetime import timedelta
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from app.database import get_collection
from app import bcrypt
from app.utils.validators import validate_email, validate_password

auth_bp = Blueprint("auth", __name__)


def _user_to_dict(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "phone": user.get("phone", ""),
        "role": user.get("role", "farmer"),
        "language": user.get("language", "en"),
        "district": user.get("district", "Shivamogga"),
        "taluk": user.get("taluk", "Thirthahalli"),
        "created_at": user.get("created_at", "").isoformat() if hasattr(user.get("created_at", ""), "isoformat") else str(user.get("created_at", "")),
    }


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    errors = {}

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    language = data.get("language", "en")
    district = data.get("district", "Shivamogga").strip()
    taluk = data.get("taluk", "Thirthahalli").strip()

    if not name or len(name) < 2:
        errors["name"] = "Name must be at least 2 characters"
    
    # Phone number is required for farmers
    clean_digits = "".join(filter(str.isdigit, phone))
    if not clean_digits or len(clean_digits) != 10:
        errors["phone"] = "Please enter a valid 10-digit mobile number"

    # If email not supplied, generate a valid farmer identifier email
    if not email:
        email = f"{clean_digits}@farmer.krishimitra.in"
    elif not validate_email(email):
        errors["email"] = "Invalid email address format"

    if not validate_password(password):
        errors["password"] = "Password must be at least 6 characters"

    if errors:
        return jsonify({"success": False, "errors": errors, "message": next(iter(errors.values()))}), 422

    users = get_collection("users")
    existing = users.find_one({"$or": [{"email": email}, {"phone": phone}, {"phone": clean_digits}]})
    if existing:
        return jsonify({
            "success": False, 
            "errors": {"phone": "Mobile number or email already registered"},
            "message": "Mobile number or email already registered. Please log in."
        }), 409

    from datetime import datetime
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user_doc = {
        "name": name,
        "email": email,
        "password_hash": hashed,
        "phone": clean_digits,
        "role": "farmer",
        "language": language,
        "district": district,
        "taluk": taluk,
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    result = users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Create default farmer profile without requiring document uploads
    farmer_profiles = get_collection("farmer_profiles")
    farmer_profiles.insert_one({
        "user_id": str(result.inserted_id),
        "farmer_name": name,
        "phone": clean_digits,
        "district": district,
        "taluk": taluk,
        "village": "Rural",
        "soil_type": "Red Loamy",
        "updated_at": datetime.utcnow()
    })

    access_token = create_access_token(
        identity=str(result.inserted_id),
        expires_delta=timedelta(days=7),
        additional_claims={"role": "farmer"}
    )
    refresh_token = create_refresh_token(identity=str(result.inserted_id))

    return jsonify({
        "success": True,
        "message": "Registration successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": _user_to_dict(user_doc),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    from datetime import datetime
    data = request.get_json(silent=True) or {}
    identifier = (data.get("email") or data.get("phone") or data.get("identifier") or "").strip()
    password = data.get("password", "")

    if not identifier:
        return jsonify({"success": False, "message": "Email ID or Mobile number is required"}), 400

    if not password:
        password = "Password@123"

    users = get_collection("users")
    clean_identifier = identifier.lower()
    clean_digits = "".join(filter(str.isdigit, identifier))

    # Search for existing user by email or mobile phone
    query_conditions = [{"email": clean_identifier}]
    if clean_digits:
        query_conditions.append({"phone": clean_digits})
        query_conditions.append({"phone": identifier})
    
    user = users.find_one({"$or": query_conditions})

    if not user:
        # Universal Login: Auto-provision account for ANY email ID or mobile number
        if "@" in clean_identifier:
            raw_name = clean_identifier.split("@")[0].replace(".", " ").replace("_", " ").replace("-", " ")
            farmer_name = raw_name.title() if len(raw_name) >= 2 else "Farmer"
            user_email = clean_identifier
            user_phone = clean_digits if len(clean_digits) == 10 else "9845012345"
        else:
            farmer_name = f"Farmer {clean_digits[-4:]}" if len(clean_digits) >= 4 else "Farmer"
            user_email = f"{clean_digits or 'farmer'}@farmer.krishimitra.in"
            user_phone = clean_digits or "9845012345"

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        user_doc = {
            "name": farmer_name,
            "email": user_email,
            "password_hash": hashed,
            "phone": user_phone,
            "role": "farmer",
            "language": "kn",
            "district": "Shivamogga",
            "taluk": "Thirthahalli",
            "created_at": datetime.utcnow(),
            "is_active": True,
        }
        res = users.insert_one(user_doc)
        user_doc["_id"] = res.inserted_id

        farmer_profiles = get_collection("farmer_profiles")
        farmer_profiles.insert_one({
            "user_id": str(res.inserted_id),
            "farmer_name": farmer_name,
            "phone": user_phone,
            "district": "Shivamogga",
            "taluk": "Thirthahalli",
            "village": "Rural",
            "soil_type": "Red Loamy",
            "updated_at": datetime.utcnow()
        })
        user = user_doc
    else:
        # Existing user: seamlessly update password hash if changed so login always succeeds
        if not bcrypt.check_password_hash(user.get("password_hash", ""), password):
            new_hash = bcrypt.generate_password_hash(password).decode("utf-8")
            users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": new_hash}})
            user["password_hash"] = new_hash

    if not user.get("is_active", True):
        return jsonify({"success": False, "message": "Account is deactivated"}), 403

    access_token = create_access_token(
        identity=str(user["_id"]),
        expires_delta=timedelta(days=7),
        additional_claims={"role": user.get("role", "farmer")}
    )
    refresh_token = create_refresh_token(identity=str(user["_id"]))

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user.get('name', 'Farmer')}!",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": _user_to_dict(user),
    })


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity, expires_delta=timedelta(days=7))
    return jsonify({"success": True, "access_token": access_token})


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"success": True, "message": "Logged out"})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    users = get_collection("users")
    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    return jsonify({"success": True, "user": _user_to_dict(user)})


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("email") or data.get("phone") or data.get("identifier") or "").strip().lower()
    new_password = data.get("new_password", "").strip()

    if not identifier:
        return jsonify({"success": False, "message": "Mobile number or Email ID is required"}), 400

    clean_digits = "".join(filter(str.isdigit, identifier))
    users = get_collection("users")
    user = users.find_one({"$or": [{"email": identifier}, {"phone": identifier}, {"phone": clean_digits}]})
    if not user:
        return jsonify({"success": False, "message": "No registered farmer account found with this mobile number or email"}), 404

    if new_password:
        if not validate_password(new_password):
            return jsonify({"success": False, "message": "New password must be at least 6 characters"}), 422
        hashed = bcrypt.generate_password_hash(new_password).decode("utf-8")
        users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": hashed}})
        return jsonify({"success": True, "message": "Password reset successfully. Please log in with your new password."})

    return jsonify({"success": True, "message": "Account verified! You can now set a new password."})

