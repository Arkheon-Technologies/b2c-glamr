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

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
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

export async function fetchServices(search?: string, businessId?: string) {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (businessId) params.set("business_id", businessId);
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
  bbox?: string;
}) {
  const q = new URLSearchParams();
  if (params?.query?.trim()) q.set('query', params.query.trim());
  if (params?.vertical?.trim()) q.set('vertical', params.vertical.trim());
  if (params?.bbox?.trim()) q.set('bbox', params.bbox.trim());
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

// ─── Search ───────────────────────────────────────────────────────────────────

export interface AutocompleteResult {
  businesses: Array<{ id: string; label: string; slug: string; logo_url: string | null; kind: "business" }>;
  services: Array<{ id: string; label: string; vertical: string | null; kind: "service" }>;
  neighborhoods: Array<{ label: string; kind: "neighborhood" }>;
}

export async function searchAutocomplete(q: string): Promise<AutocompleteResult> {
  const params = new URLSearchParams({ q });
  const data = await request<AutocompleteResult>(`/search/autocomplete?${params.toString()}`);
  return data;
}

export interface FeaturedBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  verticals: string[];
  total_bookings: number;
  is_verified: boolean;
  location: { city: string; neighborhood: string | null; countryCode: string } | null;
}

export async function fetchFeatured(): Promise<FeaturedBusiness[]> {
  const data = await request<FeaturedBusiness[]>("/search/featured");
  return data;
}

export interface TrendingQuery {
  slug: string;
  label: string;
  rank: number;
}

export async function fetchTrending(): Promise<TrendingQuery[]> {
  const data = await request<TrendingQuery[]>("/search/trending");
  return data;
}

// ─── Q&A ─────────────────────────────────────────────────────────────────────

export interface QaAnswer {
  id: string;
  staff_id: string;
  answer: string;
  created_at: string;
}

export interface QaThread {
  id: string;
  question: string;
  is_public: boolean;
  created_at: string;
  answers: QaAnswer[];
}

