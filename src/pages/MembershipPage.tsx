import { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle, Crown, Calendar, Clock, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
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
import {
  fetchMembershipPlans,
  fetchMyMembership,
  subscribeToPlan,
  cancelMembership,
} from "@/services/bookingService";
import type { MembershipPlan, UserMembership } from "@/services/bookingService";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
} as const;

const CurrentMembershipCard = ({
  membership,
  onCancel,
}: {
  membership: UserMembership;
  onCancel: () => void;
}) => {
  const statusCfg = STATUS_CONFIG[membership.status];
  const isActive = membership.status === "active";

  return (
    <Card className="border-primary/30 bg-primary/5 mb-10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{membership.plan_detail.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{membership.plan_detail.description}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(membership.start_date + "T00:00:00"), "MMM d, yyyy")} —{" "}
                  {format(new Date(membership.end_date + "T00:00:00"), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{membership.plan_detail.hours_per_month} hrs/month included</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                ₱{parseFloat(membership.plan_detail.price).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground capitalize">/ {membership.plan_detail.billing_cycle}</p>
            </div>
            <span className={cn(
              "inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border",
              statusCfg.className
            )}>
              {statusCfg.label}
            </span>
            {isActive && (
              <button
                onClick={onCancel}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancel membership
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PlanCard = ({
  plan,
  isCurrent,
  onSubscribe,
  subscribing,
}: {
  plan: MembershipPlan;
  isCurrent: boolean;
  onSubscribe: (plan: MembershipPlan) => void;
  subscribing: boolean;
}) => (
  <Card className={cn(
    "border-border bg-card transition-all",
    isCurrent ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/40"
  )}>
    <CardContent className="p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{plan.billing_cycle}</p>
        </div>
        {isCurrent && (
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Current
          </span>
        )}
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold text-foreground">
          ₱{parseFloat(plan.price).toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground capitalize"> / {plan.billing_cycle}</span>
      </div>
      {plan.description && (
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
      )}
      <ul className="space-y-2 mb-6 flex-1">
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-primary shrink-0" />
          {plan.hours_per_month} hours per month
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-primary shrink-0" />
          All spaces included
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-primary shrink-0" />
          Priority booking
        </li>
      </ul>
      <Button
        className="w-full"
        variant={isCurrent ? "outline" : "default"}
        disabled={isCurrent || subscribing}
        onClick={() => onSubscribe(plan)}
      >
        {subscribing ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing…</>
        ) : isCurrent ? (
          "Current Plan"
        ) : (
          "Subscribe"
        )}
      </Button>
    </CardContent>
  </Card>
);

const MembershipPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeTarget, setSubscribeTarget] = useState<MembershipPlan>();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchMembershipPlans(),
      fetchMyMembership().catch(() => null),
    ])
      .then(([p, m]) => { setPlans(p); setMembership(m); })
      .catch(() => setError("Failed to load membership data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    if (!subscribeTarget) return;
    setSubscribing(true);
    try {
      const updated = await subscribeToPlan(subscribeTarget.id);
      setMembership(updated);
      setSubscribeTarget(undefined);
    } catch {
      setError("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelMembership();
      setMembership(prev => prev ? { ...prev, status: "cancelled" as const } : null);
      setCancelOpen(false);
    } catch {
      setError("Failed to cancel membership. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Key fix: only hide current plan when membership is ACTIVE ─────────────
  const visiblePlans = plans.filter(p =>
    !(membership?.status === "active" && p.id === membership?.plan)
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex-1 pt-28 pb-24 container mx-auto px-6 max-w-5xl">


        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-2">Membership</h1>
          <p className="text-muted-foreground text-sm">
            Subscribe to a plan and get access to all MindSpace spaces.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-6">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            {/* Show current plan card only when active */}
            {membership && membership.status === "active" && (
              <CurrentMembershipCard
                membership={membership}
                onCancel={() => setCancelOpen(true)}
              />
            )}

            <h2 className="text-lg font-semibold text-foreground mb-4">
              {membership?.status === "active" ? "Other Plans" : "Choose a Plan"}
            </h2>

            {visiblePlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Crown className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No other plans available</h3>
                <p className="text-sm text-muted-foreground">You're already on the only available plan.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visiblePlans.map(plan => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrent={membership?.plan === plan.id && membership?.status === "active"}
                    onSubscribe={setSubscribeTarget}
                    subscribing={subscribing}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      <AlertDialog open={!!subscribeTarget} onOpenChange={(o) => !o && setSubscribeTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscribe to {subscribeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be subscribed to the {subscribeTarget?.name} plan at{" "}
              ₱{subscribeTarget ? parseFloat(subscribeTarget.price).toLocaleString() : 0} / {subscribeTarget?.billing_cycle}.
              {membership?.status === "active" && " Your current plan will be replaced."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={subscribing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubscribe} disabled={subscribing}>
              {subscribing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing…</> : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={(o) => !o && setCancelOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your membership?</AlertDialogTitle>
            <AlertDialogDescription>
              Your membership will be cancelled immediately. You'll lose access to membership benefits.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Membership</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
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

export default MembershipPage;