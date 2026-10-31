import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemVariants } from '../../components/common/MotionComponents';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  BookOpen, Search, Clock, ArrowRight, Award,
  CheckCircle2, FlaskConical, Languages, ListOrdered, Tag, X
} from 'lucide-react';

const CATEGORY_MAP: Record<string, { en: string; kn: string }> = {
  All: { en: 'All Categories', kn: 'ಎಲ್ಲಾ ವಿಷಯಗಳು' },
  'Crop cultivation': { en: 'Crop Cultivation', kn: 'ಬೆಳೆ ಬೇಸಾಯ' },
  'Soil management': { en: 'Soil Management', kn: 'ಮಣ್ಣು ನಿರ್ವಹಣೆ' },
  'Irrigation': { en: 'Irrigation & Water', kn: 'ನೀರಾವರಿ & ಜಲ' },
  'Fertilizer management': { en: 'Fertilizers & Nutrients', kn: 'ರಸಗೊಬ್ಬರ & ಪೋಷಕಾಂಶ' },
  'Pest management': { en: 'Pest Management', kn: 'ಕೀಟ ನಿರ್ವಹಣೆ' },
  'Disease management': { en: 'Disease Management', kn: 'ರೋಗ ನಿರ್ವಹಣೆ' },
  'Horticulture': { en: 'Horticulture & Spices', kn: 'ತೋಟಗಾರಿಕೆ & ಸಾಂಬಾರ' },
  'Organic farming': { en: 'Organic & Natural Farming', kn: 'ಸಾವಯವ & ನೈಸರ್ಗಿಕ ಕೃಷಿ' },
  'Dairy and livestock': { en: 'Dairy & Livestock', kn: 'ಹೈನುಗಾರಿಕೆ & ಮೇವು' },
  'Agricultural technology': { en: 'Agri-Tech & Drones', kn: 'ಕೃಷಿ ತಂತ್ರಜ್ಞಾನ & ಡ್ರೋನ್' },
};

