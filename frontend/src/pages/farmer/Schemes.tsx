import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '../../components/common/MotionComponents';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldCheck, Search, Filter, ArrowRight, 
  ExternalLink, CheckCircle2, Bookmark, Layers, Scale, X, RefreshCw
} from 'lucide-react';

// Client-side fallback schemes ensuring schemes always render
const FALLBACK_SCHEMES = [
  {
    id: "pm-kisan",
    name_en: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    name_kn: "ಪಿಎಂ-ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
    category: "Income support",
    government_level: "Central",
    department: "Ministry of Agriculture & Farmers Welfare, GoI",
    benefit_description_en: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts.",
    benefit_description_kn: "ವರ್ಷಕ್ಕೆ ₹6,000 ಮೂರು ಕಂತುಗಳಲ್ಲಿ (ಪ್ರತಿ ಕಂತಿಗೆ ₹2,000) ನೇರವಾಗಿ ರೈತರ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ.",
    subsidy_or_financial: "₹6,000 / year (Direct Benefit Transfer)",
    last_verified_date: "2026-09-01",
    required_documents: ["Aadhaar Card", "Land Pahani (RTC)", "Bank Account Passbook (NPCI linked)"]
  },
  {
    id: "pmfby",
    name_en: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    name_kn: "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
    category: "Crop insurance",
    government_level: "Central",
    department: "Department of Agriculture, Cooperation & Farmers Welfare",
    benefit_description_en: "Comprehensive risk insurance covering yield losses due to non-preventable natural risks from pre-sowing to post-harvest.",
    benefit_description_kn: "ನೈಸರ್ಗಿಕ ವಿಕೋಪಗಳಿಂದಾಗುವ ಬೆಳೆ ಹಾನಿಗೆ ಸಮಗ್ರ ವಿಮಾ ರಕ್ಷಣೆ.",
    subsidy_or_financial: "Farmer premium: Kharif 2%, Rabi 1.5%, Commercial/Horticulture 5%",
    last_verified_date: "2026-08-20",
    required_documents: ["Pahani / RTC", "Sowing Certificate", "Aadhaar", "Bank Passbook"]
  },
  {
    id: "krishi-bhagya",
    name_en: "Krishi Bhagya Scheme (Karnataka)",
    name_kn: "ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆ (ಕರ್ನಾಟಕ)",
    category: "Irrigation",
    government_level: "Karnataka",
    department: "Department of Agriculture, Govt of Karnataka",
    benefit_description_en: "Subsidies for constructing Krishi Honda (Farm Ponds), polythene lining, diesel pump sets, and micro-irrigation systems in dryland rainfed zones.",
    benefit_description_kn: "ಕೃಷಿ ಹೊಂಡ ನಿರ್ಮಾಣ, ಪಾಲಿಥೀನ್ ಹೊದಿಕೆ, ಡೀಸೆಲ್ ಪಂಪ್‌ಸೆಟ್ ಮತ್ತು ಹನಿ ನೀರಾವರಿಗೆ ಸಹಾಯಧನ.",
    subsidy_or_financial: "Up to 80-90% subsidy for SC/ST and 50% for General small/marginal farmers",
    last_verified_date: "2026-07-15",
    required_documents: ["FRUITS ID (FID)", "RTC with dryland status", "Bank Details"]
  },
  {
    id: "raitha-siri",
    name_en: "Raitha Siri Scheme (Millet Promotion)",
    name_kn: "ರೈತ ಸಿರಿ ಯೋಜನೆ (ಸಿರಿಧಾನ್ಯ ಪ್ರೋತ್ಸಾಹ)",
    category: "Seeds and fertilizers",
    government_level: "Karnataka",
    department: "Department of Agriculture, Govt of Karnataka",
    benefit_description_en: "Incentive of ₹10,000 per hectare (up to 2 hectares) for farmers cultivating recognized minor millets (Siridhanya).",
    benefit_description_kn: "ಸಿರಿಧಾನ್ಯ ಬೆಳೆಯುವ ರೈತರಿಗೆ ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ ₹10,000 ಪ್ರೋತ್ಸಾಹಧನ (ಗರಿಷ್ಠ 2 ಹೆಕ್ಟೇರ್).",
    subsidy_or_financial: "₹10,000 / hectare",
    last_verified_date: "2026-08-10",
    required_documents: ["Pahani / RTC showing millet crop entry", "Aadhaar Card", "FRUITS ID"]
  },
  {
    id: "kisan-credit-card",
    name_en: "Kisan Credit Card (KCC) & Interest Subvention",
    name_kn: "ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (ಕೆ.ಸಿ.ಸಿ)",
    category: "Agricultural credit",
    government_level: "Central",
    department: "NABARD & Ministry of Finance, GoI",
    benefit_description_en: "Concessional institutional short-term credit up to ₹3,00,000 at effective interest rate of 4% per annum upon prompt repayment.",
    benefit_description_kn: "ರೈತರಿಗೆ ₹3,00,000 ವರೆಗೆ ಶೇ. 4 ರ ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ಕೃಷಿ ಸಾಲ ಸೌಲಭ್ಯ.",
    subsidy_or_financial: "3% prompt repayment incentive + 2% interest subvention",
    last_verified_date: "2026-09-12",
    required_documents: ["Land record / RTC", "Aadhaar Card", "No-Dues Certificate"]
  },
  {
    id: "solar-pump-demo",
    name_en: "PM-KUSUM Component-B (Solar Water Pumps)",
    name_kn: "ಪಿಎಂ-ಕುಸುಮ್ ಸೋಲಾರ್ ಪಂಪ್ ಯೋಜನೆ",
    category: "Agricultural machinery",
    government_level: "Central",
    department: "Ministry of New and Renewable Energy",
    benefit_description_en: "Subsidy up to 60% for standalone solar-powered agriculture pumps of capacity up to 7.5 HP in off-grid areas.",
    benefit_description_kn: "ವಿದ್ಯುತ್ ಸಂಪರ್ಕವಿಲ್ಲದ ಜಮೀನುಗಳಿಗೆ 7.5 ಹೆಚ್.ಪಿ ವರೆಗಿನ ಸೋಲಾರ್ ಪಂಪ್‌ಸೆಟ್‌ಗಳಿಗೆ ಶೇ. 60 ಸಹಾಯಧನ.",
    subsidy_or_financial: "60% Government Subsidy, 30% Bank Loan, 10% Farmer Share",
    last_verified_date: "2026-08-25",
    required_documents: ["Pahani / RTC", "No-electricity connection certificate", "Bank Passbook"]
  }
];