export async function fetchQa(slug: string, limit = 20, offset = 0): Promise<{ threads: QaThread[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const data = await request<{ threads: QaThread[]; total: number }>(`/qa/${slug}?${params.toString()}`);
  return data;
}

export async function askQuestion(slug: string, question: string): Promise<QaThread> {
  const data = await request<{ thread: QaThread }>(`/qa/${slug}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ question }),
  });
  return data.thread;
}

export async function answerQuestion(slug: string, threadId: string, answer: string): Promise<QaAnswer> {
  const data = await request<{ answer: QaAnswer }>(`/qa/${slug}/${threadId}/answer`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ answer }),
  });
  return data.answer;
}

// ─── Add-ons ───────────────────────────────────────────────────────────

export type ServiceAddon = {
  id: string; serviceId: string; name: string; description?: string | null;
  priceCents: number; durationMin: number; isActive: boolean; displayOrder: number;
};

export async function listAddons(serviceId: string): Promise<ServiceAddon[]> {
  const data = await request<{ addons: ServiceAddon[] }>(`/services/${serviceId}/addons`);
  return data.addons;
}

export async function createAddon(serviceId: string, payload: {
  name: string; priceCents: number; durationMin?: number; description?: string;
}): Promise<ServiceAddon> {
  const data = await request<{ addon: ServiceAddon }>(`/services/${serviceId}/addons`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(payload),
  });
  return data.addon;
}

export async function updateAddon(addonId: string, payload: {
  name?: string; priceCents?: number; durationMin?: number; isActive?: boolean; description?: string;
}): Promise<ServiceAddon> {
  const data = await request<{ addon: ServiceAddon }>(`/services/addons/${addonId}`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload),
  });
  return data.addon;
}

export async function deleteAddon(addonId: string): Promise<void> {
  await request<unknown>(`/services/addons/${addonId}`, { method: "DELETE", headers: authHeaders() });
}

// ─── Packages ──────────────────────────────────────────────────────────

export type ServicePackage = {
  id: string; businessId: string; serviceId: string; name: string;
  sessionCount: number; priceCents: number; currency: string;
  validityDays?: number | null; description?: string | null;
  shareable: boolean; isActive: boolean; createdAt: string;
  service?: { id: string; name: string } | null;
};

export async function listPackages(businessId: string): Promise<ServicePackage[]> {
  const data = await request<{ packages: ServicePackage[] }>(`/services/business/${businessId}/packages`);
  return data.packages;
}

export async function createPackage(businessId: string, payload: {
  serviceId: string; name: string; sessionCount: number; priceCents: number;
  validityDays?: number; description?: string; shareable?: boolean; currency?: string;
}): Promise<ServicePackage> {
  const data = await request<{ package: ServicePackage }>(`/services/business/${businessId}/packages`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(payload),
  });
  return data.package;
}

export async function updatePackage(pkgId: string, payload: {
  name?: string; priceCents?: number; sessionCount?: number;
  validityDays?: number; isActive?: boolean; description?: string; shareable?: boolean;
}): Promise<ServicePackage> {
  const data = await request<{ package: ServicePackage }>(`/services/packages/${pkgId}`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload),
  });
  return data.package;
}

// ─── Seasonal / Discount rules ─────────────────────────────────────────

export type DiscountRule = {
  id: string; businessId: string; ruleType: string; name: string;
  isActive: boolean; priority: number; conditions: unknown; discountType: string;
  discountValue: number; validFrom?: string | null; validTo?: string | null;
  maxUses?: number | null; usedCount: number; appliesTo: unknown; createdAt: string;
};

export async function listDiscountRules(businessId: string): Promise<DiscountRule[]> {
  const data = await request<{ rules: DiscountRule[] }>(`/services/business/${businessId}/pricing-rules`);
  return data.rules;
}

export async function createDiscountRule(businessId: string, payload: {
  name: string; ruleType?: string; discountType: "pct" | "flat"; discountValue: number;
  validFrom?: string; validTo?: string; appliesTo?: object;
}): Promise<DiscountRule> {
  const data = await request<{ rule: DiscountRule }>(`/services/business/${businessId}/pricing-rules`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(payload),
  });
  return data.rule;
}

export async function updateDiscountRule(ruleId: string, payload: {
  name?: string; isActive?: boolean; discountValue?: number; validFrom?: string; validTo?: string;
}): Promise<DiscountRule> {
  const data = await request<{ rule: DiscountRule }>(`/services/pricing-rules/${ruleId}`, {
    method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload),
  });
  return data.rule;
}

/** Studio drag-drop reschedule — PATCH /bookings/studio/:id/reschedule */
export async function rescheduleBooking(
  bookingId: string,
  startAt: string,
  notifyClient = false,
  reason?: string,
): Promise<{ id: string; status: string; start_at: string; end_at: string }> {
  const data = await request<{ booking: { id: string; status: string; start_at: string; end_at: string } }>(
    `/bookings/studio/${bookingId}/reschedule`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ start_at: startAt, notify_client: notifyClient, reason }),
    },
  );
  return data.booking;
}

// ─── Messages ──────────────────────────────────────────────────────────────

export type MessageThread = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string | null;
  business_id: string;
  appointment_id: string | null;
  appointment_label: string | null;
  last_message: { body: string | null; sender_kind: string; created_at: string } | null;
  unread: boolean;
  last_message_at: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  body: string | null;
  sender_kind: "customer" | "staff" | "system";
  sender_user_id: string | null;
  read_at: string | null;
  created_at: string;
};

export async function listMessageThreads(businessId: string): Promise<MessageThread[]> {
  const data = await request<{ threads: MessageThread[] }>(`/messages/business/${businessId}`, {
    headers: authHeaders(),
  });
  return data.threads;
}

export async function getMessageThread(threadId: string): Promise<{
  id: string; customer_name: string; appointment_id: string | null; messages: ChatMessage[];
}> {
  const data = await request<{ thread: { id: string; customer_name: string; appointment_id: string | null; messages: ChatMessage[] } }>(
    `/messages/threads/${threadId}`, { headers: authHeaders() },
  );
  return data.thread;
}

export async function sendMessage(threadId: string, body: string): Promise<ChatMessage> {
  const data = await request<{ message: ChatMessage }>(`/messages/threads/${threadId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  });
  return data.message;
}

export async function createMessageThread(businessId: string, customerId: string, appointmentId?: string): Promise<{ id: string }> {
  const data = await request<{ thread: { id: string } }>(`/messages/business/${businessId}/threads`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ customer_id: customerId, appointment_id: appointmentId }),
  });
  return data.thread;
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export type AnalyticsPeriod = "7d" | "30d" | "month" | "last_month";

