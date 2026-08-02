import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/devionic-logo.png";

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-primary-foreground border-t border-white/5 pt-10">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="Devionic" className="h-8 brightness-0 invert" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Inspiring Innovation Digitally. Your trusted partner in technology innovation and growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-cyan font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Services", path: "/services" },
                { label: "Careers", path: "/careers" },
                { label: "Contact", path: "/contact" },
                { label: "Complaint & Ticket", path: "/complaint" },
                { label: "Verification", path: "/verification" },
                { label: "Resource Center", path: "/resource-center" },
                { label: "How It Works", path: "/how-it-works" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-primary-foreground/60 hover:text-cyan text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-cyan font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <div className="flex flex-col gap-2">
              {["Web Development", "App Development", "UI/UX Design", "AI Automation", "Digital Marketing", "Cyber Security"].map((s) => (
                <Link key={s} to="/services" className="text-primary-foreground/60 hover:text-cyan text-sm transition-colors">
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cyan font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/60">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-cyan shrink-0" />
                <span>Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450</span>
              </div>
              <a href="tel:+923177121841" className="flex items-center gap-2 hover:text-cyan transition-colors">
                <Phone size={16} className="text-cyan" />
                +92-317-7121841
              </a>
              <a href="mailto:info@devionic.com" className="flex items-center gap-2 hover:text-cyan transition-colors">
                <Mail size={16} className="text-cyan" />
                info@devionic.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Devionic (Private) Limited. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Terms & Conditions</Link>
            <Link to="/disclaimer" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Disclaimer</Link>
            <Link to="/how-it-works" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">How It Works</Link>
            <Link to="/resource-center" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Resource Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
