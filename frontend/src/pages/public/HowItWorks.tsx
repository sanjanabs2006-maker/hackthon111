import React from 'react';
import { Sprout, ShieldCheck, Database, Camera, TrendingUp, CloudRain, FolderLock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Create Your Farm DNA',
      desc: 'Enter your land parcels (Acre/Gunta), soil type, and active crops once. Your profile becomes the central source of truth for the entire ecosystem.',
      icon: Sprout,
    },
    {
      num: '02',
      title: 'Automated Rule-Based Scheme Assessment',
      desc: 'Our deterministic Python engine evaluates your farm records against mandatory conditions, land ceilings, and notified crop lists from official gazettes.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Agro-Advisory & Spray Windows',
      desc: 'Live weather and agrometeorology models predict rainfall windows so you can time pesticide or Bordeaux mixture sprays before convective rains wash them away.',
      icon: CloudRain,
    },
    {
      num: '04',
      title: 'Mandi Intelligence & Disease Diagnosis',
      desc: 'Monitor official APMC prices across Karnataka markets and upload crop foliage photographs for instant disease classification.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider block">
          Connected Data Architecture
        </span>
        <h1 className="text-4xl font-extrabold text-[#245C3A] font-display">
          How Krishi Mitra Works
        </h1>
        <p className="text-sm text-[#303B32]/70 max-w-xl mx-auto leading-relaxed">
          One unified farmer profile powers nine independent agricultural services without redundant data entry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-white rounded-3xl p-8 border border-[#DCE9D5] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#245C3A] transition group"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#245C3A] text-[#D5A94F] flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black font-display text-[#D5A94F]">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#245C3A] font-display group-hover:text-[#1B452B] transition">{s.title}</h3>
                <p className="text-xs sm:text-sm text-[#303B32]/70 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-6">
        <Link
          to="/farmer/home"
          className="bg-[#245C3A] hover:bg-[#1B452B] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xs inline-flex items-center space-x-2 transition cursor-pointer"
        >
          <span>Get Started With Krishi Mitra</span>
          <ArrowRight className="w-4 h-4 text-[#D5A94F]" />
        </Link>
      </div>
    </div>
  );
};

