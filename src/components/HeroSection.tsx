import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-study.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="A cozy modern study space with warm lighting and plants"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-primary-foreground leading-tight mb-6">
            Your perfect space to focus & grow
          </h1>
          <p className="text-lg text-primary-foreground/80 font-body mb-8 max-w-lg">
            Book quiet study spaces, private rooms, and co-working desks designed for deep work. Flexible hours, thoughtful amenities.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/book">
              <Button size="lg" className="gap-2">
                Book a Seat <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#spaces">
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                Explore Spaces
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
