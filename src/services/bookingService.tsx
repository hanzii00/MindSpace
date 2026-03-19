import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Space {
  id: number;
  name: string;
  address: string;
  description: string;
  is_active: boolean;
  seat_count: number;
  available_seats: number;
}

export interface Seat {
  id: number;
  name: string;
  label?: string;
  is_active: boolean;
  price_per_hour: string;
  space: number;
  space_name?: string;
  seat_type?: string;
  capacity?: number;
}

export interface Booking {
  id: number;
  user: number;
  user_email: string;
  seat: number;
  seat_detail: Seat & { space_name: string };
  date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled" | "completed";
  total_price: string;
  notes: string;
  created_at: string;
}

export interface CreateBookingPayload {
  seat: number;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export interface Analytics {
  summary: {
    total_bookings: number;
    confirmed_bookings: number;
    cancelled_bookings: number;
    total_revenue: number;
    total_seats: number;
  };
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  billing_cycle: "monthly" | "yearly";
  hours_per_month: number;
  is_active: boolean;
  created_at: string;
}

export interface UserMembership {
  id: number;
  user: number;
  user_email: string;
  plan: number;
  plan_detail: MembershipPlan;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  created_at: string;
}

// ── Spaces ────────────────────────────────────────────────────────────────────

export const fetchSpaces = async (): Promise<Space[]> => {
  const { data } = await api.get<PaginatedResponse<Space>>("/api/spaces/?page_size=50");
  return data.results;
};

// ── Seats ─────────────────────────────────────────────────────────────────────

export const fetchSeatsBySpace = async (spaceId: number): Promise<Seat[]> => {
  const { data } = await api.get<PaginatedResponse<Seat>>(
    `/api/seats/?space=${spaceId}&is_active=true&page_size=100`
  );
  return data.results;
};

export const fetchAdminSeats = async (): Promise<Seat[]> => {
  const { data } = await api.get<PaginatedResponse<Seat>>("/api/admin/seats/?page_size=200");
  return data.results;
};

export const fetchAvailableSeats = async (
  date: string,
  startTime: string,
  endTime: string
): Promise<number[]> => {
  const { data } = await api.get<Seat[]>(
    `/api/available-seats/?date=${date}&start_time=${startTime}&end_time=${endTime}`
  );
  return data.map((s) => s.id);
};

// ── Bookings ──────────────────────────────────────────────────────────────────

export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  const { data } = await api.post<Booking>("/api/bookings/", payload);
  return data;
};

export const fetchMyBookings = async (status?: string): Promise<Booking[]> => {
  const params = status ? `?status=${status}` : "";
  const { data } = await api.get<PaginatedResponse<Booking>>(`/api/my-bookings/${params}`);
  return data.results;
};

export const cancelBooking = async (bookingId: number): Promise<void> => {
  await api.delete(`/api/bookings/${bookingId}/`);
};

// ── Admin Bookings ────────────────────────────────────────────────────────────

export const fetchAdminBookings = async (status?: string): Promise<Booking[]> => {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  const { data } = await api.get<PaginatedResponse<Booking>>(`/api/admin/bookings/?${params}`);
  return data.results;
};

export const cancelAdminBooking = async (bookingId: number): Promise<void> => {
  await api.delete(`/api/admin/bookings/${bookingId}/`);
};

// ── Admin Users ───────────────────────────────────────────────────────────────

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await api.get<PaginatedResponse<AdminUser>>("/api/auth/admin/users/");
  return data.results;
};

// ── Analytics ─────────────────────────────────────────────────────────────────

export const fetchAnalytics = async (): Promise<Analytics> => {
  const { data } = await api.get<Analytics>("/api/admin/analytics/");
  return data;
};

// ── Memberships ───────────────────────────────────────────────────────────────

export const fetchMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const { data } = await api.get<PaginatedResponse<MembershipPlan>>("/api/memberships/");
  return data.results;
};

export const fetchMyMembership = async (): Promise<UserMembership> => {
  const { data } = await api.get<UserMembership>("/api/my-membership/");
  return data;
};

export const subscribeToPlan = async (planId: number): Promise<UserMembership> => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 1);
  const { data } = await api.post<UserMembership>("/api/memberships/subscribe/", {
    plan: planId,
    start_date: today.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
  });
  return data;
};

export const cancelMembership = async (): Promise<void> => {
  await api.post("/api/memberships/cancel/");
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const toApiTime = (displayTime: string): string => {
  const [time, meridiem] = displayTime.split(" ");
  const [rawHour, rawMin] = time.split(":");
  let hour = parseInt(rawHour, 10);
  if (meridiem === "AM" && hour === 12) hour = 0;
  if (meridiem === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${rawMin}`;
};

export const fromApiTime = (apiTime: string): string => {
  const [h, m] = apiTime.split(":").map(Number);
  const meridiem = h < 12 ? "AM" : "PM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${meridiem}`;
};
export const fetchAdminMemberships = async (): Promise<UserMembership[]> => {
  const { data } = await api.get<PaginatedResponse<UserMembership>>("/api/admin/memberships/users/");
  return data.results;
};