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

// Alias export so Auth components can import { supabase }
// When in mock mode, provide a stub with auth methods that do nothing
export const supabase = !isMockMode && supabaseClient
  ? supabaseClient
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async (_opts: any) => { throw new Error('not configured'); },
        signOut: async () => {},
        onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    } as any;

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

// LocalStorage mock implementation — starts empty for every new user/browser
const MOCK_STORAGE_KEY = 'smart_handling_declarations';

// Database helper functions
export const db = {
  isMock: isMockMode,
  
  async getDeclarations(): Promise<Declaration[]> {
    if (isMockMode) {
      const data = localStorage.getItem(MOCK_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabaseClient!
      .from('declarations')
      .select('*')
      .eq('user_id', user.id)
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
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabaseClient!
      .from('declarations')
      .upsert({
        ...declaration,
        user_id: user?.id || null,
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
  },

  async deleteAccountAndLog(email: string, name: string): Promise<void> {
    if (isMockMode) {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      return;
    }

    // 1. Insert deletion log
    const { error: logError } = await supabaseClient!
      .from('deletion_logs')
      .insert({
        user_email: email,
        user_name: name
      });
    if (logError) console.error('Failed to log deletion:', logError);

    // 2. Delete all declarations for current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: deleteError } = await supabaseClient!
        .from('declarations')
        .delete()
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
    }
  }
};
