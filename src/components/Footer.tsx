import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-background">Voyago</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-background/60">
            <Link to="/" className="hover:text-background transition-colors">Home</Link>
            <Link to="/destinations" className="hover:text-background transition-colors">Destinations</Link>
            <Link to="/planner" className="hover:text-background transition-colors">Planner</Link>
            <Link to="/budget" className="hover:text-background transition-colors">Budget</Link>
          </div>
          <p className="text-sm text-background/40">© 2026 Voyago. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
