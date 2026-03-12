import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-display text-xl text-foreground">MindSpace</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#spaces" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Spaces
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#facilities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Facilities
          </a>
          <Link to="/book">
            <Button size="sm">Book a Seat</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-3">
          <a href="#spaces" className="block text-sm font-medium text-muted-foreground" onClick={() => setIsOpen(false)}>Spaces</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground" onClick={() => setIsOpen(false)}>Pricing</a>
          <a href="#facilities" className="block text-sm font-medium text-muted-foreground" onClick={() => setIsOpen(false)}>Facilities</a>
            <Link to="/login">
              <Button size="sm">Book a Seat</Button>
            </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
