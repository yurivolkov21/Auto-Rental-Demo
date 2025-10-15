/**
 * Payment Model Type
 */
export interface Payment {
  id: number;
  transaction_id: string;
  booking_id: number;
  user_id: number;
  payment_method: 'paypal' | 'credit_card' | 'bank_transfer' | 'cash' | 'wallet';
  payment_type: 'deposit' | 'full_payment' | 'partial' | 'refund';
  amount: string; // Legacy field (deprecated)
  amount_vnd: string; // Primary amount in VND
  amount_usd: string; // Amount in USD
  exchange_rate: string; // Exchange rate at payment time
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paypal_order_id: string | null;
  paypal_payer_id: string | null;
  paypal_payer_email: string | null;
  paypal_response: Record<string, unknown> | null;
  notes: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relationships
  booking?: {
    id: number;
    booking_code: string;
    car?: { id: number; name: string };
    user?: { id: number; name: string; email: string };
    pickup_location?: { id: number; name: string };
    return_location?: { id: number; name: string };
    charge?: Record<string, unknown>;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

/**
 * PayPal Order Response
 */
export interface PayPalOrderResponse {
  success: boolean;
  order_id?: string;
  approval_url?: string;
  status?: string;
  message?: string;
}

/**
 * PayPal Capture Response
 */
export interface PayPalCaptureResponse {
  success: boolean;
  payment_id?: number;
  transaction_id?: string;
  status?: string;
  amount?: number;
  payer_email?: string;
  message?: string;
}
