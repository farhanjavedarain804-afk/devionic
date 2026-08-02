import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/devionic-logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Careers", path: "/careers" },
  { label: "Contact", path: "/contact" },
  { label: "Complaint & Ticket", path: "/complaint" },
  { label: "Verification", path: "/verification" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Devionic Logo" className="h-8 md:h-10 brightness-0 invert" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === link.path ? "text-cyan" : "text-primary-foreground/80 hover:text-cyan"
              }`}>
              {link.label}
            </Link>
          ))}
          <a href="https://devionic.com/portal/login" target="_blank" rel="noopener noreferrer">
            <Button className="ml-3 bg-gradient-to-r from-cyan to-blue-500 text-white shadow-lg shadow-cyan/30 border-0 rounded-full px-6 py-2 h-auto font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-cyan/50">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Sign Up
            </Button>
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-primary-foreground" aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-navy-dark/95 backdrop-blur-xl border-t border-white/5 animate-fade-in shadow-2xl">
          <div className="flex flex-col px-4 py-6 gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === link.path ? "text-cyan bg-white/5" : "text-primary-foreground/70 hover:text-cyan hover:bg-white/5"
                }`}>
                {link.label}
              </Link>
            ))}
            <a href="https://devionic.com/portal/login" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="mt-2">
              <Button className="w-full bg-gradient-to-r from-cyan to-blue-500 text-white shadow-lg shadow-cyan/30 border-0 rounded-full py-3 h-auto font-bold tracking-wide transition-all duration-300 hover:shadow-cyan/50">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In / Sign Up
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
