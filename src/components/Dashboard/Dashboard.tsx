import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Clock, Trash2, ArrowRight, Shield, Zap } from 'lucide-react';
import { Card, Badge } from '../ui';
import type { Declaration } from '../../lib/supabase';
import { db } from '../../lib/supabase';
import { AnimatedCounter } from '../ui/AnimatedCounter';

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
    if (processedToday >= 4) {
      setErrorMessage('Daily upload limit reached. You can only upload and extract 4 PDFs per day on the sandbox account plan.');
      return;
    }
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
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-in-up">
      {/* ERROR MESSAGE TOAST */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#0A0A0A]">Document Validation Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* TOP ROW: UPLOAD CARD & QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Upload Invoice) - spans 2 cols on lg screens */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between flex-grow min-h-[300px]">
            <div>
              <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Upload Invoice or Packing List</h3>
              <p className="text-xs text-[#6B7280] mt-1">Extract data instantly with AI-powered OCR mapping to Mirsal 2 standards.</p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-5 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[170px] ${
                isDragActive
                  ? 'border-[#0C2461] bg-[#0C2461]/5'
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
                  <div className="w-12 h-12 rounded-full bg-[#0C2461]/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#0C2461] animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A0A0A]">Extracting Fields…</h4>
                    <p className="text-xs text-[#6B7280] mt-1">Converting raw PDF into structured customs schema</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#0C2461]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  
                  <button
                    type="button"
                    className="px-5 py-2 bg-[#0C2461] hover:bg-[#0A1D4F] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Upload PDF Document
                  </button>
                  <p className="text-xs text-[#6B7280] mt-1">or drag and drop your file here</p>
                </div>
              )}
            </div>

            {/* Feature Badges Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#F3F4F6] pt-5 mt-6 text-xs text-[#6B7280]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#0C2461]" />
                </div>
                <div>
                  <p className="font-bold text-[#0A0A0A]">PDF only</p>
                  <p className="text-[10px] text-[#9CA3AF]">Up to 10MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-[#0C2461]" />
                </div>
                <div>
                  <p className="font-bold text-[#0A0A0A]">AI-Powered OCR</p>
                  <p className="text-[10px] text-[#9CA3AF]">99% accuracy</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-[#0C2461]" />
                </div>
                <div>
                  <p className="font-bold text-[#0A0A0A]">Secure & Private</p>
                  <p className="text-[10px] text-[#9CA3AF]">Your data is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Stats) */}
        <div className="flex flex-col">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between flex-grow">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">Quick Stats</h3>
              <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">Today</span>
            </div>

            <div className="flex flex-col gap-4 flex-1 justify-center">
              {/* Stat 1: Total Declarations */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#0C2461]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total Declarations</p>
                    <p className="text-2xl font-bold text-[#0A0A0A] mt-0.5">{totalCount}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#0C2461] bg-[#E0E7FF] px-2 py-0.5 rounded-full">
                  +{processedToday} today
                </span>
              </div>

              {/* Stat 2: Average Speed */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#0C2461]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Average Speed</p>
                    <p className="text-2xl font-bold text-[#0A0A0A] mt-0.5">2.8s</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#0C2461] bg-[#E0E7FF] px-2 py-0.5 rounded-full">
                  ↓ 0.5s vs yesterday
                </span>
              </div>

              {/* Stat 3: Audit Warnings */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E0E7FF] flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#0C2461]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Audit Warnings</p>
                    <p className="text-2xl font-bold text-[#0A0A0A] mt-0.5">{warningCount}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  No new issues
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: RECENT DECLARATIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Recent Declarations Table) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card 
            title="Recent Declarations" 
            subtitle="Your latest draft declarations"
            actions={<span className="text-xs font-semibold text-[#0C2461] hover:underline cursor-pointer">View all →</span>}
          >
            {declarations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#6B7280]">
                <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">No declarations yet</p>
                <p className="text-xs mt-1">Upload your first invoice PDF to start drafting customs entries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Document</th>
                      <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Importer</th>
                      <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">CIF Value</th>
                      <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Status</th>
                      <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280] text-right">Date</th>
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
                              <span className="text-sm font-semibold text-[#0A0A0A] truncate">{dec.file_name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-medium text-[#6B7280]">
                            {dec.extracted_header.consignee_name ? (
                              <span className="truncate block max-w-[150px]">{dec.extracted_header.consignee_name}</span>
                            ) : (
                              <span className="text-[#9CA3AF] italic">Unknown</span>
                            )}
                          </td>
                          <td className="py-4 text-xs font-bold text-[#0A0A0A] font-mono">
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
                              <Badge variant="navy">Extracting</Badge>
                            ) : hasWarnings ? (
                              <Badge variant="navy">Warnings</Badge>
                            ) : (
                              <Badge variant="navy">Ready</Badge>
                            )}
                          </td>
                          <td className="py-4 text-[10px] text-[#9CA3AF] font-medium text-right">
                            {new Date(dec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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

        {/* Right Column (Recent Activity) */}
        <div className="flex flex-col">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider border-b border-[#F3F4F6] pb-3 mb-4">
                Recent Activity
              </h3>
              
              <div className="flex flex-col gap-4">
                {declarations.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] italic text-center py-6">No recent logs</p>
                ) : (
                  declarations.slice(0, 3).map((dec, i) => (
                    <div key={dec.id} className="flex items-start justify-between text-xs gap-3">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0C2461] mt-1 shrink-0" />
                        <div>
                          <p className="font-bold text-[#0A0A0A]">
                            {i === 0 ? 'Declaration created' : 'Document uploaded'}
                          </p>
                          <p className="text-[10px] text-[#6B7280] font-mono mt-0.5 truncate max-w-[170px]">
                            {dec.file_name}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] text-[#9CA3AF] font-medium text-right mt-0.5">
                        {new Date(dec.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex items-start justify-between text-xs gap-3">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0C2461] mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-[#0A0A0A]">System check completed</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">All systems operational</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] font-medium text-right mt-0.5">Ready</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#F3F4F6] pt-4 mt-6 text-center">
              <span className="text-xs font-semibold text-[#0C2461] hover:underline cursor-pointer block">
                View all activity →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: PERFORMANCE SNAPSHOT CONTAINER */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-[#0A0A0A] tracking-tight">Performance Snapshot</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Overview of your key performance metrics</p>
          </div>
          <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB]">Last 7 days</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Declarations */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Total Declarations</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-[#0A0A0A]">
                <AnimatedCounter target={totalCount} />
              </span>
              <span className="text-[10px] text-[#0C2461] font-bold">+{processedToday} today</span>
            </div>
          </div>

          {/* Card 2: Average Speed */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Average Speed</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-[#0A0A0A]">
                <AnimatedCounter target={2.8} decimals={1} suffix="s" />
              </span>
              <span className="text-[10px] text-[#0C2461] font-bold">↓ 0.5s</span>
            </div>
          </div>

          {/* Card 3: Success Rate */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Success Rate</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-[#0A0A0A]">
                <AnimatedCounter target={100} suffix="%" />
              </span>
              <span className="text-[10px] text-[#0C2461] font-bold">↑ Excellent</span>
            </div>
          </div>

          {/* Card 4: Audit Warnings */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Audit Warnings</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold text-[#0A0A0A]">
                <AnimatedCounter target={warningCount} />
              </span>
              <span className="text-[10px] text-[#6B7280] font-bold">No issues</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── "Why we did this?" and Feedback Form Section ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-[#E5E7EB] pt-8">
        {/* Left Side: Why we did this */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 bg-[#0C2461] rounded-full" />
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
