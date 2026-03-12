import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon, Infinity, Users, BookOpen, Zap, Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const timePasses = [
  { name: "Day Pass", time: "6AM – 6PM", price: "₱238", icon: Sun },
  { name: "Night Pass", time: "6PM – 6AM", price: "₱208", icon: Moon },
  { name: "Unlimited Pass", time: "24 Hours", price: "₱308", icon: Infinity, popular: true },
];

const regularRates = [
  { name: "Hourly", price: "₱50" },
  { name: "3 Hours", price: "₱138" },
  { name: "5 Hours", price: "₱188" },
  { name: "Rental Lockers", price: "₱25", note: "/day" },
];

const multiDayPasses = [
  { name: "3-Day Pass", validity: "valid 7 days", price: "₱810", perDay: "₱270/day" },
  { name: "7-Day Pass", validity: "valid 15 days", price: "₱1,519", perDay: "₱217/day" },
  { name: "15-Day Pass", validity: "valid 30 days", price: "₱2,580", perDay: "₱172/day" },
  { name: "Monthly Pass", validity: "valid 90 days", price: "₱4,980", perDay: "₱166/day", best: true },
];

const huddleRoom = [
  { name: "5 Pax", note: "per hour", price: "₱280" },
  { name: "8 Pax", note: "per hour", price: "₱485" },
  { name: "Additional Pax", price: "₱56" },
];

const boardReviewee = [
  { name: "Day Pass", price: "₱290" },
  { name: "3-Day Pass", price: "₱804" },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-6">

        {/* Header — matches other sections exactly */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No hidden fees. Pick a plan that fits your study rhythm.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">

          {/* Student Promo — subtle pill banner */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-full px-6 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Student Promo:</span>
              <span className="text-sm font-bold text-primary">₱39/hr</span>
              <span className="text-xs text-muted-foreground">· min. 2 hrs · valid ID required</span>
            </div>
          </div>

          {/* Time Passes */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Time Passes
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {timePasses.map((pass) => {
                const Icon = pass.icon;
                return (
                  <Card
                    key={pass.name}
                    className={`relative overflow-hidden border transition-shadow duration-300 bg-card hover:shadow-elevated ${
                      pass.popular
                        ? "border-primary shadow-elevated scale-[1.03]"
                        : "border-border shadow-soft"
                    }`}
                  >
                    {pass.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                        Best Value
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display text-lg text-card-foreground mb-1">{pass.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4">{pass.time}</p>
                      <p className="text-3xl font-bold text-foreground">{pass.price}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Regular Rates + Multi-Day side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border shadow-soft bg-card">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5" /> Regular Rates
                </p>
                <div className="divide-y divide-border">
                  {regularRates.map((item) => (
                    <div key={item.name} className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {item.price}
                        {item.note && <span className="text-xs font-normal text-muted-foreground">{item.note}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft bg-card">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" /> Multi-Day Passes
                </p>
                <div className="divide-y divide-border">
                  {multiDayPasses.map((item) => (
                    <div key={item.name} className={`flex justify-between items-center py-3 ${item.best ? "opacity-100" : ""}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                          {item.best && (
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Best
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{item.validity}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground tabular-nums">{item.price}</div>
                        <div className="text-xs text-primary font-medium">{item.perDay}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Huddle Room + Board Reviewee */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border shadow-soft bg-card">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Huddle Room
                </p>
                <div className="divide-y divide-border">
                  {huddleRoom.map((item) => (
                    <div key={item.name} className="flex justify-between items-center py-3">
                      <div>
                        <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                        {item.note && <span className="text-xs text-muted-foreground ml-2">({item.note})</span>}
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">{item.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border leading-relaxed">
                  Includes Wi-Fi, power outlets, ergonomic seating, unlimited brewed coffee & no corkage fee.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft bg-card">
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" /> Board Reviewee Rates
                </p>
                <div className="divide-y divide-border">
                  {boardReviewee.map((item) => (
                    <div key={item.name} className="flex justify-between items-center py-3">
                      <span className="text-sm font-medium text-card-foreground">{item.name}</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">{item.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border leading-relaxed">
                  Priority seating in quiet zones. Ideal for board exam preparation.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/book">
            <Button size="lg" className="min-w-[200px]">Book a Seat</Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default PricingSection;