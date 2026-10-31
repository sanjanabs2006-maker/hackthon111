import React from 'react';
import { Sprout, ShieldCheck, Award, Heart, BookOpen, Layers } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-[#245C3A] text-[#D5A94F] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Sprout className="w-8 h-8 text-[#D5A94F]" />
        </div>
        <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider block">
          Living Fields · Digital Karnataka
        </span>
        <h1 className="text-4xl font-extrabold text-[#245C3A] font-display">
          About Krishi Mitra
        </h1>
        <p className="text-sm text-[#303B32]/70 max-w-xl mx-auto leading-relaxed">
          KRISHI MITRA is an unified agricultural companion platform engineered for Karnataka farmers, bridging real-time farm profiles, rule-based government scheme discovery, crop diagnostics, and APMC market prices.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-[#DCE9D5] shadow-xs space-y-6 text-sm text-[#303B32] leading-relaxed">
        <h2 className="text-2xl font-bold text-[#245C3A] font-display">
          Our Core Philosophy
        </h2>
        <p>
          Farmers across Karnataka cultivate under diverse agro-climatic conditions—from the high-rainfall lateritic hills of Shivamogga and Chikkamagaluru to the dry plains of Davanagere and Ballari. While dozens of state and central schemes exist (PM-KISAN, PMFBY, Krishi Bhagya, Raitha Siri), navigating eligibility criteria and application procedures is often convoluted.
        </p>
        <p>
          <strong className="text-[#245C3A]">Krishi Mitra changes this through a website-first connected data architecture:</strong>{' '}
          a farmer inputs their land and crop records once, generating a persistent <em>Farm DNA</em> that immediately drives accurate scheme assessments, spray time alerts, and commodity market comparisons across all platform modules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#DCE9D5]/40">
          <div className="p-4 rounded-2xl bg-[#F7F8F0] border border-[#DCE9D5] space-y-1">
            <ShieldCheck className="w-6 h-6 text-[#245C3A]" />
            <h3 className="font-bold text-[#245C3A]">No LLM Hallucinations</h3>
            <p className="text-xs text-[#303B32]/70">
              Scheme eligibility is evaluated strictly by a deterministic Python rule engine checked against official government gazettes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F0] border border-[#DCE9D5] space-y-1">
            <Award className="w-6 h-6 text-[#D5A94F]" />
            <h3 className="font-bold text-[#245C3A]">University Grounded</h3>
            <p className="text-xs text-[#303B32]/70">
              Crop health advisories reflect verified recommendations from UAHS Shivamogga, IIHR, and ICAR.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F8F0] border border-[#DCE9D5] space-y-1">
            <Layers className="w-6 h-6 text-[#245C3A]" />
            <h3 className="font-bold text-[#245C3A]">Kannada-First Experience</h3>
            <p className="text-xs text-[#303B32]/70">
              Complete bilingual UI with Noto Sans Kannada font, native voice recognition, and contextual terminology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

