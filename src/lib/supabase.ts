import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are placeholders or empty
const isMockMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-supabase-project') ||
  supabaseAnonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Create authentic Supabase client
export const supabaseClient = !isMockMode
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock database type definitions
export interface Declaration {
  id: string;
  user_id?: string;
  file_name: string;
  file_path?: string;
  status: 'processing' | 'completed' | 'failed' | 'modified';
  extracted_header: {
    declaration_type?: string;
    declaration_sub_type?: string;
    consignee_code?: string;
    consignee_name?: string;
    shipper_name?: string;
    shipper_country?: string;
    commercial_invoice_no?: string;
    invoice_date?: string;
    invoice_currency?: string;
    total_invoice_value?: number;
    delivery_term?: string;
    freight_charges?: number;
    insurance_charges?: number;
    port_of_loading?: string;
    port_of_discharge?: string;
    bill_of_lading_no?: string;
  };
  extracted_items: Array<{
    item_no: number;
    hs_code: string;
    goods_description: string;
    quantity: number;
    unit_of_quantity: string;
    package_type: string;
    package_quantity: number;
    net_weight_kg: number;
    gross_weight_kg: number;
    country_of_origin: string;
    unit_price: number;
    total_value: number;
  }>;
  warnings: string[];
  created_at: string;
  updated_at: string;
}

// LocalStorage mock implementation
const MOCK_STORAGE_KEY = 'dubai_customs_declarations';

// Initialize mock data if empty
if (isMockMode && !localStorage.getItem(MOCK_STORAGE_KEY)) {
  const initialMockData: Declaration[] = [
    {
      id: 'd1b2c3d4-e5f6-47a8-b9c0-1d2e3f4a5b6c',
      file_name: 'commercial_invoice_10928_shanghai.pdf',
      status: 'completed',
      extracted_header: {
        declaration_type: 'Import to Local',
        declaration_sub_type: 'Import to Local from Abroad',
        consignee_code: 'AE-3948572',
        consignee_name: 'IMEX GENERAL TRADING LLC',
        shipper_name: 'SHANGHAI INDUSTRIAL CO. LTD',
        shipper_country: 'China',
        commercial_invoice_no: 'INV-10928',
        invoice_date: '2026-06-25',
        invoice_currency: 'USD',
        total_invoice_value: 24500.00,
        delivery_term: 'CIF',
        freight_charges: 1200.00,
        insurance_charges: 150.00,
        port_of_loading: 'CNSHA',
        port_of_discharge: 'AEJEA',
        bill_of_lading_no: 'OOLU2039847192'
      },
      extracted_items: [
        {
          item_no: 1,
          hs_code: '8504.40.90',
          goods_description: 'Static Converters (UPS System 10kVA)',
          quantity: 10,
          unit_of_quantity: 'PCS',
          package_type: 'Pallet',
          package_quantity: 2,
          net_weight_kg: 850.00,
          gross_weight_kg: 920.00,
          country_of_origin: 'CN',
          unit_price: 1800.00,
          total_value: 18000.00
        },
        {
          item_no: 2,
          hs_code: '8507.20.80',
          goods_description: 'Lead-acid Accumulators (12V 100Ah Batteries)',
          quantity: 40,
          unit_of_quantity: 'PCS',
          package_type: 'Carton',
          package_quantity: 10,
          net_weight_kg: 1200.00,
          gross_weight_kg: 1240.00,
          country_of_origin: 'CN',
          unit_price: 162.50,
          total_value: 6500.00
        }
      ],
      warnings: [],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'a9b8c7d6-e5f4-3210-fedc-ba9876543210',
      file_name: 'packing_list_hamburg_aejep.pdf',
      status: 'completed',
      extracted_header: {
        declaration_type: 'Import to Local',
        declaration_sub_type: 'Import to Local from Abroad',
        consignee_code: 'AE-9988112',
        consignee_name: 'GULF SUPPLY LOGISTICS DMCC',
        shipper_name: 'DEUTSCHE LOGISTIK GMBH',
        shipper_country: 'Germany',
        commercial_invoice_no: 'PL-99281-DE',
        invoice_date: '2026-06-28',
        invoice_currency: 'EUR',
        total_invoice_value: 14200.00,
        delivery_term: 'FOB',
        freight_charges: 850.00,
        insurance_charges: 90.00,
        port_of_loading: 'DEHAM',
        port_of_discharge: 'AEJEP',
        bill_of_lading_no: 'MSCU881928374'
      },
      extracted_items: [
        {
          item_no: 1,
          hs_code: '8481.80.90',
          goods_description: 'Industrial Safety Valves 2-inch Stainless Steel',
          quantity: 25,
          unit_of_quantity: 'PCS',
          package_type: 'Crate',
          package_quantity: 1,
          net_weight_kg: 320.00,
          gross_weight_kg: 350.00,
          country_of_origin: 'DE',
          unit_price: 568.00,
          total_value: 14200.00
        }
      ],
      warnings: ['Delivery Term is FOB, but Freight Charges were not added on the customs invoice totals page.'],
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialMockData));
}

// Database helper functions
export const db = {
  isMock: isMockMode,
  
  async getDeclarations(): Promise<Declaration[]> {
    if (isMockMode) {
      const data = localStorage.getItem(MOCK_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
    
    const { data, error } = await supabaseClient!
      .from('declarations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  async getDeclaration(id: string): Promise<Declaration | null> {
    if (isMockMode) {
      const declarations = await this.getDeclarations();
      return declarations.find(d => d.id === id) || null;
    }
    
    const { data, error } = await supabaseClient!
      .from('declarations')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async saveDeclaration(declaration: Omit<Declaration, 'created_at' | 'updated_at'>): Promise<Declaration> {
    const timestamp = new Date().toISOString();
    
    if (isMockMode) {
      const declarations = await this.getDeclarations();
      const existingIdx = declarations.findIndex(d => d.id === declaration.id);
      
      const newDeclaration: Declaration = {
        ...declaration,
        created_at: existingIdx >= 0 ? declarations[existingIdx].created_at : timestamp,
        updated_at: timestamp
      };
      
      if (existingIdx >= 0) {
        declarations[existingIdx] = newDeclaration;
      } else {
        declarations.unshift(newDeclaration);
      }
      
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(declarations));
      return newDeclaration;
    }
    
    const { data, error } = await supabaseClient!
      .from('declarations')
      .upsert({
        ...declaration,
        updated_at: timestamp
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async deleteDeclaration(id: string): Promise<void> {
    if (isMockMode) {
      const declarations = await this.getDeclarations();
      const filtered = declarations.filter(d => d.id !== id);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(filtered));
      return;
    }
    
    const { error } = await supabaseClient!
      .from('declarations')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
