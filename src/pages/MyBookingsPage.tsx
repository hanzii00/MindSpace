import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Loader2, AlertCircle, XCircle, TicketCheck, Ban, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchMyBookings, cancelBooking, fromApiTime } from "@/services/bookingService";
import type { Booking } from "@/services/bookingService";

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "confirmed" | "cancelled" | "completed";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    icon: TicketCheck,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary border-primary/20",
  },
} as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

const BookingCard = ({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (booking: Booking) => void;
}) => {
  const statusCfg = STATUS_CONFIG[booking.status];
  const StatusIcon = statusCfg.icon;
  const isConfirmed = booking.status === "confirmed";

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">
                {booking.seat_detail?.space_name ?? "—"} &mdash; Seat {booking.seat_detail?.name ?? booking.seat}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                {format(new Date(booking.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                {fromApiTime(booking.start_time)} → {fromApiTime(booking.end_time)}
              </span>
            </div>
            {booking.notes && (
              <p className="text-xs text-muted-foreground italic mt-1 truncate">
                "{booking.notes}"
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <span className="text-lg font-bold text-foreground">
              ₱{parseFloat(booking.total_price).toFixed(2)}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
              statusCfg.className
            )}>
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </span>
            {isConfirmed && (
              <button
                onClick={() => onCancel(booking)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ filter }: { filter: StatusFilter }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <TicketCheck className="h-7 w-7 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">No bookings found</h3>
    <p className="text-sm text-muted-foreground mb-6">
      {filter === "all"
        ? "You haven't made any bookings yet."
        : `You have no ${filter} bookings.`}
    </p>
    <Link to="/book">
      <Button>Book a Seat</Button>
    </Link>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [cancelTarget, setCancelTarget] = useState<Booking>();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    fetchMyBookings(filter === "all" ? undefined : filter)
      .then(setBookings)
      .catch(() => setError("Failed to load bookings. Please refresh."))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTarget.id ? { ...b, status: "cancelled" as const } : b
        )
      );
    } catch {
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
      setCancelTarget(undefined);
    }
  };

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex-1 pt-28 pb-24 container mx-auto px-6 max-w-3xl">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-1">My Bookings</h1>
            <p className="text-muted-foreground text-sm">Track and manage your reservations.</p>
          </div>
          <Link to="/book">
            <Button size="sm">+ New Booking</Button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 w-fit">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                filter === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-6">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading bookings…
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Cancel confirmation dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && (
                <>
                  Seat {cancelTarget.seat_detail?.name} on{" "}
                  {format(new Date(cancelTarget.date + "T00:00:00"), "MMMM d, yyyy")},{" "}
                  {fromApiTime(cancelTarget.start_time)} → {fromApiTime(cancelTarget.end_time)}.
                  <br /><br />
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {cancelling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cancelling…</> : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyBookingsPage;