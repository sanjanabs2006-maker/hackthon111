import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  staggerContainerVariants, 
  staggerItemVariants,
  AmbientFloatingLeaves 
} from '../../components/common/MotionComponents';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sprout, Plus, Trash2, MapPin, Droplets, Layers, 
  CheckCircle2, ArrowRight, ShieldCheck, Ruler,
  CloudSun, TrendingUp, Award, ExternalLink, Clock, AlertTriangle, ChevronRight
} from 'lucide-react';

const KARNATAKA_DISTRICTS: Record<string, string[]> = {
  'Shivamogga': ['Thirthahalli', 'Sagar', 'Bhadravati', 'Shikaripura', 'Soraba', 'Hosanagara'],
  'Davanagere': ['Harihara', 'Channagiri', 'Honnali', 'Jagalur'],
  'Bengaluru Rural': ['Devanahalli', 'Nelamangala', 'Doddaballapura', 'Hoskote'],
  'Mysuru': ['Nanjangud', 'Hunsur', 'T.Narasipura', 'K.R.Nagar', 'Periyapatna'],
  'Belagavi': ['Gokak', 'Chikkodi', 'Athani', 'Bailhongal', 'Khanapur'],
  'Ballari': ['Siruguppa', 'Kampli', 'Sandur', 'Kudligi'],
  'Dharwad': ['Hubballi', 'Navalgund', 'Kundgol', 'Alnavar'],
};

