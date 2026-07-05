import { motion } from "framer-motion";

const floatingParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 8 + 8,
  delay: Math.random() * 3,
}));

interface PageHeroProps {
  title: string;
  highlight: string;
  subtitle: string;
}

const PageHero = ({ title, highlight, subtitle }: PageHeroProps) => {
  return (
    <section className="relative py-24 overflow-hidden bg-navy-gradient">
      {/* Animated grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--accent)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating particles */}
      {floatingParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/15"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [-15, 15, -15], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Glowing orb */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px] bg-accent/5 pointer-events-none"
        style={{ top: "20%", right: "-5%" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <motion.line
          x1="0%" y1="40%" x2="100%" y2="60%"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeOpacity="0.06"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.3 }}
        />
      </svg>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4"
        >
          {title} <span className="text-accent">{highlight}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-primary-foreground/70 max-w-2xl mx-auto text-lg"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
};

export default PageHero;
