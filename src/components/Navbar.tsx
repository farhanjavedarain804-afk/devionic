import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, UserPlus, ArrowRight } from "lucide-react";
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
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Devionic Logo" className="h-8 md:h-10" />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === link.path ? "text-cyan" : "text-foreground/80 hover:text-cyan"
              }`}>
              {link.label}
            </Link>
          ))}
          <div className="group relative ml-3">
            <button className="flex items-center gap-2 rounded-xl border border-primary/25 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition hover:border-primary/50 hover:bg-primary/10">
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-primary" />
                Sign In
              </span>
              <span className="h-4 w-px bg-primary/25" aria-hidden />
              <span>Sign Up</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
            </button>
            <div className="pointer-events-none absolute top-full right-0 mt-2 w-52 translate-y-2 rounded-xl border border-primary/20 bg-[#0b1221]/95 p-2 opacity-0 shadow-2xl shadow-primary/10 backdrop-blur transition-all group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <a href="https://devionic.com/portal/login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/10 hover:text-primary">
                <LogIn className="h-4 w-4 text-primary" />
                Sign In
              </a>
              <a href="https://devionic.com/portal/login" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/10 hover:text-primary">
                <UserPlus className="h-4 w-4 text-primary" />
                Create Account
              </a>
            </div>
          </div>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground" aria-label="Toggle menu">
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
            <div className="flex flex-col gap-2 mt-2">
              <a href="https://devionic.com/portal/login" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl border border-primary/25 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:border-primary/50 hover:bg-primary/10 justify-center">
                <LogIn className="h-4 w-4 text-primary" />
                Sign In
              </a>
              <a href="https://devionic.com/portal/login" target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:border-primary/50 justify-center">
                <UserPlus className="h-4 w-4 text-primary" />
                Create Account
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
