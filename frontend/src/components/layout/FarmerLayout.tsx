import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { pageVariants } from '../common/PageTransition';
import { 
  Compass, Sprout, ShieldCheck, Camera, CloudRain, 
  BarChart3, FolderLock, Sparkles, BookOpen, UserCheck, LogOut
} from 'lucide-react';

export const FarmerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const farmerNav = [
    { name: language === 'kn' ? 'ನನ್ನ ಜಮೀನು' : 'My Farm (DNA)', path: '/farmer/farm', icon: Sprout },
    { name: language === 'kn' ? 'ಯೋಜನೆಗಳು' : 'Govt Schemes', path: '/farmer/schemes', icon: ShieldCheck },
    { name: language === 'kn' ? 'ಬೆಳೆ ಆರೋಗ್ಯ' : 'Crop Health', path: '/farmer/crop-health', icon: Camera },
    { name: language === 'kn' ? 'ಹವಾಮಾನ' : 'Weather', path: '/farmer/weather', icon: CloudRain },
    { name: language === 'kn' ? 'ಮಾರುಕಟ್ಟೆ' : 'Market Mandi', path: '/farmer/market', icon: BarChart3 },
    { name: language === 'kn' ? 'ಜ್ಞಾನ ಭಂಡಾರ' : 'Knowledge', path: '/farmer/knowledge', icon: BookOpen },
    { name: language === 'kn' ? 'ಎಐ ಸಹಾಯಕ' : 'Krishi AI', path: '/farmer/assistant', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F0] text-[#303B32]">
      <Navbar />

      {/* Premium Light Sub-Nav Strip */}
      <div className="bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DCE9D5] sticky top-[73px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {farmerNav.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                      active
                        ? 'bg-[#245C3A] text-white shadow-sm ring-1 ring-[#245C3A]/20 scale-[1.02]'
                        : 'text-[#303B32] hover:bg-[#DCE9D5]/70 hover:text-[#245C3A] hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 ${active ? 'text-[#D5A94F] scale-110' : 'text-[#68756A]'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Farm DNA Badge status */}
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-[#DCE9D5] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#D5A94F] animate-pulse"></span>
              <span className="text-[#245C3A] font-bold">
                {language === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ಜಾಲ (31 ಜಿಲ್ಲೆಗಳು) ಸಕ್ರಿಯ' : 'All Karnataka (31 Districts) Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            custom={Boolean(shouldReduceMotion)}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full will-change-[transform,opacity]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};


