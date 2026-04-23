const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

interface ErrorEnvelope {
  ok?: false;
  error?: {
    message?: string;
  };
}

interface SuccessEnvelope<T> {
  ok?: true;
  data?: T;
}

function readAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem('glamr.auth.session');
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { access_token?: string };
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit | undefined {
  const accessToken = readAccessToken();

  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => undefined)) as
    | ErrorEnvelope
    | SuccessEnvelope<T>
    | undefined;

  const data =
    payload && "data" in payload
      ? (payload.data as T | undefined)
      : undefined;
  const errorMessage =
    payload && "error" in payload
      ? payload.error?.message
      : undefined;

  if (!response.ok || payload?.ok === false || !data) {
    throw new Error(errorMessage || "Request failed. Please try again.");
  }

  return data;
}

// ─── Extended booking record for detail view ────────────────────────────────

export interface BookingDetail {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
  service: {
    id: string;
    name: string;
    price_cents: number | null;
    currency: string;
    duration_active_min: number;
    duration_processing_min: number;
    duration_finish_min: number;
  } | null;
  staff: { id: string; display_name: string } | null;
  business: { id: string; name: string; slug: string } | null;
  location: { city: string; address: string | null } | null;
}

export interface BookingSummary {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  service: { id: string; name: string; price_cents: number | null; currency: string } | null;
  staff: { id: string; display_name: string } | null;
  business: { id: string; name: string; slug: string } | null;
  location: { city: string; address: string | null } | null;
}

// ─── User profile types ──────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  referral_code: string | null;
  total_bookings: number;
}

// ─── Business profile type ───────────────────────────────────────────────────

export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  about: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  is_verified: boolean;
  total_bookings: number;
  location: { city: string; neighborhood: string | null; countryCode: string } | null;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price_cents: number | null;
    price_max_cents: number | null;
    currency: string;
    duration_active_min: number;
    duration_processing_min: number;
    duration_finish_min: number;
    vertical: { slug: string; name: string } | null;
  }>;
  staff: Array<{
    id: string;
    display_name: string;
    role: string;
    avg_rating: number | null;
  }>;
}

