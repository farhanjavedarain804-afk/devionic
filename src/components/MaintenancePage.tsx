import { Construction, Mail, Phone } from "lucide-react";
import devionicLogo from "@/assets/devionic-logo-full.png";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(207,74%,8%)] via-[hsl(207,74%,12%)] to-[hsl(207,50%,18%)] p-4">
      <div className="text-center max-w-lg mx-auto">
        <img src={devionicLogo} alt="Devionic" className="h-12 mx-auto mb-8 brightness-0 invert" />
        
        <div className="h-20 w-20 rounded-full bg-[hsl(40,90%,55%)]/10 flex items-center justify-center mx-auto mb-6">
          <Construction size={40} className="text-[hsl(40,90%,55%)]" />
        </div>
        
        <h1 className="text-3xl font-bold text-[hsl(0,0%,100%)] mb-3 font-heading">
          Website Under Maintenance
        </h1>
        <p className="text-[hsl(210,20%,70%)] text-base mb-8 leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience. 
          We'll be back online shortly. Thank you for your patience!
        </p>
        
        <div className="border border-[hsl(207,50%,20%)] rounded-2xl p-6 bg-[hsl(207,50%,14%)]/50 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-[hsl(210,20%,50%)] mb-4 font-semibold">Contact Us</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href="mailto:info@devionic.com" className="flex items-center gap-2 text-accent hover:underline">
              <Mail size={16} /> info@devionic.com
            </a>
            <a href="tel:+923177121841" className="flex items-center gap-2 text-accent hover:underline">
              <Phone size={16} /> +92-317-7121841
            </a>
          </div>
        </div>
        
        <p className="text-[10px] text-[hsl(210,20%,40%)] mt-8">
          © {new Date().getFullYear()} DEVIONIC (PRIVATE) LIMITED. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
