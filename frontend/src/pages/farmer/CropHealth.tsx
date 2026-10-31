import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Camera, Upload, AlertCircle, CheckCircle2, 
  HelpCircle, ShieldAlert, ArrowRight, History, Sparkles, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const SAMPLES = [
  {
    crop: 'arecanut',
    title: 'Arecanut (Kole Roga / Fruit Rot)',
    url: 'https://images.unsplash.com/photo-1599818817688-6625841e0655?w=600&auto=format&fit=crop&q=80',
    description: 'Fallen immature nuts with water-soaked lesions'
  },
  {
    crop: 'paddy',
    title: 'Paddy (Blast Disease)',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    description: 'Spindle-shaped brown lesions with grey center'
  },
  {
    crop: 'tomato',
    title: 'Tomato (Early Blight)',
    url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80',
    description: 'Concentric ring spots with yellow halos on foliage'
  }
];

export const CropHealth: React.FC = () => {
  const { language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('arecanut');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(SAMPLES[0].url);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/crop-health/history')
      .then((res) => {
        if (res.data.success) {
          setHistory(res.data.history || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleSelectSample = (sample: typeof SAMPLES[0]) => {
    setSelectedCrop(sample.crop);
    setImageFile(null);
    setImagePreview(sample.url);
    setErrorMessage('');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('crop_name', selectedCrop);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await api.post('/crop-health/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setAnalysisResult(res.data.analysis);
        toast.success(language === 'kn' ? 'ಬೆಳೆ ರೋಗ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ!' : 'Crop health scan completed!');
        // Refresh history
        api.get('/crop-health/history')
          .then((h) => setHistory(h.data.history || []))
          .catch(() => {});
      } else {
        setErrorMessage(res.data.message || 'Analysis failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || 'Could not connect to crop diagnostic service.');
      toast.error('Scan error. Check your connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5]/30 shadow-xl">
        <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3 py-1 rounded-full text-xs font-bold text-[#D5A94F] mb-2 shadow-xs">
          <Camera className="w-3.5 h-3.5 text-[#D5A94F]" />
          <span>Module 3 · Agricultural Pathogen Intelligence</span>
        </div>
        <h1 className="text-3xl font-black font-display text-white">
          {language === 'kn' ? 'ಬೆಳೆ ಆರೋಗ್ಯ ಸಹಾಯಕ' : 'Crop Health Assistant'}
        </h1>
        <p className="text-xs sm:text-sm text-[#DCE9D5] mt-1 max-w-2xl leading-relaxed font-medium">
          Upload or capture photographs of affected leaves, bunches, or fruits. Diagnostic models identify probable diseases (e.g. Kole Roga, Blast) and recommend scientific UAHS spray advisories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Col: Upload & Scan Form (5 Cols) ─────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-field">
            <h2 className="text-xl font-bold text-[#245C3A] font-display mb-4">
              Scan Affected Crop
            </h2>

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1">
                  Select Cultivated Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    const c = e.target.value;
                    setSelectedCrop(c);
                    const matchedSample = SAMPLES.find((s) => s.crop === c);
                    if (matchedSample && !imageFile) {
                      setImagePreview(matchedSample.url);
                    }
                  }}
                  className="w-full bg-[#F7F8F0] p-2.5 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A]"
                >
                  <option value="arecanut">Arecanut (ಅಡಿಕೆ) - Malnad / Coastal</option>
                  <option value="paddy">Paddy (ಭತ್ತ) - Blast / Blight check</option>
                  <option value="tomato">Tomato (ಟೊಮೆಟೊ) - Early / Late Blight</option>
                  <option value="default">Other Crop Foliar Symptom</option>
                </select>
              </div>

              {/* Instant Sample Selectors */}
              <div>
                <span className="text-[11px] font-bold text-[#68756A] uppercase block mb-1.5">
                  Or Test with Real Karnataka Samples:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLES.map((s) => (
                    <button
                      key={s.crop}
                      type="button"
                      onClick={() => handleSelectSample(s)}
                      className={`p-2 rounded-xl border text-left text-[11px] transition cursor-pointer ${
                        selectedCrop === s.crop
                          ? 'border-[#245C3A] bg-[#EDF4EA] font-bold text-[#245C3A] shadow-xs'
                          : 'border-[#DCE9D5] bg-[#F7F8F0] text-[#68756A] hover:bg-white'
                      }`}
                    >
                      <span className="block truncate">{s.title.split(' ')[0]}</span>
                      <span className="text-[9px] text-[#D5A94F] font-bold block truncate">Sample</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1">
                  Crop Photograph
                </label>
                <div className="border-2 border-dashed border-[#245C3A]/30 rounded-2xl p-4 text-center hover:bg-[#F7F8F0] transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-44 object-cover rounded-xl mx-auto shadow-xs border border-[#DCE9D5]"
                      />
                      <span className="text-[11px] font-bold text-[#245C3A] block">
                        Tap here to upload your own custom photo
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Camera className="w-10 h-10 text-[#245C3A] mx-auto" />
                      <p className="text-xs font-semibold text-[#245C3A]">
                        Take a photo or upload from gallery
                      </p>
                      <p className="text-[10px] text-[#68756A]">
                        Supports JPG, PNG · Ensure leaf lesions or nut stalks are in clear focus
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full bg-[#245C3A] hover:bg-[#1B452B] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 text-[#D5A94F] ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Analyzing Pathogen...' : 'Analyze Crop Health Now'}</span>
              </button>
            </form>
          </div>

          {/* Previous Scans */}
          {history.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-field">
              <div className="flex items-center space-x-2 mb-4 font-bold text-[#245C3A]">
                <History className="w-4 h-4 text-[#D5A94F]" />
                <h3 className="text-base font-display">Previous Scans</h3>
              </div>
              <div className="space-y-3">
                {history.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setAnalysisResult(item)}
                    className="p-3 rounded-xl bg-[#F7F8F0] border border-[#DCE9D5] flex justify-between items-center text-xs hover:border-[#245C3A] cursor-pointer transition shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-[#245C3A] block">{item.crop_name}</span>
                      <span className="text-[10px] text-[#68756A]">{item.condition}</span>
                    </div>
                    <span className="text-[#245C3A] font-black bg-[#DCE9D5] px-2.5 py-0.5 rounded-full text-[10px]">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Col: Diagnostic Output (7 Cols) ─────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-field space-y-6 will-change-[transform,opacity]"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#DCE9D5]/60 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#D5A94F] tracking-wider">
                    Diagnostic Pathology Report
                  </span>
                  <h2 className="text-2xl font-bold text-[#245C3A] font-display">
                    {analysisResult.condition}
                  </h2>
                  <span className="text-xs text-[#68756A]">
                    Identified Host Crop: <strong className="text-[#303B32]">{analysisResult.crop_name}</strong>
                  </span>
                </div>

                <div className="bg-[#EDF4EA] border border-[#DCE9D5] text-[#245C3A] px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs">
                  Model Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C3A] mb-2 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-[#D5A94F]" />
                  <span>Visible Foliar / Fruit Symptoms</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#303B32] list-disc list-inside bg-[#F7F8F0] p-3.5 rounded-xl border border-[#DCE9D5]">
                  {analysisResult.symptoms?.map((s: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Possible Causes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C3A] mb-2 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#B85C43]" />
                  <span>Probable Environmental & Biological Causes</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#303B32] list-disc list-inside bg-[#F7F8F0] p-3.5 rounded-xl border border-[#DCE9D5]">
                  {analysisResult.possible_causes?.map((c: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{c}</li>
                  ))}
                </ul>
              </div>

              {/* Preventive Advisories */}
              <div className="bg-[#EDF4EA] p-5 rounded-2xl border border-[#DCE9D5]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C3A] mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#245C3A]" />
                  <span>Recommended Scientific Preventive Measures</span>
                </h4>
                <ul className="space-y-2 text-xs text-[#245C3A]">
                  {analysisResult.preventive_recommendations?.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D5A94F] mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Agricultural Expert Notice */}
              <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#D5A94F]/40 text-xs text-[#303B32] flex items-start space-x-3 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-[#D5A94F] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[#245C3A]">Official Agricultural University Recommendation:</p>
                  <p className="leading-relaxed text-[#68756A]">{analysisResult.expert_consultation}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-[#DCE9D5] shadow-field text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#F7F8F0] text-[#245C3A] flex items-center justify-center mx-auto border border-[#DCE9D5]">
                <Camera className="w-8 h-8 text-[#245C3A]" />
              </div>
              <h3 className="text-xl font-bold text-[#245C3A] font-display">
                Ready for Crop Diagnosis
              </h3>
              <p className="text-xs text-[#68756A] max-w-sm mx-auto leading-relaxed">
                Choose a crop on the left (or pick one of the sample buttons) and click <strong>"Analyze Crop Health Now"</strong> to generate the comprehensive pathology report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
