import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Check, Clock, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchSpaces,
  fetchSeatsBySpace,
  createBooking,
  toApiTime,
  fromApiTime,
  type Space,
  type Seat,
  type Booking,
} from "@/services/bookingService";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM",
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const ConfirmationView = ({
  booking,
  onBookAnother,
}: {
  booking: Booking;
  onBookAnother: () => void;
}) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-32 pb-24 container mx-auto px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-display text-foreground mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Booking #{booking.id} · ₱{parseFloat(booking.total_price).toFixed(2)} total
        </p>
        <Card className="bg-card border-border shadow-soft text-left">
          <CardContent className="p-6 space-y-4">
            <DetailRow icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}>
              {format(new Date(booking.date + "T00:00:00"), "PPP")}
            </DetailRow>
            <DetailRow icon={<Clock className="h-4 w-4 text-muted-foreground" />}>
              {fromApiTime(booking.start_time)} → {fromApiTime(booking.end_time)}
            </DetailRow>
            <DetailRow icon={<MapPin className="h-4 w-4 text-muted-foreground" />}>
              {booking.seat_detail?.space_name} — Seat {booking.seat_detail?.name}
            </DetailRow>
          </CardContent>
        </Card>
        <div className="flex gap-3 mt-6 justify-center">
          <Button variant="outline" onClick={onBookAnother}>Book Another</Button>
          <Link to="/my-bookings">
            <Button>View My Bookings</Button>
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

const DetailRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-sm">
    {icon}
    <span className="text-card-foreground">{children}</span>
  </div>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const BookingPage = () => {
  // ── Selection state ──────────────────────────────────────────────────────────
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [selectedSpace, setSelectedSpace] = useState<Space>();
  const [selectedSeat, setSelectedSeat] = useState<Seat>();
  const [notes, setNotes] = useState("");

  // ── Server data ──────────────────────────────────────────────────────────────
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<number>>(new Set());

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking>();
  const [error, setError] = useState<string>();

  // ── Fetch spaces on mount ────────────────────────────────────────────────────
  useEffect(() => {
    fetchSpaces()
      .then(setSpaces)
      .catch(() => setError("Failed to load spaces. Please refresh."))
      .finally(() => setLoadingSpaces(false));
  }, []);

  // ── Fetch seats when space changes ───────────────────────────────────────────
  useEffect(() => {
    if (!selectedSpace) { setSeats([]); return; }
    setLoadingSeats(true);
    setSelectedSeat(undefined);
    setBookedSeatIds(new Set());
    fetchSeatsBySpace(selectedSpace.id)
      .then(setSeats)
      .catch(() => setError("Failed to load seats for this space."))
      .finally(() => setLoadingSeats(false));
  }, [selectedSpace]);

  // ── When date + time window changes, you could fetch availability here ───────
  // (Omitted: extend with a GET /api/seats/availability/?space=X&date=Y&start=Z&end=W
  //  endpoint if your backend supports it, then populate bookedSeatIds.)

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const endTimeOptions = startTime
    ? TIME_SLOTS.filter((t) => TIME_SLOTS.indexOf(t) > TIME_SLOTS.indexOf(startTime))
    : [];

  const canConfirm =
    date && startTime && endTime && selectedSpace && selectedSeat && !submitting;

  const reset = () => {
    setDate(undefined);
    setStartTime(undefined);
    setEndTime(undefined);
    setSelectedSpace(undefined);
    setSelectedSeat(undefined);
    setNotes("");
    setError(undefined);
    setConfirmedBooking(undefined);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const booking = await createBooking({
        seat: selectedSeat!.id,
        date: format(date!, "yyyy-MM-dd"),
        start_time: toApiTime(startTime!),
        end_time: toApiTime(endTime!),
        notes,
      });
      setConfirmedBooking(booking);
    } catch (err: any) {
      const detail = err?.response?.data;
      if (typeof detail === "string") {
        setError(detail);
      } else if (detail?.seat) {
        setError(Array.isArray(detail.seat) ? detail.seat[0] : detail.seat);
      } else if (detail?.end_time) {
        setError(detail.end_time[0]);
      } else if (detail?.date) {
        setError(detail.date[0]);
      } else if (detail?.non_field_errors) {
        setError(detail.non_field_errors[0]);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmed state ──────────────────────────────────────────────────────────
  if (confirmedBooking) {
    return <ConfirmationView booking={confirmedBooking} onBookAnother={reset} />;
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-24 container mx-auto px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-2">Book a Seat</h1>
        <p className="text-muted-foreground mb-10">
          Select your date, time window, and preferred space.
        </p>

        {error && <div className="mb-6 max-w-md"><ErrorBanner message={error} /></div>}

        <div className="grid lg:grid-cols-3 gap-10">

          {/* ── Column 1: Date & Time ─────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Date picker */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setStartTime(undefined); setEndTime(undefined); }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Start time */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">Start Time</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.slice(0, -1).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => { setStartTime(slot); setEndTime(undefined); }}
                    className={cn(
                      "text-xs py-2 px-1 rounded-lg border transition-all font-medium",
                      startTime === slot
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-card-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* End time — only shown after a start is selected */}
            {startTime && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">End Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {endTimeOptions.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setEndTime(slot)}
                      className={cn(
                        "text-xs py-2 px-1 rounded-lg border transition-all font-medium",
                        endTime === slot
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-card-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional notes */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Notes <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Any special requirements?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* ── Column 2: Space Type ──────────────────────────────────────── */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Space Type</label>
            {loadingSpaces ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading spaces…
              </div>
            ) : (
              <div className="space-y-3">
                {spaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => setSelectedSpace(space)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      selectedSpace?.id === space.id
                        ? "bg-primary/5 border-primary shadow-soft"
                        : "bg-card border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-sm text-card-foreground">{space.name}</h3>
                      <span className="text-xs font-medium text-primary">
                        {space.capacity} seats
                      </span>
                    </div>
                    {space.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{space.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Column 3: Seat Grid ───────────────────────────────────────── */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">
              {selectedSpace ? `Select a Seat — ${selectedSpace.name}` : "Select a space first"}
            </label>

            {loadingSeats ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading seats…
              </div>
            ) : selectedSpace ? (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {seats.map((seat) => {
                    const isTaken = bookedSeatIds.has(seat.id) || !seat.is_active;
                    const isSelected = selectedSeat?.id === seat.id;
                    return (
                      <button
                        key={seat.id}
                        disabled={isTaken}
                        onClick={() => setSelectedSeat(seat)}
                        title={`₱${seat.price_per_hour}/hr`}
                        className={cn(
                          "aspect-square rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                          isTaken && "bg-muted text-muted-foreground/40 cursor-not-allowed",
                          !isTaken && !isSelected && "bg-card border border-border text-card-foreground hover:border-primary/50",
                          isSelected && "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        )}
                      >
                        {seat.name}
                      </button>
                    );
                  })}
                </div>

                {/* Price hint */}
                {selectedSeat && startTime && endTime && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    ₱{selectedSeat.price_per_hour}/hr ·{" "}
                    {(() => {
                      const startIdx = TIME_SLOTS.indexOf(startTime);
                      const endIdx = TIME_SLOTS.indexOf(endTime);
                      const hrs = endIdx - startIdx;
                      const total = (parseFloat(selectedSeat.price_per_hour) * hrs).toFixed(2);
                      return `${hrs}h = ₱${total} estimated`;
                    })()}
                  </p>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-card border border-border" />Available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-primary" />Selected
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-muted" />Taken
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 rounded-xl border border-dashed border-border flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Choose a space type to see seats</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Confirm bar ─────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between gap-4">
          {/* Summary */}
          <div className="text-sm text-muted-foreground hidden sm:block">
            {date && startTime && endTime && selectedSeat ? (
              <>
                {format(date, "MMM d")} · {startTime} → {endTime} ·{" "}
                <span className="text-foreground font-medium">{selectedSpace?.name}, Seat {selectedSeat.name}</span>
              </>
            ) : (
              "Complete all steps above to confirm."
            )}
          </div>

          <Button
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="min-w-[200px] ml-auto"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking…</>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;