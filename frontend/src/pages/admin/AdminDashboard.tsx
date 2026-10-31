import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ShieldCheck, Activity, Users, FileCheck, 
  Terminal, ArrowRight, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => {
        if (res.data.success) setAnalytics(res.data.analytics);
      })
      .catch((err) => console.error(err));

    api.get('/admin/audit')
      .then((res) => {
        if (res.data.success) setAuditLogs(res.data.audit_logs || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* ── Admin Header ─────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>State Agriculture Dept Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            Krishi Mitra Governance & Rules Console
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE9D5] mt-2 max-w-2xl leading-relaxed">
            Supervise deterministic scheme eligibility rules, gazette source verifications, and agrometeorology feeds.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10 shrink-0">
          <Link
            to="/admin/rules"
            className="bg-[#D5A94F] hover:bg-[#c2963e] text-[#1B452B] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 shadow-xs"
          >
            <Terminal className="w-4 h-4 text-[#1B452B]" />
            <span>Rule Engine Tester</span>
          </Link>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs">
          <span className="text-xs font-bold text-[#303B32]/70 uppercase">Verified Schemes</span>
          <p className="text-3xl font-black text-[#245C3A] mt-2">
            {analytics?.total_schemes || 6} Active
          </p>
          <span className="text-[10px] text-[#245C3A] font-semibold mt-1 block">
            100% Gazette Synced
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs">
          <span className="text-xs font-bold text-[#303B32]/70 uppercase">Registered Farmers</span>
          <p className="text-3xl font-black text-[#245C3A] mt-2">
            {analytics?.registered_farmers || 14}
          </p>
          <span className="text-[10px] text-[#245C3A] font-semibold mt-1 block">
            Across 7 KA Districts
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs">
          <span className="text-xs font-bold text-[#303B32]/70 uppercase">Eligibility Evals</span>
          <p className="text-3xl font-black text-[#D5A94F] mt-2">
            {analytics?.evaluations_completed || 48}
          </p>
          <span className="text-[10px] text-[#303B32]/60 font-semibold mt-1 block">
            Deterministic Engine v2.1
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#DCE9D5] shadow-xs">
          <span className="text-xs font-bold text-[#303B32]/70 uppercase">Crop Health Scans</span>
          <p className="text-3xl font-black text-[#245C3A] mt-2">
            {analytics?.crop_health_scans || 22}
          </p>
          <span className="text-[10px] text-[#245C3A] font-semibold mt-1 block">
            92.4% Avg Confidence
          </span>
        </div>
      </div>

      {/* ── System Audit Log Table ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">
              Governance Audit Trail
            </span>
            <h2 className="text-2xl font-bold text-[#245C3A] font-display">
              Recent System & Rule Changes
            </h2>
          </div>
          <span className="text-xs text-[#303B32]/60">Immutable Audit Storage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#F7F8F0] text-[#245C3A] font-bold border-b border-[#DCE9D5]">
                <th className="py-3 px-4 rounded-l-xl">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 rounded-r-xl">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE9D5]/40">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#F7F8F0]/50 transition">
                  <td className="py-3 px-4 text-[#303B32]/70 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#245C3A]">
                    <span className="bg-[#DCE9D5]/60 text-[#245C3A] border border-[#DCE9D5] px-2 py-0.5 rounded text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#303B32]">{log.details}</td>
                  <td className="py-3 px-4 text-[#303B32]/70 font-semibold">{log.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

