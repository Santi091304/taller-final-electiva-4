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

export interface CheckoutOrderPayload {
  order_number: string;
  // Paso 1: Identificación
  client_email: string;
  client_first_name: string;
  client_last_name: string;
  document_type: string;
  document_number: string;
  client_phone: string;
  accepted_terms: boolean;
  subscribed_newsletter: boolean;
  // Paso 2: Envío
  city: string;
  shipping_address: string;
  address_details?: string;
  delivery_method: 'express' | 'programado' | 'sede';
  // Paso 3: Pago y Resumen Financiero
  payment_method: string;
  coupon_code?: string | null;
  subtotal_cop: number;
  shipping_cop: number;
  discount_cop: number;
  total_amount_cop: number;
  items: Array<{
    product_id: string;
    product_name: string;
    selected_size: string;
    selected_color_name: string;
    selected_color_hex: string;
    quantity: number;
    unit_price_cop: number;
  }>;
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
 * Persist complete Checkout order (Identification, Shipping, Payment, Items & Coupon)
 * Supports extended Supabase schema with graceful fallback to base columns.
 */
export async function saveCheckoutOrderToSupabase(payload: CheckoutOrderPayload) {
  const config = getSupabaseConfig();
  const fullName = `${payload.client_first_name} ${payload.client_last_name}`.trim();
  const itemsSummary = payload.items
    .map(it => `${it.quantity}x ${it.product_name} (${it.selected_size}, ${it.selected_color_name})`)
    .join(' | ');

  if (!config.isConfigured) {
    console.info('[Supabase] Modo local activo. Orden registrada:', payload.order_number);
    return { data: { ...payload, id: payload.order_number }, error: null, synced: false };
  }

  try {
    // Try inserting with extended schema columns (identification, delivery, coupon, payment, items)
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_number: payload.order_number,
          client_name: fullName,
          client_email: payload.client_email,
          client_phone: payload.client_phone,
          document_type: payload.document_type,
          document_number: payload.document_number,
          shipping_address: payload.address_details
            ? `${payload.shipping_address} (${payload.address_details})`
            : payload.shipping_address,
          city: payload.city,
          delivery_method: payload.delivery_method,
          payment_method: payload.payment_method,
          coupon_code: payload.coupon_code || null,
          subtotal_cop: payload.subtotal_cop,
          shipping_cop: payload.shipping_cop,
          discount_cop: payload.discount_cop,
          total_amount_cop: payload.total_amount_cop,
          items_summary: itemsSummary,
          items_json: payload.items,
          accepted_terms: payload.accepted_terms,
          subscribed_newsletter: payload.subscribed_newsletter,
          status: 'preparando',
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      // Fallback to base schema if extended columns aren't created yet
      const fallbackResult = await saveOrderToSupabase({
        order_number: payload.order_number,
        client_name: fullName,
        client_email: payload.client_email,
        shipping_address: `${payload.shipping_address}${payload.address_details ? ` - ${payload.address_details}` : ''} | Tel: ${payload.client_phone} | Doc: ${payload.document_type} ${payload.document_number}`,
        city: payload.city,
        status: 'preparando',
        items_summary: `${itemsSummary} [Pago: ${payload.payment_method}${payload.coupon_code ? `, Cupón: ${payload.coupon_code}` : ''}]`,
        total_amount_cop: payload.total_amount_cop,
      });

      return { data: fallbackResult.data, error: fallbackResult.error, synced: !fallbackResult.error };
    }

    // Also attempt inserting line items into 'order_items' if table exists
    if (data && data[0]?.id) {
      supabase
        .from('order_items')
        .insert(
          payload.items.map(item => ({
            order_id: data[0].id,
            order_number: payload.order_number,
            product_id: item.product_id,
            product_name: item.product_name,
            size_label: item.selected_size,
            color_name: item.selected_color_name,
            color_hex: item.selected_color_hex,
            quantity: item.quantity,
            unit_price_cop: item.unit_price_cop,
          }))
        )
        .then(() => {});
    }

    return { data, error: null, synced: true };
  } catch (err: any) {
    console.error('[Supabase saveCheckoutOrder error]:', err);
    return { data: null, error: err, synced: false };
  }
}

/**
 * Validate discount coupon against Supabase ('coupons' table) with built-in promo codes
 */
export async function validateCouponInSupabase(code: string): Promise<{
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  label: string;
}> {
  const normalized = code.trim().toUpperCase();
  const config = getSupabaseConfig();

  if (config.isConfigured) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', normalized)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        return {
          valid: true,
          code: normalized,
          discountType: data.discount_type || 'percentage',
          value: Number(data.discount_value || 10),
          label: data.description || `Cupón ${normalized} aplicado`,
        };
      }
    } catch {
      // Fallback to built-in coupons
    }
  }

  // Built-in promotional coupons for immediate testing
  if (normalized === 'PINTUKO10') {
    return { valid: true, code: normalized, discountType: 'percentage', value: 10, label: '10% de descuento en pinturas' };
  }
  if (normalized === 'PRO15') {
    return { valid: true, code: normalized, discountType: 'percentage', value: 15, label: '15% de descuento Profesional' };
  }
  if (normalized === 'BIENVENIDO20') {
    return { valid: true, code: normalized, discountType: 'fixed', value: 20000, label: '$ 20.000,00 COP de descuento' };
  }
  if (normalized === 'ENVIOGRATIS') {
    return { valid: true, code: normalized, discountType: 'free_shipping', value: 0, label: 'Envío Express sin costo' };
  }

  return { valid: false, code: normalized, discountType: 'percentage', value: 0, label: 'Cupón inválido o expirado' };
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

