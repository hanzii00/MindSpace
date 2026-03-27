import { Card, CardContent } from "@/components/ui/card";
import openSpace from "@/assets/openspace.jpg";
import privateRoom from "@/assets/huddleroom.jpg";
import quietZone from "@/assets/quietzone.jpg";

const spaces = [
  {
    title: "Open Study",
    description: "Shared tables with a productive, café-like atmosphere. Great for group work or solo study.",
    image: openSpace,
    capacity: "40 seats",
  },
  {
    title: "Huddle Room",
    description: "Glass-walled rooms for uninterrupted focus. Includes a desk, ergonomic chair, and power outlets.",
    image: privateRoom,
    capacity: "8 rooms",
  },
  {
    title: "Quiet Zone",
    description: "Library-style cubicles with individual lighting. A dedicated silence zone for deep concentration.",
    image: quietZone,
    capacity: "20 nooks",
  },
];

const SpacesSection = () => {
  return (
    <section id="spaces" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
            Find your ideal space
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Whether you need silence or a buzz, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <Card key={space.title} className="overflow-hidden border-border shadow-soft hover:shadow-elevated transition-shadow duration-300 bg-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={space.image}
                  alt={space.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-xl text-card-foreground">{space.title}</h3>
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                    {space.capacity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {space.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpacesSection;
