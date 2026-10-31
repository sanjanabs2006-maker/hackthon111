import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldCheck, CheckCircle2, XCircle, HelpCircle, 
  AlertTriangle, ArrowLeft, ExternalLink, RefreshCw, FileText
} from 'lucide-react';

export const EligibilityAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const runEvaluation = async () => {
    if (!id) return;
    setEvaluating(true);
    try {
      const res = await api.post('/eligibility/evaluate', { scheme_id: id });
      if (res.data.success) {
        setAssessment(res.data.assessment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'POTENTIALLY_APPLICABLE':
        return (
          <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-full text-xs font-black">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>POTENTIALLY APPLICABLE</span>
          </div>
        );
      case 'NOT_APPLICABLE':
        return (
          <div className="inline-flex items-center space-x-1.5 bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1.5 rounded-full text-xs font-black">
            <XCircle className="w-4 h-4 text-rose-700" />
            <span>NOT APPLICABLE</span>
          </div>
        );
      case 'NEEDS_INFORMATION':
        return (
          <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-black">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            <span>NEEDS INFORMATION</span>
          </div>
        );
      case 'SOURCE_UNVERIFIED':
        return (
          <div className="inline-flex items-center space-x-1.5 bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1.5 rounded-full text-xs font-black">
            <AlertTriangle className="w-4 h-4 text-gray-600" />
            <span>SOURCE UNVERIFIED</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center space-x-1.5 bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1.5 rounded-full text-xs font-black">
            <HelpCircle className="w-4 h-4 text-blue-700" />
            <span>NEEDS HUMAN REVIEW</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#759B62] animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#388E3C]">
          Running deterministic rule-based evaluation against farm profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* ── Back & Action Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          to="/farmer/schemes"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#245C3A] hover:text-[#1B452B] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scheme Explorer</span>
        </Link>

        <button
          onClick={runEvaluation}
          disabled={evaluating}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#1B452B] bg-[#D5A94F] px-4 py-2 rounded-xl hover:bg-[#c2963e] transition cursor-pointer shadow-xs disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
          <span>Recalculate Eligibility</span>
        </button>
      </div>

      {/* ── Executive Result Banner ─────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#D5A94F] font-bold">
              Automated Rule-Based Evaluation
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
              {assessment?.scheme_name || 'Scheme Evaluation Report'}
            </h1>
            <p className="text-xs text-[#DCE9D5] mt-1">
              Evaluated strictly via deterministic Python Rule Engine v2.1 against official Gazette notifications.
            </p>
          </div>

          <div>{getStatusBadge(assessment?.status)}</div>
        </div>

        {/* Summary note */}
        <div className="mt-6 p-4 rounded-2xl bg-[#1B452B] border border-[#DCE9D5]/20 text-xs sm:text-sm text-[#DCE9D5] leading-relaxed relative z-10">
          <p className="font-semibold text-[#D5A94F] mb-1">Evaluation Summary:</p>
          <p>{assessment?.summary}</p>
        </div>
      </div>

      {/* ── Condition-by-Condition Audit Trace ──────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D5A94F]">
            Detailed Audit Breakdown
          </span>
          <h2 className="text-2xl font-bold text-[#245C3A] font-display">
            Condition-by-Condition Evaluation
          </h2>
          <p className="text-xs text-[#303B32]/70 mt-1">
            Transparent audit of each mandatory condition, farmer profile information evaluated, pass/fail status, and official gazette citations.
          </p>
        </div>

        <div className="space-y-4">
          {assessment?.breakdown?.map((cond: any) => {
            const isPass = cond.status === 'PASS';
            const isFail = cond.status === 'FAIL';
            return (
              <div
                key={cond.condition_id}
                className={`p-5 rounded-2xl border transition ${
                  isPass
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : isFail
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    {isPass && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {isFail && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    {!isPass && !isFail && <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />}
                    <h3 className="text-base font-bold text-[#245C3A]">{cond.title}</h3>
                  </div>

                  <span
                    className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800'
                        : isFail
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cond.status}
                  </span>
                </div>

                <p className="text-xs text-[#303B32]/70 mb-3">{cond.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F7F8F0] p-3.5 rounded-xl border border-[#DCE9D5]">
                  <div>
                    <span className="text-[#303B32]/60 block text-[10px] uppercase font-bold">
                      Farmer Information Evaluated:
                    </span>
                    <span className="font-semibold text-[#245C3A]">
                      {cond.farmer_value || 'Information not provided on profile'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#303B32]/60 block text-[10px] uppercase font-bold">
                      Rule Determination:
                    </span>
                    <span className="text-[#303B32]">{cond.explanation}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#DCE9D5]/40 flex flex-wrap justify-between items-center text-[11px] text-[#303B32]/70">
                  <span>Official Citation: <strong className="text-[#245C3A]">{cond.source}</strong></span>
                  <span>Verified: {cond.verification_date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Application Link */}
        {assessment?.official_portal && (
          <div className="pt-4 border-t border-[#DCE9D5]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-[#303B32]/70">
              Ready to submit your application on the official government portal?
            </span>
            <a
              href={assessment.official_portal}
              target="_blank"
              rel="noreferrer"
              className="bg-[#245C3A] hover:bg-[#1B452B] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
            >
              <span>Open Official Government Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

