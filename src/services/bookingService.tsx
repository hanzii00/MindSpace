import { api } from "@/lib/api"; // ← adjust this path to match where your axios instance lives

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
  description: string;
  capacity: number;
}

export interface Seat {
  id: number;
  name: string;
  label: string;
  is_active: boolean;
  price_per_hour: string; // DecimalField comes back as string
  space: number;
  space_name?: string;
}

export interface Booking {
  id: number;
  user: number;
  user_email: string;
  seat: number;
  seat_detail: Seat & { space_name: string };
  date: string;           // "YYYY-MM-DD"
  start_time: string;     // "HH:MM:SS"
  end_time: string;       // "HH:MM:SS"
  status: "confirmed" | "cancelled" | "completed";
  total_price: string;
  notes: string;
  created_at: string;
}

export interface CreateBookingPayload {
  seat: number;
  date: string;       // "YYYY-MM-DD"
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  notes?: string;
}

// ── Spaces ────────────────────────────────────────────────────────────────────

export const fetchSpaces = async (): Promise<Space[]> => {
  const { data } = await api.get<PaginatedResponse<Space>>("/api/spaces/");
  return data.results;
};

// ── Seats ─────────────────────────────────────────────────────────────────────

export const fetchSeatsBySpace = async (spaceId: number): Promise<Seat[]> => {
  const { data } = await api.get<PaginatedResponse<Seat>>(
    `/api/seats/?space=${spaceId}&is_active=true`
  );
  return data.results;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert display label like "9:00 AM" → "09:00" for the backend.
 */
export const toApiTime = (displayTime: string): string => {
  const [time, meridiem] = displayTime.split(" ");
  const [rawHour, rawMin] = time.split(":");
  let hour = parseInt(rawHour, 10);
  if (meridiem === "AM" && hour === 12) hour = 0;
  if (meridiem === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${rawMin}`;
};

/**
 * Format "HH:MM:SS" from the API back to a readable "9:00 AM" label.
 */
export const fromApiTime = (apiTime: string): string => {
  const [h, m] = apiTime.split(":").map(Number);
  const meridiem = h < 12 ? "AM" : "PM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${meridiem}`;
};
export interface Space {
  id: number;
  name: string;
  address: string;
  description: string;
  is_active: boolean;
}