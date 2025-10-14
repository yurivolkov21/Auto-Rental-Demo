import type { User, Location, Car, DriverProfile, Promotion } from '../index';

/**
 * Booking Model
 *
 * Represents a car rental booking with all pricing, delivery, and driver details.
 */
export interface Booking {
  id: number;
  booking_code: string; // Unique code (e.g., "BK-2025-001234")

  // Relationships
  user_id: number;
  owner_id: number;
  car_id: number;
  confirmed_by: number | null;
  cancelled_by: number | null;
  pickup_location_id: number;
  return_location_id: number;

  // Rental Period
  pickup_datetime: string;
  return_datetime: string;
  actual_pickup_time: string | null;
  actual_return_time: string | null;

  // Pricing Snapshots (captured at booking time)
  hourly_rate: string; // decimal(10,2)
  daily_rate: string; // decimal(10,2)
  daily_hour_threshold: number;
  deposit_amount: string; // decimal(10,2)

  // Driver Service
  with_driver: boolean;
  driver_profile_id: number | null;
  driver_hourly_fee: string | null; // decimal(10,2)
  driver_daily_fee: string | null; // decimal(10,2)
  total_driver_hours: number;
  driver_notes: string | null;

  // Delivery Service
  is_delivery: boolean;
  delivery_address: string | null;
  delivery_distance: string | null; // decimal(10,2)
  delivery_fee_per_km: string | null; // decimal(10,2)

  // Status & Lifecycle
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  confirmed_at: string | null;
  cancelled_at: string | null;

  // Notes & Reasons
  special_requests: string | null;
  admin_notes: string | null;
  cancellation_reason: string | null;

  created_at: string;
  updated_at: string;

  // Relationships
  user?: User;
  owner?: User;
  car?: Car;
  confirmed_by_user?: User;
  cancelled_by_user?: User;
  pickup_location?: Location;
  return_location?: Location;
  driver_profile?: DriverProfile;
  charge?: BookingCharge;
  promotions?: BookingPromotion[];
}

/**
 * Booking Charge Model
 *
 * Represents all financial calculations and payment tracking for a booking.
 */
export interface BookingCharge {
  id: number;
  booking_id: number;

  // Rental Duration
  total_hours: number;
  total_days: number;

  // Car Rental Charges
  hourly_rate: string | null; // decimal(10,2)
  daily_rate: string | null; // decimal(10,2)
  base_amount: string; // decimal(10,2)

  // Additional Charges
  delivery_fee: string; // decimal(10,2)
  driver_fee_amount: string; // decimal(10,2)
  insurance_fee: string; // decimal(10,2)
  extra_fee: string; // decimal(10,2)
  extra_fee_details: ExtraFeeDetails | null;

  // Discounts & Promotions
  discount_amount: string; // decimal(10,2)

  // Financial Calculation
  subtotal: string; // decimal(10,2)
  vat_amount: string; // decimal(10,2)
  total_amount: string; // decimal(10,2)

  // Payment Tracking
  deposit_amount: string; // decimal(10,2)
  amount_paid: string; // decimal(10,2)
  balance_due: string; // decimal(10,2)
  refund_amount: string; // decimal(10,2)

  created_at: string;
  updated_at: string;

  // Relationships
  booking?: Booking;
}

/**
 * Booking Promotion Model
 *
 * Represents a promotion applied to a booking.
 */
export interface BookingPromotion {
  id: number;
  booking_id: number;
  promotion_id: number;
  applied_by: number | null;

  // Promotion Snapshot
  promotion_code: string;
  discount_amount: string; // decimal(10,2)
  promotion_details: PromotionDetails | null;

  applied_at: string;
  created_at: string;
  updated_at: string;

  // Relationships
  booking?: Booking;
  promotion?: Promotion;
  applied_by_user?: User;
}

/**
 * Booking with all relationships loaded
 */
export interface BookingWithRelations extends Booking {
  user: User;
  owner: User;
  car: Car;
  confirmed_by_user?: User;
  cancelled_by_user?: User;
  pickup_location: Location;
  return_location: Location;
  driver_profile?: DriverProfile;
  charge: BookingCharge;
  promotions: BookingPromotion[];
}

/**
 * Extra fee details breakdown
 */
export interface ExtraFeeDetails {
  overtime?: number;
  cleaning?: number;
  damage?: number;
  fuel?: number;
  [key: string]: number | undefined;
}

/**
 * Promotion details snapshot
 */
export interface PromotionDetails {
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: string;
  max_discount?: string | null;
  min_amount?: string;
  [key: string]: unknown;
}

/**
 * Booking filters for listing/search
 */
export interface BookingFilters {
  status: 'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  with_driver: 'all' | 'yes' | 'no';
  with_delivery: 'all' | 'yes' | 'no';
  date_from?: string;
  date_to?: string;
  search: string;
}

/**
 * Booking statistics
 */
export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  active: number;
  completed: number;
  cancelled: number;
  rejected: number;
  with_driver: number;
  with_delivery: number;
  total_revenue: string; // decimal(12,2)
}

/**
 * Booking form data for creation/update
 */
export interface BookingFormData {
  car_id: number;
  pickup_location_id: number;
  return_location_id: number;
  pickup_datetime: string;
  return_datetime: string;
  with_driver: boolean;
  driver_profile_id?: number | null;
  is_delivery: boolean;
  delivery_address?: string | null;
  special_requests?: string | null;
  promotion_code?: string | null;
}

/**
 * Pricing breakdown for preview/calculation
 */
export interface PricingBreakdown {
  // Rental calculation
  total_hours: number;
  total_days: number;
  base_amount: string;

  // Additional services
  delivery_fee: string;
  driver_fee_amount: string;
  insurance_fee: string;

  // Discounts
  discount_amount: string;
  promotion_code?: string | null;

  // Financial totals
  subtotal: string;
  vat_amount: string;
  total_amount: string;
  deposit_amount: string;
  balance_due: string;
}
