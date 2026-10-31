import React, { useState } from 'react';
import { api } from '../../services/api';
import { Terminal, Play, CheckCircle2, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminRules: React.FC = () => {
  const [profileJson, setProfileJson] = useState(
    JSON.stringify(
      {
        state: 'Karnataka',
        district: 'Shivamogga',
        land_records: [
          { area: 3.5, unit: 'Acre', ownership_type: 'Owned', irrigation_type: 'Borewell' },
        ],
        crops: [{ name: 'Arecanut' }, { name: 'Paddy' }],
      },
      null,
      2
    )
  );

  const [schemeJson, setSchemeJson] = useState(
    JSON.stringify(
      {
        source_verified: true,
        official_source: 'GoK Krishi Bhagya Directive No. 42',
        rules: {
          version: '1.5',
          conditions: [
            {
              id: 'c1',
              type: 'STATE_OR_DISTRICT',
              title: 'Notified Karnataka Rainfed District',
              allowed_states: ['karnataka'],
              allowed_districts: ['shivamogga', 'davanagere', 'tumakuru'],
            },
            {
              id: 'c2',
              type: 'MAX_LAND_HOLDING',
              title: 'Small & Marginal Ceiling (<= 5.0 Acres)',
              max_acres: 5.0,
            },
            {
              id: 'c3',
              type: 'IRRIGATION_TYPE',
              title: 'Irrigation Source Check',
              allowed_irrigation: ['borewell', 'well', 'pond'],
            },
          ],
        },
      },
      null,
      2
    )
  );

  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleRunTest = async () => {
    setError('');
    setTesting(true);
    try {
      const parsedProfile = JSON.parse(profileJson);
      const parsedScheme = JSON.parse(schemeJson);

      const res = await api.post('/admin/rules/test', {
        sample_profile: parsedProfile,
        scheme: parsedScheme,
      });

      if (res.data.success) {
        setTestResult(res.data.test_result);
      }
    } catch (err: any) {
      setError(err.message || 'JSON Parse or Execution Error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#245C3A] hover:text-[#1B452B] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Overview</span>
      </Link>

      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-2 shadow-xs">
            <Terminal className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>Deterministic Rule Engine Test Suite</span>
          </div>
          <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">
            Rule-Based Eligibility Playground
          </h1>
          <p className="text-xs text-[#DCE9D5] mt-1 max-w-2xl leading-relaxed">
            Test and verify logic matrices without LLM nondeterminism. Simulates pass, fail, and missing info conditions.
          </p>
        </div>

        <button
          onClick={handleRunTest}
          disabled={testing}
          className="bg-[#D5A94F] hover:bg-[#c2963e] text-[#1B452B] px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition flex items-center space-x-2 cursor-pointer shadow-xs relative z-10 shrink-0"
        >
          <Play className="w-4 h-4 fill-current text-[#1B452B]" />
          <span>{testing ? 'Evaluating...' : 'Execute Test Run'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-mono">
          {error}
        </div>
      )}

      {/* ── JSON Editors ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-xs space-y-2">
          <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1">
            Test Farmer Profile Input (JSON)
          </label>
          <textarea
            rows={14}
            value={profileJson}
            onChange={(e) => setProfileJson(e.target.value)}
            className="w-full font-mono text-xs p-4 rounded-2xl bg-[#1B452B] text-emerald-300 border border-[#DCE9D5]/30 focus:outline-none"
          />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-xs space-y-2">
          <label className="block text-xs font-bold text-[#245C3A] uppercase tracking-wider mb-1">
            Scheme Conditions Matrix (JSON)
          </label>
          <textarea
            rows={14}
            value={schemeJson}
            onChange={(e) => setSchemeJson(e.target.value)}
            className="w-full font-mono text-xs p-4 rounded-2xl bg-[#1B452B] text-[#D5A94F] border border-[#DCE9D5]/30 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Output Breakdown ─────────────────────────────────────────── */}
      {testResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-[#DCE9D5]/40 pb-3">
            <h2 className="text-xl font-bold text-[#245C3A] font-display">
              Rule Execution Output
            </h2>
            <span className="text-xs font-black uppercase bg-[#245C3A] text-white px-3 py-1 rounded-full shadow-xs">
              Status: {testResult.status}
            </span>
          </div>

          <p className="text-xs text-[#303B32]/70">{testResult.summary}</p>

          <div className="space-y-3 pt-2">
            {testResult.breakdown?.map((b: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F7F8F0] border border-[#DCE9D5] flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-[#245C3A] block">{b.title}</span>
                  <span className="text-[11px] text-[#303B32]/70">{b.explanation}</span>
                </div>
                <span
                  className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                    b.status === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