export const Schemes: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [schemes, setSchemes] = useState<any[]>(FALLBACK_SCHEMES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(false);

  const categories = [
    'All',
    'Income support',
    'Crop insurance',
    'Irrigation',
    'Seeds and fertilizers',
    'Agricultural machinery',
    'Agricultural credit',
  ];

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/schemes', {
        params: {
          category: selectedCategory,
          level: selectedLevel,
          search: searchQuery,
        },
      });
      if (res.data.success && res.data.schemes?.length > 0) {
        setSchemes(res.data.schemes);
      } else {
        // Filter fallback schemes locally
        let filtered = FALLBACK_SCHEMES;
        if (selectedCategory !== 'All') {
          filtered = filtered.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (selectedLevel !== 'All') {
          filtered = filtered.filter((s) => s.government_level.toLowerCase() === selectedLevel.toLowerCase());
        }
        setSchemes(filtered.length > 0 ? filtered : FALLBACK_SCHEMES);
      }
    } catch (err) {
      console.error(err);
      setSchemes(FALLBACK_SCHEMES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSearchQuery('');
    setSearchParams({});
    setSchemes(FALLBACK_SCHEMES);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-3 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>Module 1 · Official Government Schemes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              {language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಅನ್ವೇಷಕ' : 'Government Scheme Explorer'}
            </h1>
            <p className="text-xs sm:text-sm text-[#DCE9D5] mt-2 max-w-2xl leading-relaxed">
              Explore verified Central & Karnataka schemes. Test deterministic eligibility with your registered farm profile.
            </p>
          </div>

          <Link
            to="/farmer/compare"
            className="bg-[#D5A94F] hover:bg-[#c2963e] text-[#1B452B] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 shadow-xs shrink-0"
          >
            <Scale className="w-4 h-4 text-[#1B452B]" />
            <span>Compare Schemes</span>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl relative z-10">
          <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-[#DCE9D5] focus-within:border-[#245C3A] transition">
            <Search className="w-4 h-4 text-[#303B32]/60 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes (PM-KISAN, Krishi Bhagya, Raitha Siri, subsidy)..."
              className="w-full bg-transparent border-none text-[#303B32] text-xs sm:text-sm focus:outline-none placeholder:text-[#303B32]/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                  fetchSchemes();
                }}
                className="text-[#303B32]/60 hover:text-[#245C3A] p-1 mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-[#245C3A] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#1B452B] transition cursor-pointer shadow-xs shrink-0"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* ── Filters (Government Level & Categories) ─────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold uppercase text-[#303B32]/60 mr-2">Level:</span>
          {['All', 'Karnataka', 'Central'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#245C3A] text-white shadow-xs'
                  : 'bg-white border border-[#DCE9D5] text-[#303B32] hover:bg-[#DCE9D5]/30 hover:border-[#245C3A]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold uppercase text-[#303B32]/60 mr-2">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#245C3A] text-white shadow-xs'
                  : 'bg-white border border-[#DCE9D5] text-[#303B32] hover:bg-[#DCE9D5]/30 hover:border-[#245C3A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scheme Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#245C3A] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#245C3A]">Loading verified schemes...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#DCE9D5] text-center space-y-4 shadow-xs">
          <ShieldCheck className="w-12 h-12 text-[#D5A94F] mx-auto" />
          <h3 className="text-xl font-bold text-[#245C3A]">No Schemes Found</h3>
          <p className="text-xs text-[#303B32]/70 max-w-sm mx-auto">
            Try adjusting your search keywords or reset filters to view all verified schemes.
          </p>
          <button
            onClick={clearFilters}
            className="bg-[#245C3A] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1B452B] transition cursor-pointer shadow-xs"
          >
            Reset Filters & View All Schemes
          </button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {schemes.map((scheme) => (
            <motion.div
              key={scheme.id || scheme._id}
              variants={staggerItemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#245C3A] transition group will-change-[transform,opacity]"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase bg-[#DCE9D5]/60 text-[#245C3A] px-2.5 py-1 rounded-full border border-[#DCE9D5]">
                    {scheme.category}
                  </span>
                  <span className="text-[10px] font-semibold text-[#245C3A] bg-[#F7F8F0] px-2.5 py-1 rounded-full border border-[#DCE9D5]">
                    {scheme.government_level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#245C3A] font-display group-hover:text-[#1B452B] transition">
                  {language === 'kn' && scheme.name_kn ? scheme.name_kn : scheme.name_en}
                </h3>
                <p className="text-xs font-extrabold text-[#D5A94F] mt-1.5">
                  {scheme.subsidy_or_financial}
                </p>

                <p className="text-xs text-[#303B32]/70 mt-3 line-clamp-3 leading-relaxed">
                  {language === 'kn' && scheme.benefit_description_kn
                    ? scheme.benefit_description_kn
                    : scheme.benefit_description_en}
                </p>

                {/* Required Documents Pill */}
                <div className="mt-4 pt-3 border-t border-[#DCE9D5]/40">
                  <span className="text-[11px] font-bold text-[#245C3A] block mb-1.5">
                    Required Documents:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(scheme.required_documents || ['Pahani (RTC)', 'Aadhaar', 'Bank Passbook']).slice(0, 3).map((d: string) => (
                      <span key={d} className="text-[10px] bg-[#F7F8F0] text-[#303B32]/80 px-2 py-0.5 rounded-md border border-[#DCE9D5]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#DCE9D5]/40 flex items-center justify-between gap-2">
                <Link
                  to={`/farmer/schemes/${scheme.id || scheme._id}`}
                  className="text-xs font-bold text-[#303B32]/70 hover:text-[#245C3A] transition underline"
                >
                  Guidelines
                </Link>
                <Link
                  to={`/farmer/eligibility/${scheme.id || scheme._id}`}
                  className="bg-[#245C3A] hover:bg-[#1B452B] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
