import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-[#1B452B] text-[#F7F8F0] pt-16 pb-12 border-t border-[#245C3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#245C3A]/60">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#245C3A] flex items-center justify-center border border-[#D5A94F]/30 shadow-xs">
                <Sprout className="w-6 h-6 text-[#D5A94F]" />
              </div>
              <span className="text-2xl font-black font-display tracking-tight text-white">
                KRISHI MITRA
              </span>
            </div>
            <p className="text-sm text-[#DCE9D5]/80 max-w-sm leading-relaxed">
              {language === 'kn'
                ? 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಸಮಗ್ರ ಡಿಜಿಟಲ್ ಕೃಷಿ ವೇದಿಕೆ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಬೆಳೆ ಆರೋಗ್ಯ, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ನೈಜ ಮಾಹಿತಿ.'
                : 'A unified digital agricultural services ecosystem built for Karnataka farmers. Seamlessly linking verified land records, crop health diagnosis, and deterministic scheme rules.'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#D5A94F] bg-[#245C3A]/70 px-3 py-2 rounded-xl border border-[#D5A94F]/30 inline-block shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D5A94F]" />
              <span className="font-semibold">Living Fields · Hackathon Demonstration Release</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D5A94F] mb-4">
              Agricultural Modules
            </h4>
            <ul className="space-y-2.5 text-sm text-[#DCE9D5]/70">
              <li><Link to="/farmer/schemes" className="hover:text-white hover:translate-x-0.5 inline-block transition">Scheme Explorer</Link></li>
              <li><Link to="/farmer/farm" className="hover:text-white hover:translate-x-0.5 inline-block transition">My Digital Farm (DNA)</Link></li>
              <li><Link to="/farmer/crop-health" className="hover:text-white hover:translate-x-0.5 inline-block transition">Crop Health Assistant</Link></li>
              <li><Link to="/farmer/weather" className="hover:text-white hover:translate-x-0.5 inline-block transition">Weather & Spray Advisory</Link></li>
              <li><Link to="/farmer/market" className="hover:text-white hover:translate-x-0.5 inline-block transition">APMC Mandi Intelligence</Link></li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D5A94F] mb-4">
              Official Govt Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-[#DCE9D5]/70">
              <li>
                <a href="https://pmkisan.gov.in/" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition">
                  <span>PM-KISAN GoI</span>
                  <ExternalLink className="w-3 h-3 text-[#D5A94F] opacity-70" />
                </a>
              </li>
              <li>
                <a href="https://pmfby.gov.in/" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition">
                  <span>PMFBY Samrakshane</span>
                  <ExternalLink className="w-3 h-3 text-[#D5A94F] opacity-70" />
                </a>
              </li>
              <li>
                <a href="https://fruits.karnataka.gov.in/" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition">
                  <span>FRUITS Karnataka</span>
                  <ExternalLink className="w-3 h-3 text-[#D5A94F] opacity-70" />
                </a>
              </li>
              <li>
                <a href="https://raitamitra.karnataka.gov.in/" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition">
                  <span>Raitha Mitra GoK</span>
                  <ExternalLink className="w-3 h-3 text-[#D5A94F] opacity-70" />
                </a>
              </li>
              <li>
                <a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-white transition">
                  <span>myScheme India</span>
                  <ExternalLink className="w-3 h-3 text-[#D5A94F] opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D5A94F] mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#DCE9D5]/70">
              <li><Link to="/about" className="hover:text-white hover:translate-x-0.5 inline-block transition">About Krishi Mitra</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white hover:translate-x-0.5 inline-block transition">How It Works</Link></li>
              <li><Link to="/knowledge" className="hover:text-white hover:translate-x-0.5 inline-block transition">Knowledge Hub</Link></li>
              <li><Link to="/admin" className="hover:text-white hover:translate-x-0.5 inline-block transition">Officer / Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#DCE9D5]/60">
          <p>© 2026 KRISHI MITRA. Living Fields — Digital Karnataka Architecture.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0 font-medium">
            <span>Built with respect for India's farmers</span>
            <Heart className="w-3.5 h-3.5 text-[#D5A94F] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};

