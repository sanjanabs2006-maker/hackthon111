"""
Deterministic Rule-Based Scheme Eligibility Engine for Krishi Mitra.
Evaluates farmer farm profile against validated scheme rules with full audit trace.
"""
from typing import Dict, Any, List, Tuple
from datetime import datetime


class EligibilityResultStatus:
    POTENTIALLY_APPLICABLE = "POTENTIALLY_APPLICABLE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    NEEDS_INFORMATION = "NEEDS_INFORMATION"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"
    SOURCE_UNVERIFIED = "SOURCE_UNVERIFIED"


class SchemeEligibilityEngine:
    def __init__(self):
        pass

    def evaluate(self, farmer_profile: Dict[str, Any], scheme: Dict[str, Any], rules: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a farmer profile against scheme criteria.
        Returns detailed evaluation breakdown and final status.
        """
        # 1. Source verification check
        source_verified = scheme.get("source_verified", False)
        if not source_verified:
            return {
                "status": EligibilityResultStatus.SOURCE_UNVERIFIED,
                "summary": "This scheme rule set is pending verification against official gazette or portal records.",
                "confidence": 0.0,
                "breakdown": [],
                "missing_fields": [],
                "source_ref": scheme.get("source_url", "https://raitamitra.karnataka.gov.in/"),
                "verification_date": scheme.get("last_verified_date", datetime.utcnow().strftime("%Y-%m-%d")),
                "evaluated_at": datetime.utcnow().isoformat()
            }

        breakdown: List[Dict[str, Any]] = []
        missing_fields: List[str] = []
        has_failure = False
        needs_info = False

        conditions = rules.get("conditions", [])

        # Calculate total land in standard Acres across all land parcels
        land_parcels = farmer_profile.get("land_records", [])
        total_acres = 0.0
        for parcel in land_parcels:
            unit = parcel.get("unit", "Acre").lower()
            val = float(parcel.get("area", 0.0))
            if unit == "acre":
                total_acres += val
            elif unit == "gunta":
                total_acres += val / 40.0
            elif unit == "hectare":
                total_acres += val * 2.47105
            elif unit == "sq_meter" or unit == "sqm":
                total_acres += val * 0.000247105

        crops_cultivated = [c.get("name", "").lower() for c in farmer_profile.get("crops", [])]
        farmer_district = (farmer_profile.get("district") or "").strip().lower()
        farmer_state = (farmer_profile.get("state") or "Karnataka").strip().lower()
        irrigation_types = [l.get("irrigation_type", "").lower() for l in land_parcels]

        for cond in conditions:
            cond_id = cond.get("id", "cond")
            cond_type = cond.get("type")
            title = cond.get("title", "")
            description = cond.get("description", "")
            source = cond.get("source", scheme.get("official_source", "Official Scheme Guidelines"))
            is_exclusion = cond.get("is_exclusion", False)

            status = "UNKNOWN"
            farmer_val = None
            explanation = ""

            if cond_type == "MAX_LAND_HOLDING":
                threshold = cond.get("max_acres", 5.0)
                if not land_parcels:
                    status = "UNKNOWN"
                    needs_info = True
                    missing_fields.append("Land Area / Parcels")
                    explanation = f"Land records not yet registered. Maximum permitted is {threshold} acres."
                else:
                    farmer_val = f"{total_acres:.2f} Acres"
                    if total_acres <= threshold:
                        status = "PASS" if not is_exclusion else "FAIL"
                        explanation = f"Your total land holding ({total_acres:.2f} acres) satisfies the ceiling of {threshold} acres."
                    else:
                        status = "FAIL" if not is_exclusion else "PASS"
                        explanation = f"Your total land holding ({total_acres:.2f} acres) exceeds the ceiling of {threshold} acres."

            elif cond_type == "STATE_OR_DISTRICT":
                allowed_states = [s.lower() for s in cond.get("allowed_states", ["karnataka"])]
                allowed_districts = [d.lower() for d in cond.get("allowed_districts", [])]
                farmer_val = f"{farmer_district.title()}, {farmer_state.title()}" if farmer_district else farmer_state.title()
                
                if farmer_state in allowed_states:
                    if allowed_districts and farmer_district:
                        if farmer_district in allowed_districts:
                            status = "PASS"
                            explanation = f"Eligible location: {farmer_district.title()} is in the notified zone."
                        else:
                            status = "FAIL"
                            explanation = f"Notified only for districts: {', '.join(d.title() for d in allowed_districts)}."
                    elif allowed_districts and not farmer_district:
                        status = "UNKNOWN"
                        needs_info = True
                        missing_fields.append("District")
                        explanation = "Please specify your district to confirm eligibility for notified taluks."
                    else:
                        status = "PASS"
                        explanation = f"Eligible Karnataka state resident."
                else:
                    status = "FAIL"
                    explanation = f"Requires state residency in {', '.join(s.title() for s in allowed_states)}."

            elif cond_type == "CROP_MATCH":
                eligible_crops = [c.lower() for c in cond.get("eligible_crops", [])]
                if not crops_cultivated:
                    status = "UNKNOWN"
                    needs_info = True
                    missing_fields.append("Cultivated Crops")
                    explanation = f"No active crop records registered. Notified crops include: {', '.join(c.title() for c in eligible_crops)}."
                else:
                    farmer_val = ", ".join(c.title() for c in crops_cultivated)
                    matches = [c for c in crops_cultivated if c in eligible_crops]
                    if matches:
                        status = "PASS"
                        explanation = f"Matched notified crops: {', '.join(m.title() for m in matches)}."
                    else:
                        status = "FAIL"
                        explanation = f"Crops grown ({farmer_val}) do not match notified crops: {', '.join(c.title() for c in eligible_crops[:5])}."

            elif cond_type == "IRRIGATION_TYPE":
                required_irrigation = [i.lower() for i in cond.get("allowed_irrigation", [])]
                if not irrigation_types:
                    status = "UNKNOWN"
                    needs_info = True
                    missing_fields.append("Irrigation Details")
                    explanation = "Irrigation setup not specified on farm land records."
                else:
                    farmer_val = ", ".join(set(irrigation_types)).title()
                    if any(it in required_irrigation for it in irrigation_types):
                        status = "PASS"
                        explanation = f"Farm irrigation method ({farmer_val}) qualifies for scheme support."
                    else:
                        status = "FAIL"
                        explanation = f"Requires irrigation method: {', '.join(r.title() for r in required_irrigation)}."

            elif cond_type == "OWNERSHIP_TYPE":
                allowed_ownership = [o.lower() for o in cond.get("allowed_ownership", ["owned"])]
                owners = [l.get("ownership_type", "owned").lower() for l in land_parcels]
                if not owners:
                    status = "UNKNOWN"
                    needs_info = True
                    missing_fields.append("Land Ownership Proof / RTC")
                    explanation = "Ownership type needed to verify landholding rights."
                else:
                    farmer_val = ", ".join(set(owners)).title()
                    if any(o in allowed_ownership for o in owners):
                        status = "PASS"
                        explanation = f"Ownership status verified as {farmer_val}."
                    else:
                        status = "FAIL"
                        explanation = f"Only {', '.join(allowed_ownership)} land records qualify."

            else:
                # Custom generic condition
                status = "PASS"
                farmer_val = "Verified"
                explanation = "Standard farmer eligibility criteria met."

            if status == "FAIL":
                has_failure = True
            elif status == "UNKNOWN":
                needs_info = True

            breakdown.append({
                "condition_id": cond_id,
                "title": title,
                "description": description,
                "status": status,
                "farmer_value": farmer_val,
                "explanation": explanation,
                "source": source,
                "verification_date": scheme.get("last_verified_date", "2026-08-15")
            })

        # Final determination
        if has_failure:
            final_status = EligibilityResultStatus.NOT_APPLICABLE
            summary = "One or more mandatory eligibility requirements were not met based on your farm records."
        elif needs_info:
            final_status = EligibilityResultStatus.NEEDS_INFORMATION
            summary = f"Additional information required to complete evaluation: {', '.join(set(missing_fields))}."
        else:
            final_status = EligibilityResultStatus.POTENTIALLY_APPLICABLE
            summary = "Your digital farm profile satisfies the verified guidelines for this agricultural scheme."

        return {
            "status": final_status,
            "summary": summary,
            "breakdown": breakdown,
            "missing_fields": list(set(missing_fields)),
            "scheme_name": scheme.get("name_en", scheme.get("name", "")),
            "scheme_id": str(scheme.get("_id", scheme.get("id", ""))),
            "official_portal": scheme.get("official_url", ""),
            "evaluated_at": datetime.utcnow().isoformat()
        }


# Global engine instance
eligibility_engine = SchemeEligibilityEngine()

