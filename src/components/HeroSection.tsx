import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-navy-dark pt-16">
      {/* Subtle modern background glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan text-sm font-medium mb-4 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
            </span>
            Innovating the Future of Tech
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-bold text-white tracking-tight leading-[1.1]">
            Let’s Build Something <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-400 drop-shadow-sm">
              Great Together
            </span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto font-light leading-relaxed">
            Ready to take your business to the next level? Devionic delivers premium digital solutions engineered for growth, performance, and scale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/contact">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan to-blue-500 text-white shadow-xl shadow-cyan/20 border-0 rounded-full px-10 py-7 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-cyan/40">
                Get Started Today
              </Button>
            </Link>
            <a href="https://wa.me/923177121841" target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full sm:w-auto rounded-full px-10 py-7 text-lg font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all backdrop-blur-md">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Modern Wave/Gradient Divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
