import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '../../components/common/MotionComponents';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { 
  Sprout, ShieldCheck, Camera, CloudSun, TrendingUp, 
  ArrowRight, FileText, CheckCircle2, AlertTriangle, 
  MapPin, Droplets, Sparkles, ChevronRight, Bell
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [profile, setProfile] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profRes, schRes, wthRes, mktRes] = await Promise.all([
          api.get('/farmer/profile'),
          api.get('/schemes/recommended'),
          api.get('/weather/current?district=shivamogga'),
          api.get('/market/prices')
        ]);

        if (profRes.data.success) setProfile(profRes.data.profile);
        if (schRes.data.success) setSchemes(schRes.data.recommendations || []);
        if (wthRes.data.success) setWeather(wthRes.data);
        if (mktRes.data.success) setMarketPrices(mktRes.data.prices.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* ── Welcome Banner & Farm DNA Summary ─────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#D5A94F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] shadow-xs">
              <Sprout className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>{language === 'kn' ? 'ಸಕ್ರಿಯ ಡಿಜಿಟಲ್ ಕೃಷಿ ಪ್ರೊಫೈಲ್' : 'Active Digital Farm Profile'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              {language === 'kn' ? 'ನಮಸ್ಕಾರ, ' : 'Welcome back, '}
              <span className="text-[#D5A94F]">{user?.name || 'Suresh Gowda'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#DCE9D5] flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>
                {profile?.district || 'Shivamogga'}, {profile?.taluk || 'Thirthahalli'} · {profile?.village || 'Agumbe'}
              </span>
              <span className="text-white/40">|</span>
              <span>FRUITS ID: <strong className="text-white font-mono">{profile?.fruits_id || 'KA-SMG-2026-8841'}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/farmer/farm"
              className="bg-[#D5A94F] hover:bg-[#c2963e] text-[#1B452B] px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 shadow-xs shrink-0"
            >
              <span>{language === 'kn' ? 'ಜಮೀನಿನ ವಿವರ ವೀಕ್ಷಿಸಿ' : 'Manage Farm DNA'}</span>
              <ArrowRight className="w-4 h-4 text-[#1B452B]" />
            </Link>
          </div>
        </div>

        {/* Farm DNA Metrics Strip */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#DCE9D5]/30 text-xs relative z-10"
        >
          <motion.div variants={staggerItemVariants} whileHover={{ y: -2 }} className="bg-[#1B452B] p-3 rounded-2xl border border-[#DCE9D5]/20 will-change-[transform,opacity]">
            <span className="text-[#DCE9D5]/70 block mb-1">Total Cultivated Area</span>
            <span className="text-xl font-black text-white">
              {profile?.total_acres ? `${profile.total_acres} Acres` : '2.50 Acres'}
            </span>
          </motion.div>

          <motion.div variants={staggerItemVariants} whileHover={{ y: -2 }} className="bg-[#1B452B] p-3 rounded-2xl border border-[#DCE9D5]/20 will-change-[transform,opacity]">
            <span className="text-[#DCE9D5]/70 block mb-1">Active Crops</span>
            <span className="text-xl font-black text-[#DCE9D5]">
              {profile?.crops?.length ? profile.crops.map((c: any) => c.name).join(', ') : 'Arecanut, Paddy'}
            </span>
          </motion.div>

          <motion.div variants={staggerItemVariants} whileHover={{ y: -2 }} className="bg-[#1B452B] p-3 rounded-2xl border border-[#DCE9D5]/20 will-change-[transform,opacity]">
            <span className="text-[#DCE9D5]/70 block mb-1">Soil Type</span>
            <span className="text-xl font-black text-[#D5A94F]">
              {profile?.soil_type || 'Red Loamy (Acidic)'}
            </span>
          </motion.div>

          <motion.div variants={staggerItemVariants} whileHover={{ y: -2 }} className="bg-[#1B452B] p-3 rounded-2xl border border-[#DCE9D5]/20 will-change-[transform,opacity]">
            <span className="text-[#DCE9D5]/70 block mb-1">Document Readiness</span>
            <span className="text-xl font-black text-emerald-300">85% Complete</span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── 2-Column Responsive Dashboard Layout ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scheme Recommendations & Weather (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recommended Schemes for this Farm */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">
                  Personalized Scheme Matches
                </span>
                <h2 className="text-2xl font-bold text-[#245C3A] font-display">
                  Recommended For Your Farm
                </h2>
              </div>
              <Link to="/farmer/schemes" className="text-xs font-bold text-[#245C3A] hover:text-[#1B452B] flex items-center space-x-1 transition">
                <span>View All (6)</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {schemes.map((scheme) => (
                <div
                  key={scheme.id || scheme._id}
                  className="bg-[#F7F8F0] p-4 sm:p-5 rounded-2xl border border-[#DCE9D5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#245C3A] transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold bg-[#DCE9D5] text-[#245C3A] px-2 py-0.5 rounded-full border border-[#DCE9D5]">
                        {scheme.category}
                      </span>
                      <span className="text-[10px] text-[#245C3A] font-semibold bg-white px-2 py-0.5 rounded-full border border-[#DCE9D5]">
                        {scheme.government_level}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#245C3A]">
                      {language === 'kn' && scheme.name_kn ? scheme.name_kn : scheme.name_en}
                    </h3>
                    <p className="text-xs text-[#D5A94F] font-bold">
                      {scheme.subsidy_or_financial}
                    </p>
                  </div>

                  <Link
                    to={`/farmer/eligibility/${scheme.id || scheme._id}`}
                    className="shrink-0 bg-[#245C3A] hover:bg-[#1B452B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
                  >
                    Evaluate Rule Eligibility
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Destinations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/farmer/crop-health"
              className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs hover:border-[#245C3A] hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#DCE9D5]/60 text-[#245C3A] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Camera className="w-5 h-5 text-[#245C3A]" />
              </div>
              <h4 className="text-sm font-bold text-[#245C3A]">Scan Crop Health</h4>
              <p className="text-xs text-[#303B32]/70 mt-1">Upload leaf photo for Kole Roga diagnosis</p>
            </Link>

            <Link
              to="/farmer/weather"
              className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs hover:border-[#245C3A] hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#D5A94F]/20 text-[#D5A94F] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <CloudSun className="w-5 h-5 text-[#D5A94F]" />
              </div>
              <h4 className="text-sm font-bold text-[#245C3A]">Spray Advisories</h4>
              <p className="text-xs text-[#303B32]/70 mt-1">Check today's 2:00 PM rainfall window</p>
            </Link>

            <Link
              to="/farmer/farm"
              className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs hover:border-[#245C3A] hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#DCE9D5]/60 text-[#245C3A] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Sprout className="w-5 h-5 text-[#245C3A]" />
              </div>
              <h4 className="text-sm font-bold text-[#245C3A]">Farm DNA Records</h4>
              <p className="text-xs text-[#303B32]/70 mt-1">View registered land and crops</p>
            </Link>
          </div>
        </div>

        {/* Right Column: Local Weather & APMC Mandi Ticker (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weather Widget */}
          <div className="bg-[#245C3A] text-white rounded-3xl p-6 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#D5A94F]/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#D5A94F] uppercase tracking-wider">
                    Live Karnataka Agrometeorology
                  </span>
                  <h3 className="text-lg font-bold font-display text-white">
                    {weather?.district ? `${weather.district} (Karnataka)` : 'All Karnataka'} Advisory
                  </h3>
                </div>
                <CloudSun className="w-6 h-6 text-[#D5A94F]" />
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-4xl font-extrabold text-white">{weather?.temperature || '27.4'}°C</span>
                <span className="text-xs text-[#DCE9D5] font-semibold">{weather?.condition || 'Partly Cloudy'}</span>
              </div>

              <div className="bg-[#1B452B] p-3 rounded-2xl border border-[#DCE9D5]/20 my-4 text-xs space-y-1.5">
                <div className="flex justify-between text-[#DCE9D5]">
                  <span>Humidity:</span>
                  <span className="font-bold text-white">{weather?.humidity || '78'}%</span>
                </div>
                <div className="flex justify-between text-[#DCE9D5]">
                  <span>Wind Speed:</span>
                  <span className="font-bold text-white">{weather?.wind_speed || '12.5'} km/h</span>
                </div>
                <div className="flex justify-between text-[#DCE9D5]">
                  <span>Expected Rain:</span>
                  <span className="font-bold text-[#D5A94F]">15 - 25 mm</span>
                </div>
              </div>

              <p className="text-xs text-[#DCE9D5] leading-relaxed bg-[#1B452B]/60 p-3 rounded-2xl border border-[#DCE9D5]/20">
                {weather?.agricultural_advisory || 'Complete foliar fungicide spray before 2:00 PM.'}
              </p>
            </div>
          </div>

          {/* Market Rates Widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-bold text-[#D5A94F] uppercase tracking-wider">
                  Today's APMC Mandi
                </span>
                <h3 className="text-lg font-bold text-[#245C3A] font-display">
                  Market Rates
                </h3>
              </div>
              <Link to="/farmer/market" className="text-xs text-[#245C3A] font-bold hover:underline">
                More
              </Link>
            </div>

            <div className="space-y-3">
              {marketPrices.map((item) => (
                <div
                  key={item.id || item.crop_name}
                  className="p-3 rounded-2xl bg-[#F7F8F0] border border-[#DCE9D5] flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-[#245C3A] block">{item.crop_name}</span>
                    <span className="text-[10px] text-[#303B32]/60">{item.market}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#D5A94F] text-sm block">
                      ₹{item.modal_price?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#303B32]/60">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

