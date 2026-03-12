import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Check, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM",
];

const spaceTypes = [
  { id: "open", name: "Open Study", seats: 40, price: "₱50/hr" },
  { id: "quiet", name: "Quiet Zone", seats: 20, price: "₱50/hr" },
  { id: "huddle5", name: "Huddle Room (5 pax)", seats: 5, price: "₱280/hr" },
  { id: "huddle8", name: "Huddle Room (8 pax)", seats: 8, price: "₱485/hr" },
];

const generateSeats = (type: string, total: number) => {
  return Array.from({ length: total }, (_, i) => ({
    id: `${type}-${i + 1}`,
    label: `${type.charAt(0).toUpperCase()}${i + 1}`,
    available: true,
  }));
};

const allSeats: Record<string, ReturnType<typeof generateSeats>> = Object.fromEntries(
  spaceTypes.map((s) => [s.id, generateSeats(s.id, s.seats)])
);

const BookingPage = () => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSpace, setSelectedSpace] = useState<string>();
  const [selectedSeat, setSelectedSeat] = useState<string>();
  const [confirmed, setConfirmed] = useState(false);

  const currentSpace = spaceTypes.find((s) => s.id === selectedSpace);
  const seats = selectedSpace ? allSeats[selectedSpace] : [];

  const canConfirm = date && selectedTime && selectedSpace && selectedSeat;

  const handleConfirm = () => setConfirmed(true);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 container mx-auto px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display text-foreground mb-4">Booking Confirmed!</h1>
            <Card className="bg-card border-border shadow-soft text-left">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-card-foreground">{date && format(date, "PPP")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-card-foreground">{selectedTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-card-foreground">{currentSpace?.name} — Seat {selectedSeat?.split("-")[1]}</span>
                </div>
              </CardContent>
            </Card>
            <Link to="/">
              <Button variant="outline" className="mt-6">Back to Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-24 container mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-2">Book a Seat</h1>
        <p className="text-muted-foreground mb-10">Select your date, time, and preferred space.</p>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: Date & Time */}
          <div className="space-y-8">
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
                    onSelect={setDate}
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-3 block">Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={cn(
                      "text-xs py-2 px-1 rounded-lg border transition-all font-medium",
                      selectedTime === slot
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-card-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Space Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Space Type</label>
            <div className="space-y-3">
              {spaceTypes.map((space) => (
                <button
                  key={space.id}
                  onClick={() => { setSelectedSpace(space.id); setSelectedSeat(undefined); }}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedSpace === space.id
                      ? "bg-primary/5 border-primary shadow-soft"
                      : "bg-card border-border hover:border-primary/40"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm text-card-foreground">{space.name}</h3>
                    <span className="text-xs font-medium text-primary">{space.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{space.seats} seats</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Seat Grid */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">
              {selectedSpace ? `Select a Seat — ${currentSpace?.name}` : "Select a space first"}
            </label>
            {selectedSpace ? (
              <div className="grid grid-cols-5 gap-2">
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    disabled={!seat.available}
                    onClick={() => setSelectedSeat(seat.id)}
                    className={cn(
                      "aspect-square rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                      !seat.available && "bg-muted text-muted-foreground/40 cursor-not-allowed",
                      seat.available && selectedSeat !== seat.id && "bg-card border border-border text-card-foreground hover:border-primary/50",
                      selectedSeat === seat.id && "bg-primary text-primary-foreground"
                    )}
                  >
                    {seat.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-48 rounded-xl border border-dashed border-border flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Choose a space type to see seats</p>
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-card border border-border" />Available</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" />Selected</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-muted" />Taken</div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button size="lg" disabled={!canConfirm} onClick={handleConfirm} className="min-w-[200px]">
            Confirm Booking
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;