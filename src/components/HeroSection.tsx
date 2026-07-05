import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const floatingParticles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  duration: Math.random() * 12 + 8,
  delay: Math.random() * 5,
}));

const hexagons = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  size: 40 + Math.random() * 60,
  duration: 15 + Math.random() * 10,
  delay: i * 1.5,
}));

const HeroSection = () => {
  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-hero-overlay" />

      {/* Animated grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--accent)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Rotating hexagonal shapes */}
      {hexagons.map((h) => (
        <motion.div
          key={`hex-${h.id}`}
          className="absolute border border-accent/10 pointer-events-none"
          style={{
            width: h.size,
            height: h.size,
            left: `${h.x}%`,
            top: `${h.y}%`,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating particles with glow */}
      {floatingParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/25 pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: `0 0 ${p.size * 3}px hsla(174, 100%, 40%, 0.3)`,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            opacity: [0.15, 0.6, 0.15],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[150px] bg-accent/8 pointer-events-none"
        style={{ top: "5%", left: "-15%" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.12, 0.04], x: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-accent/6 pointer-events-none"
        style={{ bottom: "0%", right: "-10%" }}
        animate={{ scale: [1.2, 0.9, 1.2], opacity: [0.06, 0.15, 0.06], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[80px] bg-accent/5 pointer-events-none"
        style={{ top: "60%", left: "40%" }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated diagonal lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <motion.line
          x1="0%" y1="30%" x2="100%" y2="70%"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeOpacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5 }}
        />
        <motion.line
          x1="100%" y1="20%" x2="0%" y2="80%"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeOpacity="0.06"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1 }}
        />
        <motion.line
          x1="20%" y1="0%" x2="80%" y2="100%"
          stroke="hsl(var(--accent))"
          strokeWidth="0.3"
          strokeOpacity="0.05"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 1.5 }}
        />
        {/* Animated circle */}
        <motion.circle
          cx="80%" cy="25%"
          r="80"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeOpacity="0.08"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="15%" cy="75%"
          r="50"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeOpacity="0.06"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </svg>


      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground max-w-4xl mx-auto leading-tight"
          >
            Your Trusted Partner in{" "}
            <motion.span
              className="text-accent inline-block"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Technology Innovation
            </motion.span>{" "}
            & Growth
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto"
        >
          We deliver innovative and scalable technology solutions that help businesses transform ideas into impactful digital experiences, streamline operations, and achieve sustainable growth.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/contact">
            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button variant="hero" size="xl">
                Get Free Consultation
              </Button>
            </motion.div>
          </Link>
          <a href="https://wa.me/923177121841" target="_blank" rel="noopener noreferrer">
            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button variant="heroOutline" size="xl">
                WhatsApp Now
              </Button>
            </motion.div>
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full mx-auto flex justify-center">
            <motion.div
              className="w-1.5 h-1.5 bg-accent rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
