// ─── Beauty Verticals ──────────────────────────────────────────────
export const BEAUTY_VERTICALS = [
  'hair',
  'barbershop',
  'nails',
  'cosmetology',
  'brows',
  'laser',
  'body_treatments',
  'medical_aesthetics',
  'massage',
  'micropigmentation',
  'lashes',
  'makeup',
  'other',
] as const;

export type BeautyVertical = (typeof BEAUTY_VERTICALS)[number];

// ─── Business Types ────────────────────────────────────────────────
export type BusinessType = 'solo' | 'studio' | 'chain';
export type PlanTier = 'solo_artist' | 'studio' | 'salon_chain';
export type BookingMode = 'instant' | 'manual_approval';

// ─── Staff Roles ───────────────────────────────────────────────────
export type StaffRole = 'technician' | 'receptionist' | 'manager';

// ─── Service Types ─────────────────────────────────────────────────
export type PriceType = 'fixed' | 'range' | 'from' | 'on_consultation';
export type PriceDisplayMode = 'always_visible' | 'on_consultation' | 'range_only';

// ─── Appointment Types ─────────────────────────────────────────────
export type AppointmentStatus =
  | 'pending_approval'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_business'
  | 'no_show';

export type AppointmentPhase = 'active' | 'processing' | 'finish';

export type BookingSource =
  | 'marketplace'
  | 'widget'
  | 'direct'
  | 'walk_in'
  | 'receptionist';

// ─── Walk-In Queue ─────────────────────────────────────────────────
export type QueueStatus =
  | 'waiting'
  | 'notified'
  | 'serving'
  | 'served'
  | 'cancelled'
  | 'no_show';

// ─── Reviews ───────────────────────────────────────────────────────
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

// ─── Payments ──────────────────────────────────────────────────────
export type PaymentType =
  | 'deposit'
  | 'full'
  | 'package_purchase'
  | 'no_show_charge'
  | 'travel_fee'
  | 'cash';

export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// ─── Auth ──────────────────────────────────────────────────────────
export type AuthProvider = 'email' | 'google' | 'apple' | 'magic_link';

// ─── Slot Types ────────────────────────────────────────────────────
export interface SlotPhase {
  phase: AppointmentPhase;
  startAt: string;
  endAt: string;
  technicianRequired: boolean;
}

export interface AvailableSlot {
  staffId: string;
  staffName: string;
  startAt: string;
  endAt: string;
  phases: SlotPhase[];
  priceCents: number;
  currency: string;
  discount?: {
    label: string;
    originalPriceCents: number;
    savingsCents: number;
  };
  available: boolean;
}

// ─── API Response Envelope ─────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    cursor?: string;
  };
}
