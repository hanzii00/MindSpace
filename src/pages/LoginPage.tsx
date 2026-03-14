import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { BookOpen, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleTabSwitch = (t: "login" | "register") => {
    setTab(t);
    setError("");
    setSuccess("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (tab === "register") {
        await register(name, email, password);
        setTab("login");
        setName("");
        setEmail("");
        setPassword("");
        setSuccess("Account created! Please sign in.");
      } else {
        const me = await login(email, password);
        navigate(me.is_admin ? "/admin" : from, { replace: true });
      }
    } catch (err: any) {
      const detail = err?.response?.data;
      if (typeof detail === "string") setError(detail);
      else if (detail?.detail) setError(detail.detail);
      else if (detail?.email) setError(`Email: ${detail.email[0]}`);
      else if (detail?.password) setError(`Password: ${detail.password[0]}`);
      else if (detail?.username) setError(`Username: ${detail.username[0]}`);
      else setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("Google login coming soon.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-display text-lg text-foreground">MindSpace</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to book your space at MindSpace.
            </p>
          </div>

          <Card className="border-border shadow-soft bg-card">
            <CardContent className="p-8">

              {/* Tabs */}
              <div className="flex rounded-lg bg-secondary p-1 mb-6">
                {(["login", "register"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTabSwitch(t)}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                      tab === t
                        ? "bg-card text-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-sm font-medium text-foreground mb-4"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Success banner */}
              {success && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {tab === "register" && (
                  <div>
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {tab === "login" && (
                  <div className="text-right">
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      Please wait...
                    </span>
                  ) : tab === "login" ? "Sign In" : "Create Account"}
                </Button>
              </form>

            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to MindSpace's{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;