export const KnowledgeHub: React.FC = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [readerLang, setReaderLang] = useState<'kn' | 'en'>(language === 'kn' ? 'kn' : 'en');
  const [loading, setLoading] = useState(true);

  // Sync modal reader language whenever global language changes or when an article opens
  useEffect(() => {
    setReaderLang(language === 'kn' ? 'kn' : 'en');
  }, [language, activeArticle]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        api.get('/knowledge/articles', {
          params: { category: selectedCategory, search: searchQuery },
        }),
        api.get('/knowledge/categories'),
      ]);
      if (artRes.data.success) setArticles(artRes.data.articles || []);
      if (catRes.data.success) setCategories(['All', ...(catRes.data.categories || [])]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const getCategoryLabel = (cat: string) => {
    if (CATEGORY_MAP[cat]) {
      return language === 'kn' ? CATEGORY_MAP[cat].kn : CATEGORY_MAP[cat].en;
    }
    return cat;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-3 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>{language === 'kn' ? 'ಕೃಷಿ ಜ್ಞಾನ ಭಂಡಾರ' : 'Agricultural Science & Field Guides'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {language === 'kn' ? 'ಕೃಷಿ ಜ್ಞಾನ ಭಂಡಾರ ಮತ್ತು ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ' : 'Krishi Knowledge Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE9D5] mt-2 max-w-2xl leading-relaxed">
            {language === 'kn'
              ? 'ಶಿವಮೊಗ್ಗ ಕೆ.ವಿ.ಕೆ, ಬೆಂಗಳೂರು, ಧಾರವಾಡ ಕೃಷಿ ವಿವಿಗಳು ಮತ್ತು ಐಸಿಎಆರ್ ಶಿಫಾರಸು ಮಾಡಿದ ವೈಜ್ಞಾನಿಕ ಬೇಸಾಯ, ಮಣ್ಣು ನಿರ್ವಹಣೆ, ರೋಗ-ಕೀಟ ನಿಯಂತ್ರಣ ಮತ್ತು ತೋಟಗಾರಿಕೆ ಕೈಪಿಡಿಗಳು.'
              : 'Peer-reviewed agricultural manuals developed according to UAHS Shivamogga, UAS Bangalore, UAS Dharwad, and ICAR standards. Comprehensive bilingual guides for every crop stage.'}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 max-w-xl">
            <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-sm border border-[#DCE9D5] focus-within:border-[#245C3A] transition">
              <Search className="w-4 h-4 text-[#303B32]/60 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'kn'
                    ? 'ಕೊಳೆ ರೋಗ, ಹನಿ ನೀರಾವರಿ, ಮಣ್ಣು ಪರೀಕ್ಷೆ, ಮೆಕ್ಕೆಜೋಳ, ರಾಗಿ ಹುಡುಕಿ...'
                    : 'Search guides on soil management, arecanut, pest control, drip...'
                }
                className="w-full bg-transparent border-none text-[#303B32] text-xs sm:text-sm focus:outline-none placeholder:text-[#303B32]/40"
              />
              <button
                type="submit"
                className="bg-[#245C3A] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#1B452B] transition cursor-pointer shadow-xs"
              >
                {language === 'kn' ? 'ಹುಡುಕಿ' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Categories Scroll Bar ───────────────────────────────────── */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === c
                ? 'bg-[#245C3A] text-white shadow-sm'
                : 'bg-white border border-[#DCE9D5] text-[#303B32] hover:bg-[#DCE9D5]/30 hover:border-[#245C3A]'
            }`}
          >
            {getCategoryLabel(c)}
          </button>
        ))}
      </div>

      {/* ── Loading state ───────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-12 text-[#303B32]/70 text-sm font-medium">
          {language === 'kn' ? 'ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading agricultural guides...'}
        </div>
      )}

      {/* ── Articles Grid ───────────────────────────────────────────── */}
      {!loading && (
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {articles.map((art) => {
            const title = language === 'kn' && art.title_kn ? art.title_kn : art.title_en;
            const summary = language === 'kn' && art.summary_kn ? art.summary_kn : art.summary_en;

            return (
              <motion.div
                key={art.id || art._id}
                variants={staggerItemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#245C3A] transition group will-change-[transform,opacity]"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase bg-[#DCE9D5]/60 text-[#245C3A] px-2.5 py-1 rounded-full border border-[#DCE9D5]">
                      {getCategoryLabel(art.category)}
                    </span>
                    <span className="text-[10px] text-[#303B32]/60 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#245C3A]" />
                      <span>{art.reading_time_mins} min read</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#245C3A] font-display leading-snug group-hover:text-[#1B452B] transition">
                    {title}
                  </h3>

                  <p className="text-xs text-[#303B32]/70 mt-2 line-clamp-3 leading-relaxed">
                    {summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#DCE9D5]/40 flex items-center space-x-2 text-[11px] text-[#D5A94F] font-medium">
                    <Award className="w-3.5 h-3.5 shrink-0 text-[#D5A94F]" />
                    <span className="truncate">{art.author}</span>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#DCE9D5]/40 flex items-center justify-between">
                  <span className="text-[10px] text-[#303B32]/60">{art.published_date}</span>
                  <button
                    onClick={() => setActiveArticle(art)}
                    className="bg-[#245C3A] hover:bg-[#1B452B] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{language === 'kn' ? 'ಓದಿ' : 'Read Guide'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {articles.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#DCE9D5] text-[#303B32]/70 shadow-xs">
              <BookOpen className="w-10 h-10 text-[#245C3A]/60 mx-auto mb-3" />
              <p className="text-sm font-semibold">
                {language === 'kn' ? 'ಯಾವುದೇ ಮಾರ್ಗದರ್ಶಿ ಕಂಡುಬಂದಿಲ್ಲ.' : 'No guides found for the selected filter.'}
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-[#245C3A] text-white text-xs font-bold rounded-xl hover:bg-[#1B452B] transition"
              >
                {language === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' : 'View All Guides'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Modal: Article Detail ───────────────────────────────────── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-[#303B32]/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-[#DCE9D5] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Header: Category & Language Switcher & Close */}
            <div className="flex items-center justify-between border-b border-[#DCE9D5]/60 pb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase text-[#245C3A] bg-[#DCE9D5]/60 border border-[#DCE9D5] px-3 py-1 rounded-full">
                  {getCategoryLabel(activeArticle.category)}
                </span>
                <span className="text-xs text-[#303B32]/60 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#245C3A]" />
                  <span>{activeArticle.reading_time_mins} min</span>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Modal In-Place Language Toggle */}
                <div className="inline-flex items-center bg-[#F7F8F0] border border-[#DCE9D5] rounded-xl p-0.5 text-xs font-semibold">
                  <Languages className="w-3.5 h-3.5 text-[#245C3A] ml-2 mr-1" />
                  <button
                    onClick={() => setReaderLang('kn')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      readerLang === 'kn'
                        ? 'bg-[#245C3A] text-white shadow-xs'
                        : 'text-[#303B32] hover:text-[#245C3A]'
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                  <button
                    onClick={() => setReaderLang('en')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      readerLang === 'en'
                        ? 'bg-[#245C3A] text-white shadow-xs'
                        : 'text-[#303B32] hover:text-[#245C3A]'
                    }`}
                  >
                    English
                  </button>
                </div>

                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-full bg-[#F7F8F0] hover:bg-[#DCE9D5] flex items-center justify-center text-[#303B32] transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Author */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#245C3A] font-display leading-tight">
                {readerLang === 'kn' && activeArticle.title_kn ? activeArticle.title_kn : activeArticle.title_en}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#303B32]/70 mt-3">
                <span className="inline-flex items-center space-x-1 text-[#D5A94F] font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  <span>{activeArticle.author}</span>
                </span>
                <span>·</span>
                <span>Published: {activeArticle.published_date}</span>
              </div>
            </div>

            {/* Summary Callout */}
            <div className="bg-[#DCE9D5]/20 border-l-4 border-[#245C3A] rounded-r-2xl p-4 text-xs sm:text-sm text-[#303B32] leading-relaxed">
              <span className="font-bold text-[#245C3A] block mb-1">
                {readerLang === 'kn' ? 'ಮುಖ್ಯ ಸಾರಾಂಶ' : 'Key Summary'}
              </span>
              {readerLang === 'kn' && activeArticle.summary_kn ? activeArticle.summary_kn : activeArticle.summary_en}
            </div>

            {/* Main Content */}
            <div className="text-xs sm:text-sm text-[#303B32] leading-relaxed space-y-3 whitespace-pre-line">
              {readerLang === 'kn' && activeArticle.content_kn ? activeArticle.content_kn : activeArticle.content_en}
            </div>

            {/* Step-by-Step Instructions */}
            {((readerLang === 'kn' && activeArticle.steps_kn) || activeArticle.steps_en) && (
              <div className="bg-[#F7F8F0] border border-[#DCE9D5] rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-[#245C3A] font-bold text-sm">
                  <ListOrdered className="w-4 h-4" />
                  <span>{readerLang === 'kn' ? 'ಹಂತ-ಹಂತದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ' : 'Step-by-Step Field Instructions'}</span>
                </div>
                <div className="space-y-2.5">
                  {(readerLang === 'kn' && activeArticle.steps_kn ? activeArticle.steps_kn : activeArticle.steps_en || []).map(
                    (step: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-[#303B32]">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-[#DCE9D5] text-[#245C3A] font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <p className="pt-0.5 leading-relaxed">{step}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Dosages & Formulations */}
            {((readerLang === 'kn' && activeArticle.dosages_kn) || activeArticle.dosages_en) && (
              <div className="bg-[#DCE9D5]/30 border border-[#DCE9D5] rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-[#245C3A] font-bold text-sm">
                  <FlaskConical className="w-4 h-4" />
                  <span>{readerLang === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣ ಮತ್ತು ರಸಗೊಬ್ಬರ' : 'Recommended Dosages & Formulations'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(readerLang === 'kn' && activeArticle.dosages_kn ? activeArticle.dosages_kn : activeArticle.dosages_en || []).map(
                    (dose: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#DCE9D5] rounded-xl p-3 text-xs text-[#303B32] flex items-start space-x-2 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#245C3A] shrink-0 mt-0.5" />
                        <span className="leading-snug">{dose}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {activeArticle.tags && activeArticle.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Tag className="w-3.5 h-3.5 text-[#303B32]/60 mr-1" />
                {activeArticle.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-[#DCE9D5]/40 text-[#245C3A] text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-[#DCE9D5]/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-[#DCE9D5]/60 flex items-center justify-between">
              <span className="text-[11px] text-[#303B32]/60">
                Krishi Mitra · {getCategoryLabel(activeArticle.category)}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="bg-[#245C3A] hover:bg-[#1B452B] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {readerLang === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close Guide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