export const MyFarm: React.FC = () => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Connected Services State
  const [activeTab, setActiveTab] = useState<'schemes' | 'prices' | 'weather'>('schemes');
  const [farmEvaluations, setFarmEvaluations] = useState<any[]>([]);
  const [farmPrices, setFarmPrices] = useState<any[]>([]);
  const [farmWeather, setFarmWeather] = useState<any>(null);
  const [connectedLoading, setConnectedLoading] = useState(false);

  // Modal / Form state for Farm Location
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editDistrict, setEditDistrict] = useState('Shivamogga');
  const [editTaluk, setEditTaluk] = useState('Thirthahalli');
  const [editVillage, setEditVillage] = useState('Agumbe');

  // Modal / Form state for Land Parcel
  const [showLandModal, setShowLandModal] = useState(false);
  const [surveyNumber, setSurveyNumber] = useState('');
  const [hissaNumber, setHissaNumber] = useState('');
  const [landArea, setLandArea] = useState('2.0');
  const [landUnit, setLandUnit] = useState('Acre');
  const [ownershipType, setOwnershipType] = useState('Owned');
  const [irrigationType, setIrrigationType] = useState('Borewell');
  const [soilType, setSoilType] = useState('Red Loam');

  // Modal / Form state for Crop
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropName, setCropName] = useState('Arecanut');
  const [cropVariety, setCropVariety] = useState('Mangala / Mohitnagar');
  const [cropArea, setCropArea] = useState('1.5');
  const [cropSeason, setCropSeason] = useState('Perennial');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadConnectedData = async () => {
    setConnectedLoading(true);
    try {
      const [evalRes, priceRes, weatherRes] = await Promise.allSettled([
        api.get('/eligibility/farm-evaluations'),
        api.get('/market/farm-prices'),
        api.get('/weather/farm-advisory'),
      ]);

      if (evalRes.status === 'fulfilled' && evalRes.value.data.success) {
        setFarmEvaluations(evalRes.value.data.evaluations || []);
      }
      if (priceRes.status === 'fulfilled' && priceRes.value.data.success) {
        setFarmPrices(priceRes.value.data.farm_prices || []);
      }
      if (weatherRes.status === 'fulfilled' && weatherRes.value.data.success) {
        setFarmWeather(weatherRes.value.data);
      }
    } catch (err) {
      console.error('Error loading connected services:', err);
    } finally {
      setConnectedLoading(false);
    }
  };

  const loadFarmData = async () => {
    try {
      const res = await api.get('/farmer/profile');
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Error loading farm data:', err);
    } finally {
      setLoading(false);
    }
    loadConnectedData();
  };

  useEffect(() => {
    loadFarmData();
  }, []);

  const handleAddLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyNumber.trim()) return;

    setIsSaving(true);
    try {
      const res = await api.post('/farmer/farm/land', {
        survey_number: surveyNumber.trim(),
        hissa_number: hissaNumber.trim(),
        area: parseFloat(landArea) || 1.0,
        unit: landUnit,
        ownership_type: ownershipType,
        irrigation_type: irrigationType,
        soil_type: soilType,
      });

      if (res.data.success) {
        setShowLandModal(false);
        setSurveyNumber('');
        setHissaNumber('');
        setLandArea('2.0');
        showToast(
          language === 'kn'
            ? 'ಜಮೀನಿನ ವಿವರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ ಮತ್ತು ಉಳಿಸಲಾಗಿದೆ!'
            : 'Land parcel saved and registered successfully!'
        );
        await loadFarmData();
      }
    } catch (err: any) {
      console.error('Add land error:', err);
      showToast(
        language === 'kn'
          ? 'ಜಮೀನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Failed to save land parcel. Please try again.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLand = async (id: string) => {
    try {
      const res = await api.delete(`/farmer/farm/land/${id}`);
      if (res.data.success) {
        showToast(
          language === 'kn'
            ? 'ಜಮೀನಿನ ವಿವರವನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.'
            : 'Land parcel removed successfully.'
        );
        await loadFarmData();
      }
    } catch (err) {
      console.error('Delete land error:', err);
      showToast('Could not delete parcel.', 'error');
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    setIsSaving(true);
    try {
      const res = await api.post('/farmer/farm/crops', {
        name: cropName.trim(),
        variety: cropVariety.trim(),
        area: parseFloat(cropArea) || 1.0,
        season: cropSeason,
      });

      if (res.data.success) {
        setShowCropModal(false);
        setCropVariety('Mangala / Mohitnagar');
        setCropArea('1.5');
        showToast(
          language === 'kn'
            ? 'ಬೆಳೆ ವಿವರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ ಮತ್ತು ಉಳಿಸಲಾಗಿದೆ!'
            : 'Crop record registered and saved successfully!'
        );
        await loadFarmData();
      }
    } catch (err: any) {
      console.error('Add crop error:', err);
      showToast(
        language === 'kn'
          ? 'ಬೆಳೆ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Failed to register crop. Please try again.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    try {
      const res = await api.delete(`/farmer/farm/crops/${id}`);
      if (res.data.success) {
        showToast(
          language === 'kn'
            ? 'ಬೆಳೆ ವಿವರವನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ.'
            : 'Crop record removed successfully.'
        );
        await loadFarmData();
      }
    } catch (err) {
      console.error('Delete crop error:', err);
      showToast('Could not delete crop.', 'error');
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/farmer/profile', {
        district: editDistrict,
        taluk: editTaluk,
        village: editVillage,
      });
      if (res.data.success) {
        setShowLocationModal(false);
        showToast(
          language === 'kn'
            ? `ಕೃಷಿ ಸ್ಥಳವನ್ನು ${editDistrict} (${editTaluk}) ಗೆ ನವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಹವಾಮಾನಕ್ಕೆ ಜೋಡಿಸಲಾಗಿದೆ!`
            : `Farm location updated to ${editDistrict} (${editTaluk}) and synced with Weather module!`
        );
        await loadFarmData();
      }
    } catch (err) {
      console.error('Update location error:', err);
      showToast('Failed to update farm location', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8 pb-12 relative overflow-hidden"
    >
      {/* Ambient Floating Leaves & Subtle Glow */}
      <AmbientFloatingLeaves className="opacity-40" />

      {/* ── Toast Notification Banner ─────────────────────────────────── */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold transition shadow-sm relative z-10 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-700 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Farm DNA Identity Banner with 3D Entrance ──────────────────── */}
      <div className="perspective-1000 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5]/30 shadow-xl transform-3d transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3 py-1 rounded-full text-xs font-bold text-[#D5A94F] mb-2 shadow-xs">
                <Sprout className="w-3.5 h-3.5 text-[#D5A94F]" />
                <span>Module 2 · Single Source of Truth</span>
              </div>
              <h1 className="text-3xl font-black font-display text-white">
                {language === 'kn' ? 'ನನ್ನ ಡಿಜಿಟಲ್ ಜಮೀನು (Farm DNA)' : 'My Digital Farm (Farm DNA)'}
              </h1>
              <p className="text-xs sm:text-sm text-[#DCE9D5] mt-1 font-medium">
                Your registered land parcels and crops power automatic scheme eligibility checks, spray timings, and mandi alerts.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLandModal(true)}
                className="bg-[#D5A94F] hover:bg-[#B88E3B] active:scale-95 text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Land Parcel</span>
              </button>
              <button
                onClick={() => setShowCropModal(true)}
                className="bg-white hover:bg-[#EDF4EA] active:scale-95 text-[#245C3A] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Register Crop</span>
              </button>
            </div>
          </div>

          {/* Farm DNA Metrics */}
          <motion.div variants={staggerContainerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#DCE9D5]/20 text-xs">
            <motion.div
              variants={staggerItemVariants}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-[#1B452B] p-4 rounded-2xl border border-[#DCE9D5]/20 shadow-xs transition-all"
            >
              <span className="text-[#DCE9D5]/70 block mb-1 font-medium">Total Verified Land</span>
              <span className="text-2xl font-black text-white">
                {profile?.total_acres ? `${profile.total_acres} Acres` : '2.50 Acres'}
              </span>
              <span className="text-[10px] text-[#DCE9D5] block mt-0.5 font-semibold">
                = {((profile?.total_acres || 2.5) * 40).toFixed(0)} Guntas
              </span>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-[#1B452B] p-4 rounded-2xl border border-[#DCE9D5]/20 flex flex-col justify-between shadow-xs transition-all"
            >
              <div>
                <span className="text-[#DCE9D5]/70 block mb-1 font-medium">Farm Location</span>
                <span className="text-2xl font-black text-[#D5A94F]">
                  {profile?.district || 'Shivamogga'}
                </span>
                <span className="text-[10px] text-[#DCE9D5]/80 block mt-0.5 font-medium">
                  Taluk: {profile?.taluk || 'Thirthahalli'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const dist = profile?.district || 'Shivamogga';
                  setEditDistrict(dist);
                  setEditTaluk(profile?.taluk || (KARNATAKA_DISTRICTS[dist]?.[0] || 'Thirthahalli'));
                  setEditVillage(profile?.village || 'Agumbe');
                  setShowLocationModal(true);
                }}
                className="mt-2 text-[10px] font-bold text-white hover:text-[#D5A94F] active:scale-95 bg-[#245C3A] px-2.5 py-1 rounded-xl border border-[#D5A94F]/30 flex items-center space-x-1 cursor-pointer transition-all self-start shadow-2xs"
                title="Edit Farm District and Taluk"
              >
                <MapPin className="w-3 h-3 text-[#D5A94F]" />
                <span>Change (ಸ್ಥಳ ಬದಲಾಯಿಸಿ)</span>
              </button>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-[#1B452B] p-4 rounded-2xl border border-[#DCE9D5]/20 shadow-xs transition-all"
            >
              <span className="text-[#DCE9D5]/70 block mb-1 font-medium">Dominant Soil</span>
              <span className="text-2xl font-black text-white">
                {profile?.soil_type || 'Red Loam'}
              </span>
              <span className="text-[10px] text-[#DCE9D5] block mt-0.5 font-semibold">
                pH: 5.8 - 6.2 (Acidic)
              </span>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-[#1B452B] p-4 rounded-2xl border border-[#DCE9D5]/20 shadow-xs transition-all"
            >
              <span className="text-[#DCE9D5]/70 block mb-1 font-medium">State FRUITS ID</span>
              <span className="text-lg font-black text-[#D5A94F]">
                {profile?.fruits_id || 'KA-SMG-2026-8841'}
              </span>
              <span className="text-[10px] text-[#DCE9D5]/80 block mt-0.5 font-medium">
                Bhoomi RTC Synced
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Section 1: Land Parcels Table / Cards (Scroll Slide-Up) ───── */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAF1E7] shadow-field transition-all duration-300 relative z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-bold text-[#D69A42] uppercase tracking-wider">
              Land Records (RTC / Pahani)
            </span>
            <h2 className="text-2xl font-bold text-[#388E3C] font-display">
              Registered Land Parcels
            </h2>
          </div>
          <span className="text-xs text-[#788176]">
            {profile?.land_records?.length || 0} parcel(s) recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#F7F4EA] text-[#388E3C] font-bold border-b border-[#EAF1E7]">
                <th className="py-3 px-4 rounded-l-xl">Survey / Hissa</th>
                <th className="py-3 px-4">Extent / Area</th>
                <th className="py-3 px-4">Ownership</th>
                <th className="py-3 px-4">Irrigation</th>
                <th className="py-3 px-4">Soil Type</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profile?.land_records && profile.land_records.length > 0 ? (
                profile.land_records.map((parcel: any) => (
                  <tr key={parcel.id || parcel._id} className="hover:bg-[#FFFDF7] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#388E3C]">
                      Sy. No. {parcel.survey_number} / {parcel.hissa_number || '1'}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#D69A42]">
                      {parcel.area} {parcel.unit}
                      <span className="text-[10px] text-[#788176] block font-normal">
                        ({(parcel.unit === 'Acre' ? parcel.area * 40 : parcel.area).toFixed(0)} Guntas)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {parcel.ownership_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#24342A]">
                      {parcel.irrigation_type}
                    </td>
                    <td className="py-3.5 px-4 text-[#788176]">
                      {parcel.soil_type}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLand(parcel.id || parcel._id)}
                        className="text-red-500 hover:text-red-700 active:scale-90 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Remove parcel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#788176]">
                    {language === 'kn'
                      ? 'ಯಾವುದೇ ಜಮೀನು ನೋಂದಾಯಿಸಿಲ್ಲ. "+ Add Land Parcel" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಸೇರಿಸಿ.'
                      : 'No land parcels registered yet. Click "+ Add Land Parcel" above to record your land.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Section 2: Active Crops Management (Scroll Slide-Up) ──────── */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAF1E7] shadow-field transition-all duration-300 relative z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-bold text-[#D69A42] uppercase tracking-wider">
              Crop Survey & Harvest Cycles
            </span>
            <h2 className="text-2xl font-bold text-[#388E3C] font-display">
              Cultivated Crops
            </h2>
          </div>
          <span className="text-xs text-[#788176]">
            {profile?.crops?.length || 0} crop(s) registered
          </span>
        </div>

        <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile?.crops && profile.crops.length > 0 ? (
            profile.crops.map((crop: any) => (
              <motion.div
                key={crop.id || crop._id}
                variants={staggerItemVariants}
                whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2 } }}
                className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EAF1E7] flex justify-between items-start hover:border-[#759B62] transition shadow-xs"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-[#EAF1E7] text-[#388E3C] px-2 py-0.5 rounded">
                    {crop.season}
                  </span>
                  <h3 className="text-lg font-bold text-[#388E3C]">{crop.name}</h3>
                  <p className="text-xs text-[#788176]">Variety: {crop.variety}</p>
                  <p className="text-xs font-bold text-[#D69A42] pt-1">
                    Area: {crop.area} Acres
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteCrop(crop.id || crop._id)}
                  className="text-red-400 hover:text-red-600 active:scale-90 p-1.5 rounded hover:bg-red-50 transition cursor-pointer"
                  title="Remove crop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-[#788176] bg-[#FFFDF7] rounded-2xl border border-dashed border-[#EAF1E7]">
              {language === 'kn'
                ? 'ಯಾವುದೇ ಬೆಳೆ ನೋಂದಾಯಿಸಿಲ್ಲ. "+ Register Crop" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಸೇರಿಸಿ.'
                : 'No crops registered yet. Click "+ Register Crop" above to add your crops.'}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Section 3: Connected Farm Services (Scroll Slide-Up) ──────── */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAF1E7] shadow-field space-y-6 transition-all duration-300 relative z-10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EAF1E7] pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#EAF1E7] px-3 py-1 rounded-full text-xs font-bold text-[#388E3C] mb-2">
              <Layers className="w-3.5 h-3.5 text-[#388E3C]" />
              <span>Cross-Module Farm Intelligence</span>
            </div>
            <h2 className="text-2xl font-bold text-[#388E3C] font-display">
              {language === 'kn' ? 'ನನ್ನ ಜಮೀನಿಗೆ ಸಂಪರ್ಕಿತ ಸೇವೆಗಳು' : 'Connected Services for Your Farm'}
            </h2>
            <p className="text-xs text-[#788176] mt-0.5">
              Live APMC prices, weather spray windows, and government scheme eligibility connected directly to your registered land and crops.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center bg-[#F7F4EA] p-1.5 rounded-2xl border border-[#EAF1E7] text-xs font-bold">
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'schemes'
                  ? 'bg-[#388E3C] text-white shadow-xs'
                  : 'text-[#24342A] hover:text-[#388E3C]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು' : 'Schemes Eligibility'}</span>
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'prices'
                  ? 'bg-[#388E3C] text-white shadow-xs'
                  : 'text-[#24342A] hover:text-[#388E3C]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ದರ' : 'Mandi Prices'}</span>
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'weather'
                  ? 'bg-[#388E3C] text-white shadow-xs'
                  : 'text-[#24342A] hover:text-[#388E3C]'
              }`}
            >
              <CloudSun className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಹವಾಮಾನ & ಸಿಂಪಡಣೆ' : 'Weather & Spray'}</span>
            </button>
          </div>
        </div>

        {connectedLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-[#788176] space-y-2">
            <div className="w-6 h-6 border-2 border-[#388E3C] border-t-transparent rounded-full animate-spin"></div>
            <span>Evaluating live connections for your farm records...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── 1. SCHEMES ELIGIBILITY TAB ──────────────────────────────── */}
            {activeTab === 'schemes' && (
              <motion.div
                key="schemes-tab"
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#EAF1E7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#388E3C]" />
                    <span className="font-semibold text-[#24342A]">
                      Evaluated against your farm DNA: <strong>{profile?.total_acres || 2.5} Acres</strong> ·{' '}
                      <strong>{profile?.crops?.length || 2} Cultivated Crop(s)</strong> ·{' '}
                      <strong>{profile?.district || 'Shivamogga'} District</strong>
                    </span>
                  </div>
                  <Link
                    to="/farmer/schemes"
                    className="text-[#388E3C] font-bold hover:underline flex items-center space-x-1 shrink-0"
                  >
                    <span>Browse All Schemes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmEvaluations.slice(0, 4).map((evalItem) => {
                    const isApplicable = evalItem.status === 'POTENTIALLY_APPLICABLE';
                    return (
                      <motion.div
                        key={evalItem.scheme_id}
                        variants={staggerItemVariants}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EAF1E7] hover:border-[#759B62] transition space-y-3 flex flex-col justify-between shadow-xs"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF1E7] text-[#388E3C]">
                              {evalItem.government} · {evalItem.category}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isApplicable
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {evalItem.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#388E3C]">
                            {language === 'kn' && evalItem.name_kn ? evalItem.name_kn : evalItem.name_en}
                          </h3>
                          <p className="text-xs text-[#788176] line-clamp-2 mt-1">
                            {evalItem.benefit_summary || evalItem.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-[#24342A] font-semibold">
                            Conditions: {evalItem.conditions_passed} / {evalItem.conditions_total} Passed
                          </span>
                          <Link
                            to={`/farmer/eligibility/${evalItem.scheme_id}`}
                            className="bg-[#388E3C] hover:bg-[#256029] active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <span>Assessment Breakdown</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            {/* ── 2. MANDI PRICES FOR REGISTERED CROPS TAB ───────────────── */}
            {activeTab === 'prices' && (
              <motion.div
                key="prices-tab"
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#EAF1E7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#388E3C]" />
                    <span className="font-semibold text-[#24342A]">
                      Live modal market rates from Karnataka APMC mandis for your farm's cultivated crops.
                    </span>
                  </div>
                  <Link
                    to="/farmer/market"
                    className="text-[#388E3C] font-bold hover:underline flex items-center space-x-1 shrink-0"
                  >
                    <span>Full Market Trends</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmPrices.map((p, idx) => (
                    <motion.div
                      key={idx}
                      variants={staggerItemVariants}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EAF1E7] hover:border-[#759B62] transition space-y-3 shadow-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-[#788176] uppercase">
                            {p.market}
                          </span>
                          <h3 className="text-lg font-bold text-[#388E3C]">{p.crop_name}</h3>
                          <p className="text-xs text-[#788176]">Variety: {p.variety || 'Standard'}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center space-x-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{p.change_percent}%</span>
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#EAF1E7]">
                        <span className="text-[10px] text-[#788176] block">Today's Modal Rate</span>
                        <span className="text-2xl font-black text-[#D69A42]">
                          ₹{p.modal_price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#788176] ml-1">{p.unit}</span>
                        <div className="flex justify-between text-[11px] text-[#788176] mt-2 pt-2 border-t border-gray-100">
                          <span>Min: ₹{p.min_price?.toLocaleString()}</span>
                          <span>Max: ₹{p.max_price?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#24342A] flex justify-between items-center font-medium">
                        <span>Cultivated: {p.area} Acre(s)</span>
                        <span className="text-[#388E3C] font-bold">
                          Est. Val: ₹{Math.round(p.area * (p.modal_price || 0) * 0.8).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ── 3. WEATHER & SPRAY ADVISORY TAB ───────────────────────── */}
            {activeTab === 'weather' && (
              <motion.div
                key="weather-tab"
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#EAF1E7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CloudSun className="w-4 h-4 text-[#388E3C]" />
                    <span className="font-semibold text-[#24342A]">
                      Station: <strong>{farmWeather?.district || 'Shivamogga'} ({farmWeather?.taluk || 'Thirthahalli'})</strong> ·{' '}
                      Temp: <strong>{farmWeather?.temperature || 27.4}°C</strong> ·{' '}
                      Humidity: <strong>{farmWeather?.humidity || 78}%</strong> ·{' '}
                      Condition: <strong>{farmWeather?.condition || 'Scattered Clouds'}</strong>
                    </span>
                  </div>
                  <Link
                    to="/farmer/weather"
                    className="text-[#388E3C] font-bold hover:underline flex items-center space-x-1 shrink-0"
                  >
                    <span>7-Day Weather Advisory</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Best Spray Window Highlight */}
                <div className="bg-[#EAF1E7] border border-[#759B62]/30 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#388E3C] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#256029] block">
                        Recommended Daily Spray Window
                      </span>
                      <span className="text-base font-bold text-[#388E3C]">
                        {farmWeather?.best_spray_window_today || '07:30 AM - 01:30 PM'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-white text-[#388E3C] font-bold px-3 py-1.5 rounded-xl border border-[#759B62]/30 hidden sm:inline-block">
                    Conclude before afternoon convective rain
                  </span>
                </div>

                {/* Crop-Specific Weather & Disease Warnings */}
                <motion.div variants={staggerContainerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(farmWeather?.crop_advisories || []).map((adv: any, idx: number) => (
                    <motion.div
                      key={idx}
                      variants={staggerItemVariants}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="p-5 rounded-2xl bg-[#FFFDF7] border border-[#EAF1E7] space-y-2 hover:border-[#759B62] transition shadow-xs"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-bold text-[#388E3C]">
                          {adv.crop_name} <span className="text-xs font-normal text-[#788176]">({adv.stage})</span>
                        </h4>
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
                      <p className="text-xs text-[#24342A] leading-relaxed">
                        {adv.recommendation}
                      </p>
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-[#788176]">
                        <span>Safe Timing: <strong>{adv.spray_window}</strong></span>
                        <span className="text-rose-600 font-bold">Urgency: {adv.urgency}</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Modal: Add Land Parcel ────────────────────────────────────── */}
      <AnimatePresence>
        {showLandModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAF1E7] shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-[#388E3C] font-display">
                Add Land Parcel
              </h3>
              <form onSubmit={handleAddLand} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Survey Number
                    </label>
                    <input
                      type="text"
                      required
                      value={surveyNumber}
                      onChange={(e) => setSurveyNumber(e.target.value)}
                      placeholder="e.g. 142"
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Hissa / Sub-division
                    </label>
                    <input
                      type="text"
                      value={hissaNumber}
                      onChange={(e) => setHissaNumber(e.target.value)}
                      placeholder="e.g. 2A"
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Area Extent
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={landArea}
                      onChange={(e) => setLandArea(e.target.value)}
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Unit
                    </label>
                    <select
                      value={landUnit}
                      onChange={(e) => setLandUnit(e.target.value)}
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    >
                      <option value="Acre">Acre</option>
                      <option value="Gunta">Gunta (40 Gunta = 1 Acre)</option>
                      <option value="Hectare">Hectare</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Ownership Type
                    </label>
                    <select
                      value={ownershipType}
                      onChange={(e) => setOwnershipType(e.target.value)}
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    >
                      <option value="Owned">Sole Owner (Pahani)</option>
                      <option value="Joint Owned">Joint Family Ownership</option>
                      <option value="Leased">Leased Cultivator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Irrigation Setup
                    </label>
                    <select
                      value={irrigationType}
                      onChange={(e) => setIrrigationType(e.target.value)}
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    >
                      <option value="Borewell">Borewell with Drip</option>
                      <option value="Well">Open Well</option>
                      <option value="Pond">Krishi Honda (Farm Pond)</option>
                      <option value="Rainfed">Dryland Rainfed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLandModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#788176] hover:bg-gray-100 cursor-pointer active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#388E3C] text-white hover:bg-[#256029] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    {isSaving ? 'Saving...' : 'Save Land Parcel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Add Crop ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showCropModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAF1E7] shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-[#388E3C] font-display">
                Register Cultivated Crop
              </h3>
              <form onSubmit={handleAddCrop} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                    Crop Name
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                  >
                    <option value="Arecanut">Arecanut (ಅಡಿಕೆ)</option>
                    <option value="Paddy">Paddy (ಭತ್ತ)</option>
                    <option value="Maize">Maize (ಮೆಕ್ಕೆಜೋಳ)</option>
                    <option value="Ragi">Ragi (Finger Millet - ಸಿರಿಧಾನ್ಯ)</option>
                    <option value="Cotton">Cotton (ಹತ್ತಿ)</option>
                    <option value="Coffee">Coffee (ಕಾಫಿ)</option>
                    <option value="Tomato">Tomato (ಟೊಮೆಟೊ)</option>
                    <option value="Sugarcane">Sugarcane (ಕಬ್ಬು)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                    Variety
                  </label>
                  <input
                    type="text"
                    value={cropVariety}
                    onChange={(e) => setCropVariety(e.target.value)}
                    placeholder="e.g. Mangala / Jyothi"
                    className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Cultivated Area (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={cropArea}
                      onChange={(e) => setCropArea(e.target.value)}
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                      Season
                    </label>
                    <select
                      value={cropSeason}
                      onChange={(e) => setCropSeason(e.target.value)}
                      className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                    >
                      <option value="Kharif">Kharif (ಮುಂಗಾರು)</option>
                      <option value="Rabi">Rabi (ಹಿಂಗಾರು)</option>
                      <option value="Summer">Summer (ಬೇಸಿಗೆ)</option>
                      <option value="Perennial">Perennial (ಬಹುವಾರ್ಷಿಕ)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCropModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#788176] hover:bg-gray-100 cursor-pointer active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#388E3C] text-white hover:bg-[#256029] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    {isSaving ? 'Registering...' : 'Save Crop'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Update Farm Location ───────────────────────────────── */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAF1E7] shadow-2xl space-y-4"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#388E3C]" />
                <h3 className="text-xl font-bold text-[#388E3C] font-display">
                  Update Farm Location
                </h3>
              </div>
              <p className="text-xs text-[#788176]">
                Changing this location updates your registered Farm DNA and is immediately accepted by the Weather & Market modules.
              </p>

              <form onSubmit={handleUpdateLocation} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                    Karnataka District
                  </label>
                  <select
                    value={editDistrict}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setEditDistrict(newDist);
                      const talukList = KARNATAKA_DISTRICTS[newDist] || [];
                      if (talukList.length > 0) {
                        setEditTaluk(talukList[0]);
                      }
                    }}
                    className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                  >
                    {Object.keys(KARNATAKA_DISTRICTS).map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                    Taluk
                  </label>
                  <select
                    value={editTaluk}
                    onChange={(e) => setEditTaluk(e.target.value)}
                    className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                  >
                    {(KARNATAKA_DISTRICTS[editDistrict] || []).map((t) => (
                      <option key={t} value={t}>
                        {t} Taluk
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#388E3C] uppercase mb-1">
                    Village / Hobli
                  </label>
                  <input
                    type="text"
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    placeholder="e.g. Agumbe / Kasaba"
                    className="w-full bg-[#FFFDF7] p-2.5 rounded-xl border border-[#EAF1E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#388E3C]"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#788176] hover:bg-gray-100 cursor-pointer active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#388E3C] text-white hover:bg-[#256029] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    {isSaving ? 'Updating...' : 'Save & Sync Weather'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
