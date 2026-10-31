"""
Document & Application Centre Routes
- Secure document storage & categorization (RTC/Pahani, Aadhaar, Bank Passbook, Crop Survey)
- OCR extraction extraction with explicit Farmer Confirmation dialog
- Safety notice: OCR does not replace certified Bhoomi portal RTC
"""
import os
import uuid
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.database import get_collection

documents_bp = Blueprint("documents", __name__)


@documents_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():
    user_id = get_jwt_identity()
    file = request.files.get("file")
    doc_type = request.form.get("document_type", "Pahani / RTC").strip()
    title = request.form.get("title", "Farm Document").strip()

    if not file or not file.filename:
        return jsonify({"success": False, "message": "No file uploaded"}), 400

    filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    # Simulated OCR extraction tailored to Karnataka land/identity documents
    extracted_data = {}
    if "rtc" in doc_type.lower() or "pahani" in doc_type.lower():
        extracted_data = {
            "document_type": "Karnataka Bhoomi RTC / Pahani",
            "owner_name": "Farmer (As recorded in Form No. 16)",
            "district": "Shivamogga",
            "taluk": "Thirthahalli",
            "hobli": "Kasaba",
            "village": "Agumbe",
            "survey_number": "142/A",
            "total_extent": "2.50 Acres",
            "soil_classification": "Bagayat / Dryland",
            "water_source": "Borewell",
            "verification_note": "Awaiting farmer manual confirmation before updating farm profile"
        }
    elif "aadhaar" in doc_type.lower():
        extracted_data = {
            "document_type": "Government of India Aadhaar",
            "masked_number": "XXXX-XXXX-8924",
            "year_of_birth": "1982",
            "gender": "Male/Female",
            "address_state": "Karnataka"
        }
    else:
        extracted_data = {
            "document_type": doc_type,
            "detected_text": "Agricultural certificate / bank passbook header verified.",
            "status": "Ready for farmer review"
        }

    doc_record = {
        "farmer_id": user_id,
        "title": title,
        "document_type": doc_type,
        "filename": filename,
        "file_url": f"/api/v1/documents/files/{filename}",
        "file_size_kb": round(os.path.getsize(filepath) / 1024, 1),
        "extracted_ocr": extracted_data,
        "is_confirmed_by_farmer": False,
        "uploaded_at": datetime.utcnow().isoformat()
    }

    res = get_collection("documents").insert_one(doc_record)
    doc_record["id"] = str(res.inserted_id)
    if "_id" in doc_record:
        del doc_record["_id"]

    return jsonify({"success": True, "document": doc_record}), 201


@documents_bp.route("", methods=["GET"])
@jwt_required()
def list_documents():
    user_id = get_jwt_identity()
    col = get_collection("documents")
    docs = list(col.find({"farmer_id": user_id}))
    for d in docs:
        d["id"] = str(d.get("_id", ""))
        if "_id" in d:
            del d["_id"]
    return jsonify({"success": True, "documents": docs})


@documents_bp.route("/<doc_id>/confirm", methods=["POST"])
@jwt_required()
def confirm_document_ocr(doc_id):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    col = get_collection("documents")
    
    col.update_one(
        {"_id": ObjectId(doc_id), "farmer_id": user_id},
        {"$set": {"is_confirmed_by_farmer": True, "confirmed_data": data.get("confirmed_data", {})}}
    )
    return jsonify({"success": True, "message": "Document information confirmed by farmer"})


@documents_bp.route("/<doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    user_id = get_jwt_identity()
    get_collection("documents").delete_one({"_id": ObjectId(doc_id), "farmer_id": user_id})
    return jsonify({"success": True, "message": "Document deleted"})


@documents_bp.route("/files/<path:filename>", methods=["GET"])
def serve_file(filename):
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    return send_from_directory(upload_dir, filename)