export type AnalyticsSummary = {
  revenue_cents: number;
  revenue_change_pct: number | null;
  bookings: number;
  bookings_change_pct: number | null;
  new_clients: number;
  retention_pct: number;
  unique_clients: number;
  period: { from: string; to: string };
};

export async function getAnalyticsSummary(businessId: string, period: AnalyticsPeriod = "30d"): Promise<AnalyticsSummary> {
  const data = await request<AnalyticsSummary>(`/analytics/business/${businessId}/summary?period=${period}`, {
    headers: authHeaders(),
  });
  return data;
}

export async function getAnalyticsRevenueSeries(businessId: string, period: AnalyticsPeriod = "30d"): Promise<{ date: string; value: number }[]> {
  const data = await request<{ series: { date: string; value: number }[] }>(
    `/analytics/business/${businessId}/revenue-series?period=${period}`,
    { headers: authHeaders() },
  );
  return data.series;
}

export async function getAnalyticsTopServices(businessId: string, period: AnalyticsPeriod = "30d"): Promise<{ name: string; bookings: number; revenue_cents: number }[]> {
  const data = await request<{ services: { name: string; bookings: number; revenue_cents: number }[] }>(
    `/analytics/business/${businessId}/top-services?period=${period}`,
    { headers: authHeaders() },
  );
  return data.services;
}

export async function getAnalyticsPeakHours(businessId: string, period: AnalyticsPeriod = "30d"): Promise<{ heatmap: number[][]; days: string[]; hours: string[] }> {
  const data = await request<{ heatmap: number[][]; days: string[]; hours: string[] }>(
    `/analytics/business/${businessId}/peak-hours?period=${period}`,
    { headers: authHeaders() },
  );
  return data;
}

// ─── Feed / Inspiration ───────────────────────────────────────────────────────

export type FeedPost = {
  id: string;
  hero_photo_url: string | null;
  caption: string | null;
  category: string | null;
  like_count: number;
  save_count: number;
  comment_count: number;
  published_at: string;
  liked_by_me: boolean;
  saved_by_me?: boolean;
  business: { id: string; name: string; slug: string } | null;
  staff: { id: string; displayName: string; avatarUrl: string | null } | null;
};

export async function listFeedPosts(params?: {
  category?: string;
  mode?: "for_you" | "following" | "all";
  limit?: number;
  offset?: number;
}): Promise<{ posts: FeedPost[]; meta: { total: number; limit: number; offset: number } }> {
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.mode) q.set("mode", params.mode);
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  const path = q.size ? `/feed?${q.toString()}` : "/feed";
  const data = await request<{ posts: FeedPost[]; meta: { total: number; limit: number; offset: number } }>(
    path,
    { headers: authHeaders() },
  );
  return data;
}

export async function getFeedCategories(): Promise<string[]> {
  const data = await request<{ categories: string[] }>("/feed/categories");
  return data.categories;
}

export async function toggleFeedLike(postId: string): Promise<{ liked: boolean; like_count: number }> {
  const data = await request<{ liked: boolean; like_count: number }>(`/feed/${postId}/like`, {
    method: "POST",
    headers: authHeaders(),
  });
  return data;
}

export async function saveFeedPost(postId: string): Promise<{ saved: boolean; collection_id: string }> {
  const data = await request<{ saved: boolean; collection_id: string }>(`/feed/${postId}/save`, {
    method: "POST",
    headers: authHeaders(),
  });
  return data;
}

