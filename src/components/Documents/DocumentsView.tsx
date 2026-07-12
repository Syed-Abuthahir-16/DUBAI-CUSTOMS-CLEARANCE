import React, { useState, useEffect } from 'react';
import { Folder, FileText, ArrowLeft, Trash2, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, Badge } from '../ui';
import { db } from '../../lib/supabase';

interface DocumentsViewProps {
}

export const DocumentsView: React.FC<DocumentsViewProps> = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<'root' | 'pdf' | 'csv'>('root');

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await db.getUserFiles();
      setFiles(list);
    } catch (err) {
      console.error('Failed to load user files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document from your files directory?')) return;
    try {
      await db.deleteUserFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const pdfFiles = files.filter(f => f.file_type === 'pdf');
  const csvFiles = files.filter(f => f.file_type === 'csv');

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px] text-[#6B7280]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#0C2461]" />
        <p className="text-xs mt-2 font-medium">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-6 animate-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <div className="flex items-center gap-3">
          {activeFolder !== 'root' && (
            <button 
              onClick={() => setActiveFolder('root')}
              className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] tracking-tight">
              {activeFolder === 'root' ? 'Documents Directory' : activeFolder === 'pdf' ? 'Uploaded PDFs' : 'Saved CSV Exports'}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {activeFolder === 'root' ? 'View and manage all uploaded customs files and spreadsheets.' : `Folder: Documents / ${activeFolder === 'pdf' ? 'Uploaded PDFs' : 'Saved CSV'}`}
            </p>
          </div>
        </div>
        <button 
          onClick={loadFiles}
          className="p-2 rounded-full hover:bg-white text-[#6B7280] hover:text-[#0a0a0a] transition-all cursor-pointer border border-[#E5E7EB] shadow-sm"
          title="Refresh files"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ROOT DIRECTORY VIEW */}
      {activeFolder === 'root' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* PDF Folder */}
          <div 
            onClick={() => setActiveFolder('pdf')}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:border-[#0C2461] hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] flex items-center justify-center shrink-0 text-[#0C2461] group-hover:scale-105 transition-transform">
              <Folder className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#0A0A0A] tracking-tight">Uploaded PDFs</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{pdfFiles.length} files saved</p>
            </div>
            <Badge variant="navy">Open</Badge>
          </div>

          {/* CSV Folder */}
          <div 
            onClick={() => setActiveFolder('csv')}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:border-[#0C2461] hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] flex items-center justify-center shrink-0 text-[#0C2461] group-hover:scale-105 transition-transform">
              <Folder className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#0A0A0A] tracking-tight">Saved CSV</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{csvFiles.length} files exported</p>
            </div>
            <Badge variant="navy">Open</Badge>
          </div>
        </div>
      )}

      {/* FOLDER CONTENTS VIEW */}
      {activeFolder !== 'root' && (
        <Card>
          {((activeFolder === 'pdf' ? pdfFiles : csvFiles).length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#6B7280]">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#0A0A0A]">No documents found</p>
              <p className="text-xs mt-1">There are no {activeFolder === 'pdf' ? 'PDF' : 'CSV'} files saved in this folder.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 text-[10px] font-bold uppercase tracking-widest">File Name</th>
                    <th className="py-3 text-[10px] font-bold uppercase tracking-widest">Type</th>
                    <th className="py-3 text-[10px] font-bold uppercase tracking-widest">Created At</th>
                    <th className="py-3 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {(activeFolder === 'pdf' ? pdfFiles : csvFiles).map((file) => (
                    <tr 
                      key={file.id} 
                      className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-all group"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0C2461] shrink-0" />
                          <span className="text-sm font-semibold text-[#0A0A0A] truncate max-w-[300px]">{file.file_name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="navy">{file.file_type.toUpperCase()}</Badge>
                      </td>
                      <td className="py-4 text-xs text-[#6B7280]">
                        {new Date(file.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {file.file_type === 'csv' ? (
                            <button
                              onClick={() => {
                                // Simulate downloading generated CSV content
                                const blob = new Blob([`Declaration,File,Date\n"${file.file_name}",CSV Export,"${file.created_at}"`], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.setAttribute('href', url);
                                a.setAttribute('download', file.file_name);
                                a.click();
                              }}
                              className="p-1.5 rounded hover:bg-[#0C2461]/10 text-[#6B7280] hover:text-[#0C2461] transition-all"
                              title="Download spreadsheet"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => alert('Opening PDF preview...')}
                              className="p-1.5 rounded hover:bg-[#0C2461]/10 text-[#6B7280] hover:text-[#0C2461] transition-all"
                              title="Preview document"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(file.id, e)}
                            className="p-1.5 rounded hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
