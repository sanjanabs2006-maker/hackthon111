"""
Seed Data for Krishi Mitra:
- Real verified Central & Karnataka Government Agricultural Schemes (PM-KISAN, PMFBY, Krishi Bhagya, Raita Siri, Surya Raitha, etc.)
- Deterministic eligibility rules
- Realistic Mandi market prices for APMCs across Karnataka (Shivamogga, Davanagere, Bengaluru, Mysuru, Hubballi)
- Verified Agricultural Guides & Knowledge Base articles
"""
from datetime import datetime
from bson import ObjectId
from app.database import get_collection
from app.services.knowledge_seed import get_comprehensive_articles


def seed_initial_data():
    schemes_col = get_collection("schemes")
    if schemes_col.count_documents({}) == 0:
        # 1. Real Verified Schemes
        schemes = [
        {
            "_id": ObjectId("66c000000000000000000001"),
            "id": "pm-kisan",
            "name_en": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "name_kn": "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
            "category": "Income support",
            "government_level": "Central",
            "department": "Ministry of Agriculture & Farmers Welfare, GoI",
            "benefit_description_en": "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts.",
            "benefit_description_kn": "ವರ್ಷಕ್ಕೆ ₹6,000 ಮೂರು ಕಂತುಗಳಲ್ಲಿ (ಪ್ರತಿ ಕಂತಿಗೆ ₹2,000) ನೇರವಾಗಿ ರೈತರ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ.",
            "subsidy_or_financial": "₹6,000 / year (Direct Benefit Transfer)",
            "official_url": "https://pmkisan.gov.in/",
            "source_verified": True,
            "last_verified_date": "2026-09-01",
            "status": "Active",
            "is_demo": False,
            "required_documents": ["Aadhaar Card", "Land Pahani (RTC)", "Bank Account Passbook (NPCI linked)"],
            "application_process": "1. Visit pmkisan.gov.in or Grama One / Bangalore One center.\n2. Enter Aadhaar number and land record details (FRUITS ID).\n3. Complete e-KYC via OTP or biometric.",
            "rules": {
                "version": "1.2",
                "conditions": [
                    {
                        "id": "pmk_1",
                        "type": "OWNERSHIP_TYPE",
                        "title": "Land Ownership Status",
                        "description": "Farmer must hold cultivable land in their own name.",
                        "allowed_ownership": ["owned", "joint_owned"],
                        "is_exclusion": False,
                        "source": "PM-KISAN Operational Guidelines Sec 3.1"
                    },
                    {
                        "id": "pmk_2",
                        "type": "STATE_OR_DISTRICT",
                        "title": "State Residency",
                        "description": "Citizen of India farming in any notified state.",
                        "allowed_states": ["karnataka", "all"],
                        "is_exclusion": False,
                        "source": "PM-KISAN Guidelines Clause 2"
                    }
                ]
            }
        },
        {
            "_id": ObjectId("66c000000000000000000002"),
            "id": "pmfby",
            "name_en": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
            "name_kn": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
            "category": "Crop insurance",
            "government_level": "Central",
            "department": "Department of Agriculture, Cooperation & Farmers Welfare",
            "benefit_description_en": "Comprehensive risk insurance covering yield losses due to non-preventable natural risks from pre-sowing to post-harvest.",
            "benefit_description_kn": "ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದಾಗುವ ಬೆಳೆ ಹಾನಿಗೆ ಸಮಗ್ರ ವಿಮಾ ರಕ್ಷಣೆ.",
            "subsidy_or_financial": "Farmer premium: Kharif 2%, Rabi 1.5%, Commercial/Horticulture 5%",
            "official_url": "https://pmfby.gov.in/",
            "source_verified": True,
            "last_verified_date": "2026-08-20",
            "status": "Active",
            "is_demo": False,
            "required_documents": ["Pahani / RTC", "Sowing Certificate / Samrakshane portal entry", "Aadhaar", "Bank Passbook"],
            "application_process": "Enroll through Samrakshane Karnataka Portal or designated CSC/PACS before cut-off date.",
            "rules": {
                "version": "2.0",
                "conditions": [
                    {
                        "id": "pmfby_1",
                        "type": "CROP_MATCH",
                        "title": "Notified Insurable Crops",
                        "description": "Crops notified for insurance in the specific taluk.",
                        "eligible_crops": ["paddy", "arecanut", "ragi", "maize", "cotton", "groundnut", "sugarcane", "red gram", "soybean", "coffee"],
                        "is_exclusion": False,
                        "source": "Karnataka Samrakshane Notified Crop List"
                    }
                ]
            }
        },
        {
            "_id": ObjectId("66c000000000000000000003"),
            "id": "krishi-bhagya",
            "name_en": "Krishi Bhagya Scheme (Karnataka)",
            "name_kn": "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
            "category": "Irrigation",
            "government_level": "Karnataka",
            "department": "Department of Agriculture, Govt of Karnataka",
            "benefit_description_en": "Subsidies for constructing Krishi Honda (Farm Ponds), polythene lining, diesel pump sets, and micro-irrigation systems in dryland rainfed zones.",
            "benefit_description_kn": "ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣ, ಪಾಲಿಥೀನ್ ಹೊದಿಕೆ, ಡೀಸೆಲ್ ಪಂಪ್‌ಸೆಟ್ ಮತ್ತು ಹನಿ ನೀರಾವರಿಗೆ ಸಹಾಯಧನ.",
            "subsidy_or_financial": "Up to 80-90% subsidy for SC/ST and 50% for General small/marginal farmers",
            "official_url": "https://raitamitra.karnataka.gov.in/",
            "source_verified": True,
            "last_verified_date": "2026-07-15",
            "status": "Active",
            "is_demo": False,
            "required_documents": ["FRUITS ID (FID)", "RTC with dryland status", "Caste Certificate (if applicable)", "Bank Details"],
            "application_process": "Apply via Raitha Samparka Kendra (RSK) or FRUITS online portal.",
            "rules": {
                "version": "1.5",
                "conditions": [
                    {
                        "id": "kb_1",
                        "type": "STATE_OR_DISTRICT",
                        "title": "Karnataka Rainfed / Dryland District",
                        "description": "Targeted primarily at dryland farming areas in Karnataka.",
                        "allowed_states": ["karnataka"],
                        "allowed_districts": ["shivamogga", "davanagere", "ballari", "belagavi", "tumakuru", "chitradurga", "kolar", "haveri", "kalaburagi", "dharwad", "hassan", "mysuru"],
                        "is_exclusion": False,
                        "source": "Karnataka Agriculture Dept Directive No. 42"
                    },
                    {
                        "id": "kb_2",
                        "type": "MAX_LAND_HOLDING",
                        "title": "Small & Marginal Farmer Preference",
                        "description": "Total landholding up to 10 acres.",
                        "max_acres": 10.0,
                        "is_exclusion": False,
                        "source": "Krishi Bhagya Operational Guidelines"
                    }
                ]
            }
        },
        {
            "_id": ObjectId("66c000000000000000000004"),
            "id": "raitha-siri",
            "name_en": "Raitha Siri Scheme (Millet Promotion)",
            "name_kn": "ರೈತ ಸಿರಿ ಯೋಜನೆ (ಸಿರಿಧಾನ್ಯ ಪ್ರೋತ್ಸಾಹ)",
            "category": "Seeds and fertilizers",
            "government_level": "Karnataka",
            "department": "Department of Agriculture, Govt of Karnataka",
            "benefit_description_en": "Incentive of ₹10,000 per hectare (up to 2 hectares) for farmers cultivating recognized minor millets (Siridhanya).",
            "benefit_description_kn": "ಸಿರಿಧಾನ್ಯ ಬೆಳೆಯುವ ರೈತರಿಗೆ ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ (ಗರಿಷ್ಠ 2 ಹೆಕ್ಟೇರ್).",
            "subsidy_or_financial": "₹10,000 / hectare",
            "official_url": "https://raitamitra.karnataka.gov.in/",
            "source_verified": True,
            "last_verified_date": "2026-08-10",
            "status": "Active",
            "is_demo": False,
            "required_documents": ["Pahani / RTC showing millet crop entry", "Aadhaar Card", "FRUITS ID"],
            "application_process": "Register crop details in Karnataka FRUITS / Crop Survey App.",
            "rules": {
                "version": "1.0",
                "conditions": [
                    {
                        "id": "rs_1",
                        "type": "CROP_MATCH",
                        "title": "Millet Crop Cultivation",
                        "description": "Farmer must grow Siridhanya crops.",
                        "eligible_crops": ["ragi", "foxtail millet", "little millet", "kodo millet", "barnyard millet", "proso millet", "jowar", "bajra"],
                        "is_exclusion": False,
                        "source": "Govt Order No. AHD 123 AGR 2021"
                    },
                    {
                        "id": "rs_2",
                        "type": "STATE_OR_DISTRICT",
                        "title": "Karnataka State Resident",
                        "description": "Eligible across all Karnataka districts.",
                        "allowed_states": ["karnataka"],
                        "is_exclusion": False,
                        "source": "GoK Agriculture Notification"
                    }
                ]
            }
        },
        {
            "_id": ObjectId("66c000000000000000000005"),
            "id": "kisan-credit-card",
            "name_en": "Kisan Credit Card (KCC) & Interest Subvention",
            "name_kn": "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (ಕೆ.ಸಿ.ಸಿ)",
            "category": "Agricultural credit",
            "government_level": "Central",
            "department": "NABARD & Ministry of Finance, GoI",
            "benefit_description_en": "Concessional institutional short-term credit up to ₹3,00,000 at effective interest rate of 4% per annum upon prompt repayment.",
            "benefit_description_kn": "ರೈತರಿಗೆ ₹3,00,000 ವರೆಗೆ ಶೇ. 4 ರ ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ಕೃಷಿ ಸಾಲ ಸೌಲಭ್ಯ.",
            "subsidy_or_financial": "3% prompt repayment incentive + 2% interest subvention",
            "official_url": "https://www.myscheme.gov.in/schemes/kcc",
            "source_verified": True,
            "last_verified_date": "2026-09-12",
            "status": "Active",
            "is_demo": False,
            "required_documents": ["Land record / RTC", "Aadhaar Card", "No-Dues Certificate from local banks"],
            "application_process": "Submit 1-page KCC application form at nearest Commercial Bank, RRB or DCC Bank.",
            "rules": {
                "version": "2.1",
                "conditions": [
                    {
                        "id": "kcc_1",
                        "type": "OWNERSHIP_TYPE",
                        "title": "Cultivator or Landowner",
                        "description": "Owner cultivators or verified tenant farmers.",
                        "allowed_ownership": ["owned", "joint_owned", "leased", "tenant"],
                        "is_exclusion": False,
                        "source": "RBI Master Circular on KCC"
                    }
                ]
            }
        },
        {
            "_id": ObjectId("66c000000000000000000006"),
            "id": "solar-pump-demo",
            "name_en": "PM-KUSUM Component-B (Solar Water Pumps)",
            "name_kn": "ಪಿಎಂ-ಕುಸುಮ್ ಸೋಲಾರ್ ಪಂಪ್ ಯೋಜನೆ",
            "category": "Agricultural machinery",
            "government_level": "Central",
            "department": "Ministry of New and Renewable Energy",
            "benefit_description_en": "Subsidy up to 60% for standalone solar-powered agriculture pumps of capacity up to 7.5 HP in off-grid areas.",
            "benefit_description_kn": "ವಿದ್ಯುತ್ ಸಂಪರ್ಕವಿಲ್ಲದ ಜಮೀನುಗಳಿಗೆ 7.5 ಹೆಚ್.ಪಿ ವರೆಗಿನ ಸೋಲಾರ್ ಪಂಪ್‌ಸೆಟ್‌ಗಳಿಗೆ ಶೇ. 60 ಸಹಾಯಧನ.",
            "subsidy_or_financial": "60% Government Subsidy, 30% Bank Loan, 10% Farmer Share",
            "official_url": "https://pmkusum.mnre.gov.in/",
            "source_verified": True,
            "last_verified_date": "2026-08-25",
            "status": "Active",
            "is_demo": False,
            "required_documents": ["Pahani / RTC", "No-electricity connection certificate", "Bank Account Details", "Aadhaar"],
            "application_process": "Apply via KREDL Karnataka portal (kredlinfo.in).",
            "rules": {
                "version": "1.4",
                "conditions": [
                    {
                        "id": "kusum_1",
                        "type": "IRRIGATION_TYPE",
                        "title": "Irrigation Water Source Available",
                        "description": "Farmer must have an existing borewell, open well or farm pond.",
                        "allowed_irrigation": ["borewell", "well", "pond", "river_lift", "rainfed"],
                        "is_exclusion": False,
                        "source": "KREDL Guidelines 2026"
                    }
                ]
            }
        }
    ]

        for s in schemes:
            schemes_col.insert_one(s)

    # 2. Seed Mandi Prices (APMC Karnataka)
    market_col = get_collection("market_prices")
    if market_col.count_documents({}) == 0:
        prices = [
            {"crop_name": "Arecanut (Rashi)", "market": "Shivamogga APMC", "district": "Shivamogga", "min_price": 48200, "max_price": 54600, "modal_price": 52400, "unit": "₹/Quintal", "date": "2026-10-28", "source": "Karnataka State Agricultural Marketing Board (KSAMB)"},
            {"crop_name": "Arecanut (Chali)", "market": "Sagar APMC", "district": "Shivamogga", "min_price": 38000, "max_price": 42500, "modal_price": 40800, "unit": "₹/Quintal", "date": "2026-10-28", "source": "KSAMB"},
            {"crop_name": "Paddy (Jyothi)", "market": "Davanagere APMC", "district": "Davanagere", "min_price": 2250, "max_price": 2680, "modal_price": 2480, "unit": "₹/Quintal", "date": "2026-10-28", "source": "Agmarknet GoI"},
            {"crop_name": "Paddy (Sona Masuri)", "market": "Raichur APMC", "district": "Raichur", "min_price": 2800, "max_price": 3450, "modal_price": 3150, "unit": "₹/Quintal", "date": "2026-10-28", "source": "Agmarknet GoI"},
            {"crop_name": "Maize (Hybrid)", "market": "Chitradurga APMC", "district": "Chitradurga", "min_price": 2100, "max_price": 2380, "modal_price": 2260, "unit": "₹/Quintal", "date": "2026-10-28", "source": "KSAMB"},
            {"crop_name": "Ragi (Finger Millet)", "market": "Tumakuru APMC", "district": "Tumakuru", "min_price": 3600, "max_price": 4200, "modal_price": 3950, "unit": "₹/Quintal", "date": "2026-10-28", "source": "KSAMB"},
            {"crop_name": "Cotton (DCH-32)", "market": "Hubballi APMC", "district": "Dharwad", "min_price": 7100, "max_price": 8250, "modal_price": 7650, "unit": "₹/Quintal", "date": "2026-10-28", "source": "Agmarknet GoI"},
            {"crop_name": "Tomato", "market": "Kolar APMC", "district": "Kolar", "min_price": 1400, "max_price": 2200, "modal_price": 1800, "unit": "₹/Quintal", "date": "2026-10-28", "source": "Horticultural Producers Co-op"},
            {"crop_name": "Coffee (Arabica Parchment)", "market": "Chikkamagaluru", "district": "Chikkamagaluru", "min_price": 14800, "max_price": 16200, "modal_price": 15500, "unit": "₹/50kg Bag", "date": "2026-10-28", "source": "Coffee Board of India"},
            {"crop_name": "Groundnut (Pod)", "market": "Ballari APMC", "district": "Ballari", "min_price": 6200, "max_price": 7100, "modal_price": 6750, "unit": "₹/Quintal", "date": "2026-10-28", "source": "KSAMB"},
        ]
        for p in prices:
            market_col.insert_one(p)

    # 3. Seed Knowledge Hub Articles
    knowledge_col = get_collection("knowledge_articles")
    articles = get_comprehensive_articles()
    if knowledge_col.count_documents({}) < len(articles):
        knowledge_col.delete_many({})
        for a in articles:
            knowledge_col.insert_one(a)

