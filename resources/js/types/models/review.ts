/**
 * Review Model Type
 */
export interface Review {
  id: number;
  booking_id: number;
  car_id: number;
  user_id: number;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  response: string | null;
  responded_by: number | null;
  responded_at: string | null;
  is_verified_booking: boolean;
  created_at: string;
  updated_at: string;

  // Relationships
  booking?: {
    id: number;
    booking_code: string;
    status: string;
    pickup_datetime: string;
    return_datetime: string;
  };
  car?: {
    id: number;
    name: string;
    model: string;
    license_plate: string;
    brand?: { id: number; name: string };
  };
  user?: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
  responder?: {
    id: number;
    name: string;
    role: string;
  };
}

/**
 * Review Statistics
 */
export interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  average_rating: string;
  by_rating: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

/**
 * Review Filters
 */
export interface ReviewFilters {
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  rating?: 'all' | '1' | '2' | '3' | '4' | '5';
  verified?: 'all' | 'yes' | 'no';
  search?: string;
}
