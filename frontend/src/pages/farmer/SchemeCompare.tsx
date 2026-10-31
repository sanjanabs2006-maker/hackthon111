import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Scale, Check, X, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SchemeCompare: React.FC = () => {
  const { language } = useLanguage();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [scheme1Id, setScheme1Id] = useState<string>('pm-kisan');
  const [scheme2Id, setScheme2Id] = useState<string>('krishi-bhagya');

  useEffect(() => {
    api.get('/schemes')
      .then((res) => {
        if (res.data.success && res.data.schemes?.length) {
          setSchemes(res.data.schemes);
          if (res.data.schemes[0]) setScheme1Id(res.data.schemes[0].id || res.data.schemes[0]._id);
          if (res.data.schemes[2]) setScheme2Id(res.data.schemes[2].id || res.data.schemes[2]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const scheme1 = schemes.find((s) => (s.id || s._id) === scheme1Id);
  const scheme2 = schemes.find((s) => (s.id || s._id) === scheme2Id);

  return (
    <div className="space-y-8 pb-12">
      <Link
        to="/farmer/schemes"
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#245C3A] hover:text-[#1B452B] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Scheme Explorer</span>
      </Link>

      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-3 shadow-xs">
            <Scale className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>Feature 7 · Side-by-Side Scheme Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            Compare Agricultural Schemes
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE9D5] mt-2 max-w-2xl leading-relaxed">
            Compare benefits, required documents, government levels, and eligibility conditions between any two Karnataka or Central schemes.
          </p>

          {/* Selection Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#DCE9D5]/30">
            <div>
              <label className="block text-xs font-bold text-[#D5A94F] uppercase mb-1.5">
                Select Scheme A
              </label>
              <select
                value={scheme1Id}
                onChange={(e) => setScheme1Id(e.target.value)}
                className="w-full bg-[#1B452B] text-white p-2.5 rounded-xl border border-[#DCE9D5]/30 text-xs font-bold focus:outline-none"
              >
                {schemes.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D5A94F] uppercase mb-1.5">
                Select Scheme B
              </label>
              <select
                value={scheme2Id}
                onChange={(e) => setScheme2Id(e.target.value)}
                className="w-full bg-[#1B452B] text-white p-2.5 rounded-xl border border-[#DCE9D5]/30 text-xs font-bold focus:outline-none"
              >
                {schemes.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>
                    {s.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparison Table ─────────────────────────────────────────── */}
      {scheme1 && scheme2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#DCE9D5]">
                <th className="py-4 px-4 font-bold text-xs uppercase tracking-wider text-[#303B32]/70 w-1/4">
                  Feature / Parameter
                </th>
                <th className="py-4 px-4 font-bold text-base text-[#245C3A] w-3/8 bg-[#DCE9D5]/25 rounded-t-xl">
                  {scheme1.name_en}
                </th>
                <th className="py-4 px-4 font-bold text-base text-[#245C3A] w-3/8 bg-[#DCE9D5]/50 rounded-t-xl">
                  {scheme2.name_en}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE9D5]/40">
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#303B32]/70">Government Level</td>
                <td className="py-3.5 px-4 font-semibold text-[#245C3A] bg-[#DCE9D5]/15">
                  {scheme1.government_level}
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#245C3A] bg-[#DCE9D5]/30">
                  {scheme2.government_level}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#303B32]/70">Category</td>
                <td className="py-3.5 px-4 text-[#303B32] bg-[#DCE9D5]/15">{scheme1.category}</td>
                <td className="py-3.5 px-4 text-[#303B32] bg-[#DCE9D5]/30">{scheme2.category}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#303B32]/70">Financial Benefit / Subsidy</td>
                <td className="py-3.5 px-4 font-black text-[#D5A94F] bg-[#DCE9D5]/15">
                  {scheme1.subsidy_or_financial}
                </td>
                <td className="py-3.5 px-4 font-black text-[#D5A94F] bg-[#DCE9D5]/30">
                  {scheme2.subsidy_or_financial}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#303B32]/70">Required Documents</td>
                <td className="py-3.5 px-4 text-xs text-[#303B32] bg-[#DCE9D5]/15 space-y-1">
                  {scheme1.required_documents?.map((d: string) => (
                    <div key={d}>• {d}</div>
                  ))}
                </td>
                <td className="py-3.5 px-4 text-xs text-[#303B32] bg-[#DCE9D5]/30 space-y-1">
                  {scheme2.required_documents?.map((d: string) => (
                    <div key={d}>• {d}</div>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-[#303B32]/70">Source Verification</td>
                <td className="py-3.5 px-4 bg-[#DCE9D5]/15 text-[#245C3A] font-bold">
                  Verified ({scheme1.last_verified_date})
                </td>
                <td className="py-3.5 px-4 bg-[#DCE9D5]/30 text-[#245C3A] font-bold">
                  Verified ({scheme2.last_verified_date})
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-[#303B32]/70">Eligibility Action</td>
                <td className="py-4 px-4 bg-[#DCE9D5]/15">
                  <Link
                    to={`/farmer/eligibility/${scheme1.id || scheme1._id}`}
                    className="bg-[#245C3A] hover:bg-[#1B452B] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-1 shadow-xs transition"
                  >
                    <span>Check Eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
                <td className="py-4 px-4 bg-[#DCE9D5]/30">
                  <Link
                    to={`/farmer/eligibility/${scheme2.id || scheme2._id}`}
                    className="bg-[#245C3A] hover:bg-[#1B452B] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-1 shadow-xs transition"
                  >
                    <span>Check Eligibility</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

