import React, { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { 
  Sprout, Lock, Mail, User, Phone, MapPin, 
  ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, 
  Sparkles, Globe, Check
} from 'lucide-react';
import { KARNATAKA_DISTRICTS_TALUKS, DISTRICT_LIST } from '../../data/karnatakaDistricts';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // District and Taluk cascade
  const [district, setDistrict] = useState('Shivamogga');
  const [taluk, setTaluk] = useState('Thirthahalli');

  // Preferred Language
  const [prefLanguage, setPrefLanguage] = useState<'kn' | 'en'>(language === 'kn' ? 'kn' : 'en');

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle District change & update Taluks
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDist = e.target.value;
    setDistrict(selectedDist);
    const taluksForDistrict = KARNATAKA_DISTRICTS_TALUKS[selectedDist] || [];
    setTaluk(taluksForDistrict[0] || '');
  };

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 2 ಅಕ್ಷರ).'
          : 'Please enter your full name (minimum 2 characters).'
      );
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return false;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage(
          language === 'kn'
            ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.'
            : 'Please enter a valid email address.'
        );
        return false;
      }
    }

    if (!password || password.length < 6) {
      setErrorMessage(
        language === 'kn'
          ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.'
          : 'Password must be at least 6 characters.'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        language === 'kn'
          ? 'ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ದೃಢೀಕರಣ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.'
          : 'Password and Confirm Password do not match.'
      );
      return false;
    }

    if (!district) {
      setErrorMessage(
        language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select your district.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const finalEmail = email.trim() || `${cleanPhone}@farmer.krishimitra.in`;

      await register(
        name.trim(),
        finalEmail,
        password,
        cleanPhone,
        prefLanguage,
        district,
        taluk
      );

      // If user selected Kannada, synchronize global language context
      if (prefLanguage !== language) {
        setLanguage(prefLanguage);
      }

      toast.success(
        language === 'kn'
          ? 'ರೈತರ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ಕೃಷಿ ಮಿತ್ರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ.'
          : 'Registration successful! Welcome to your Krishi Mitra dashboard.'
      );

      // Redirect directly to the Krishi Mitra farmer dashboard
      navigate('/farmer/farm');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        (language === 'kn'
          ? 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Registration failed. Please check your details and try again.');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const talukOptions = KARNATAKA_DISTRICTS_TALUKS[district] || [];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* ── Agricultural Background with Green Fields & Farmers ──────── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(27, 69, 43, 0.94), rgba(36, 92, 58, 0.88), rgba(15, 45, 26, 0.96)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F7F8F0_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* ── Top Bar: Logo, Home link & Language Switcher ─────────────── */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#245C3A] flex items-center justify-center shadow-lg border border-white/20 transition-transform group-hover:scale-105">
            <Sprout className="w-6 h-6 text-[#245C3A]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-white font-display tracking-tight drop-shadow-sm">
                KRISHI MITRA
              </span>
              <span className="bg-[#D5A94F] text-[#1B452B] text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                KA
              </span>
            </div>
            <p className="text-[11px] text-[#DCE9D5] font-medium">
              {language === 'kn' ? 'ಕನ್ನಡ ಧ್ವನಿ ಆಧಾರಿತ ಕೃಷಿ ಎಐ ಸಹಾಯಕ' : 'Kannada Voice-Based AI Assistant for Farmers'}
            </p>
          </div>
        </Link>

        {/* Language switch & Home button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            className="flex items-center space-x-1.5 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-white/15 transition"
          >
            <span>{language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}</span>
          </Link>
        </div>
      </header>

      {/* ── Main Content: Registration Card ──────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-9 shadow-2xl border border-[#DCE9D5] space-y-6 animate-fadeIn">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#DCE9D5]/60 text-[#245C3A] border border-[#DCE9D5] px-3.5 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>{language === 'kn' ? 'ಹೊಸ ರೈತರ ನೋಂದಣಿ' : 'New Farmer Registration'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#245C3A] font-display">
              {language === 'kn' ? 'ಕೃಷಿ ಮಿತ್ರ ಖಾತೆ ತೆರೆಯಿರಿ' : 'Register Farmer Account'}
            </h1>
            <p className="text-xs text-[#303B32]/70 max-w-md mx-auto leading-relaxed">
              {language === 'kn'
                ? 'ಯಾವುದೇ ದಾಖಲೆಗಳ ಅಪ್‌ಲೋಡ್ ಇಲ್ಲದೆ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ತಕ್ಷಣ ನೋಂದಾಯಿಸಿ.'
                : 'Simple, direct registration for farmers without document upload hassles.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-start space-x-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row 1: Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                {language === 'kn' ? 'ರೈತರ ಪೂರ್ಣ ಹೆಸರು (Full Name)' : 'Full Name'} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'kn' ? 'ಉದಾ: ಸುರೇಶ್ ಗೌಡ' : 'e.g. Suresh Gowda'}
                  className="w-full bg-[#F7F8F0] pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#303B32]/40 focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                />
              </div>
            </div>

            {/* Row 2: Mobile Number & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                  {language === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile)' : 'Mobile Number'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9845012345"
                    className="w-full bg-[#F7F8F0] pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#303B32]/40 focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                  />
                </div>
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                  {language === 'kn' ? 'ಇಮೇಲ್ ಐಡಿ (Email ID)' : 'Email ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="suresh.farmer@malnad.in"
                    className="w-full bg-[#F7F8F0] pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#303B32]/40 focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: District & Taluk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* District */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                  {language === 'kn' ? 'ಜಿಲ್ಲೆ (District)' : 'District'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={district}
                    onChange={handleDistrictChange}
                    className="w-full bg-[#F7F8F0] pl-10 pr-8 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs cursor-pointer appearance-none"
                  >
                    {DISTRICT_LIST.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Taluk */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                  {language === 'kn' ? 'ತಾಲೂಕು (Taluk)' : 'Taluk'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    className="w-full bg-[#F7F8F0] pl-10 pr-8 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs cursor-pointer appearance-none"
                  >
                    {talukOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Create Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Create Password */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                  {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ' : 'Create Password'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F7F8F0] pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#303B32]/40 focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#303B32]/60 hover:text-[#245C3A] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                  {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : 'Confirm Password'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#303B32]/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F7F8F0] pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#303B32]/40 focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#303B32]/60 hover:text-[#245C3A] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="flex items-center space-x-1.5 text-[11px] pt-0.5">
                {password === confirmPassword ? (
                  <span className="text-emerald-700 flex items-center space-x-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ ✓' : 'Passwords match ✓'}</span>
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center space-x-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ' : 'Passwords do not match yet'}</span>
                  </span>
                )}
              </div>
            )}

            {/* Row 5: Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1.5">
                {language === 'kn' ? 'ಆದ್ಯತೆಯ ಭಾಷೆ (Preferred Language)' : 'Preferred Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrefLanguage('kn')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    prefLanguage === 'kn'
                      ? 'bg-[#245C3A] text-white border-[#245C3A] shadow-xs'
                      : 'bg-[#F7F8F0] text-[#303B32] border-[#DCE9D5] hover:bg-[#DCE9D5]/30'
                  }`}
                >
                  {prefLanguage === 'kn' && <Check className="w-3.5 h-3.5 text-[#D5A94F]" />}
                  <span>ಕನ್ನಡ (Kannada)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrefLanguage('en')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    prefLanguage === 'en'
                      ? 'bg-[#245C3A] text-white border-[#245C3A] shadow-xs'
                      : 'bg-[#F7F8F0] text-[#303B32] border-[#DCE9D5] hover:bg-[#DCE9D5]/30'
                  }`}
                >
                  {prefLanguage === 'en' && <Check className="w-3.5 h-3.5 text-[#D5A94F]" />}
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#245C3A] hover:bg-[#1B452B] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              <span>
                {loading
                  ? (language === 'kn' ? 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'Registering Account...')
                  : (language === 'kn' ? 'ಖಾತೆ ತೆರೆಯಿರಿ (Register)' : 'Register Account')}
              </span>
              <ArrowRight className="w-4 h-4 text-[#D5A94F]" />
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 text-center text-xs text-[#303B32]/70 border-t border-[#DCE9D5]/40">
            {language === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?' : 'Already have a registered account?'}{' '}
            <Link
              to="/login"
              className="text-[#245C3A] font-bold hover:underline inline-flex items-center space-x-0.5 ml-1"
            >
              <span>{language === 'kn' ? 'ಇಲ್ಲಿ ಲಾಗಿನ್ ಆಗಿ (Sign In)' : 'Sign In here'}</span>
              <ArrowRight className="w-3 h-3 ml-0.5 text-[#245C3A]" />
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-4 text-center text-xs text-white/80 font-medium">
        <span>© 2026 Krishi Mitra · Karnataka Digital Agriculture Platform · Built for Farmers</span>
      </footer>
    </div>
  );
};
