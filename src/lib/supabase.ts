import { createClient } from '@supabase/supabase-js';

// Configuration parameters
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_06AtvMldHs9-ReuGPx9-SA_cOGkp3rL';

// Retrieve configuration from Vite environment variables or localStorage override
export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  
  // Also check stored project ref or URL if user sets it dynamically in the session
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('pintuko_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('pintuko_supabase_key') : null;

  const supabaseUrl = storedUrl || envUrl || 'https://your-project-ref.supabase.co';
  const supabaseKey = storedKey || envKey || DEFAULT_PUBLISHABLE_KEY;

  const isConfigured = Boolean(
    supabaseUrl && 
    !supabaseUrl.includes('your-project-ref') && 
    supabaseUrl.startsWith('https://')
  );

  return {
    supabaseUrl,
    supabaseKey,
    isConfigured,
  };
};

const initialConfig = getSupabaseConfig();

// Create Supabase Client instance
export const supabase = createClient(initialConfig.supabaseUrl, initialConfig.supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const updateSupabaseUrl = (newUrl: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pintuko_supabase_url', newUrl);
    window.location.reload();
  }
};

// Database helper functions for PINTUKO PRO
export interface QuoteRecord {
  client_name: string;
  client_email: string;
  client_phone: string;
  city: string;
  service_type: string;
  total_area_m2?: number;
  estimated_gallons?: number;
  total_estimate_cop: number;
  notes?: string;
  created_at?: string;
}

export interface OrderRecord {
  order_number: string;
  client_name: string;
  client_email: string;
  shipping_address: string;
  city: string;
  status: 'preparando' | 'en_camino' | 'entregado';
  items_summary: string;
  total_amount_cop: number;
  created_at?: string;
}

/**
 * Persist a quotation to Supabase (table: 'quotes')
 */
export async function saveQuoteToSupabase(quote: QuoteRecord) {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    console.warn('[Supabase] VITE_SUPABASE_URL not fully configured yet. Saved in local fallback state.');
    return { data: null, error: new Error('SUPABASE_URL_NOT_CONFIGURED') };
  }

  try {
    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          client_name: quote.client_name,
          client_email: quote.client_email,
          client_phone: quote.client_phone,
          city: quote.city,
          service_type: quote.service_type,
          total_area_m2: quote.total_area_m2 || 0,
          estimated_gallons: quote.estimated_gallons || 0,
          total_estimate_cop: quote.total_estimate_cop,
          notes: quote.notes || '',
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    return { data, error };
  } catch (err: any) {
    console.error('[Supabase saveQuote error]:', err);
    return { data: null, error: err };
  }
}

/**
 * Persist an order to Supabase (table: 'orders')
 */
export async function saveOrderToSupabase(order: OrderRecord) {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return { data: null, error: new Error('SUPABASE_URL_NOT_CONFIGURED') };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_number: order.order_number,
          client_name: order.client_name,
          client_email: order.client_email,
          shipping_address: order.shipping_address,
          city: order.city,
          status: order.status,
          items_summary: order.items_summary,
          total_amount_cop: order.total_amount_cop,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    return { data, error };
  } catch (err: any) {
    console.error('[Supabase saveOrder error]:', err);
    return { data: null, error: err };
  }
}

/**
 * Fetch orders for a user email
 */
export async function fetchUserOrdersFromSupabase(email: string) {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_email', email)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (err) {
    console.error('[Supabase fetchOrders error]:', err);
    return { data: [], error: err };
  }
}
