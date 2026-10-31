import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { PageTransition } from '../../components/common/PageTransition';
import { 
  Sprout, Lock, Mail, ArrowRight, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ShieldCheck, UserCheck, 
  Sparkles, Globe, KeyRound, X, Phone
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginDemo } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // Load remembered email/phone on mount
  useEffect(() => {
    const saved = localStorage.getItem('krishi_remembered_identifier');
    if (saved) {
      setIdentifier(saved);
    }
  }, []);

  const validate = () => {
    if (!identifier.trim()) {
      setErrorMessage(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಯಾವುದೇ ಇಮೇಲ್ ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.'
          : 'Please enter any email ID or mobile number.'
      );
      return false;
    }
    if (!password) {
      setErrorMessage(
        language === 'kn'
          ? 'ದಯವಿಟ್ಟು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.'
          : 'Please enter your password.'
      );
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      if (rememberMe) {
        localStorage.setItem('krishi_remembered_identifier', identifier.trim());
      } else {
        localStorage.removeItem('krishi_remembered_identifier');
      }

      toast.success(
        language === 'kn'
          ? 'ಕೃಷಿ ಮಿತ್ರ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ!'
          : 'Welcome to Krishi Mitra Platform!'
      );
      // Redirect directly to the Krishi Mitra farmer dashboard
      navigate('/farmer/farm');
    } catch (err: any) {
      const msg = err.message || (
        language === 'kn'
          ? 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ರುಜುವಾತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.'
          : 'Invalid mobile number/email or password.'
      );
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'farmer' | 'admin') => {
    setErrorMessage('');
    setLoading(true);
    try {
      await loginDemo(role);
      toast.success(
        language === 'kn'
          ? 'ಡೆಮೊ ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!'
          : `Signed in as Demo ${role === 'admin' ? 'Officer' : 'Farmer'}!`
      );
      navigate(role === 'admin' ? '/admin' : '/farmer/farm');
    } catch (err: any) {
      const msg = err.message || 'Demo login failed';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');

    try {
      if (forgotStep === 'verify') {
        const res = await api.post('/auth/forgot-password', {
          identifier: forgotIdentifier.trim(),
        });
        if (res.data.success) {
          setForgotStep('reset');
          setForgotMessage(res.data.message);
          toast.success(
            language === 'kn'
              ? 'ಖಾತೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ಈಗ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ.'
              : 'Account verified! Now set your new password.'
          );
        }
      } else {
        if (!newPassword || newPassword.length < 6) {
          toast.error(
            language === 'kn'
              ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರ ಇರಬೇಕು'
              : 'Password must be at least 6 characters'
          );
          setForgotLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          toast.error(
            language === 'kn'
              ? 'ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ'
              : 'Passwords do not match'
          );
          setForgotLoading(false);
          return;
        }

        const res = await api.post('/auth/forgot-password', {
          identifier: forgotIdentifier.trim(),
          new_password: newPassword,
        });

        if (res.data.success) {
          toast.success(res.data.message);
          setShowForgotModal(false);
          setForgotStep('verify');
          setPassword(newPassword);
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to verify account';
      setForgotMessage(msg);
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* ── Agricultural Background with Green Crops & Overlay ───────── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(36, 92, 58, 0.92), rgba(27, 69, 43, 0.88), rgba(18, 48, 30, 0.95)), url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=80')`,
        }}
      >
        {/* Subtle decorative grid/field pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F7F8F0_1px,transparent_1px)] [background-size:24px_24px]"></div>
      </div>

      {/* ── Top Bar: Logo, Home link & Language Switcher ─────────────── */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#FFFFFF] text-[#245C3A] flex items-center justify-center shadow-lg border border-[#DCE9D5]/40 transition-transform group-hover:scale-105">
            <Sprout className="w-6 h-6 text-[#245C3A]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-white font-display tracking-tight drop-shadow-sm">
                KRISHI MITRA
              </span>
              <span className="bg-[#D5A94F] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
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
            className="flex items-center space-x-1.5 bg-[#FFFFFF]/15 hover:bg-[#FFFFFF]/25 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center space-x-1 bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-white/15 transition"
          >
            <span>{language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}</span>
          </Link>
        </div>
      </header>

      {/* ── Main Content: Centered Login Card ────────────────────────── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-[#FFFFFF]/98 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-2xl border border-[#DCE9D5] space-y-6 animate-fadeIn">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#DCE9D5] text-[#245C3A] px-3.5 py-1 rounded-full text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>{language === 'kn' ? 'ರೈತರ ಸುರಕ್ಷಿತ ಲಾಗಿನ್' : 'Secure Farmer Portal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#245C3A] font-display">
              {language === 'kn' ? 'ಕೃಷಿ ಮಿತ್ರ ಲಾಗಿನ್' : 'Farmer Sign In'}
            </h1>
            <p className="text-xs text-[#68756A] max-w-sm mx-auto leading-relaxed">
              {language === 'kn'
                ? 'ನಿಮ್ಮ ಯಾವುದೇ ಇಮೇಲ್ ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ನೇರವಾಗಿ ಲಾಗಿನ್ ಆಗಿ.'
                : 'Sign in directly with ANY email address or mobile number to access your dashboard.'}
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
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email or Mobile */}
            <div>
              <label className="block text-xs font-bold text-[#303B32] uppercase tracking-wider mb-1.5">
                {language === 'kn' ? 'ಯಾವುದೇ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Any Email Address or Mobile'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68756A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={language === 'kn' ? 'ಯಾವುದೇ ಇಮೇಲ್ (ಉದಾ: name@gmail.com ಅಥವಾ ಮೊಬೈಲ್)' : 'Enter any email (e.g. name@gmail.com or mobile)'}
                  className="w-full bg-[#F7F8F0] pl-10 pr-4 py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#8F9C91] focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#303B32] uppercase tracking-wider">
                  {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-[#245C3A] hover:text-[#1B452B] hover:underline cursor-pointer"
                >
                  {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68756A]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F8F0] pl-10 pr-11 py-3 rounded-2xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] placeholder-[#8F9C91] focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68756A] hover:text-[#245C3A] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#245C3A] rounded border-[#DCE9D5] focus:ring-[#245C3A] accent-[#245C3A]"
                />
                <span className="text-xs font-semibold text-[#303B32]">
                  {language === 'kn' ? 'ನನ್ನನ್ನು ನೆನಪಿಡಿ (Remember Me)' : 'Remember Me'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#245C3A] hover:bg-[#1B452B] text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] disabled:opacity-70"
            >
              <span>{loading ? (language === 'kn' ? 'ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...' : 'Signing in...') : (language === 'kn' ? 'ಲಾಗಿನ್ ಆಗಿ' : 'Sign In')}</span>
              <ArrowRight className="w-4 h-4 text-[#D5A94F]" />
            </button>
          </form>

          {/* Quick Demo Logins for Judges & Evaluators */}
          <div className="pt-3 border-t border-[#DCE9D5] space-y-2.5">
            <p className="text-[10px] font-bold uppercase text-[#68756A] text-center tracking-wider">
              ⚡ {language === 'kn' ? 'ತ್ವರಿತ ಪರೀಕ್ಷಾ ಲಾಗಿನ್ (ಡೆಮೊ)' : 'Instant Test Access (1-Click Demo)'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                disabled={loading}
                className="w-full bg-[#DCE9D5] hover:bg-[#C5D8BC] text-[#245C3A] border border-[#C5D8BC] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#245C3A]" />
                <span>{language === 'kn' ? 'ರೈತ ಡೆಮೊ' : 'Demo Farmer'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                className="w-full bg-[#F7F8F0] hover:bg-[#EDF4EA] text-[#B88E3B] border border-[#D5A94F]/40 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D5A94F]" />
                <span>{language === 'kn' ? 'ಅಧಿಕಾರಿ ಡೆಮೊ' : 'Demo Officer'}</span>
              </button>
            </div>
          </div>

          {/* Secure Access Footer note */}
          <div className="pt-2 text-center text-[11px] text-[#303B32]/60">
            <span>
              {language === 'kn'
                ? '🔒 ಕರ್ನಾಟಕ ಕೃಷಿ ಡಿಜಿಟಲ್ ವೇದಿಕೆ · ಸುರಕ್ಷಿತ ರೈತ ಪ್ರವೇಶ'
                : '🔒 Karnataka Digital Agriculture Platform · Secure Farmer Access'}
            </span>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-4 text-center text-xs text-white/80 font-medium">
        <span>© 2026 Krishi Mitra · Karnataka Digital Agriculture Platform · Built for Farmers</span>
      </footer>

      {/* ── Forgot Password Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#303B32]/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE9D5] space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-[#DCE9D5]/60 text-[#245C3A] flex items-center justify-center border border-[#DCE9D5]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#245C3A] font-display">
                      {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ' : 'Reset Password'}
                    </h3>
                    <p className="text-[11px] text-[#303B32]/70">
                      {forgotStep === 'verify'
                        ? (language === 'kn' ? 'ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಅಥವಾ ಇಮೇಲ್ ನಮೂದಿಸಿ' : 'Enter registered mobile or email')
                        : (language === 'kn' ? 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Set your new password')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep('verify');
                    setForgotMessage('');
                  }}
                  className="w-7 h-7 rounded-full bg-[#F7F8F0] hover:bg-[#DCE9D5]/50 text-[#303B32] flex items-center justify-center transition cursor-pointer active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {forgotMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-[#245C3A] text-xs p-3 rounded-xl">
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {forgotStep === 'verify' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                      {language === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / ಇಮೇಲ್' : 'Registered Mobile or Email'}
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. 9845012345 or farmer@mail.com"
                      className="w-full bg-[#F7F8F0] px-3.5 py-2.5 rounded-xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A]"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                        {language === 'kn' ? 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್' : 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#F7F8F0] px-3.5 py-2.5 pr-10 rounded-xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-[#303B32]/60 hover:text-[#245C3A]"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                        {language === 'kn' ? 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : 'Confirm New Password'}
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F7F8F0] px-3.5 py-2.5 rounded-xl border border-[#DCE9D5] text-xs sm:text-sm text-[#303B32] focus:outline-none focus:ring-2 focus:ring-[#245C3A]"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-[#303B32]/70 hover:bg-[#F7F8F0] rounded-xl transition active:scale-95"
                  >
                    {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="bg-[#245C3A] hover:bg-[#1B452B] active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition"
                  >
                    <span>
                      {forgotLoading
                        ? (language === 'kn' ? 'ಪ್ರಕ್ರಿಯೆ...' : 'Processing...')
                        : forgotStep === 'verify'
                        ? (language === 'kn' ? 'ಪರಿಶೀಲಿಸಿ' : 'Verify Account')
                        : (language === 'kn' ? 'ಮರುಹೊಂದಿಸಿ' : 'Reset Password')}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PageTransition>
  );
};