export async function followStaff(staffId: string): Promise<{ following: boolean }> {
  const data = await request<{ following: boolean }>(`/feed/follow/${staffId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  return data;
}

// ─── Marketing ────────────────────────────────────────────────────────────────

export type Campaign = {
  id: string;
  businessId: string;
  name: string;
  segment: unknown;
  channels: string[];
  scheduledAt: string | null;
  sentAt: string | null;
  status: string;
  createdAt: string;
};

export type MessageTemplate = {
  id: string;
  businessId: string;
  kind: string;
  subject: string | null;
  bodyEmail: string | null;
  bodySms: string | null;
  updatedAt: string;
};

export async function listCampaigns(businessId: string): Promise<Campaign[]> {
  const data = await request<{ campaigns: Campaign[] }>(
    `/marketing/business/${businessId}/campaigns`,
    { headers: authHeaders() },
  );
  return data.campaigns;
}

export async function createCampaign(businessId: string, payload: {
  name: string; segment?: object; channels?: string[]; scheduled_at?: string;
}): Promise<Campaign> {
  const data = await request<{ campaign: Campaign }>(
    `/marketing/business/${businessId}/campaigns`,
    { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) },
  );
  return data.campaign;
}

export async function updateCampaign(campaignId: string, payload: {
  name?: string; status?: string; scheduled_at?: string | null;
}): Promise<Campaign> {
  const data = await request<{ campaign: Campaign }>(
    `/marketing/campaigns/${campaignId}`,
    { method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload) },
  );
  return data.campaign;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await request<unknown>(`/marketing/campaigns/${campaignId}`, {
    method: "DELETE", headers: authHeaders(),
  });
}

export async function listTemplates(businessId: string): Promise<MessageTemplate[]> {
  const data = await request<{ templates: MessageTemplate[] }>(
    `/marketing/business/${businessId}/templates`,
    { headers: authHeaders() },
  );
  return data.templates;
}

export async function upsertTemplate(businessId: string, kind: string, payload: {
  subject?: string; body_email?: string; body_sms?: string;
}): Promise<MessageTemplate> {
  const data = await request<{ template: MessageTemplate }>(
    `/marketing/business/${businessId}/templates/${kind}`,
    { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) },
  );
  return data.template;
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export type WebhookEndpoint = {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  createdAt: string;
};

export type WebhookDelivery = {
  id: string | number;
  event: string;
  statusCode: number | null;
  attempt: number;
  deliveredAt: string | null;
  createdAt: string;
};

export async function listWebhooks(businessId: string): Promise<WebhookEndpoint[]> {
  const data = await request<{ webhooks: WebhookEndpoint[] }>(
    `/webhooks/business/${businessId}`,
    { headers: authHeaders() },
  );
  return data.webhooks;
}

export async function createWebhook(businessId: string, payload: {
  url: string; events: string[];
}): Promise<WebhookEndpoint> {
  const data = await request<{ webhook: WebhookEndpoint }>(
    `/webhooks/business/${businessId}`,
    { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) },
  );
  return data.webhook;
}

export async function updateWebhook(webhookId: string, payload: {
  url?: string; events?: string[]; active?: boolean;
}): Promise<WebhookEndpoint> {
  const data = await request<{ webhook: WebhookEndpoint }>(
    `/webhooks/${webhookId}`,
    { method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload) },
  );
  return data.webhook;
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await request<unknown>(`/webhooks/${webhookId}`, { method: "DELETE", headers: authHeaders() });
}

export async function listWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
  const data = await request<{ deliveries: WebhookDelivery[] }>(
    `/webhooks/${webhookId}/deliveries`,
    { headers: authHeaders() },
  );
  return data.deliveries;
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export type IntegrationStatus = {
  provider: string;
  connected: boolean;
  connectedAt: string | null;
  config: unknown;
};

export async function listIntegrations(businessId: string): Promise<IntegrationStatus[]> {
  const data = await request<{ integrations: IntegrationStatus[] }>(
    `/integrations/business/${businessId}`,
    { headers: authHeaders() },
  );
  return data.integrations;
}

export async function connectIntegration(businessId: string, provider: string, payload?: {
  config?: object; tokens?: object;
}): Promise<{ id: string; provider: string; connectedAt: string }> {
  const data = await request<{ connection: { id: string; provider: string; connectedAt: string } }>(
    `/integrations/business/${businessId}/${provider}/connect`,
    { method: "POST", headers: authHeaders(), body: JSON.stringify(payload ?? {}) },
  );
  return data.connection;
}

export async function disconnectIntegration(businessId: string, provider: string): Promise<void> {
  await request<unknown>(`/integrations/business/${businessId}/${provider}`, {
    method: "DELETE", headers: authHeaders(),
  });
}

// ─── QR Code ─────────────────────────────────────────────────────────────────

/**
 * Returns the URL of a QR code image that can be used as an <img src>.
 * The QR code encodes the given URL and is served by the API.
 */
export function getQrCodeUrl(params: {
  url: string;
  format?: "svg" | "png";
  size?: number;
}): string {
  const q = new URLSearchParams({ url: params.url });
  if (params.format) q.set("format", params.format);
  if (params.size) q.set("size", String(params.size));
  return `${apiBaseUrl}/qr?${q.toString()}`;
}