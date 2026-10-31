import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FileText, Upload, Trash2, CheckCircle2, AlertCircle, 
  Eye, Check, FolderLock, ShieldCheck, Download
} from 'lucide-react';

export const Documents: React.FC = () => {
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [docType, setDocType] = useState('Pahani / RTC');
  const [docTitle, setDocTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeReviewDoc, setActiveReviewDoc] = useState<any>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);
    formData.append('title', docTitle || `${docType} - ${file.name}`);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFile(null);
        setDocTitle('');
        fetchDocuments();
        // Open review modal for farmer confirmation
        setActiveReviewDoc(res.data.document);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmOCR = async (docId: string) => {
    try {
      await api.post(`/documents/${docId}/confirm`, {
        confirmed_data: activeReviewDoc?.extracted_ocr,
      });
      setActiveReviewDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <div className="bg-[#245C3A] text-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D5A94F]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#1B452B] border border-[#D5A94F]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D5A94F] mb-3 shadow-xs">
            <FolderLock className="w-3.5 h-3.5 text-[#D5A94F]" />
            <span>Module 6 · Secure Document & OCR Verification Centre</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {language === 'kn' ? 'ದಾಖಲೆ ಮತ್ತು ಅರ್ಜಿ ಕೇಂದ್ರ' : 'Document & Application Centre'}
          </h1>
          <p className="text-xs sm:text-sm text-[#DCE9D5] mt-2 max-w-2xl leading-relaxed">
            Store Karnataka RTC / Pahani records, Aadhaar, and Bank Passbooks securely. Automatic OCR extraction reads survey numbers and land extent for farmer confirmation before updating your farm profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Col: Upload Form (5 Cols) ─────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs">
            <h2 className="text-xl font-bold text-[#245C3A] font-display mb-4">
              Upload Farm Document
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-[#F7F8F0] p-2.5 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A]"
                >
                  <option value="Pahani / RTC">Karnataka Bhoomi RTC / Pahani</option>
                  <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                  <option value="Bank Passbook">Bank Passbook / NPCI Link Proof</option>
                  <option value="Crop Sowing Certificate">Crop Sowing / Survey Certificate</option>
                  <option value="Caste / Income Certificate">Caste / Income Certificate (RDPR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                  Document Label / Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Sy 142/2A Agumbe Pahani 2026"
                  className="w-full bg-[#F7F8F0] p-2.5 rounded-xl border border-[#DCE9D5] text-sm text-[#303B32] focus:outline-none focus:border-[#245C3A] placeholder:text-[#303B32]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#245C3A] uppercase mb-1.5">
                  Select File (PDF, JPG, PNG)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-[#303B32]/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#DCE9D5]/60 file:text-[#245C3A] hover:file:bg-[#DCE9D5] cursor-pointer"
                />
              </div>

              <div className="p-3 bg-[#DCE9D5]/20 rounded-xl border border-[#DCE9D5] text-[11px] text-[#303B32] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-[#245C3A] shrink-0 mt-0.5" />
                <span>
                  <strong>Legal Notice:</strong> OCR text extraction helps you fill farm records faster but does not establish official government title. Official records are verified via Karnataka Bhoomi / FRUITS databases.
                </span>
              </div>

              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-[#245C3A] hover:bg-[#1B452B] text-white py-3 rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Extracting Text via OCR...' : 'Upload & Extract Document'}</span>
              </button>
            </form>
          </div>

          {/* Scheme Document Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-[#DCE9D5] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#245C3A] uppercase tracking-wider">
              Essential Scheme Document Checklist
            </h3>
            <ul className="space-y-2.5 text-xs text-[#303B32]">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#245C3A] shrink-0" />
                <span>Bhoomi RTC / Pahani with updated owner name</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#245C3A] shrink-0" />
                <span>Aadhaar seeded with active bank account (NPCI)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#245C3A] shrink-0" />
                <span>Karnataka FRUITS Registration (FID)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#245C3A] shrink-0" />
                <span>Samrakshane crop insurance sowing confirmation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Right Col: Document Vault List (7 Cols) ────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE9D5] shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">
                  Document Vault
                </span>
                <h2 className="text-2xl font-bold text-[#245C3A] font-display">
                  Your Uploaded Documents
                </h2>
              </div>
              <span className="text-xs text-[#303B32]/60">
                {documents.length} document(s) stored
              </span>
            </div>

            <div className="space-y-3">
              {(documents.length > 0 ? documents : [
                {
                  id: 'sample_rtc',
                  title: 'Agumbe Land Pahani (Sy. 142/2A)',
                  document_type: 'Pahani / RTC',
                  file_size_kb: 480,
                  is_confirmed_by_farmer: true,
                  uploaded_at: '2026-10-25',
                  extracted_ocr: {
                    document_type: 'Karnataka Bhoomi RTC / Pahani',
                    survey_number: '142/2A',
                    total_extent: '2.50 Acres',
                    water_source: 'Borewell'
                  }
                }
              ]).map((doc: any) => (
                <div
                  key={doc.id || doc._id}
                  className="p-4 rounded-2xl bg-[#F7F8F0] border border-[#DCE9D5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#245C3A] transition"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DCE9D5]/60 text-[#245C3A] flex items-center justify-center shrink-0 border border-[#DCE9D5]">
                      <FileText className="w-5 h-5 text-[#245C3A]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#245C3A]">{doc.title}</h4>
                      <p className="text-xs text-[#303B32]/70">{doc.document_type} · {doc.file_size_kb} KB</p>
                      <div className="mt-1">
                        {doc.is_confirmed_by_farmer ? (
                          <span className="text-[10px] font-bold text-[#245C3A] bg-[#DCE9D5] px-2 py-0.5 rounded-full inline-flex items-center space-x-1 border border-[#DCE9D5]">
                            <CheckCircle2 className="w-3 h-3 text-[#245C3A]" />
                            <span>Farmer Confirmed</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#D5A94F] bg-[#D5A94F]/10 px-2 py-0.5 rounded-full inline-flex items-center space-x-1 border border-[#D5A94F]/30">
                            <AlertCircle className="w-3 h-3 text-[#D5A94F]" />
                            <span>Pending Confirmation</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => setActiveReviewDoc(doc)}
                      className="text-xs font-bold text-[#245C3A] bg-white hover:bg-[#DCE9D5]/30 border border-[#DCE9D5] px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Review OCR
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id || doc._id)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Farmer OCR Confirmation Dialog ───────────────────── */}
      {activeReviewDoc && (
        <div className="fixed inset-0 z-50 bg-[#303B32]/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#DCE9D5] shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#D5A94F] uppercase tracking-wider">
                  OCR Text Extraction
                </span>
                <h3 className="text-xl font-bold text-[#245C3A] font-display">
                  Confirm Extracted Details
                </h3>
              </div>
              <button
                onClick={() => setActiveReviewDoc(null)}
                className="text-[#303B32]/60 hover:text-[#245C3A] text-sm font-bold w-7 h-7 rounded-full bg-[#F7F8F0] flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#303B32]/70">
              Please review the information extracted by Tesseract/PyMuPDF from <strong>{activeReviewDoc.title}</strong> before it updates your official farm profile.
            </p>

            <div className="bg-[#F7F8F0] p-4 rounded-2xl border border-[#DCE9D5] space-y-2 text-xs">
              {Object.entries(activeReviewDoc.extracted_ocr || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-[#DCE9D5]/40 pb-1">
                  <span className="font-bold text-[#245C3A] capitalize">{k.replace(/_/g, ' ')}:</span>
                  <span className="text-[#303B32] text-right font-medium">{String(v)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveReviewDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#303B32]/70 hover:bg-[#F7F8F0] border border-transparent hover:border-[#DCE9D5] transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleConfirmOCR(activeReviewDoc.id || activeReviewDoc._id)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#245C3A] text-white hover:bg-[#1B452B] flex items-center space-x-1.5 transition shadow-xs"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Confirm & Save to Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