export interface ServiceListItem {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  currency: string;
  price_type: string;
  price_cents: number | null;
  price_max_cents: number | null;
  duration_active_min: number;
  duration_processing_min: number;
  duration_finish_min: number;
  vertical: {
    slug: string;
    name: string;
  } | null;
  business: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ServiceDetails {
  id: string;
  business_id: string;
  location_id: string | null;
  name: string;
  description: string | null;
  currency: string;
  price_type: string;
  price_cents: number | null;
  price_max_cents: number | null;
  duration_active_min: number;
  duration_processing_min: number;
  duration_finish_min: number;
  patch_test_required: boolean;
  consultation_required: boolean;
  booking_notice_hours: number;
  rebooking_interval_days: number | null;
  photo_urls: string[];
  business: {
    id: string;
    name: string;
    slug: string;
    isVerified: boolean;
  };
  staff: Array<{
    id: string;
    displayName: string;
    isActive: boolean;
  }>;
}

export interface AvailableSlot {
  staffId: string;
  staffName: string;
  startAt: string;
  endAt: string;
  phases: Array<{
    phase: "active" | "processing" | "finish";
    startAt: string;
    endAt: string;
    technicianRequired: boolean;
  }>;
  priceCents: number;
  currency: string;
  available: boolean;
}

export interface BookingRecord {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string;
  customer_id: string | null;
  start_at: string;
  end_at: string;
  status: string;
}

export type QueueStatus =
  | "waiting"
  | "notified"
  | "serving"
  | "served"
  | "cancelled"
  | "no_show";

export interface QueueEntry {
  id: string;
  business_id: string;
  location_id: string;
  customer_name: string;
  phone: string | null;
  customer_id: string | null;
  service_id: string | null;
  service_name: string | null;
  staff_preference: string | null;
  position: number;
  estimated_wait_min: number | null;
  joined_at: string;
  notified_at: string | null;
  served_at: string | null;
  status: QueueStatus;
}

export interface PortfolioListItem {
  id: string;
  business_id: string;
  technician_id: string;
  service_vertical: string | null;
  service_name: string | null;
  tags: string[];
  consent_type: string;
  is_watermarked: boolean;
  is_published: boolean;
  view_count: number;
  book_tap_count: number;
  created_at: string;
  image_urls: {
    before: string | null;
    after: string | null;
    healed: string | null;
    before_thumb: string | null;
    after_thumb: string | null;
    watermarked_after: string | null;
    primary: string | null;
  };
  technician: {
    id: string;
    display_name: string;
    slug: string | null;
    avatar_url: string | null;
    avg_rating: number | null;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    is_verified: boolean;
  };
}

export type PortfolioUploadVariant =
  | 'before'
  | 'after'
  | 'healed'
  | 'before_thumb'
  | 'after_thumb'
  | 'watermarked_after';

export interface PortfolioUploadIntent {
  upload_url: string;
  method: 'PUT';
  asset_url: string;
  asset_key: string;
  expires_in: number;
  required_headers: Record<string, string>;
}

export async function fetchServices(search?: string) {
  const params = new URLSearchParams();
  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const path = params.size ? `/services?${params.toString()}` : "/services";
  const data = await request<{ services: ServiceListItem[] }>(path);
  return data.services;
}

export async function fetchPortfolio(params?: {
  business_id?: string;
  technician_id?: string;
  vertical?: string;
  tag?: string;
  search?: string;
  limit?: number;
  include_unpublished?: boolean;
}) {
  const query = new URLSearchParams();

  if (params?.business_id?.trim()) {
    query.set('business_id', params.business_id.trim());
  }

  if (params?.technician_id?.trim()) {
    query.set('technician_id', params.technician_id.trim());
  }

  if (params?.vertical?.trim()) {
    query.set('vertical', params.vertical.trim());
  }

  if (params?.tag?.trim()) {
    query.set('tag', params.tag.trim());
  }

  if (params?.search?.trim()) {
    query.set('search', params.search.trim());
  }

  if (params?.limit != null) {
    query.set('limit', String(params.limit));
  }

  if (params?.include_unpublished != null) {
    query.set('include_unpublished', String(params.include_unpublished));
  }

  const path = query.size ? `/portfolio?${query.toString()}` : '/portfolio';
  const data = await request<{ items: PortfolioListItem[] }>(path);
  return data.items;
}

export async function createPortfolioItem(payload: {
  business_id: string;
  technician_id: string;
  appointment_id?: string;
  before_url?: string;
  after_url: string;
  healed_url?: string;
  before_thumb_url?: string;
  after_thumb_url?: string;
  service_vertical?: string;
  service_name?: string;
  tags?: string[];
  consent_type?: string;
  is_published?: boolean;
  is_watermarked?: boolean;
  watermarked_after_url?: string;
}) {
  const data = await request<{ item: PortfolioListItem }>('/portfolio', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return data.item;
}

export async function createPortfolioUploadIntent(payload: {
  business_id: string;
  file_name: string;
  content_type: string;
  variant: PortfolioUploadVariant;
}) {
  const data = await request<{ upload: PortfolioUploadIntent }>('/portfolio/uploads/presign', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return data.upload;
}

export async function uploadFileToPresignedUrl(
  intent: PortfolioUploadIntent,
  file: File,
) {
  const headers = new Headers(intent.required_headers ?? {});
  if (!headers.has('Content-Type') && file.type) {
    headers.set('Content-Type', file.type);
  }

  const response = await fetch(intent.upload_url, {
    method: intent.method,
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error('Upload failed while transferring image to storage');
  }

  return intent.asset_url;
}

export async function updatePortfolioPublishState(
  itemId: string,
  isPublished: boolean,
) {
  const data = await request<{ item: PortfolioListItem }>(`/portfolio/${itemId}/publish`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ is_published: isPublished }),
  });

  return data.item;
}

export async function trackPortfolioBookTap(itemId: string) {
  const data = await request<{ tracked: boolean; item_id: string; book_tap_count: number }>(
    `/portfolio/${itemId}/book-tap`,
    {
      method: 'POST',
    },
  );

  return data;
}

export async function fetchServiceById(serviceId: string) {
  const data = await request<{ service: ServiceDetails }>(`/services/${serviceId}`);
  return data.service;
}

export async function fetchAvailability(serviceId: string, date: string) {
  const params = new URLSearchParams({
    service_id: serviceId,
    date,
  });

  const data = await request<{
    service_id: string;
    service_name: string;
    date: string;
    slots: AvailableSlot[];
  }>(`/scheduling/availability?${params.toString()}`);

  return data.slots;
}

export async function createBooking(payload: {
  service_id: string;
  staff_id: string;
  start_at: string;
}) {
  const data = await request<{ booking: BookingRecord }>("/bookings", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return data.booking;
}

export async function listQueueEntries(params: {
  business_id: string;
  location_id?: string;
  status?: QueueStatus;
}) {
  const query = new URLSearchParams({ business_id: params.business_id });

  if (params.location_id?.trim()) {
    query.set("location_id", params.location_id.trim());
  }

  if (params.status) {
    query.set("status", params.status);
  }

  const data = await request<{ entries: QueueEntry[] }>(`/queue?${query.toString()}`);
  return data.entries;
}

export async function joinQueue(payload: {
  business_id: string;
  location_id?: string;
  customer_name: string;
  phone?: string;
  customer_id?: string;
  service_id?: string;
  staff_preference?: string;
}) {
  const data = await request<{ entry: QueueEntry }>("/queue/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data.entry;
}

export async function updateQueueEntryStatus(entryId: string, status: QueueStatus) {
  const data = await request<{ entry: QueueEntry }>(`/queue/${entryId}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });

  return data.entry;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getMe() {
  const data = await request<{ user: UserProfile }>("/users/me", {
    headers: authHeaders(),
  });
  return data.user;
}

export async function updateMe(payload: { fullName?: string }) {
  const data = await request<{ user: { id: string; email: string; name: string } }>("/users/me", {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.user;
}

// ─── My bookings ──────────────────────────────────────────────────────────────

export async function getMyBookings(status?: "upcoming" | "past" | "all") {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const path = params.size ? `/bookings?${params.toString()}` : "/bookings";
  const data = await request<{ bookings: BookingSummary[] }>(path, {
    headers: authHeaders(),
  });
  return data.bookings;
}

export async function getBookingById(id: string) {
  const data = await request<{ booking: BookingDetail }>(`/bookings/${id}`, {
    headers: authHeaders(),
  });
  return data.booking;
}

export async function cancelBookingById(id: string, reason?: string) {
  const data = await request<{ booking: BookingRecord }>(`/bookings/${id}/cancel`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reason }),
  });
  return data.booking;
}

export async function updateBookingStatus(id: string, status: string) {
  const data = await request<{ booking: BookingSummary }>(`/bookings/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return data.booking;
}

// ─── Business public profile ──────────────────────────────────────────────────

export async function fetchBusinessProfile(slug: string) {
  const data = await request<{ business: BusinessProfile }>(`/businesses/${slug}/profile`);
  return data.business;
}

// ─── Business reviews ─────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  rating_overall: number;
  rating_skill: number | null;
  rating_clean: number | null;
  rating_value: number | null;
  text: string | null;
  photo_urls: string[];
  is_verified: boolean;
  business_response: string | null;
  business_response_at: string | null;
  created_at: string;
  customer_name: string;
  customer_avatar: string | null;
  technician_name: string;
  service_name: string | null;
}

export interface ReviewsSummary {
  total_reviews: number;
  avg_overall: number;
  avg_skill: number;
  avg_clean: number;
  avg_value: number;
}

export async function fetchBusinessReviews(slug: string, limit = 20, offset = 0) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const data = await request<{ reviews: ReviewItem[]; summary: ReviewsSummary }>(
    `/reviews/business/${slug}?${params.toString()}`
  );
  return data;
}

// ─── Discover businesses ──────────────────────────────────────────────────────

export interface DiscoverBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  verticals: string[];
  plan_tier: string;
  is_verified: boolean;
  total_bookings: number;
  logo_url: string | null;
  cover_image_url: string | null;
  location: { city: string; neighborhood: string | null; countryCode: string } | null;
  services_count: number;
  staff_count: number;
}

export async function discoverBusinesses(params?: {
  query?: string;
  vertical?: string;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.query?.trim()) q.set('query', params.query.trim());
  if (params?.vertical?.trim()) q.set('vertical', params.vertical.trim());
  if (params?.limit) q.set('limit', String(params.limit));
  const path = q.size ? `/businesses/discover?${q.toString()}` : '/businesses/discover';
  const data = await request<{ businesses: DiscoverBusiness[] }>(path);
  return data.businesses;
}

// ─── Business management (studio) ────────────────────────────────────────────

export interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  about: string | null;
  logo_url: string | null;
  is_verified: boolean;
  total_bookings: number;
}

