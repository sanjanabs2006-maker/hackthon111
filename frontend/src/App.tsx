import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { FarmerLayout } from './components/layout/FarmerLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { HowItWorks } from './pages/public/HowItWorks';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Farmer Pages
import { Onboarding } from './pages/farmer/Onboarding';
import { Dashboard } from './pages/farmer/Dashboard';
import { MyFarm } from './pages/farmer/MyFarm';
import { Schemes } from './pages/farmer/Schemes';
import { SchemeDetail } from './pages/farmer/SchemeDetail';
import { EligibilityAssessment } from './pages/farmer/EligibilityAssessment';
import { SchemeCompare } from './pages/farmer/SchemeCompare';
import { CropHealth } from './pages/farmer/CropHealth';
import { WeatherAdvisory } from './pages/farmer/WeatherAdvisory';
import { MarketIntelligence } from './pages/farmer/MarketIntelligence';
import { Documents } from './pages/farmer/Documents';
import { KnowledgeHub } from './pages/farmer/KnowledgeHub';
import { Assistant } from './pages/farmer/Assistant';
import { Profile } from './pages/farmer/Profile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRules } from './pages/admin/AdminRules';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes with standard Header & Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/schemes/public" element={<Schemes />} />
                <Route path="/knowledge" element={<KnowledgeHub />} />
                <Route path="/onboarding" element={<Navigate to="/farmer/farm" replace />} />
              </Route>

              {/* Dedicated Authentication Page - Clean and separate from dashboard */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />

              {/* Farmer Routes with persistent sub-nav & Farm DNA ribbon */}
              <Route path="/farmer" element={<FarmerLayout />}>
                <Route index element={<Navigate to="/farmer/farm" replace />} />
                <Route path="home" element={<Navigate to="/farmer/farm" replace />} />
                <Route path="farm" element={<MyFarm />} />
                <Route path="schemes" element={<Schemes />} />
                <Route path="schemes/:id" element={<SchemeDetail />} />
                <Route path="eligibility/:id" element={<EligibilityAssessment />} />
                <Route path="compare" element={<SchemeCompare />} />
                <Route path="crop-health" element={<CropHealth />} />
                <Route path="weather" element={<WeatherAdvisory />} />
                <Route path="market" element={<MarketIntelligence />} />
                <Route path="documents" element={<Navigate to="/farmer/farm" replace />} />
                <Route path="knowledge" element={<KnowledgeHub />} />
                <Route path="knowledge/:id" element={<KnowledgeHub />} />
                <Route path="assistant" element={<Assistant />} />
                <Route path="saved" element={<Schemes />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<PublicLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="schemes" element={<AdminDashboard />} />
                <Route path="rules" element={<AdminRules />} />
                <Route path="audit" element={<AdminDashboard />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
