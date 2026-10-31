import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, MapPin, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [farmerName, setFarmerName] = useState('');
  const [district, setDistrict] = useState('Shivamogga');
  const [taluk, setTaluk] = useState('Thirthahalli');
  const [village, setVillage] = useState('Agumbe');
  const [fruitsId, setFruitsId] = useState('KA-SMG-2026-8841');
  const [soilType, setSoilType] = useState('Red Loamy');
  const [incomeBracket, setIncomeBracket] = useState('< ₹1.5 Lakh');
  const [socialCategory, setSocialCategory] = useState('General');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/farmer/profile')
      .then((res) => {
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFarmerName(p.farmer_name || user?.name || '');
          setDistrict(p.district || 'Shivamogga');
          setTaluk(p.taluk || 'Thirthahalli');
          setVillage(p.village || 'Agumbe');
          setFruitsId(p.fruits_id || 'KA-SMG-2026-8841');
          setSoilType(p.soil_type || 'Red Loamy');
          setIncomeBracket(p.annual_income_bracket || '< ₹1.5 Lakh');
          setSocialCategory(p.social_category || 'General');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    try {
      await api.put('/farmer/profile', {
        farmer_name: farmerName,
        district,
        taluk,
        village,
        fruits_id: fruitsId,
        soil_type: soilType,
        annual_income_bracket: incomeBracket,
        social_category: socialCategory,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-3 shadow-xs">
            <User className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>Profile & FRUITS Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            Farmer Profile & Identity
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE9D5] mt-2 max-w-2xl leading-relaxed">
            Maintain your verified farmer attributes. Changes here immediately reflect across scheme eligibility audits.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs">
        {savedSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-[#245C3A] p-3.5 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#245C3A]" />
            <span>Profile and Farm DNA updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Farmer Full Name
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Karnataka FRUITS ID
              </label>
              <input
                type="text"
                value={fruitsId}
                onChange={(e) => setFruitsId(e.target.value)}
                placeholder="KA-SMG-2026-XXXX"
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="Shivamogga">Shivamogga</option>
                <option value="Davanagere">Davanagere</option>
                <option value="Bengaluru Rural">Bengaluru Rural</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Belagavi">Belagavi</option>
                <option value="Ballari">Ballari</option>
                <option value="Dharwad">Dharwad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Taluk
              </label>
              <input
                type="text"
                value={taluk}
                onChange={(e) => setTaluk(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Village / Hobli
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="Red Loamy">Red Loamy</option>
                <option value="Laterite">Laterite (Malnad)</option>
                <option value="Black Cotton">Black Cotton</option>
                <option value="Alluvial">Alluvial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Annual Income Bracket
              </label>
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="< ₹1.5 Lakh">&lt; ₹1.5 Lakh (Small & Marginal)</option>
                <option value="₹1.5L - ₹3.0L">₹1.5L - ₹3.0L</option>
                <option value="> ₹3.0 Lakh">&gt; ₹3.0 Lakh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Social Category
              </label>
              <select
                value={socialCategory}
                onChange={(e) => setSocialCategory(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Category 2A/3A/3B)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#245C3A] hover:bg-[#1B452B] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xs transition flex items-center space-x-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

