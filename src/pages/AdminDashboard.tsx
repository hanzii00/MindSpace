import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Users, CalendarCheck, LayoutDashboard,
  LogOut, TrendingUp, Clock, CheckCircle, XCircle,
  Loader2, Trash2, Search, AlertCircle, MapPin, Crown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminBookings, cancelAdminBooking,
  fetchAdminUsers, fetchAnalytics,
  fetchSpaces, fetchAdminSeats,
  fetchAdminMemberships,
} from "@/services/bookingService";
import type { Booking, AdminUser, Analytics, Space, Seat, UserMembership } from "@/services/bookingService";

type NavLabel = "Dashboard" | "Bookings" | "Users" | "Spaces" | "Memberships";

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  confirmed: "text-green-600 bg-green-500/10",
  cancelled: "text-red-500 bg-red-500/10",
  completed: "text-blue-500 bg-blue-500/10",
};

const membershipStatusStyles: Record<string, string> = {
  active: "text-green-600 bg-green-500/10",
  cancelled: "text-red-500 bg-red-500/10",
  expired: "text-muted-foreground bg-muted",
};

const StatusIcon = ({ status }: { status: string }) =>
  status === "confirmed" ? <CheckCircle className="h-3.5 w-3.5" /> :
  status === "cancelled" ? <XCircle className="h-3.5 w-3.5" /> :
  <Clock className="h-3.5 w-3.5" />;

const fromApiTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const meridiem = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(m).padStart(2, "0")} ${meridiem}`;
};

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
    <AlertCircle className="h-4 w-4 shrink-0" /> {message}
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-48">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const SearchInput = ({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

// ── Dashboard Panel ───────────────────────────────────────────────────────────

const DashboardPanel = ({ analytics, bookings, loading, error }: {
  analytics: Analytics | null;
  bookings: Booking[];
  loading: boolean;
  error: string;
}) => {
  const stats = analytics ? [
    { label: "Total Bookings", value: analytics.summary.total_bookings, change: `${analytics.summary.confirmed_bookings} confirmed`, icon: CalendarCheck, color: "text-blue-500 bg-blue-500/10" },
    { label: "Total Seats", value: analytics.summary.total_seats, change: "active seats", icon: Users, color: "text-green-500 bg-green-500/10" },
    { label: "Total Revenue", value: `₱${analytics.summary.total_revenue.toLocaleString()}`, change: `${analytics.summary.confirmed_bookings} sessions`, icon: TrendingUp, color: "text-primary bg-primary/10" },
    { label: "Cancelled", value: analytics.summary.cancelled_bookings, change: "bookings cancelled", icon: Clock, color: "text-orange-500 bg-orange-500/10" },
  ] : [];

  return (
    <div>
      {error && <ErrorBanner message={error} />}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, change, icon: Icon, color }) => (
            <Card key={label} className="border-border bg-card">
              <CardContent className="p-5">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
                <div className="text-xs text-primary mt-1">{change}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border bg-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Bookings</h2>
        </div>
        {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "User", "Space", "Seat", "Date", "Time", "Status", "Price"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.slice(0, 8).map(b => (
                  <tr key={b.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-mono">#{b.id}</td>
                    <td className="px-6 py-3.5 font-medium text-card-foreground">{b.user_email}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.seat_detail?.space_name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground font-mono">{b.seat_detail?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.date}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{fromApiTime(b.start_time)}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize", statusStyles[b.status])}>
                        <StatusIcon status={b.status} /> {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">₱{Number(b.total_price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Bookings Panel ────────────────────────────────────────────────────────────

const BookingsPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBookings(await fetchAdminBookings(statusFilter));
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: number) => {
    try {
      await cancelAdminBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b));
    } catch {
      setError("Failed to cancel booking.");
    }
  };

  const filtered = bookings.filter(b =>
    b.user_email.toLowerCase().includes(search.toLowerCase()) ||
    (b.seat_detail?.space_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by user or space..." />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} />}

      <Card className="border-border bg-card">
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "User", "Space", "Seat", "Date", "Time", "Status", "Price", ""].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-mono">#{b.id}</td>
                    <td className="px-6 py-3.5 font-medium text-card-foreground">{b.user_email}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.seat_detail?.space_name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground font-mono">{b.seat_detail?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.date}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{fromApiTime(b.start_time)} → {fromApiTime(b.end_time)}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize", statusStyles[b.status])}>
                        <StatusIcon status={b.status} /> {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">₱{Number(b.total_price).toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      {b.status === "confirmed" && (
                        <button onClick={() => handleCancel(b.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Cancel booking">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Users Panel ───────────────────────────────────────────────────────────────

const UsersPanel = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by email or username..." />
      </div>
      {error && <ErrorBanner message={error} />}
      <Card className="border-border bg-card">
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Username", "Email", "Phone", "Role", "Joined"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-mono">#{u.id}</td>
                    <td className="px-6 py-3.5 font-medium text-card-foreground">{u.username}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", u.is_admin ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                        {u.is_admin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Spaces Panel ──────────────────────────────────────────────────────────────

const SpacesPanel = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchSpaces(), fetchAdminSeats()])
      .then(([s, se]) => { setSpaces(s); setSeats(se); })
      .catch(() => setError("Failed to load spaces."))
      .finally(() => setLoading(false));
  }, []);

  const seatsForSpace = (spaceId: number) => seats.filter(s => s.space === spaceId);

  return (
    <div>
      {error && <ErrorBanner message={error} />}
      {loading ? <LoadingSpinner /> : spaces.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No spaces found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {spaces.map(space => (
            <Card
              key={space.id}
              className={cn("border-border bg-card cursor-pointer transition-all hover:border-primary/40", selectedSpace === space.id && "border-primary ring-1 ring-primary/30")}
              onClick={() => setSelectedSpace(selectedSpace === space.id ? null : space.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{space.name}</h3>
                    {space.address && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{space.address}</span>
                      </div>
                    )}
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", space.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500")}>
                    {space.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {space.description && <p className="text-sm text-muted-foreground mb-3">{space.description}</p>}

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-green-600 font-medium">{space.available_seats} available</span>
                  <span className="text-xs text-muted-foreground">/ {space.seat_count} total — click to expand</span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: space.seat_count > 0 ? `${(space.available_seats / space.seat_count) * 100}%` : "0%" }}
                  />
                </div>

                {selectedSpace === space.id && seatsForSpace(space.id).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2">
                    {seatsForSpace(space.id).map(seat => (
                      <div key={seat.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{seat.name}</span>
                          <span className="text-muted-foreground capitalize">{seat.seat_type?.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">₱{parseFloat(seat.price_per_hour).toFixed(0)}/hr</span>
                          <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", seat.is_active ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500")}>
                            {seat.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Memberships Panel ─────────────────────────────────────────────────────────

const MembershipsPanel = () => {
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAdminMemberships()
      .then(setMemberships)
      .catch(() => setError("Failed to load memberships."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = memberships.filter(m => {
    const matchesSearch = m.user_email.toLowerCase().includes(search.toLowerCase()) ||
      m.plan_detail.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by user or plan..." />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} />}

      <Card className="border-border bg-card">
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No memberships found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "User", "Plan", "Price", "Start", "End", "Status"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-mono">#{m.id}</td>
                    <td className="px-6 py-3.5 font-medium text-card-foreground">{m.user_email}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{m.plan_detail.name}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">₱{parseFloat(m.plan_detail.price).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{m.start_date}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{m.end_date}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", membershipStatusStyles[m.status])}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const navItems: { icon: React.ElementType; label: NavLabel }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: CalendarCheck, label: "Bookings" },
  { icon: Users, label: "Users" },
  { icon: BookOpen, label: "Spaces" },
  { icon: Crown, label: "Memberships" },
];

const panelTitle: Record<NavLabel, string> = {
  Dashboard: "Dashboard",
  Bookings: "All Bookings",
  Users: "Users",
  Spaces: "Spaces & Seats",
  Memberships: "Memberships",
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState<NavLabel>("Dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchAdminBookings(), fetchAnalytics()])
      .then(([b, a]) => { setBookings(b); setAnalytics(a); })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r border-border bg-card flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="px-6 py-5 border-b border-border flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-display text-lg text-foreground">MindSpace</span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-auto">Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeNav === label ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-foreground">{panelTitle[activeNav]}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{user?.username ?? "Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{user?.username?.[0]?.toUpperCase() ?? "A"}</span>
            </div>
          </div>
        </div>

        {activeNav === "Dashboard"   && <DashboardPanel analytics={analytics} bookings={bookings} loading={loading} error={error} />}
        {activeNav === "Bookings"    && <BookingsPanel />}
        {activeNav === "Users"       && <UsersPanel />}
        {activeNav === "Spaces"      && <SpacesPanel />}
        {activeNav === "Memberships" && <MembershipsPanel />}
      </main>
    </div>
  );
};

export default AdminDashboard;