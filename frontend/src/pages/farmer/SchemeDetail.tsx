import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldCheck, ArrowLeft, ExternalLink, FileText, 
  CheckCircle2, ArrowRight, Calendar, Bookmark, Scale
} from 'lucide-react';

export const SchemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/schemes/${id}`)
      .then((res) => {
        if (res.data.success) {
          setScheme(res.data.scheme);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-24 text-center text-sm font-semibold text-[#388E3C]">Loading scheme details...</div>;
  }

  if (!scheme) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-base font-bold text-red-600">Scheme not found.</p>
        <Link to="/farmer/schemes" className="text-xs text-[#388E3C] underline">
          Back to Scheme Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <Link
        to="/farmer/schemes"
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#245C3A] hover:text-[#1B452B] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Schemes</span>
      </Link>

      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold uppercase bg-[#DCE9D5]/60 text-[#245C3A] px-3 py-1 rounded-full border border-[#DCE9D5]">
              {scheme.category}
            </span>
            <span className="text-xs text-[#DCE9D5] font-semibold bg-[#1B452B] px-3 py-1 rounded-xl border border-[#DCE9D5]/30">
              {scheme.government_level} Government
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {language === 'kn' && scheme.name_kn ? scheme.name_kn : scheme.name_en}
          </h1>

          <p className="text-base sm:text-lg font-bold text-[#D5A94F] mt-2">
            {scheme.subsidy_or_financial}
          </p>

          <p className="text-xs text-[#DCE9D5] mt-2">
            Department: {scheme.department}
          </p>

          <div className="mt-6 pt-4 border-t border-[#DCE9D5]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-[#DCE9D5]">
              <span>Official Gazette Verified: <strong className="text-white">{scheme.last_verified_date}</strong></span>
            </div>

            <Link
              to={`/farmer/eligibility/${scheme.id || scheme._id}`}
              className="bg-[#D5A94F] hover:bg-[#c2963e] text-[#1B452B] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 shadow-xs"
            >
              <span>Evaluate My Eligibility</span>
              <ArrowRight className="w-4 h-4 text-[#1B452B]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Detailed Benefits & Description ──────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#245C3A] font-display mb-2">
            Scheme Objective & Benefit Structure
          </h2>
          <p className="text-xs sm:text-sm text-[#303B32] leading-relaxed">
            {language === 'kn' && scheme.benefit_description_kn
              ? scheme.benefit_description_kn
              : scheme.benefit_description_en}
          </p>
        </div>

        {/* Required Documents */}
        <div className="pt-4 border-t border-[#DCE9D5]/40">
          <h3 className="text-sm font-bold text-[#245C3A] uppercase tracking-wider mb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#245C3A]" />
            <span>Mandatory Documents Required</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(scheme.required_documents || ['Pahani (RTC)', 'Aadhaar Card', 'Bank Passbook']).map((doc: string) => (
              <div
                key={doc}
                className="p-3 rounded-xl bg-[#F7F8F0] border border-[#DCE9D5] flex items-center space-x-2 text-xs text-[#303B32]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#245C3A] shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="pt-4 border-t border-[#DCE9D5]/40">
          <h3 className="text-sm font-bold text-[#245C3A] uppercase tracking-wider mb-2">
            Application Instructions
          </h3>
          <p className="text-xs sm:text-sm text-[#303B32] whitespace-pre-line leading-relaxed bg-[#DCE9D5]/20 p-4 rounded-2xl border border-[#DCE9D5]">
            {scheme.application_process || 'Apply online via FRUITS / Raitha Mitra or at your local Raitha Samparka Kendra (RSK).'}
          </p>
        </div>

        {/* Official Portal Button */}
        {scheme.official_url && (
          <div className="pt-4 border-t border-[#DCE9D5]/40 flex justify-between items-center">
            <span className="text-xs text-[#303B32]/70">Official Portal Link:</span>
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noreferrer"
              className="bg-[#245C3A] hover:bg-[#1B452B] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
            >
              <span>Visit Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

