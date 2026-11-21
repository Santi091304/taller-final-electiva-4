import { createClient } from '@supabase/supabase-js';

// Public publishable key for browser client (safe under Supabase RLS; never store secret/SMTP keys in frontend)
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_06AtvMldHs9-ReuGPx9-SA_cOGkp3rL';

export const getSupabaseConfig = () => {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  const envKey = (
    (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const isPlaceholderUrl =
    !envUrl ||
    envUrl.includes('your-project-ref') ||
    envUrl.includes('TU_PROJECT_REF') ||
    envUrl.includes('placeholder');

  const supabaseKey = envKey || DEFAULT_PUBLISHABLE_KEY;

  const isConfigured = Boolean(
    !isPlaceholderUrl &&
      envUrl.startsWith('https://') &&
      supabaseKey &&
      !supabaseKey.startsWith('sb_secret_')
  );

  // Use a safe non-routing fallback URL only to prevent createClient from throwing during initial module load
  // when VITE_SUPABASE_URL has not been set yet; all auth/DB helpers block calls when isConfigured is false.
  const supabaseUrl = isConfigured ? envUrl : 'https://unconfigured-project.supabase.co';

  return {
    supabaseUrl,
    supabaseKey,
    isConfigured,
  };
};

const initialConfig = getSupabaseConfig();

// Create Supabase Client instance with persistent auth session handling
export const supabase = createClient(initialConfig.supabaseUrl, initialConfig.supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Translate Supabase Auth / Network errors into clear, actionable Spanish messages.
 */
export function translateSupabaseAuthError(err: unknown): string {
  const rawMessage =
    typeof err === 'string'
      ? err
      : (err as { message?: string })?.message || 'Error desconocido de autenticación.';
  const msg = rawMessage.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado. Ingresa el código de 6 dígitos o solicita un reenvío.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
  }
  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('token has expired') || msg.includes('otp_expired')) {
    return 'El código de verificación ha expirado o ya fue utilizado. Solicita un nuevo código.';
  }
  if (msg.includes('invalid token') || msg.includes('otp_disabled') || msg.includes('invalid otp')) {
    return 'El código de 6 dígitos es incorrecto. Verifica tu correo electrónico e inténtalo nuevamente.';
  }
  if (
    msg.includes('rate limit') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('security purposes')
  ) {
    return 'Se alcanzó el límite temporal de envíos de correo. Por favor espera unos minutos antes de reintentar.';
  }
  if (
    msg.includes('error sending confirmation email') ||
    msg.includes('error sending') ||
    msg.includes('smtp') ||
    msg.includes('sender')
  ) {
    return 'No se pudo enviar el correo de verificación desde el servidor SMTP (remitente rechazado o error SMTP). Verifica la configuración de Brevo y Supabase.';
  }
  if (msg.includes('unable to validate email address') || msg.includes('invalid email')) {
    return 'El formato del correo electrónico no es válido.';
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network')) {
    return 'No fue posible conectar con Supabase. Verifica tu conexión a internet y la variable VITE_SUPABASE_URL.';
  }

  return rawMessage;
}

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
  id?: string;
  order_number: string;
  client_name: string;
  client_email: string;
  shipping_address: string;
  city: string;
  status: 'preparando' | 'en_camino' | 'entregado';
  items_summary: string;
  total_amount_cop: number;
  created_at?: string;
  user_id?: string;
  payment_method?: string;
  delivery_method?: string;
  items_json?: Array<{
    product_id: string;
    product_name: string;
    selected_size: string;
    selected_color_name: string;
    selected_color_hex: string;
    quantity: number;
    unit_price_cop: number;
  }>;
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
    return {
      data: null,
      error: new Error('VITE_SUPABASE_URL no está configurada. No se pudo guardar la cotización en Supabase.'),
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const record: Record<string, unknown> = {
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
    };

    if (session?.user?.id) {
      record.user_id = session.user.id;
    }

    const { data, error } = await supabase.from('quotes').insert([record]).select();

    if (error && session?.user?.id && error.message?.toLowerCase().includes('user_id')) {
      delete record.user_id;
      const retry = await supabase.from('quotes').insert([record]).select();
      return { data: retry.data, error: retry.error };
    }

    return { data, error };
  } catch (err: unknown) {
    console.error('[Supabase saveQuote error]:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Error de conexión con Supabase') };
  }
}

/**
 * Persist an order to Supabase (table: 'orders')
 */
