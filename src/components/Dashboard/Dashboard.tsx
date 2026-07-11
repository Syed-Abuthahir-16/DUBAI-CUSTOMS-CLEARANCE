import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Clock, Trash2, ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { Card, Badge } from '../ui';
import type { Declaration } from '../../lib/supabase';
import { db } from '../../lib/supabase';

interface DashboardProps {
  declarations: Declaration[];
  onUpload: (fileName: string, fileBase64: string, localPdfUrl?: string) => Promise<void>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isProcessing: boolean;
  userEmail?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  declarations,
  onUpload,
  onSelect,
  onDelete,
  isProcessing,
  userEmail
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions/Feedback States
  const [suggestion, setSuggestion] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      await db.submitSuggestion(userEmail || 'anonymous', suggestion);
      setFeedbackSuccess(true);
      setSuggestion('');
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to submit suggestion:', err);
      setFeedbackError('Could not submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setErrorMessage(null);
    if (e.dataTransfer.files?.[0]) await processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files?.[0]) await processFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF document (Commercial Invoice, Packing List, or B/L).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File exceeds the 5MB size limit.');
      return;
    }
    const localPdfUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        await onUpload(file.name, base64Data, localPdfUrl);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to process file.');
      }
    };
  };

  // Stats
  const totalCount = declarations.length;
  const warningCount = declarations.filter(d => d.warnings && d.warnings.length > 0).length;
  const processedToday = declarations.filter(d => {
    const today = new Date().toISOString().split('T')[0];
    return d.created_at.startsWith(today);
  }).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4 md:gap-5 animate-in-up">

      {/* ── KPI Stats Panel ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        {/* Stat 1 — Total Declarations */}
        <div className="p-4 md:p-5 border-b sm:border-b-0 sm:border-r border-[#E5E7EB] flex flex-col justify-between relative overflow-hidden">
          {/* Gold left accent bar */}
          <div className="absolute left-0 top-4 md:top-5 bottom-4 md:bottom-5 w-[3px] bg-[#C9A84C] rounded-r-full" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] pl-4">Total Declarations</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <div className="flex items-baseline gap-2 mt-3 pl-4">
            <span className="text-4xl font-bold text-[#0A0A0A]">{totalCount}</span>
            <span className="text-xs text-green-600 font-semibold">+{processedToday} today</span>
          </div>
        </div>

        {/* Stat 2 — Average Speed */}
        <div className="p-4 md:p-5 border-b sm:border-b-0 sm:border-r border-[#E5E7EB] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Average Speed</span>
            <Zap className="w-3.5 h-3.5 text-[#0C2461]" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-bold text-[#0A0A0A]">2.8s</span>
          </div>
        </div>

        {/* Stat 3 — Audit Warnings */}
        <div className="p-4 md:p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Audit Warnings Flagged</span>
            <Shield className="w-3.5 h-3.5 text-[#0A0A0A]" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className={`text-4xl font-bold ${warningCount > 0 ? 'text-amber-600' : 'text-[#0A0A0A]'}`}>
              {warningCount}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

        {/* Upload Zone */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <Card title="New Extraction" subtitle="Drag & drop invoice or Packing List">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[195px] ${
                isDragActive
                  ? 'border-[#C9A84C] bg-[#F0E2B6]/20'
                  : 'border-[#E5E7EB] hover:border-[#0C2461] hover:bg-[#0C2461]/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0C2461]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#0C2461] animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0A0A0A]">Extracting Fields…</h4>
                    <p className="text-xs text-[#6B7280] mt-1 max-w-[200px]">Converting invoice to Mirsal 2 structured schema</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#0C2461]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#0A0A0A]">Upload Document</h4>
                    <p className="text-xs text-[#6B7280] mt-1">PDF up to 5MB</p>
                  </div>
                  {/* Gold accent */}
                  <div className="w-8 h-[2px] bg-[#C9A84C] rounded-full mt-1" />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </Card>
        </div>

        {/* History Table */}
        <div className="md:col-span-2">
          <Card title="Declaration History" subtitle="Click to view and edit draft declarations">
            {declarations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-[#6B7280]">
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#9CA3AF]" />
                </div>
                <h4 className="text-sm font-semibold text-[#0A0A0A]">No declarations yet</h4>
                <p className="text-xs max-w-[280px] mt-1 text-[#6B7280]">
                  Upload your first invoice PDF to start drafting customs entries.
                </p>
                {/* Gold rule */}
                <div className="w-12 h-[2px] bg-[#C9A84C] rounded-full mt-4 opacity-60" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Document Name</th>
                      <th className="py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Importer</th>
                      <th className="py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">CIF Value</th>
                      <th className="py-3 text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Status</th>
                      <th className="py-3 text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map((dec) => {
                      const hasWarnings = dec.warnings && dec.warnings.length > 0;
                      return (
                        <tr
                          key={dec.id}
                          onClick={() => onSelect(dec.id)}
                          className="border-b border-[#F3F4F6] hover:bg-[#F7F7F7] cursor-pointer transition-all group sh-row"
                        >
                          <td className="py-4 pr-3 max-w-[200px]">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#0C2461] shrink-0" />
                              <span className="text-sm font-medium text-[#0A0A0A] truncate">{dec.file_name}</span>
                            </div>
                            <span className="text-[10px] text-[#9CA3AF] block mt-0.5 pl-6">
                              {new Date(dec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-[#0A0A0A]">
                            {dec.extracted_header.consignee_name ? (
                              <span className="truncate block max-w-[150px]">{dec.extracted_header.consignee_name}</span>
                            ) : (
                              <span className="text-[#9CA3AF] italic">Unknown</span>
                            )}
                          </td>
                          <td className="py-4 text-sm font-mono text-[#0A0A0A]">
                            {dec.extracted_header.total_invoice_value ? (
                              <span>
                                {dec.extracted_header.invoice_currency || 'USD'}{' '}
                                {dec.extracted_header.total_invoice_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-[#9CA3AF]">—</span>
                            )}
                          </td>
                          <td className="py-4">
                            {dec.status === 'processing' ? (
                              <Badge variant="violet">Extracting</Badge>
                            ) : hasWarnings ? (
                              <Badge variant="warning">Warnings</Badge>
                            ) : (
                              <Badge variant="navy">Ready</Badge>
                            )}
                          </td>
                          <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onSelect(dec.id)}
                                className="p-1.5 rounded hover:bg-[#0C2461]/10 text-[#9CA3AF] hover:text-[#0C2461] transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDelete(dec.id)}
                                className="p-1.5 rounded hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── "Why we did this?" and Feedback Form Section ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-[#E5E7EB] pt-8">
        {/* Left Side: Why we did this */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#C9A84C] rounded-full" />
            <h3 className="text-lg font-bold text-[#0A0A0A] tracking-tight">Why we did this?</h3>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Smart Handling was built to solve the tedious, manual customs clearance process. By leveraging AI-powered OCR, we parse complicated shipping documents (Commercial Invoices, Packing Lists, Bills of Lading) and map them directly into structured Mirsal 2 customs drafts in just <strong>2.8 seconds</strong>. 
          </p>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Our built-in audit runner automatically flags calculation mismatches, pricing anomalies, and incorrect Incoterms before submission, preventing costly compliance errors and fines.
          </p>
        </div>

        {/* Right Side: Feedback Form */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0C2461]" />
            <h4 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wider">Improve & Enhancement thoughts</h4>
          </div>
          <p className="text-xs text-[#6B7280]">
            Have an idea for a feature or layout enhancement? Submit it directly to our database! We review all suggestions daily.
          </p>
          <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Tell us what we should add or improve..."
              className="w-full min-h-[80px] p-3 text-xs border border-[#E5E7EB] rounded-lg focus:border-[#0C2461] focus:ring-1 focus:ring-[#0C2461] outline-none transition-all resize-none bg-[#F9FAFB] focus:bg-white"
              maxLength={1000}
              required
            />
            {feedbackSuccess && (
              <p className="text-xs text-green-600 font-semibold flex items-center gap-1 font-mono animate-fade-in">
                ✓ Thank you! Your thought has been securely logged.
              </p>
            )}
            {feedbackError && (
              <p className="text-xs text-red-600 font-semibold font-mono animate-fade-in">
                ⚠ {feedbackError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmittingFeedback || !suggestion.trim()}
              className="self-end px-4 py-2 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              Submit Thought
            </button>
          </form>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mt-12 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF] pb-8">
        <div>
          <p className="font-semibold text-[#6B7280]">Smart Handling</p>
          <p className="mt-1">© 2026 Smart Handling. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="mailto:support@smarthandling.ae" className="hover:text-[#0C2461] transition-colors">
            Contact Support
          </a>
          <span>•</span>
          <span className="font-mono text-[10px]">Dubai Trade Compliance v1.2</span>
        </div>
      </footer>
    </div>
  );
};
