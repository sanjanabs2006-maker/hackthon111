import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  staggerContainerVariants, 
  staggerItemVariants,
  AmbientFloatingLeaves 
} from '../../components/common/MotionComponents';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { 
  Sprout, ShieldCheck, Camera, CloudSun, TrendingUp, 
  Search, ArrowRight, CheckCircle2, ChevronRight, FileText, 
  MapPin, Sparkles, AlertCircle, Droplets, Compass, User, Bot, Award, Check
} from 'lucide-react';

export const Home: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHeroDistrict, setSelectedHeroDistrict] = useState('all');
  const [featuredSchemes, setFeaturedSchemes] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    // Load featured schemes
    api.get('/schemes/recommended')
      .then((res) => {
        if (res.data.success) {
          setFeaturedSchemes(res.data.recommendations || []);
        }
      })
      .catch(() => {});

    // Load market prices preview
    api.get('/market/prices?limit=4')
      .then((res) => {
        if (res.data.success) {
          setMarketPrices(res.data.prices.slice(0, 4) || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Load weather for selected district or statewide
    const distParam = selectedHeroDistrict === 'all' ? 'shivamogga' : selectedHeroDistrict;
    api.get(`/weather/current?district=${distParam}`)
      .then((res) => {
        if (res.data.success) {
          setWeatherData(res.data);
        }
      })
      .catch(() => {});
  }, [selectedHeroDistrict]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/farmer/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="bg-[#F7F8F0] text-[#303B32] space-y-20 pb-24 relative overflow-hidden"
    >
      {/* ── Section 1: Editorial Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-[#DCE9D5]">
        {/* Cinematic Background Smooth Zoom-in & Contour Pattern */}
        <motion.div
          initial={{ scale: 1.10, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-contour-pattern pointer-events-none"
        />

        {/* Ambient Floating Leaves & Animated Gradient Lighting */}
        <AmbientFloatingLeaves />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Editorial Headlines */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center space-x-2 bg-[#FFFFFF] border border-[#DCE9D5] px-4 py-1.5 rounded-full text-xs font-bold text-[#245C3A] shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#D5A94F] animate-pulse"></span>
                <span>{language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಡಿಜಿಟಲ್ ಕ್ರಾಂತಿ' : 'Living Fields · Karnataka Digital Agronomy'}</span>
                <span className="bg-[#DCE9D5] text-[#245C3A] text-[10px] font-extrabold px-1.5 py-0.5 rounded ml-1">AI 2.0</span>
              </motion.div>

              <div>
                {/* Kannada tagline slides down and fades in */}
                <motion.p
                  initial={{ opacity: 0, y: -28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="text-2xl sm:text-3xl font-black text-[#D5A94F] font-kannada tracking-wide mb-2 drop-shadow-xs"
                >
                  "ನಿಮ್ಮ ಕೃಷಿಗೆ, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ."
                </motion.p>

                {/* Main heading slides in from the left with a smooth reveal */}
                <motion.h1
                  initial={{ opacity: 0, x: -45 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#245C3A] font-display leading-[1.14]"
                >
                  {language === 'kn' 
                    ? 'ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸಂಗಾತಿ.' 
                    : 'Your Complete Digital Farming Companion.'}
                </motion.h1>
              </div>

              {/* Description appears with staggered animation */}
              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.40, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg text-[#68756A] max-w-xl leading-relaxed"
              >
                {language === 'kn'
                  ? 'ಕನ್ನಡ ಧ್ವನಿ ಆಧಾರಿತ ಕೃಷಿ ಎಐ, ನೈಜ ಮಣ್ಣು-ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ, ನಿಖರ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಹಾಗೂ ನೇರ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳ ಸಮಗ್ರ ವೇದಿಕೆ.'
                  : 'Karnataka\'s premier agricultural AI assistant: voice-guided crop diagnostics, soil health advisory, official DBT scheme eligibility, and real-time APMC mandi intelligence.'}
              </motion.p>

              {/* Search bar slides upward into position */}
              <motion.form
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.50, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSearch}
                className="max-w-xl"
              >
                <div className="relative flex items-center bg-[#FFFFFF] rounded-2xl shadow-field-lg border border-[#DCE9D5] p-2 transition focus-within:ring-2 focus-within:ring-[#245C3A] focus-within:border-[#245C3A]">
                  <Search className="w-5 h-5 text-[#68756A] ml-3 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero_search_placeholder')}
                    className="w-full bg-transparent border-none text-[#303B32] text-sm focus:outline-none placeholder-[#8F9C91]"
                  />
                  <button
                    type="submit"
                    className="bg-[#245C3A] hover:bg-[#1B452B] active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 cursor-pointer transition-all shrink-0 shadow-xs"
                  >
                    <span>{language === 'kn' ? 'ಹುಡುಕಿ' : 'Search'}</span>
                    <ArrowRight className="w-4 h-4 text-[#D5A94F]" />
                  </button>
                </div>
              </motion.form>

              {/* Action Buttons appear with smooth scale and fade animations */}
              <motion.div
                initial={{ opacity: 0, scale: 0.90, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.60, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap items-center gap-3.5 pt-2"
              >
                <Link
                  to="/farmer/assistant"
                  className="bg-[#245C3A] hover:bg-[#1B452B] active:scale-95 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center space-x-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer hover:shadow-lg"
                >
                  <Bot className="w-4 h-4 text-[#D5A94F]" />
                  <span>{language === 'kn' ? 'ಕೃಷಿ ಎಐ ಸಹಾಯಕ' : 'Launch Krishi AI'}</span>
                </Link>

                <Link
                  to="/farmer/farm"
                  className="bg-[#FFFFFF] hover:bg-[#DCE9D5]/40 active:scale-95 text-[#245C3A] border border-[#DCE9D5] px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xs flex items-center space-x-2 hover:shadow-md"
                >
                  <Sprout className="w-4 h-4 text-[#245C3A]" />
                  <span>{t('hero_cta_services')}</span>
                </Link>

                <Link
                  to="/farmer/schemes"
                  className="bg-[#EDF4EA] hover:bg-[#DCE9D5] active:scale-95 text-[#245C3A] border border-[#DCE9D5] px-5 py-3.5 rounded-2xl font-bold text-sm transition-all hover:shadow-sm"
                >
                  {t('hero_cta_schemes')}
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.70 }}
                className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#68756A]"
              >
                <span className="flex items-center space-x-1.5 bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#DCE9D5] shadow-xs hover:border-[#245C3A] transition">
                  <CheckCircle2 className="w-4 h-4 text-[#245C3A]" />
                  <span className="font-semibold text-[#303B32]">100% Rule-Based Scheme Audit</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#DCE9D5] shadow-xs hover:border-[#D5A94F] transition">
                  <CheckCircle2 className="w-4 h-4 text-[#D5A94F]" />
                  <span className="font-semibold text-[#303B32]">Official Karnataka Gazette Data</span>
                </span>
              </motion.div>
            </div>

            {/* Right Col: Weather Card with 3D Entrance */}
            <div className="lg:col-span-5 relative perspective-1000">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Weather card slides in from the right with a beautiful 3D-like entrance */}
                <motion.div
                  initial={{ opacity: 0, x: 55, rotateY: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5, rotateY: 2, scale: 1.015, transition: { duration: 0.3 } }}
                  className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#DCE9D5]/30 relative overflow-hidden transition-all duration-300 transform-3d"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#D5A94F] font-extrabold flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5 text-[#D5A94F]" />
                        <span>Karnataka State Network · 31 Districts</span>
                      </span>
                      <h3 className="text-2xl font-bold font-display mt-1 text-white">
                        {selectedHeroDistrict === 'all' 
                          ? (language === 'kn' ? 'ಸಮಗ್ರ ಕರ್ನಾಟಕ ಕೃಷಿ ಜಾಲ' : 'All Karnataka Agricultural Network')
                          : `${weatherData?.district || 'Karnataka'} Agricultural Zone`}
                      </h3>
                      <p className="text-xs text-[#DCE9D5]/80 mt-0.5">
                        {selectedHeroDistrict === 'all'
                          ? (language === 'kn' ? 'ಮಲೆನಾಡು, ಕರಾವಳಿ, ಬಯಲುಸೀಮೆ ಮತ್ತು ಉತ್ತರ ಕರ್ನಾಟಕ' : 'Malnad, Coastal, Central Plains & North Dry Zones')
                          : `${weatherData?.taluk || 'Notified'} Taluk · KSNDMC Weather Station`}
                      </p>
                    </div>

                    {/* Karnataka District Selector Dropdown */}
                    <div className="shrink-0">
                      <select
                        value={selectedHeroDistrict}
                        onChange={(e) => setSelectedHeroDistrict(e.target.value)}
                        className="bg-[#1B452B] text-[#D5A94F] border border-[#D5A94F]/40 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none shadow-xs cursor-pointer hover:border-[#D5A94F]"
                      >
                        <option value="all">🌾 All Karnataka (31 Districts)</option>
                        <option value="bengaluru">Bengaluru Rural (ಬೆಂಗಳೂರು)</option>
                        <option value="belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
                        <option value="ballari">Ballari (ಬಳ್ಳಾರಿ)</option>
                        <option value="davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
                        <option value="dharwad">Dharwad & Hubballi (ಧಾರವಾಡ)</option>
                        <option value="mysuru">Mysuru (ಮೈಸೂರು)</option>
                        <option value="shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Weather Snippet */}
                  <div className="grid grid-cols-2 gap-3 mb-6 bg-[#1B452B]/90 p-4 rounded-2xl border border-[#DCE9D5]/20 shadow-xs">
                    <div>
                      <span className="text-[11px] text-[#DCE9D5]/70 block font-medium">State Avg Temperature</span>
                      <span className="text-2xl font-black text-white">
                        {weatherData ? `${weatherData.temperature}°C` : '27.4°C'}
                      </span>
                      <span className="text-[10px] text-[#DCE9D5] font-semibold block mt-0.5">
                        {selectedHeroDistrict === 'all' ? 'Moderate Climate' : weatherData?.condition || 'Partly Cloudy'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#DCE9D5]/70 block font-medium">Rainfall Outlook</span>
                      <span className="text-2xl font-black text-[#D5A94F]">
                        {selectedHeroDistrict === 'all' ? 'Active Monsoon' : '15 - 25 mm'}
                      </span>
                      <span className="text-[10px] text-[#DCE9D5]/80 block mt-0.5">
                        {selectedHeroDistrict === 'all' ? 'Statewide KSNDMC Feed' : 'Next 48 hrs'}
                      </span>
                    </div>
                  </div>

                  {/* Spray Window Advisory */}
                  <div className="bg-[#FFFFFF]/10 p-3.5 rounded-2xl border border-[#DCE9D5]/20 text-xs text-[#F7F8F0] mb-6">
                    <p className="font-bold text-[#D5A94F] mb-1 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D5A94F]" />
                      <span>{selectedHeroDistrict === 'all' ? 'Statewide Agricultural Advisory:' : 'District Foliar Spray Advisory:'}</span>
                    </p>
                    <p className="text-xs leading-relaxed text-white/90">
                      {selectedHeroDistrict === 'all'
                        ? 'Optimal weather for bio-control and foliar sprays across Central Karnataka. Maintain drainage trenches in Malnad arecanut plantations.'
                        : (weatherData?.agricultural_advisory || 'Ideal window for foliar spray concludes before convective precipitation.')}
                    </p>
                  </div>

                  {/* Farm Profile Connect Pill */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#DCE9D5]/20">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D5A94F] animate-ping"></div>
                      <span className="text-white font-medium">
                        {language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಡಿಎನ್ಎ ಸಕ್ರಿಯ' : 'All Karnataka Farm DNA Active'}
                      </span>
                    </div>
                    <Link to="/farmer/farm" className="text-[#D5A94F] hover:text-white font-bold flex items-center space-x-1 transition active:scale-95">
                      <span>View Farm DNA</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>

                {/* Overlapping Floating Mandi Price Badge with 3D Lift */}
                <motion.div
                  initial={{ opacity: 0, y: 25, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.68, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.04, y: -4, transition: { duration: 0.2 } }}
                  className="absolute -bottom-6 -left-4 sm:-left-6 bg-[#FFFFFF] p-4 rounded-2xl shadow-field-lg border border-[#DCE9D5] max-w-xs text-xs z-20"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#D5A94F]"></span>
                    <span className="font-bold text-[#245C3A]">Karnataka APMC Mandis</span>
                    <span className="bg-[#DCE9D5] text-[#245C3A] text-[9px] font-extrabold px-1 py-0.5 rounded">Live</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-semibold text-[#68756A]">
                      {selectedHeroDistrict === 'all' ? 'Arecanut (State Avg):' : `${weatherData?.district || 'APMC'} Rate:`}
                    </span>
                    <span className="text-base font-black text-[#245C3A]">₹52,400</span>
                    <span className="text-[10px] text-[#68756A]">/Quintal</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Distinctive Agricultural Services (Scroll Slide-Up) ── */}
      <motion.section
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <AmbientFloatingLeaves className="opacity-40" />

        <div className="text-center max-w-2xl mx-auto mb-14 relative z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#245C3A] bg-[#DCE9D5] px-3 py-1 rounded-full">
            Unified Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#245C3A] font-display mt-3">
            {t('services_title')}
          </h2>
          <p className="text-sm text-[#68756A] mt-2">
            {t('services_subtitle')}
          </p>
        </div>

        {/* Asymmetrical Editorial Service Banners with Stagger & 3D Hover */}
        <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Tile 1: Government Schemes Explorer (Large 7 Cols) */}
          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25 } }}
            className="md:col-span-7 bg-[#FFFFFF] rounded-3xl p-8 border border-[#DCE9D5] shadow-field flex flex-col justify-between hover:border-[#245C3A] hover:shadow-field-lg transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#245C3A] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-[#D5A94F]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">Module 1</span>
                  <h3 className="text-2xl font-bold text-[#245C3A] font-display">
                    {language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಅನ್ವೇಷಕ' : 'Government Scheme Explorer'}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#68756A] leading-relaxed mb-6">
                Discover Central and Karnataka agricultural schemes (PM-KISAN, PMFBY, Krishi Bhagya, Raitha Siri). Powered by our independent deterministic rule engine that audits land ceiling, crop match, and district zoning.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#245C3A]">
                <span className="bg-[#EDF4EA] px-3 py-1.5 rounded-xl border border-[#DCE9D5]">Income Support</span>
                <span className="bg-[#EDF4EA] px-3 py-1.5 rounded-xl border border-[#DCE9D5]">Crop Insurance</span>
                <span className="bg-[#EDF4EA] px-3 py-1.5 rounded-xl border border-[#DCE9D5]">Micro-Irrigation</span>
                <span className="bg-[#EDF4EA] px-3 py-1.5 rounded-xl border border-[#DCE9D5]">Millet Incentives</span>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/farmer/schemes"
                className="inline-flex items-center space-x-2 font-bold text-[#245C3A] group-hover:text-[#1B452B] transition active:scale-95"
              >
                <span>{language === 'kn' ? 'ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ' : 'Explore All Verified Schemes'}</span>
                <ArrowRight className="w-4 h-4 text-[#D5A94F] transform group-hover:translate-x-1.5 transition" />
              </Link>
            </div>
          </motion.div>

          {/* Tile 2: My Digital Farm & DNA (5 Cols) */}
          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25 } }}
            className="md:col-span-5 bg-[#245C3A] text-white rounded-3xl p-8 border border-[#DCE9D5]/30 shadow-field flex flex-col justify-between hover:bg-[#1B452B] hover:shadow-field-lg transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1B452B] text-white flex items-center justify-center border border-[#D5A94F]/30 shadow-xs group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6 text-[#D5A94F]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">Module 2</span>
                  <h3 className="text-2xl font-bold font-display text-white">
                    {language === 'kn' ? 'ನನ್ನ ಡಿಜಿಟಲ್ ಜಮೀನು' : 'My Digital Farm (DNA)'}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#DCE9D5]/80 leading-relaxed mb-6">
                Centralized profile holding land parcels, survey numbers, crops, and irrigation types. Enter once, and every module across Krishi Mitra automatically personalizes.
              </p>
              <div className="space-y-2 text-xs text-[#DCE9D5] bg-[#1B452B]/80 p-3.5 rounded-2xl border border-[#DCE9D5]/20">
                <div className="flex justify-between">
                  <span>Unit Conversions:</span>
                  <span className="font-bold text-[#D5A94F]">Acre · Gunta · Hectare</span>
                </div>
                <div className="flex justify-between">
                  <span>State Integration:</span>
                  <span className="font-bold text-white">Bhoomi / FRUITS Ready</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                to="/farmer/farm"
                className="inline-flex items-center space-x-2 font-bold text-[#D5A94F] hover:text-white transition active:scale-95"
              >
                <span>{language === 'kn' ? 'ಜಮೀನಿನ ವಿವರ ನಿರ್ವಹಿಸಿ' : 'Manage Farm Records'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition" />
              </Link>
            </div>
          </motion.div>

          {/* Tile 3: Crop Health Assistant (4 Cols) */}
          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
            className="md:col-span-4 bg-[#FFFFFF] rounded-3xl p-6 border border-[#DCE9D5] shadow-field flex flex-col justify-between hover:border-[#245C3A] hover:shadow-field-lg transition-all duration-300 group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#EDF4EA] text-[#245C3A] flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-[#245C3A]" />
              </div>
              <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">Module 3</span>
              <h3 className="text-xl font-bold text-[#245C3A] mt-1 font-display">Crop Health AI</h3>
              <p className="text-xs text-[#68756A] mt-2 leading-relaxed">
                Photograph affected foliage or nuts. Get instant symptom explanation, causes, and Bordeaux mixture or biocontrol advisories.
              </p>
            </div>
            <Link to="/farmer/crop-health" className="mt-6 text-xs font-bold text-[#245C3A] flex items-center space-x-1 hover:text-[#1B452B] transition active:scale-95">
              <span>Diagnose Crop</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D5A94F] transform group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>

          {/* Tile 4: Weather & Spray Windows (4 Cols) */}
          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
            className="md:col-span-4 bg-[#FFFFFF] rounded-3xl p-6 border border-[#DCE9D5] shadow-field flex flex-col justify-between hover:border-[#245C3A] hover:shadow-field-lg transition-all duration-300 group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#EDF4EA] text-[#D5A94F] flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                <CloudSun className="w-5 h-5 text-[#D5A94F]" />
              </div>
              <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">Module 4</span>
              <h3 className="text-xl font-bold text-[#245C3A] mt-1 font-display">Weather & Advisory</h3>
              <p className="text-xs text-[#68756A] mt-2 leading-relaxed">
                Taluk-level rainfall predictions and optimal spray timing windows to protect crops before monsoon squalls.
              </p>
            </div>
            <Link to="/farmer/weather" className="mt-6 text-xs font-bold text-[#245C3A] flex items-center space-x-1 hover:text-[#1B452B] transition active:scale-95">
              <span>View Forecast</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D5A94F] transform group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>

          {/* Tile 5: APMC Market Mandi Prices (4 Cols) */}
          <motion.div
            variants={staggerItemVariants}
            whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
            className="md:col-span-4 bg-[#FFFFFF] rounded-3xl p-6 border border-[#DCE9D5] shadow-field flex flex-col justify-between hover:border-[#245C3A] hover:shadow-field-lg transition-all duration-300 group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#EDF4EA] text-[#245C3A] flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-[#245C3A]" />
              </div>
              <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">Module 5</span>
              <h3 className="text-xl font-bold text-[#245C3A] mt-1 font-display">Market Intelligence</h3>
              <p className="text-xs text-[#68756A] mt-2 leading-relaxed">
                Modal, minimum and maximum mandi rates for Arecanut, Paddy, Maize, Ragi, Cotton across Karnataka APMCs.
              </p>
            </div>
            <Link to="/farmer/market" className="mt-6 text-xs font-bold text-[#245C3A] flex items-center space-x-1 hover:text-[#1B452B] transition active:scale-95">
              <span>Compare Mandis</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D5A94F] transform group-hover:translate-x-1 transition" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Section 3: Featured Verified Government Schemes (Scroll Slide-Up) ── */}
      <motion.section
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#FFFFFF] py-16 border-y border-[#DCE9D5] relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#245C3A] bg-[#DCE9D5] px-3 py-1 rounded-full">
                Official Direct Benefit Transfers
              </span>
              <h2 className="text-3xl font-black text-[#245C3A] font-display mt-3">
                {t('verified_schemes')}
              </h2>
              <p className="text-sm text-[#68756A] mt-1">
                {t('verified_schemes_desc')}
              </p>
            </div>
            <Link
              to="/farmer/schemes"
              className="mt-4 md:mt-0 text-sm font-bold text-[#245C3A] hover:text-[#1B452B] flex items-center space-x-1.5 transition active:scale-95 group"
            >
              <span>View All Schemes</span>
              <ArrowRight className="w-4 h-4 text-[#D5A94F] transform group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.slice(0, 3).map((scheme) => (
              <motion.div
                key={scheme.id || scheme._id}
                variants={staggerItemVariants}
                whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.25 } }}
                className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#DCE9D5] shadow-field flex flex-col justify-between hover:border-[#245C3A] hover:shadow-field-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#EDF4EA] text-[#245C3A] px-2.5 py-1 rounded-full border border-[#DCE9D5]">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] font-bold text-[#D5A94F] bg-[#F7F8F0] px-2 py-0.5 rounded border border-[#D5A94F]/30">
                      {scheme.government_level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#245C3A] font-display group-hover:text-[#1B452B] transition">
                    {language === 'kn' && scheme.name_kn ? scheme.name_kn : scheme.name_en}
                  </h3>
                  <p className="text-xs text-[#D5A94F] font-bold mt-1">
                    {scheme.subsidy_or_financial}
                  </p>

                  <p className="text-xs text-[#68756A] mt-3 line-clamp-3 leading-relaxed">
                    {language === 'kn' && scheme.benefit_description_kn
                      ? scheme.benefit_description_kn
                      : scheme.benefit_description_en}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#DCE9D5]/60 flex items-center justify-between">
                  <div className="text-[11px] text-[#8F9C91]">
                    <span>Verified: {scheme.last_verified_date}</span>
                  </div>
                  <Link
                    to={`/farmer/eligibility/${scheme.id || scheme._id}`}
                    className="bg-[#245C3A] hover:bg-[#1B452B] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    Check Eligibility
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Section 4: Market Price Ticker (Scroll Slide-Up) ─────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-[#245C3A] rounded-3xl p-8 text-white border border-[#DCE9D5]/30 shadow-xl transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D5A94F] font-extrabold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D5A94F]"></span>
                <span>Agmarknet & KSAMB Feed</span>
              </span>
              <h2 className="text-2xl font-bold font-display mt-1 text-white">
                {t('market_ticker')}
              </h2>
            </div>
            <Link
              to="/farmer/market"
              className="mt-3 md:mt-0 text-xs font-bold text-[#D5A94F] hover:text-white flex items-center space-x-1.5 transition active:scale-95 group"
            >
              <span>Full Market Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketPrices.map((item) => (
              <motion.div
                key={item.id || item.crop_name}
                variants={staggerItemVariants}
                whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-[#1B452B] p-4 rounded-2xl border border-[#DCE9D5]/20 shadow-xs transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-white truncate">{item.crop_name}</span>
                  <span className="text-[10px] text-[#DCE9D5] bg-[#245C3A] px-2 py-0.5 rounded font-medium">
                    {item.district}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-black text-[#D5A94F]">₹{item.modal_price?.toLocaleString()}</span>
                  <span className="text-xs text-[#DCE9D5]/70">{item.unit}</span>
                </div>
                <div className="text-[10px] text-[#DCE9D5]/60 mt-2 flex justify-between border-t border-[#DCE9D5]/10 pt-1.5">
                  <span>Min: ₹{item.min_price}</span>
                  <span>Max: ₹{item.max_price}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Section 5: Krishi AI Assistant Intro (Scroll Slide-Up) ─────────── */}
      <motion.section
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <AmbientFloatingLeaves className="opacity-30" />

        <div className="bg-[#FFFFFF] rounded-3xl p-8 sm:p-12 border border-[#DCE9D5] shadow-field-lg flex flex-col lg:flex-row items-center justify-between gap-8 transition-all duration-300 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-[#EDF4EA] px-3.5 py-1 rounded-full text-xs font-bold text-[#245C3A] border border-[#DCE9D5]">
              <Sparkles className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>Grounded Agricultural Intelligence</span>
            </div>
            <h2 className="text-3xl font-black text-[#245C3A] font-display">
              {t('ai_assistant_title')}
            </h2>
            <p className="text-sm text-[#68756A] leading-relaxed">
              {t('ai_assistant_desc')} Built with strict boundaries: the AI explains and clarifies across all farming domains, while our deterministic rule engine decides official scheme criteria without hallucination.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Link
                to="/farmer/assistant"
                className="bg-[#245C3A] hover:bg-[#1B452B] active:scale-95 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center space-x-2 hover:shadow-md"
              >
                <Bot className="w-4 h-4 text-[#D5A94F]" />
                <span>{language === 'kn' ? 'ಎಐ ಜೊತೆ ಮಾತನಾಡಿ' : 'Launch AI Assistant'}</span>
              </Link>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.025, y: -2 }}
            className="bg-[#F7F8F0] rounded-2xl p-5 border border-[#DCE9D5] shadow-xs max-w-sm w-full space-y-3 text-xs transition-all"
          >
            <div className="flex items-center space-x-2 font-bold text-[#245C3A] border-b border-[#DCE9D5] pb-2">
              <Sprout className="w-4 h-4 text-[#D5A94F]" />
              <span>Sample Farmer Voice Query</span>
            </div>
            <div className="bg-[#FFFFFF] p-3 rounded-xl text-[#303B32] border border-[#DCE9D5]">
              "ನನ್ನ ಹೊಲದಲ್ಲಿ ಮೆಕ್ಕೆಜೋಳ ಬೆಳೆದಿದ್ದೇನೆ, ಎಲೆಗಳು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತಿವೆ. ಏನು ಮಾಡಬೇಕು?"
            </div>
            <div className="bg-[#EDF4EA] p-3 rounded-xl text-[#245C3A] font-semibold border border-[#DCE9D5]/60">
              "ಸಾರಜನಕ ಕೊರತೆ ಇದ್ದರೆ 30-40 ಕೆಜಿ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಿ; ಸತುವಿನ ಕೊರತೆ ಇದ್ದರೆ 1 ಗ್ರಾಂ ಚೆಲೇಟೆಡ್ ಜಿಂಕ್ ಸಿಂಪಡಿಸಿ..."
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
};
