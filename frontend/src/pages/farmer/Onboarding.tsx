import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, CheckCircle2, ArrowRight, MapPin, Layers } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState('Shivamogga');
  const [taluk, setTaluk] = useState('Thirthahalli');
  const [landArea, setLandArea] = useState('2.5');
  const [primaryCrop, setPrimaryCrop] = useState('Arecanut');
  const [irrigation, setIrrigation] = useState('Borewell');

  const handleFinish = async () => {
    try {
      // 1. Update farmer profile
      await api.put('/farmer/profile', {
        district,
        taluk,
        soil_type: 'Red Loamy',
      });

      // 2. Add initial land parcel
      await api.post('/farmer/farm/land', {
        survey_number: '142',
        hissa_number: '1',
        area: parseFloat(landArea),
        unit: 'Acre',
        ownership_type: 'Owned',
        irrigation_type: irrigation,
      });

      // 3. Add initial crop
      await api.post('/farmer/farm/crops', {
        name: primaryCrop,
        variety: 'Standard High Yield',
        area: parseFloat(landArea),
        season: 'Kharif',
      });

      navigate('/farmer/home');
    } catch (err) {
      console.error(err);
      navigate('/farmer/home');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#DCE9D5] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#245C3A] text-[#D5A94F] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Sprout className="w-8 h-8 text-[#D5A94F]" />
          </div>
          <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider block pt-1">
            Step {step} of 3 · Digital Farm DNA Setup
          </span>
          <h2 className="text-2xl font-black text-[#245C3A] font-display">
            {step === 1 && 'Where is your farm located?'}
            {step === 2 && 'How much land do you cultivate?'}
            {step === 3 && 'What is your primary crop & water setup?'}
          </h2>
          <p className="text-xs text-[#303B32]/70">
            This information automatically links to verified Karnataka scheme recommendations and spray forecasts.
          </p>
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="Shivamogga">Shivamogga (ಶಿವಮೊಗ್ಗ)</option>
                <option value="Davanagere">Davanagere (ದಾವಣಗೆರೆ)</option>
                <option value="Bengaluru Rural">Bengaluru Rural (ಬೆಂಗಳೂರು)</option>
                <option value="Mysuru">Mysuru (ಮೈಸೂರು)</option>
                <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
                <option value="Ballari">Ballari (ಬಳ್ಳಾರಿ)</option>
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
                placeholder="e.g. Thirthahalli"
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#245C3A] hover:bg-[#1B452B] text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              <span>Continue to Land Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Land Extent */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Total Land Holding (in Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              />
              <span className="text-[11px] text-[#303B32]/60 block mt-1">
                = {(parseFloat(landArea || '0') * 40).toFixed(0)} Guntas
              </span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 border border-[#DCE9D5] text-[#303B32] hover:bg-[#F7F8F0] py-3 rounded-xl font-bold text-sm cursor-pointer transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 bg-[#245C3A] hover:bg-[#1B452B] text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Crops</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Crop & Irrigation */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Main Cultivated Crop
              </label>
              <select
                value={primaryCrop}
                onChange={(e) => setPrimaryCrop(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="Arecanut">Arecanut (ಅಡಿಕೆ)</option>
                <option value="Paddy">Paddy (ಭತ್ತ)</option>
                <option value="Maize">Maize (ಮೆಕ್ಕೆಜೋಳ)</option>
                <option value="Ragi">Ragi (Finger Millet - ಸಿರಿಧಾನ್ಯ)</option>
                <option value="Cotton">Cotton (ಹತ್ತಿ)</option>
                <option value="Coffee">Coffee (ಕಾಫಿ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                Irrigation Source
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="w-full bg-[#F7F8F0] p-3 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
              >
                <option value="Borewell">Borewell with Drip</option>
                <option value="Well">Open Well</option>
                <option value="Pond">Krishi Honda (Farm Pond)</option>
                <option value="Rainfed">Dryland Rainfed</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 border border-[#DCE9D5] text-[#303B32] hover:bg-[#F7F8F0] py-3 rounded-xl font-bold text-sm cursor-pointer transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 bg-[#245C3A] hover:bg-[#1B452B] text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Activate My Farm DNA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

