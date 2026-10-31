import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '../../components/common/MotionComponents';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  TrendingUp, Search, BarChart3, ArrowUpRight, 
  ArrowDownRight, Scale, MapPin, Calendar, HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

export const MarketIntelligence: React.FC = () => {
  const { language } = useLanguage();
  const [prices, setPrices] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('Arecanut');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const crops = ['All', 'Arecanut', 'Paddy', 'Maize', 'Ragi', 'Cotton', 'Coffee', 'Tomato', 'Groundnut'];

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/market/prices', {
        params: {
          crop: selectedCrop === 'All' ? '' : selectedCrop,
          district: selectedDistrict === 'All' ? '' : selectedDistrict,
        },
      });
      if (res.data.success) {
        setPrices(res.data.prices || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/market/history', {
        params: { crop: selectedCrop === 'All' ? 'Arecanut' : selectedCrop },
      });
      if (res.data.success) {
        setHistoryData(res.data.history || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchHistory();
  }, [selectedCrop, selectedDistrict]);

  return (
    <div className="space-y-8 pb-12">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5]/30 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3 py-1 rounded-full text-xs font-bold text-[#D5A94F] mb-2 shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>Module 5 · Karnataka APMC Mandi Intelligence</span>
            </div>
            <h1 className="text-3xl font-black font-display text-white">
              {language === 'kn' ? 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ದರ ಬುದ್ಧಿಮತ್ತೆ' : 'Market Price Intelligence'}
            </h1>
            <p className="text-xs sm:text-sm text-[#DCE9D5] mt-1 max-w-2xl leading-relaxed font-medium">
              Official modal, minimum, and maximum prices from KSAMB and Agmarknet for Karnataka agricultural markets. Historical comparative trends in ₹/Quintal.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-6 mt-6 border-t border-[#DCE9D5]/20">
          <span className="text-xs font-bold uppercase text-[#D5A94F] mr-2">Commodity:</span>
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                selectedCrop === c
                  ? 'bg-[#D5A94F] text-white shadow-sm'
                  : 'bg-[#1B452B] text-[#DCE9D5] border border-[#DCE9D5]/20 hover:bg-[#245C3A] hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recharts Historical Price Trend Chart ───────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-field">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">
              6-Month APMC Price Trend
            </span>
            <h2 className="text-2xl font-bold text-[#245C3A] font-display">
              {selectedCrop === 'All' ? 'Arecanut' : selectedCrop} Price Volatility (₹/Quintal)
            </h2>
          </div>
          <span className="text-xs font-bold text-[#245C3A] bg-[#EDF4EA] px-3.5 py-1 rounded-full border border-[#DCE9D5]">
            Source: KSAMB Official Records
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorModal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#245C3A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#245C3A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE9D5" opacity={0.6} />
              <XAxis dataKey="month" stroke="#68756A" fontSize={12} />
              <YAxis stroke="#68756A" fontSize={12} tickFormatter={(val) => `₹${val}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#245C3A',
                  border: '1px solid #DCE9D5',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="modal_price"
                stroke="#245C3A"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorModal)"
                name="Modal Price (₹)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── APMC Mandi Prices Grid ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-field">
        <h2 className="text-xl font-bold text-[#245C3A] font-display mb-6">
          Today's Reported Mandi Arrivals & Prices
        </h2>

        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {prices.map((p) => (
            <motion.div
              key={p.id || p.crop_name + p.market}
              variants={staggerItemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-[#F7F8F0] border border-[#DCE9D5] flex flex-col justify-between hover:border-[#245C3A] hover:bg-white transition shadow-2xs group will-change-[transform,opacity]"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-base text-[#245C3A] group-hover:text-[#1B452B] transition">{p.crop_name}</span>
                  <span className="text-[10px] font-bold text-[#245C3A] bg-[#DCE9D5] px-2.5 py-0.5 rounded-full">
                    {p.district}
                  </span>
                </div>

                <div className="text-xs text-[#68756A] mb-3 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D5A94F]" />
                  <span>{p.market}</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DCE9D5] space-y-1 shadow-2xs">
                  <span className="text-[10px] text-[#68756A] uppercase font-bold block">Modal Price</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-[#245C3A]">₹{p.modal_price?.toLocaleString()}</span>
                    <span className="text-xs text-[#68756A] font-medium">{p.unit}</span>
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-xs text-[#68756A] px-1">
                  <span>Min: <strong className="text-[#303B32]">₹{p.min_price}</strong></span>
                  <span>Max: <strong className="text-[#303B32]">₹{p.max_price}</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCE9D5]/60 flex justify-between items-center text-[10px] text-[#8F9C91]">
                <span>Reported: {p.date}</span>
                <span className="font-bold text-[#245C3A]">Agmarknet</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

