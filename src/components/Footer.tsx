import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/devionic-logo.png";

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-primary-foreground border-t border-white/5 pt-10">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          {/* Brand */}
          <div className="space-y-6">
            <img src={logo} alt="Devionic" className="h-10 brightness-0 invert" />
            <p className="text-primary-foreground/70 text-base leading-relaxed max-w-sm">
              Inspiring Innovation Digitally. Your trusted partner in technology innovation and growth.
            </p>
          </div>

          {/* Contact */}
          <div className="md:ml-auto w-full">
            <h4 className="text-cyan font-semibold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
            <div className="flex flex-col gap-5 text-base text-primary-foreground/70">
              {/* Address - First Line */}
              <div className="flex items-start md:items-center gap-3 w-full">
                <MapPin size={20} className="mt-1 md:mt-0 text-cyan shrink-0" />
                <span className="leading-relaxed">Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450</span>
              </div>
              
              {/* Phone and Email - Second Line */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 w-full">
                <a href="tel:+923177121841" className="flex items-center gap-3 hover:text-cyan transition-colors">
                  <Phone size={20} className="text-cyan shrink-0" />
                  +92-317-7121841
                </a>
                <a href="mailto:info@devionic.com" className="flex items-center gap-3 hover:text-cyan transition-colors">
                  <Mail size={20} className="text-cyan shrink-0" />
                  info@devionic.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Devionic (Private) Limited. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link to="/privacy" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Terms & Conditions</Link>
            <Link to="/disclaimer" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Disclaimer</Link>
            <Link to="/complaint" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Complaint & Ticket</Link>
            <Link to="/verification" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Verification</Link>
            <Link to="/resource-center" className="text-primary-foreground/40 hover:text-cyan text-sm transition-colors">Resource Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
