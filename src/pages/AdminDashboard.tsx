import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen, Users, CalendarCheck, LayoutDashboard,
  LogOut, TrendingUp, Clock, CheckCircle, XCircle, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Stub data — replace with backend API calls
const stats = [
  { label: "Total Bookings", value: "128", change: "+12 today", icon: CalendarCheck, color: "text-blue-500 bg-blue-500/10" },
  { label: "Active Users", value: "54", change: "+3 today", icon: Users, color: "text-green-500 bg-green-500/10" },
  { label: "Revenue Today", value: "₱4,320", change: "8 sessions", icon: TrendingUp, color: "text-primary bg-primary/10" },
  { label: "Avg. Stay", value: "3.2 hrs", change: "per user", icon: Clock, color: "text-orange-500 bg-orange-500/10" },
];

const recentBookings = [
  { id: "B001", name: "Maria Santos", space: "Open Study", seat: "O12", date: "Mar 12, 2026", time: "9:00 AM", status: "confirmed" },
  { id: "B002", name: "Carlo Reyes", space: "Quiet Zone", seat: "Q4", date: "Mar 12, 2026", time: "10:00 AM", status: "confirmed" },
  { id: "B003", name: "Ana Lim", space: "Huddle Room (5 pax)", seat: "H1", date: "Mar 12, 2026", time: "1:00 PM", status: "pending" },
  { id: "B004", name: "Jose Cruz", space: "Open Study", seat: "O7", date: "Mar 12, 2026", time: "2:00 PM", status: "cancelled" },
  { id: "B005", name: "Lea Gomez", space: "Quiet Zone", seat: "Q11", date: "Mar 13, 2026", time: "8:00 AM", status: "confirmed" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarCheck, label: "Bookings", active: false },
  { icon: Users, label: "Users", active: false },
  { icon: BookOpen, label: "Spaces", active: false },
];

const statusStyles: Record<string, string> = {
  confirmed: "text-green-600 bg-green-500/10",
  pending: "text-orange-500 bg-orange-500/10",
  cancelled: "text-red-500 bg-red-500/10",
};

const StatusIcon = ({ status }: { status: string }) =>
  status === "confirmed" ? <CheckCircle className="h-3.5 w-3.5" /> :
  status === "cancelled" ? <XCircle className="h-3.5 w-3.5" /> :
  <Clock className="h-3.5 w-3.5" />;

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
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
                activeNav === label
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <Link to="/login">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Thursday, March 12, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">admin@mindspace.com</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">A</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map(({ label, value, change, icon: Icon, color }) => (
            <Card key={label} className="border-border shadow-soft bg-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
                <div className="text-xs text-primary mt-1">{change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Bookings Table */}
        <Card className="border-border shadow-soft bg-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Bookings</h2>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Name", "Space", "Seat", "Date", "Time", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-muted-foreground font-mono">{b.id}</td>
                    <td className="px-6 py-3.5 font-medium text-card-foreground">{b.name}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.space}</td>
                    <td className="px-6 py-3.5 text-muted-foreground font-mono">{b.seat}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.date}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{b.time}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize", statusStyles[b.status])}>
                        <StatusIcon status={b.status} />
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </main>
    </div>
  );
};

export default AdminDashboard;