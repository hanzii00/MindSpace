import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, LogOut, CalendarDays, LayoutDashboard, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hideNavLinks = location.pathname === "/book" || location.pathname === "/my-bookings";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const showLoggedIn = !!user || loggingOut;

  const LogoutButton = ({ className }: { className?: string }) => (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className={`flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {loggingOut ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing out…
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      )}
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-display text-xl text-foreground">MindSpace</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">

          {!hideNavLinks && (
            <div className="flex items-center gap-6">
              <a href="#spaces" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Spaces
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#facilities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Facilities
              </a>

              {/* Light black separator */}
              <div className="w-[2px] h-6 bg-black/20 mx-2" />
            </div>
          )}

          {showLoggedIn ? (
            <div className="flex items-center gap-1">

              {user?.is_admin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link to="/my-bookings">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <CalendarDays className="h-4 w-4" />
                  My Bookings
                </Button>
              </Link>

              <Link to="/book">
                <Button size="sm" className="ml-2">
                  Book a Seat
                </Button>
              </Link>

              {/* Light black separator */}
              <div className="w-[2px] h-6 bg-black/20 mx-2" />

              <LogoutButton />
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-1">

          {!hideNavLinks && (
            <>
              <a
                href="#spaces"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Spaces
              </a>

              <a
                href="#pricing"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>

              <a
                href="#facilities"
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Facilities
              </a>

              <div className="h-px bg-black/20 my-2" />
            </>
          )}

          {showLoggedIn ? (
            <div className="space-y-1 pt-1">

              {user?.is_admin && (
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5 text-muted-foreground">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link to="/my-bookings" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  My Bookings
                </Button>
              </Link>

              <Link to="/book" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full mt-2">
                  Book a Seat
                </Button>
              </Link>

              <div className="pt-2">
                <LogoutButton />
              </div>

            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button size="sm" className="w-full mt-2">
                Sign In
              </Button>
            </Link>
          )}

        </div>
      )}
    </nav>
  );
};

export default Navbar;