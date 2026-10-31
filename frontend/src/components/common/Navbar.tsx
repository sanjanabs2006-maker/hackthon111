import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sprout, Globe, User, LogOut, Menu, X, Shield, 
  FileText, CloudSun, TrendingUp, BookOpen, Bot, LayoutDashboard, ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const isFarmerPortal = location.pathname.startsWith('/farmer');

  // When inside the Farmer Portal, the secondary navigation bar (sub-nav strip)
  // displays all specialized agricultural modules. The top navbar displays
  // clean primary site navigation so modules are never duplicated.
  const publicNavLinks = [
    { name: t('nav_home'), path: '/' },
    { name: language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us', path: '/about' },
    { name: language === 'kn' ? 'ಕಾರ್ಯವೈಖರಿ' : 'How It Works', path: '/how-it-works' },
    { name: language === 'kn' ? 'ಜ್ಞಾನ ಭಂಡಾರ' : 'Knowledge Hub', path: '/farmer/knowledge' },
    { name: language === 'kn' ? 'ರೈತರ ಸೇವೆಗಳು' : 'Farmer Portal', path: '/farmer/farm' },
  ];

  const farmerPortalTopLinks = [
    { name: t('nav_home'), path: '/' },
    { name: language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us', path: '/about' },
    { name: language === 'kn' ? 'ಕಾರ್ಯವೈಖರಿ' : 'How It Works', path: '/how-it-works' },
  ];

  const navLinks = isFarmerPortal ? farmerPortalTopLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCE9D5] shadow-xs transition-all">
      {/* Top micro-bar with Karnataka badge & Language toggle */}
      <div className="bg-[#245C3A] text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D5A94F] animate-pulse"></span>
            <span className="font-semibold tracking-wide text-white/95">
              {language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಡಿಜಿಟಲ್ ವೇದಿಕೆ · ಅಧಿಕೃತ ಸೇವೆಗಳು' : 'Karnataka Digital Agriculture Portal · Living Fields Platform'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 bg-[#1B452B] hover:bg-[#2D7248] px-2.5 py-0.5 rounded text-xs font-bold text-[#D5A94F] border border-[#D5A94F]/40 shadow-xs transition cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'ಕನ್ನಡ (KN)' : 'English (EN)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#245C3A] flex items-center justify-center shadow-md shadow-[#245C3A]/15 border border-[#DCE9D5] transition-transform group-hover:scale-105">
              <Sprout className="w-7 h-7 text-[#D5A94F]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-[#245C3A] font-display">
                  KRISHI MITRA
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-[#D5A94F] text-white px-1.5 py-0.5 rounded shadow-xs">
                  KA
                </span>
              </div>
              <p className="text-xs text-[#68756A] font-medium font-kannada">
                {language === 'kn' ? 'ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸಂಗಾತಿ' : 'Living Fields · Karnataka'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-[#DCE9D5] text-[#245C3A] font-bold shadow-xs scale-[1.02]'
                      : 'text-[#303B32] hover:bg-[#DCE9D5]/60 hover:text-[#245C3A] hover:-translate-y-0.5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {!isFarmerPortal && (
              <Link
                to="/farmer/assistant"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#EDF4EA] text-[#245C3A] border border-[#DCE9D5] text-sm font-bold hover:bg-[#DCE9D5] hover:-translate-y-0.5 active:scale-95 transition shadow-xs group"
              >
                <Bot className="w-4 h-4 text-[#D5A94F] group-hover:scale-110 transition-transform" />
                <span>{language === 'kn' ? 'ಎಐ ಸಹಾಯಕ' : 'Krishi AI'}</span>
              </Link>
            )}

            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#245C3A] hover:bg-[#1B452B] hover:-translate-y-0.5 active:scale-95 text-white text-xs font-bold transition shadow-sm hover:shadow-md cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#D5A94F]" />
              <span>{user ? user.name : (language === 'kn' ? 'ರೈತರ ಲಾಗಿನ್' : 'Farmer Login')}</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#245C3A] hover:bg-[#DCE9D5]/60"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE9D5] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-[#303B32] hover:bg-[#DCE9D5]/70"
            >
              {item.name}
            </Link>
          ))}
          {!isFarmerPortal && (
            <Link
              to="/farmer/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-bold text-[#245C3A] bg-[#EDF4EA]"
            >
              {language === 'kn' ? 'ಕೃಷಿ ಎಐ ಸಹಾಯಕ' : 'Krishi AI Assistant'}
            </Link>
          )}
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-bold text-white bg-[#245C3A] text-center shadow-xs"
          >
            {user ? user.name : (language === 'kn' ? 'ರೈತರ ಲಾಗಿನ್' : 'Farmer Login')}
          </Link>
        </div>
      )}
    </header>
  );
};

