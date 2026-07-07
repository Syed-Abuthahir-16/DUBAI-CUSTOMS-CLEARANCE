import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Clock, Trash2, ArrowRight } from 'lucide-react';
import { Card, Badge } from '../ui';
import type { Declaration } from '../../lib/supabase';

interface DashboardProps {
  declarations: Declaration[];
  onUpload: (fileName: string, fileBase64: string, localPdfUrl?: string) => Promise<void>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  isProcessing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  declarations,
  onUpload,
  onSelect,
  onDelete,
  isProcessing
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setErrorMessage("Please upload a PDF document (Commercial Invoice, Packing List, or B/L).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds the 5MB size limit.");
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
        setErrorMessage(err.message || "Failed to process file.");
      }
    };
  };

  // Stats calculation
  const totalCount = declarations.length;
  const warningCount = declarations.filter(d => d.warnings && d.warnings.length > 0).length;
  const processedToday = declarations.filter(d => {
    const today = new Date().toISOString().split('T')[0];
    return d.created_at.startsWith(today);
  }).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6 animate-in-up">
      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border border-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b sm:border-b-0 sm:border-r border-border-light flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">Total Declarations</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-mono font-bold text-text-primary">{totalCount}</span>
            <span className="text-xs text-green-500 font-semibold font-mono">+{processedToday} today</span>
          </div>
        </div>
        <div className="p-6 border-b sm:border-b-0 sm:border-r border-border-light flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">Average Speed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-mono font-bold text-text-primary">2.8s</span>
            <span className="text-xs text-text-secondary font-mono">OpenAI 4o-mini</span>
          </div>
        </div>
        <div className="p-6 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">Audit Warnings Flagged</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-mono font-bold ${warningCount > 0 ? 'text-accent-orange' : 'text-text-primary'}`}>{warningCount}</span>
            <span className="text-xs text-text-secondary font-mono">auto-reconciled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Zone (Left Column) */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <Card title="New Extraction" subtitle="Drag & drop invoice or Packing List">
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] ${
                isDragActive 
                  ? 'border-accent-orange bg-accent-orange/5' 
                  : 'border-border-light hover:border-accent-violet hover:bg-accent-violet/5'
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
                  <div className="w-10 h-10 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet animate-spin">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary font-mono">Extracting Fields...</h4>
                    <p className="text-xs text-text-secondary mt-1 max-w-[200px]">Converting invoice to Mirsal 2 structured schema</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-text-secondary">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Upload Document</h4>
                    <p className="text-xs text-text-secondary mt-1">PDF up to 5MB</p>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </Card>
        </div>

        {/* History Table (Right Column) */}
        <div className="md:col-span-2">
          <Card title="Declaration History" subtitle="Click to view and edit draft declarations">
            {declarations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-text-secondary">
                <FileText className="w-8 h-8 opacity-40 mb-2" />
                <h4 className="text-sm font-semibold text-text-primary font-mono">No declarations yet</h4>
                <p className="text-xs max-w-[280px] mt-1">Upload your first invoice PDF to start drafting customs entries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">Document Name</th>
                      <th className="py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">Importer</th>
                      <th className="py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">CIF Value</th>
                      <th className="py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">Status</th>
                      <th className="py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {declarations.map((dec) => {
                      const hasWarnings = dec.warnings && dec.warnings.length > 0;
                      return (
                        <tr 
                          key={dec.id} 
                          onClick={() => onSelect(dec.id)}
                          className="border-b border-border-light hover:bg-background/60 cursor-pointer transition-all group"
                        >
                          <td className="py-4 pr-3 max-w-[200px] truncate">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-text-secondary shrink-0" />
                              <span className="text-sm font-medium text-text-primary truncate">{dec.file_name}</span>
                            </div>
                            <span className="text-[10px] text-text-secondary font-mono block mt-0.5">
                              {new Date(dec.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-text-primary">
                            {dec.extracted_header.consignee_name ? (
                              <span className="truncate block max-w-[150px]">{dec.extracted_header.consignee_name}</span>
                            ) : (
                              <span className="text-text-secondary italic">Unknown</span>
                            )}
                          </td>
                          <td className="py-4 text-sm font-mono text-text-primary">
                            {dec.extracted_header.total_invoice_value ? (
                              <span>
                                {dec.extracted_header.invoice_currency || 'USD'}{' '}
                                {(dec.extracted_header.total_invoice_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-text-secondary">-</span>
                            )}
                          </td>
                          <td className="py-4">
                            {dec.status === 'processing' ? (
                              <Badge variant="violet">Extracting</Badge>
                            ) : hasWarnings ? (
                              <Badge variant="warning">Warnings</Badge>
                            ) : (
                              <Badge variant="success">Ready</Badge>
                            )}
                          </td>
                          <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => onSelect(dec.id)}
                                className="p-1.5 rounded hover:bg-border-accent text-text-secondary hover:text-accent-violet transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => onDelete(dec.id)}
                                className="p-1.5 rounded hover:bg-red-500/10 text-text-secondary hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
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
    </div>
  );
};
