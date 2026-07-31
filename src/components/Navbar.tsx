import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/95 backdrop-blur-md border-b border-cyan/10">
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
          <a href="https://dms.devionic.com/portal/login" target="_blank" rel="noopener noreferrer">
            <Button variant="navCta" size="sm" className="ml-3">Client Portal</Button>
          </a>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-primary-foreground" aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-navy-dark/98 backdrop-blur-md border-t border-cyan/10 animate-fade-in">
          <div className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === link.path ? "text-cyan bg-cyan/10" : "text-primary-foreground/80 hover:text-cyan"
                }`}>
                {link.label}
              </Link>
            ))}
            <a href="https://dms.devionic.com/portal/login" target="_blank" rel="noopener noreferrer" className="mt-2" onClick={() => setIsOpen(false)}>
              <Button variant="navCta" className="w-full">Client Portal</Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
