import { Wifi, Coffee, Plug, Lock, Clock, ShoppingBag, Droplets, Wind, Volume2, Sofa } from "lucide-react";

const facilities = [
  { icon: Wifi, label: "High-Speed Wi-Fi", desc: "1 Gbps fibre connection" },
  { icon: Coffee, label: "Café Corner", desc: "Complimentary coffee & tea" },
  { icon: Plug, label: "Power Outlets", desc: "At every seat" },
  { icon: Lock, label: "Personal Lockers", desc: "Secure your belongings" },
  { icon: Clock, label: "Flexible Hours", desc: "24/7" },
  { icon: ShoppingBag, label: "Snack Shop", desc: "Snacks available on-site" },
  { icon: Droplets, label: "Free Water", desc: "Complimentary drinking water" },
  { icon: Wind, label: "Air-Conditioned", desc: "Comfortable temperature always" },
  { icon: Volume2, label: "Silent Zone", desc: "Quiet, productive environment" },
  { icon: Sofa, label: "Cozy Space", desc: "Warm, inviting atmosphere" },
];

const FacilitiesSection = () => {
  return (
    <section id="facilities" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thoughtfully equipped so you can focus on what matters.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {facilities.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="text-center p-6 rounded-xl bg-card border border-border shadow-soft hover:shadow-elevated transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-card-foreground mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;