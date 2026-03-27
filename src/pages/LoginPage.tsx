import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
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
  const [verificationSent, setVerificationSent] = useState(false);

  const handleTabSwitch = (t: "login" | "register") => {
    setTab(t);
    setError("");
    setSuccess("");
    setVerificationSent(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (tab === "register") {
        await register(name, email, password);
        setVerificationSent(true);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        const me = await login(email, password);
        navigate(me.is_admin ? "/admin" : from, { replace: true });
      }
    } catch (err: any) {
      const detail = err?.response?.data;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail)) setError(detail[0]);           // ← add this
      else if (detail?.detail) setError(detail.detail);
      else if (detail?.non_field_errors) setError(detail.non_field_errors[0]); // ← add this
      else if (detail?.email) setError(`Email: ${detail.email[0]}`);
      else if (detail?.password) setError(`Password: ${detail.password[0]}`);
      else if (detail?.username) setError(`Username: ${detail.username[0]}`);
      else setError("Something went wrong. Please try again.");
    }finally {
      setSubmitting(false);
    }
  };

  // Show verification sent screen after registration
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg text-foreground">MindSpace</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-display text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a verification link to your email address. Click it to activate your account before signing in.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setVerificationSent(false);
                setTab("login");
              }}
            >
              Back to Sign In
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Didn't receive it? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="flex items-center gap-2">
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
            <h1 className="text-3xl font-display text-foreground mb-2">
              {tab === "login" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {tab === "login"
                ? "Sign in to book your space at MindSpace."
                : "Register to get started with MindSpace."}
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

              {/* Error banner */}
              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600">
                  {success}
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