export async function saveOrderToSupabase(order: OrderRecord) {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return {
      data: null,
      error: new Error('VITE_SUPABASE_URL no está configurada. No se pudo registrar la orden.'),
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        data: null,
        error: new Error('Debes tener una sesión autenticada para registrar un pedido.'),
      };
    }

    const baseRecord: Record<string, unknown> = {
      order_number: order.order_number,
      client_name: order.client_name,
      client_email: order.client_email,
      shipping_address: order.shipping_address,
      city: order.city,
      status: order.status,
      items_summary: order.items_summary,
      total_amount_cop: order.total_amount_cop,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('orders').insert([baseRecord]).select();

    if (error && error.message?.toLowerCase().includes('user_id')) {
      delete baseRecord.user_id;
      const retry = await supabase.from('orders').insert([baseRecord]).select();
      return { data: retry.data, error: retry.error };
    }

    return { data, error };
  } catch (err: unknown) {
    console.error('[Supabase saveOrder error]:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Error al guardar pedido') };
  }
}

/**
 * Persist complete Checkout order (Identification, Shipping, Payment, Items & Coupon).
 * Requires an authenticated Supabase session to respect RLS policies.
 */
export async function saveCheckoutOrderToSupabase(payload: CheckoutOrderPayload) {
  const config = getSupabaseConfig();
  const fullName = `${payload.client_first_name} ${payload.client_last_name}`.trim();
  const itemsSummary = payload.items
    .map((it) => `${it.quantity}x ${it.product_name} (${it.selected_size}, ${it.selected_color_name})`)
    .join(' | ');

  if (!config.isConfigured) {
    return {
      data: null,
      error: new Error('VITE_SUPABASE_URL no está configurada. No se pudo conectar con Supabase para guardar tu pedido.'),
      synced: false,
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        data: null,
        error: new Error('Sesión no autenticada. Inicia sesión con tu correo verificado para confirmar tu compra.'),
        synced: false,
      };
    }

    const extendedRecord: Record<string, unknown> = {
      order_number: payload.order_number,
      user_id: session.user.id,
      client_name: fullName,
      client_email: session.user.email || payload.client_email,
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
    };

    const { data, error } = await supabase.from('orders').insert([extendedRecord]).select();

    if (error) {
      // Only fall back to base columns if the failure is due to schema column mismatch, NOT RLS/auth failures
      const errMsg = error.message?.toLowerCase() || '';
      const isSchemaColumnError = errMsg.includes('column') && errMsg.includes('does not exist');

      if (!isSchemaColumnError) {
        return { data: null, error, synced: false };
      }

      const fallbackResult = await saveOrderToSupabase({
        order_number: payload.order_number,
        client_name: fullName,
        client_email: session.user.email || payload.client_email,
        shipping_address: `${payload.shipping_address}${payload.address_details ? ` - ${payload.address_details}` : ''} | Tel: ${payload.client_phone} | Doc: ${payload.document_type} ${payload.document_number}`,
        city: payload.city,
        status: 'preparando',
        items_summary: `${itemsSummary} [Pago: ${payload.payment_method}${payload.coupon_code ? `, Cupón: ${payload.coupon_code}` : ''}]`,
        total_amount_cop: payload.total_amount_cop,
      });

      return {
        data: fallbackResult.data,
        error: fallbackResult.error,
        synced: !fallbackResult.error,
      };
    }

    if (data && data[0]?.id) {
      await supabase.from('order_items').insert(
        payload.items.map((item) => ({
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
      );
    }

    return { data, error: null, synced: true };
  } catch (err: unknown) {
    console.error('[Supabase saveCheckoutOrder error]:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Error de conexión con Supabase'),
      synced: false,
    };
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
 * Fetch orders belonging to the authenticated user session.
 */
export async function fetchUserOrdersFromSupabase(): Promise<{
  data: OrderRecord[];
  error: Error | null;
}> {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return {
      data: [],
      error: new Error('VITE_SUPABASE_URL no está configurada.'),
    };
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        data: [],
        error: new Error('Sesión no autenticada.'),
      };
    }

    const userEmail = session.user.email || '';
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data as OrderRecord[]) || [], error: null };
  } catch (err: unknown) {
    console.error('[Supabase fetchOrders error]:', err);
    return {
      data: [],
      error: err instanceof Error ? err : new Error('Error al consultar tus pedidos'),
    };
  }
}
