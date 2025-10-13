import type { User, UserVerification } from '../index';

/**
 * Driver Profile Model
 *
 * Represents driver-specific business logic and performance data.
 * Linked to a User with role='driver'.
 */
export interface DriverProfile {
  id: number;
  user_id: number;
  owner_id: number | null;

  // Pricing Configuration
  hourly_fee: string; // decimal(10,2)
  daily_fee: string; // decimal(10,2)
  overtime_fee_per_hour: string; // decimal(10,2)
  daily_hour_threshold: number; // tinyint

  // Availability & Status
  status: 'available' | 'on_duty' | 'off_duty' | 'suspended';
  working_hours: WorkingHours | null; // {"mon": "8-18", "tue": "8-18", ...}
  is_available_for_booking: boolean;

  // Performance Metrics
  completed_trips: number;
  average_rating: string | null; // decimal(3,2)
  total_km_driven: number;
  total_hours_driven: number;

  created_at: string;
  updated_at: string;

  // Relationships
  user?: User;
  owner?: User;
  verification?: UserVerification;
}

/**
 * Driver Profile with nested relationships
 */
export interface DriverProfileWithRelations extends DriverProfile {
  user: User;
  owner?: User;
  verification?: UserVerification;
}

/**
 * Working hours format
 */
export interface WorkingHours {
  mon?: string; // "8-18" or "off"
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}