export async function createBusiness(payload: {
  name: string;
  businessType: string;
  about?: string;
  address: { line1: string; city: string; countryCode: string; timezone: string; latitude?: number; longitude?: number };
  verticalIds?: string[];
}) {
  const data = await request<{ business: BusinessSummary }>("/businesses", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.business;
}

export async function getBusinessById(id: string) {
  const data = await request<{ business: BusinessSummary }>(`/businesses/${id}`);
  return data.business;
}

export async function updateBusiness(id: string, payload: { name?: string; about?: string; logoUrl?: string }) {
  const data = await request<{ business: BusinessSummary }>(`/businesses/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.business;
}

export async function getBusinessBookings(businessId: string, status?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const path = params.size ? `/businesses/${businessId}/bookings?${params.toString()}` : `/businesses/${businessId}/bookings`;
  const data = await request<{ bookings: BookingSummary[] }>(path, {
    headers: authHeaders(),
  });
  return data.bookings;
}

export interface ClientSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  visits: number;
  last_visit: string;
  lifetime_cents: number;
}

export async function getBusinessClients(businessId: string) {
  const data = await request<{ clients: ClientSummary[] }>(`/businesses/${businessId}/clients`, {
    headers: authHeaders(),
  });
  return data.clients;
}

// ─── Services management (studio) ────────────────────────────────────────────

export async function createService(payload: {
  businessId: string;
  name: string;
  durationActiveMin: number;
  durationProcessingMin?: number;
  durationFinishMin?: number;
  priceCents: number;
  currency: string;
  verticalId?: string;
  description?: string;
}) {
  const data = await request<{ service: ServiceListItem }>("/services", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.service;
}

export async function updateService(id: string, payload: {
  name?: string;
  durationActiveMin?: number;
  priceCents?: number;
  description?: string;
  isActive?: boolean;
}) {
  const data = await request<{ service: ServiceListItem }>(`/services/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.service;
}

export async function deleteService(id: string) {
  const data = await request<{ deleted: boolean }>(`/services/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return data;
}

export async function assignStaffToService(serviceId: string, staffIds: string[]) {
  const data = await request<{ assigned: number }>(`/services/${serviceId}/staff`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ staffIds }),
  });
  return data;
}

// ─── Staff management (studio) ───────────────────────────────────────────────

export interface StaffMember {
  id: string;
  displayName: string;
  role: string;
  isActive: boolean;
  email?: string | null;
}

export async function listStaff(businessId: string) {
  const data = await request<{ staff: StaffMember[] }>(`/staff?businessId=${businessId}`, {
    headers: authHeaders(),
  });
  return data.staff;
}

export async function createStaff(payload: {
  businessId: string;
  displayName: string;
  role: string;
  email?: string;
}) {
  const data = await request<{ staff: StaffMember }>("/staff", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.staff;
}

export async function updateStaff(id: string, payload: {
  displayName?: string;
  role?: string;
  isActive?: boolean;
}) {
  const data = await request<{ staff: StaffMember }>(`/staff/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.staff;
}

// ─── Scheduling (studio) ─────────────────────────────────────────────────────

export interface ScheduleDay {
  staffId: string;
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export async function getStaffSchedule(staffId: string) {
  const data = await request<{ schedule: ScheduleDay[] }>(`/scheduling/schedules/${staffId}`, {
    headers: authHeaders(),
  });
  return data.schedule;
}

export async function setStaffScheduleDay(payload: {
  staffId: string;
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}) {
  const data = await request<{ schedule: ScheduleDay }>("/scheduling/schedules", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return data.schedule;
}