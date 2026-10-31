import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '../../components/common/MotionComponents';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  CloudSun, CloudRain, Droplets, Wind, 
  MapPin, AlertTriangle, Calendar, Clock, CheckCircle2,
  RefreshCw, Save, Sprout
} from 'lucide-react';

export const WeatherAdvisory: React.FC = () => {
  const { language } = useLanguage();
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('shivamogga');
  const [selectedTaluk, setSelectedTaluk] = useState('Thirthahalli');
  const [farmLocation, setFarmLocation] = useState<{ district: string; taluk: string } | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [farmAdvisory, setFarmAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // 1. Initial Load: Fetch Farmer Profile location from My Farm
  useEffect(() => {
    api.get('/farmer/profile')
      .then((res) => {
        if (res.data.success && res.data.profile) {
          const prof = res.data.profile;
          const dist = (prof.district || 'shivamogga').toLowerCase();
          const tlk = prof.taluk || 'Thirthahalli';
          setFarmLocation({ district: prof.district || 'Shivamogga', taluk: tlk });
          setSelectedDistrict(dist);
          setSelectedTaluk(tlk);
        }
      })
      .catch((err) => console.error('Farm profile load error:', err));

    api.get('/weather/districts')
      .then((res) => {
        if (res.data.success) {
          setDistricts(res.data.districts || []);
        }
      })
      .catch(() => {});
  }, []);

  const loadWeather = async (district: string, taluk: string) => {
    setLoading(true);
    try {
      const [currRes, foreRes, advRes] = await Promise.all([
        api.get('/weather/current', { params: { district, taluk } }),
        api.get('/weather/forecast', { params: { district } }),
        api.get('/weather/farm-advisory'),
      ]);
      if (currRes.data.success) setCurrentWeather(currRes.data);
      if (foreRes.data.success) setForecast(foreRes.data.forecast || []);
      if (advRes.data.success) setFarmAdvisory(advRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedDistrict, selectedTaluk);
  }, [selectedDistrict, selectedTaluk]);

  // Save current weather location to My Farm
  const handleSaveToMyFarm = async () => {
    try {
      const distName = selectedDistrict.charAt(0).toUpperCase() + selectedDistrict.slice(1);
      await api.put('/farmer/profile', {
        district: distName,
        taluk: selectedTaluk,
      });
      setFarmLocation({ district: distName, taluk: selectedTaluk });
      setSaveStatus(
        language === 'kn'
          ? 'ಹೊಸ ಸ್ಥಳವನ್ನು ನನ್ನ ಫಾರ್ಮ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!'
          : 'Location synced with My Farm successfully!'
      );
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err) {
      console.error('Save to farm error:', err);
    }
  };

  const isCurrentLocationFromFarm =
    farmLocation &&
    farmLocation.district.toLowerCase() === selectedDistrict.toLowerCase() &&
    farmLocation.taluk.toLowerCase() === selectedTaluk.toLowerCase();

  return (
    <div className="space-y-8 pb-12">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5]/30 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3 py-1 rounded-full text-xs font-bold text-[#D5A94F] mb-2 shadow-xs">
              <CloudSun className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>Module 4 · Agro-Meteorological Advisory</span>
            </div>
            <h1 className="text-3xl font-black font-display text-white">
              {language === 'kn' ? 'ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಮುನ್ಸೂಚನೆ' : 'Weather & Farming Advisory'}
            </h1>
            <p className="text-xs sm:text-sm text-[#DCE9D5] mt-1 max-w-2xl leading-relaxed font-medium">
              District and taluk specific agro-meteorological forecasting with foliar spray windows and convective rainfall alerts for Karnataka crops.
            </p>

            {/* My Farm Location Sync Status Badge */}
            {farmLocation && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-1.5 bg-[#1B452B] text-white px-3 py-1 rounded-xl text-xs font-bold border border-[#DCE9D5]/30 shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-[#D5A94F]" />
                  <span>
                    Accepted from My Farm:{' '}
                    <strong className="text-[#D5A94F]">
                      {farmLocation.district} ({farmLocation.taluk})
                    </strong>
                  </span>
                  {isCurrentLocationFromFarm && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-1" />
                  )}
                </div>

                {!isCurrentLocationFromFarm && (
                  <button
                    onClick={() => {
                      setSelectedDistrict(farmLocation.district.toLowerCase());
                      setSelectedTaluk(farmLocation.taluk);
                    }}
                    className="text-[11px] font-bold text-[#DCE9D5] hover:text-white bg-[#1B452B] px-2.5 py-1 rounded-xl border border-[#D5A94F]/30 flex items-center space-x-1 cursor-pointer transition shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3 text-[#D5A94F]" />
                    <span>Return to Farm Location</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* District & Taluk Selectors + Save to My Farm */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setSelectedDistrict(newDist);
                  const dObj = districts.find((d) => d.id === newDist);
                  if (dObj && dObj.taluks?.length) {
                    setSelectedTaluk(dObj.taluks[0]);
                  }
                }}
                className="bg-[#1B452B] text-white border border-[#DCE9D5]/30 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ)</option>
                <option value="davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
                <option value="bengaluru">Bengaluru Rural (ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ)</option>
                <option value="mysuru">Mysuru (ಮೈಸೂರು)</option>
                <option value="belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
                <option value="ballari">Ballari (ಬಳ್ಳಾರಿ)</option>
                <option value="dharwad">Dharwad (ಧಾರವಾಡ)</option>
              </select>

              <select
                value={selectedTaluk}
                onChange={(e) => setSelectedTaluk(e.target.value)}
                className="bg-[#1B452B] text-white border border-[#DCE9D5]/30 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer shadow-xs"
              >
                {(
                  districts.find((d) => d.id === selectedDistrict)?.taluks || [
                    'Thirthahalli',
                    'Sagar',
                    'Bhadravati',
                    'Shikaripura',
                  ]
                ).map((t: string) => (
                  <option key={t} value={t}>
                    {t} Taluk
                  </option>
                ))}
              </select>
            </div>

            {/* Option to sync new selection back to My Farm */}
            {!isCurrentLocationFromFarm && (
              <button
                type="button"
                onClick={handleSaveToMyFarm}
                className="text-[11px] font-bold text-[#D5A94F] bg-[#1B452B] hover:bg-[#245C3A] px-3 py-1 rounded-xl border border-[#D5A94F]/40 flex items-center space-x-1 cursor-pointer transition shadow-xs"
                title="Sync this location to My Farm profile"
              >
                <Save className="w-3 h-3" />
                <span>Save as My Farm Location</span>
              </button>
            )}

            {saveStatus && (
              <span className="text-[10px] text-emerald-300 font-bold animate-pulse">
                {saveStatus}
              </span>
            )}
          </div>
        </div>

        {/* Current Weather Highlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 pt-6 border-t border-[#759B62]/30 items-center">
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#EAF1E7]/70">
              <MapPin className="w-3.5 h-3.5 text-[#759B62]" />
              <span>
                {currentWeather?.district} · {currentWeather?.taluk} Taluk
              </span>
            </div>
            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-black font-display text-white">
                {currentWeather?.temperature || '27.4'}°C
              </span>
              <span className="text-base text-[#D69A42] font-semibold">
                {currentWeather?.condition || 'Scattered Clouds'}
              </span>
            </div>
            <p className="text-xs text-[#EAF1E7]/90 font-medium">
              {currentWeather?.description}
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#256029] p-3 rounded-2xl border border-[#759B62]/20">
              <Droplets className="w-5 h-5 text-sky-400 mx-auto mb-1" />
              <span className="text-[10px] text-[#788176] block">Humidity</span>
              <span className="text-base font-bold text-white">
                {currentWeather?.humidity || '78'}%
              </span>
            </div>

            <div className="bg-[#256029] p-3 rounded-2xl border border-[#759B62]/20">
              <Wind className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-[#788176] block">Wind Speed</span>
              <span className="text-base font-bold text-white">
                {currentWeather?.wind_speed || '12.5'} km/h
              </span>
            </div>

            <div className="bg-[#256029] p-3 rounded-2xl border border-[#759B62]/20">
              <CloudRain className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] text-[#788176] block">48h Rain</span>
              <span className="text-base font-bold text-[#D69A42]">15 - 25 mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Spray Window & Precautions Box ──────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAF1E7] shadow-field space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#D69A42]" />
            <h2 className="text-xl font-bold text-[#388E3C] font-display">
              Recommended Foliar Spray Windows
            </h2>
          </div>
          <span className="text-xs text-[#256029] font-bold bg-[#EAF1E7] px-3 py-1 rounded-full">
            Safe Window Today: {farmAdvisory?.best_spray_window_today || '07:30 AM - 01:30 PM'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#EAF1E7] border border-[#759B62]/30 text-xs sm:text-sm text-[#388E3C] leading-relaxed">
          <p className="font-bold mb-1">Station Agro-Advisory for {currentWeather?.district}:</p>
          <p>{currentWeather?.agricultural_advisory}</p>
        </div>

        {/* Tailored Crop Advisories from My Farm */}
        {farmAdvisory?.crop_advisories?.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#388E3C]">
              <Sprout className="w-4 h-4 text-[#759B62]" />
              <span>Precautions for Your Farm's Cultivated Crops:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmAdvisory.crop_advisories.map((adv: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EAF1E7] space-y-2 hover:border-[#759B62] transition shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#388E3C]">{adv.crop_name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adv.suitability === 'GOOD' || adv.suitability === 'EXCELLENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Spray: {adv.suitability}
                    </span>
                  </div>
                  <p className="text-xs text-[#24342A] leading-relaxed">{adv.recommendation}</p>
                  <div className="flex justify-between text-[11px] text-[#788176] pt-1 border-t border-gray-100">
                    <span>Window: <strong>{adv.spray_window}</strong></span>
                    <span className="text-rose-600 font-bold">Urgency: {adv.urgency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 7-Day Day-by-Day Forecast ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAF1E7] shadow-field">
        <h2 className="text-xl font-bold text-[#388E3C] font-display mb-6">
          7-Day Agricultural Forecast for {currentWeather?.district}
        </h2>

        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
        >
          {forecast.map((item, idx) => (
            <motion.div
              key={idx}
              variants={staggerItemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#EAF1E7] text-center space-y-1.5 hover:border-[#759B62] transition will-change-[transform,opacity]"
            >
              <span className="text-xs font-extrabold text-[#388E3C] block">{item.day}</span>
              <span className="text-[10px] text-[#788176] block">{item.date}</span>
              <CloudSun className="w-6 h-6 text-[#D69A42] mx-auto my-1" />
              <span className="text-xs font-bold text-[#388E3C] block">
                {item.max_temp}° / {item.min_temp}°
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold block">
                {item.rain_prob}% Rain
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
