import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-background" />
            <span className="font-display text-lg text-background">MindSpace</span>
          </div>
          <p className="text-sm text-background/60">
            © 2026 MindSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;