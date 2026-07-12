import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Copy, Check, FileText, AlertTriangle, 
  Trash2, Plus, Download, FileCode, CheckCircle, Save
} from 'lucide-react';
import { Button, Input, Badge } from '../ui';
import { db, type Declaration } from '../../lib/supabase';

// Navy + gold palette constants
const NAVY = '#0C2461';
const GOLD = '#C9A84C';

interface CopyInputProps {
  id: string;
  label: string;
  value: any;
  onChange: (val: string) => void;
  copiedField: string | null;
  onCopy: (id: string, val: string) => void;
  type?: string;
}

const CopyInput: React.FC<CopyInputProps> = ({ 
  id, label, value, onChange, copiedField, onCopy, type = 'text' 
}) => {
  const isCopied = copiedField === id;
  return (
    <div className="relative w-full group">
      <Input
        id={id}
        label={label}
        value={value || ''}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 bg-white border-[#E5E7EB] focus:border-[#0C2461] focus:ring-1 focus:ring-[#0C2461]"
      />
      <button
        type="button"
        onClick={() => onCopy(id, value)}
        disabled={!value}
        className="absolute right-2.5 bottom-2 p-1 text-[#6B7280] hover:text-[#0C2461] hover:bg-[#F3F4F6] transition-all rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        title="Copy field value"
      >
        {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

interface EditorContainerProps {
  declaration: Declaration;
  onBack: () => void;
  onSave: (updatedDec: Declaration) => Promise<void>;
  declarationsList: Declaration[];
  onSelectOther: (id: string) => void;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({
  declaration,
  onBack,
  onSave,
  declarationsList,
  onSelectOther
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pdf' | 'header' | 'items'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024 ? 'pdf' : 'header';
  });
  
  // Local state for edits
  const [header, setHeader] = useState({ ...declaration.extracted_header });
  const [items, setItems] = useState([ ...declaration.extracted_items ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Copy helper
  const handleCopy = (fieldId: string, value: any) => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Header input change
  const handleHeaderChange = (key: string, value: string | number) => {
    setHeader(prev => ({ ...prev, [key]: value }));
  };

  // Line items changes
  const handleItemChange = (index: number, key: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    
    // Automatically recalculate item total value if price or qty changes
    if (key === 'unit_price' || key === 'quantity') {
      const q = key === 'quantity' ? Number(value) : Number(updated[index].quantity || 0);
      const p = key === 'unit_price' ? Number(value) : Number(updated[index].unit_price || 0);
      updated[index].total_value = q * p;
    }
    
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem = {
      item_no: items.length + 1,
      hs_code: '0000.00.00',
      goods_description: 'New Cargo Item',
      quantity: 1,
      unit_of_quantity: 'PCS',
      package_type: 'Carton',
      package_quantity: 1,
      net_weight_kg: 0,
      gross_weight_kg: 0,
      country_of_origin: 'CN',
      unit_price: 0,
      total_value: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      item_no: idx + 1
    }));
    setItems(updated);
  };

  // Save changes
  const handleLocalSave = async () => {
    setIsSaving(true);
    
    // Recalculate invoice total
    const totalVal = items.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const updatedHeader = { ...header, total_invoice_value: totalVal };
    setHeader(updatedHeader);

    // Re-verify warnings
    const newWarnings: string[] = [];
    const term = (updatedHeader.delivery_term || '').toUpperCase();
    if (term === 'FOB' && (updatedHeader.freight_charges || 0) === 0) {
      newWarnings.push(`Warning: Incoterm is FOB, but Freight Charges are declared as 0.`);
    }
    
    const updatedDeclaration: Declaration = {
      ...declaration,
      status: 'modified',
      extracted_header: updatedHeader,
      extracted_items: items,
      warnings: newWarnings
    };

    await onSave(updatedDeclaration);
    setIsSaving(false);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  // Export functions
  const handleExportCSV = async () => {
    // Generate CSV representing Dubai Customs Bulk Upload fields
    const headers = [
      'Item No', 'HS Code', 'Goods Description', 'Qty', 'Unit', 'Pkg Type', 
      'Pkg Qty', 'Net Weight', 'Gross Weight', 'Origin', 'Unit Price', 'Total Value'
    ];
    
    const rows = items.map(i => [
      i.item_no, i.hs_code, `"${i.goods_description.replace(/"/g, '""')}"`, 
      i.quantity, i.unit_of_quantity, i.package_type, i.package_quantity, 
      i.net_weight_kg, i.gross_weight_kg, i.country_of_origin, i.unit_price, i.total_value
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const fileName = `customs_declaration_${header.commercial_invoice_no || 'draft'}.csv`;
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save CSV export file to user_files directory
    try {
      await db.saveUserFile(fileName, 'csv');
    } catch (err) {
      console.error('Failed to save user CSV file log:', err);
    }
  };

  const handleExportXML = () => {
    // Basic Mirsal 2 XML draft generator
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationRequest>
  <Header>
    <DeclarationType>${header.declaration_type || 'Import'}</DeclarationType>
    <DeclarationSubType>${header.declaration_sub_type || ''}</DeclarationSubType>
    <ConsigneeCode>${header.consignee_code || ''}</ConsigneeCode>
    <InvoiceNo>${header.commercial_invoice_no || ''}</InvoiceNo>
    <InvoiceDate>${header.invoice_date || ''}</InvoiceDate>
    <Incoterm>${header.delivery_term || ''}</Incoterm>
    <InvoiceCurrency>${header.invoice_currency || ''}</InvoiceCurrency>
    <TotalInvoiceValue>${header.total_invoice_value || 0}</TotalInvoiceValue>
    <LoadingPort>${header.port_of_loading || ''}</LoadingPort>
    <DischargePort>${header.port_of_discharge || ''}</DischargePort>
    <BLNumber>${header.bill_of_lading_no || ''}</BLNumber>
  </Header>
  <Items>
    ${items.map(item => `
    <Item>
      <ItemNo>${item.item_no}</ItemNo>
      <HSCode>${item.hs_code}</HSCode>
      <Description>${item.goods_description}</Description>
      <Quantity>${item.quantity}</Quantity>
      <Unit>${item.unit_of_quantity}</Unit>
      <PackageType>${item.package_type}</PackageType>
      <PackageQuantity>${item.package_quantity}</PackageQuantity>
      <NetWeight>${item.net_weight_kg}</NetWeight>
      <GrossWeight>${item.gross_weight_kg}</GrossWeight>
      <Origin>${item.country_of_origin}</Origin>
      <UnitPrice>${item.unit_price}</UnitPrice>
      <TotalValue>${item.total_value}</TotalValue>
    </Item>`).join('')}
  </Items>
</DeclarationRequest>`;

    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customs_declaration_${header.commercial_invoice_no || 'draft'}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      
      {/* 1. COLLAPSIBLE SIDEBAR (LEFT) */}
      <div 
        className={`bg-white border-r border-[#E5E7EB] flex flex-col transition-sidebar relative z-30 shrink-0 ${
          sidebarCollapsed ? 'w-[60px]' : 'w-[420px]'
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] hover:text-[#0A0A0A] shadow-sm hover:scale-105 z-40 transition-all cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {sidebarCollapsed ? (
          <div className="flex flex-col items-center py-6 gap-6">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#0A0A0A]" title="Back">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-[#E5E7EB]" />
            <FileText className="w-5 h-5" style={{color: NAVY}} />
            {declaration.warnings.length > 0 && (
              <Badge variant="warning" className="w-5 h-5 flex items-center justify-center p-0 text-[10px]">
                {declaration.warnings.length}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between">
              <button 
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <Badge variant={declaration.status === 'modified' ? 'violet' : 'success'}>
                {declaration.status.toUpperCase()}
              </Badge>
            </div>

            {/* Document Details Card */}
            <div className="bg-[#F7F7F7] border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center" style={{color: NAVY}}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-[#0A0A0A] truncate" title={declaration.file_name}>
                    {declaration.file_name}
                  </h4>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">Uploaded {new Date(declaration.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            {/* RLS Warnings Panel */}
            <div className="flex-1 flex flex-col min-h-0">
              <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" style={{color: GOLD}} /> Audit Warnings ({declaration.warnings.length})
              </h5>

              {declaration.warnings.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 text-xs text-green-700">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                  <div>
                    <span className="font-semibold block font-mono">Declaration Validated</span>
                    No calculation mismatches, pricing anomalies, or invalid delivery term details flagged by our audit runner.
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                  {declaration.warnings.map((warn, index) => (
                    <div key={index} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-700">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Switch Switcher */}
            <div className="border-t border-[#E5E7EB] pt-4">
              <h6 className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Switch Draft</h6>
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                {declarationsList.filter(d => d.id !== declaration.id).slice(0, 3).map(d => (
                  <button 
                    key={d.id}
                    onClick={() => onSelectOther(d.id)}
                    className="w-full text-left text-xs p-2 rounded-lg hover:bg-[#F7F7F7] border border-transparent hover:border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] transition-all truncate"
                  >
                    {d.file_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN REVIEW CANVAS (RIGHT) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Toolbar */}
        <div className="min-h-14 border-b border-[#E5E7EB] px-4 md:px-6 py-2.5 md:py-0 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg border border-[#E5E7EB] w-full md:w-auto overflow-x-auto select-none no-scrollbar">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-2.5 md:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pdf' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <span className="hidden sm:inline">1. PDF Document</span>
              <span className="inline sm:hidden">1. PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('header')}
              className={`px-2.5 md:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'header' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <span className="hidden sm:inline">2. Declaration Header</span>
              <span className="inline sm:hidden">2. Header</span>
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-2.5 md:px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'items' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <span className="hidden sm:inline">3. Line Items ({items.length})</span>
              <span className="inline sm:hidden">3. Items ({items.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {showSavedFeedback && (
              <span className="text-xs text-green-600 font-semibold font-mono flex items-center gap-1 mr-1">
                <Check className="w-3.5 h-3.5" /> Changes saved
              </span>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLocalSave}
              disabled={isSaving}
              className="gap-1.5 text-[11px] md:text-xs px-2.5 md:px-3 py-1"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleExportCSV} 
              className="gap-1.5 text-[11px] md:text-xs px-2.5 md:px-3 py-1"
            >
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export CSV</span><span className="inline sm:hidden">CSV</span>
            </Button>
            <Button 
              variant="gold" 
              size="sm" 
              onClick={handleExportXML} 
              className="gap-1.5 text-[11px] md:text-xs px-2.5 md:px-3 py-1"
            >
              <FileCode className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export XML</span><span className="inline sm:hidden">XML</span>
            </Button>
          </div>
        </div>

        {/* Workspace Grid Viewport */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* PDF Viewer (Left half) - Visible on lg screens, OR when activeTab is 'pdf' */}
          <div className={`${
            activeTab === 'pdf' ? 'flex w-full' : 'hidden lg:flex lg:w-[45%]'
          } border-r border-[#E5E7EB] bg-[#F3F4F6]/60 flex-col p-4`}>
            <div className="w-full h-full bg-white border border-[#E5E7EB] rounded-lg shadow-sm flex flex-col relative overflow-hidden">
              <div className="h-10 bg-[#F7F7F7] border-b border-[#E5E7EB] px-4 flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-[#6B7280] truncate">{declaration.file_name}</span>
                <Badge variant="default" className="text-[9px]">ORIGINAL PDF</Badge>
              </div>
              <div className="flex-1">
                {declaration.file_path ? (
                  <iframe 
                    src={declaration.file_path} 
                    className="w-full h-full border-0"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-[#6B7280]">
                    <FileText className="w-12 h-12 mb-3 animate-pulse" style={{color: `${NAVY}60`}} />
                    <h5 className="text-sm font-semibold text-[#0A0A0A]">Invoice Preview Canvas</h5>
                    <p className="text-xs max-w-[200px] mt-1">Please re-upload your PDF file to preview it here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Editor Panel (Right half) - Hidden on mobile if activeTab is 'pdf' */}
          <div className={`${activeTab === 'pdf' ? 'hidden lg:block' : 'block'} flex-1 overflow-y-auto p-4 md:p-6`}>
            {activeTab === 'header' ? (
              <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-[3px] h-5 rounded-full" style={{background: GOLD}} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
                    Customs Declaration Header Fields (Mirsal 2)
                  </h3>
                </div>
                
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">
                  <CopyInput 
                    id="decl_type" 
                    label="Declaration Type" 
                    value={header.declaration_type} 
                    onChange={(val) => handleHeaderChange('declaration_type', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="decl_sub" 
                    label="Declaration Sub-Type" 
                    value={header.declaration_sub_type} 
                    onChange={(val) => handleHeaderChange('declaration_sub_type', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="cons_code" 
                    label="Consignee Code" 
                    value={header.consignee_code} 
                    onChange={(val) => handleHeaderChange('consignee_code', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="cons_name" 
                    label="Consignee Name (Importer)" 
                    value={header.consignee_name} 
                    onChange={(val) => handleHeaderChange('consignee_name', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="ship_name" 
                    label="Shipper Name (Exporter)" 
                    value={header.shipper_name} 
                    onChange={(val) => handleHeaderChange('shipper_name', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="ship_country" 
                    label="Shipper Country" 
                    value={header.shipper_country} 
                    onChange={(val) => handleHeaderChange('shipper_country', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
                  <CopyInput 
                    id="inv_no" 
                    label="Commercial Invoice No" 
                    value={header.commercial_invoice_no} 
                    onChange={(val) => handleHeaderChange('commercial_invoice_no', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="inv_date" 
                    label="Invoice Date" 
                    value={header.invoice_date} 
                    onChange={(val) => handleHeaderChange('invoice_date', val)} 
                    type="date"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="bl_no" 
                    label="Bill of Lading No" 
                    value={header.bill_of_lading_no} 
                    onChange={(val) => handleHeaderChange('bill_of_lading_no', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="incoterm" 
                    label="Delivery Term (Incoterm)" 
                    value={header.delivery_term} 
                    onChange={(val) => handleHeaderChange('delivery_term', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="currency" 
                    label="Invoice Currency" 
                    value={header.invoice_currency} 
                    onChange={(val) => handleHeaderChange('invoice_currency', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="total_val" 
                    label="Total Invoice Value" 
                    value={header.total_invoice_value} 
                    onChange={(val) => handleHeaderChange('total_invoice_value', Number(val))} 
                    type="number"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="freight" 
                    label="Freight Charges" 
                    value={header.freight_charges} 
                    onChange={(val) => handleHeaderChange('freight_charges', Number(val))} 
                    type="number"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="insurance" 
                    label="Insurance Charges" 
                    value={header.insurance_charges} 
                    onChange={(val) => handleHeaderChange('insurance_charges', Number(val))} 
                    type="number"
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">
                  <CopyInput 
                    id="port_load" 
                    label="Port of Loading" 
                    value={header.port_of_loading} 
                    onChange={(val) => handleHeaderChange('port_of_loading', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                  <CopyInput 
                    id="port_dis" 
                    label="Port of Discharge" 
                    value={header.port_of_discharge} 
                    onChange={(val) => handleHeaderChange('port_of_discharge', val)} 
                    copiedField={copiedField}
                    onCopy={handleCopy}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4 animate-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[3px] h-5 rounded-full" style={{background: GOLD}} />
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
                      Customs Invoice Items Worksheet
                    </h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-1 text-xs">
                    <Plus className="w-4 h-4" /> Add Row
                  </Button>
                </div>
                
                {/* Spreadsheet grid */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] bg-[#F7F7F7] text-[9px] uppercase tracking-widest text-[#6B7280]">
                          <th className="py-3 px-3 w-[50px]">No</th>
                          <th className="py-3 px-3 w-[140px]">HS Code</th>
                          <th className="py-3 px-3 min-w-[200px]">Description</th>
                          <th className="py-3 px-3 w-[80px]">Qty</th>
                          <th className="py-3 px-3 w-[70px]">Unit</th>
                          <th className="py-3 px-3 w-[100px]">Pkg Type</th>
                          <th className="py-3 px-3 w-[80px]">Pkg Qty</th>
                          <th className="py-3 px-3 w-[90px]">Net Wt</th>
                          <th className="py-3 px-3 w-[90px]">Gross Wt</th>
                          <th className="py-3 px-3 w-[70px]">Origin</th>
                          <th className="py-3 px-3 w-[100px]">Unit Price</th>
                          <th className="py-3 px-3 w-[110px]">Total Value</th>
                          <th className="py-3 px-3 w-[50px] text-right"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-b border-[#F3F4F6] hover:bg-[#F9F9F9] text-xs">
                            <td className="py-2 px-3 font-mono font-bold text-[#6B7280]">{item.item_no}</td>
                            <td className="py-2 px-2">
                              <input 
                                type="text" 
                                value={item.hs_code || ''} 
                                onChange={(e) => handleItemChange(index, 'hs_code', e.target.value)}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text" 
                                value={item.goods_description || ''} 
                                onChange={(e) => handleItemChange(index, 'goods_description', e.target.value)}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded text-xs outline-none truncate"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs text-right outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text" 
                                value={item.unit_of_quantity || ''} 
                                onChange={(e) => handleItemChange(index, 'unit_of_quantity', e.target.value)}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text" 
                                value={item.package_type || ''} 
                                onChange={(e) => handleItemChange(index, 'package_type', e.target.value)}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded text-xs outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.package_quantity} 
                                onChange={(e) => handleItemChange(index, 'package_quantity', Number(e.target.value))}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs text-right outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.net_weight_kg} 
                                onChange={(e) => handleItemChange(index, 'net_weight_kg', Number(e.target.value))}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs text-right outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.gross_weight_kg} 
                                onChange={(e) => handleItemChange(index, 'gross_weight_kg', Number(e.target.value))}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs text-right outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="text" 
                                value={item.country_of_origin || ''} 
                                onChange={(e) => handleItemChange(index, 'country_of_origin', e.target.value)}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs text-center outline-none"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input 
                                type="number" 
                                value={item.unit_price} 
                                onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#0C2461] focus:bg-white rounded font-mono text-xs text-right outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#0A0A0A]">
                              {(item.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button 
                                onClick={() => handleRemoveItem(index)}
                                className="p-1 rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
