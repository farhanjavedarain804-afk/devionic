import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Send, Youtube } from "lucide-react";
import logo from "@/assets/devionic-logo.png";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Case Studies", path: "/case-studies" },
  { label: "How We Work", path: "/how-it-works" },
  { label: "Careers", path: "/careers" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const products = [
  { label: "Devionic DMS", desc: "Document Management System", path: "#" },
  { label: "Devionic POS", desc: "Point of Sale System", path: "#" },
  { label: "Devionic ERP", desc: "Enterprise Resource Planning", path: "#" },
  { label: "Devionic HRM", desc: "HR & Payroll Management", path: "#" },
  { label: "Devionic CRM", desc: "Customer Relationship Manager", path: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-primary-foreground border-t border-white/5">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* Brand Column */}
          <div className="space-y-5">
            <img src={logo} alt="Devionic" className="h-10 brightness-0 invert" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Inspiring Innovation Digitally. Your trusted partner in technology innovation and growth.
            </p>

            {/* Nav Links — one line, wrapping */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-primary-foreground/50 hover:text-cyan text-xs transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-cyan hover:text-navy-dark transition-all duration-300">
                <Facebook size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-cyan hover:text-navy-dark transition-all duration-300">
                <Twitter size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-cyan hover:text-navy-dark transition-all duration-300">
                <Linkedin size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-cyan hover:text-navy-dark transition-all duration-300">
                <Instagram size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-cyan hover:text-navy-dark transition-all duration-300">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-5">
            <h4 className="text-cyan font-semibold text-sm uppercase tracking-wider">Our Products</h4>
            <p className="text-primary-foreground/60 text-xs leading-relaxed">
              Ready-made digital solutions for businesses of all sizes. Customizable to your exact needs.
            </p>
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <a
                  key={p.label}
                  href={p.path}
                  className="group flex items-start gap-3 hover:gap-4 transition-all duration-200"
                >
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan/50 group-hover:bg-cyan shrink-0 transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-primary-foreground/80 group-hover:text-cyan transition-colors">{p.label}</p>
                    <p className="text-xs text-primary-foreground/40">{p.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact + Newsletter Column */}
          <div className="space-y-6">
            <div>
              <h4 className="text-cyan font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
              <div className="flex flex-col gap-4 text-sm text-primary-foreground/70">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-cyan shrink-0" />
                  <span className="leading-relaxed text-xs">Head Office — Multan Road, Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan 31450</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <a href="tel:+923177121841" className="flex items-center gap-3 hover:text-cyan transition-colors text-xs">
                    <Phone size={15} className="text-cyan shrink-0" />
                    +92-317-7121841
                  </a>
                  <a href="mailto:info@devionic.com" className="flex items-center gap-3 hover:text-cyan transition-colors text-xs">
                    <Mail size={15} className="text-cyan shrink-0" />
                    info@devionic.com
                  </a>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-cyan font-semibold mb-3 text-sm uppercase tracking-wider">Stay Updated</h4>
              <p className="text-primary-foreground/60 text-xs leading-relaxed mb-3">
                Subscribe for the latest tech news and updates.
              </p>
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-4 pr-12 text-xs focus:outline-none focus:border-cyan transition-colors text-white placeholder:text-white/30"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan text-navy-dark rounded-md hover:bg-white transition-colors"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/35 text-xs">
            © {new Date().getFullYear()} Devionic (Private) Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-1.5">
            <Link to="/privacy" className="text-primary-foreground/35 hover:text-cyan text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-primary-foreground/35 hover:text-cyan text-xs transition-colors">Terms & Conditions</Link>
            <Link to="/disclaimer" className="text-primary-foreground/35 hover:text-cyan text-xs transition-colors">Disclaimer</Link>
            <Link to="/complaint" className="text-primary-foreground/35 hover:text-cyan text-xs transition-colors">Complaint & Ticket</Link>
            <Link to="/verification" className="text-primary-foreground/35 hover:text-cyan text-xs transition-colors">Verification</Link>
            <Link to="/resource-center" className="text-primary-foreground/35 hover:text-cyan text-xs transition-colors">Resource Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
