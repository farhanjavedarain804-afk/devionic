import { useEffect, useRef } from "react";

const techCategories = [
  {
    label: "Frontend",
    color: "text-blue-400",
    items: [
      { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
      { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
      { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
      { name: "Tailwind CSS", icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" },
      { name: "Vue.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
    ],
  },
  {
    label: "Backend",
    color: "text-green-400",
    items: [
      { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "Express", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
      { name: "NestJS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg" },
      { name: "PHP", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
    ],
  },
  {
    label: "Mobile",
    color: "text-purple-400",
    items: [
      { name: "Flutter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
      { name: "Kotlin", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg" },
      { name: "Android", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" },
      { name: "Swift", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg" },
    ],
  },
  {
    label: "Database & DevOps",
    color: "text-cyan",
    items: [
      { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
      { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "Redis", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
      { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
      { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
      { name: "AWS", icon: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
    ],
  },
];

// Flatten all items for the marquee
const allItems = techCategories.flatMap(c => c.items.map(item => ({ ...item, category: c.label, color: c.color })));
// Duplicate for seamless loop
const marqueeItems = [...allItems, ...allItems];

const TechStackMarquee = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-12 text-center">
        <p className="text-cyan text-sm font-semibold uppercase tracking-widest mb-2">Technologies We Master</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Our Tech Stack & <span className="text-cyan">Tools</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          We work with the most modern and battle-tested technologies to deliver scalable, high-performance solutions across every platform.
        </p>
      </div>

      {/* Category labels */}
      <div className="container mx-auto px-4 lg:px-8 mb-10">
        <div className="flex flex-wrap justify-center gap-3">
          {techCategories.map((cat) => (
            <div key={cat.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium`}>
              <span className={`w-2 h-2 rounded-full ${cat.color.replace("text-", "bg-")}`} />
              <span className="text-card-foreground">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Continuous marquee */}
      <div className="relative w-full">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-6 w-max"
          style={{ animation: "marquee 40s linear infinite" }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {marqueeItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 w-28 shrink-0 group cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center p-3 group-hover:border-cyan/50 group-hover:shadow-lg group-hover:shadow-cyan/10 transition-all duration-300 group-hover:-translate-y-1">
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium text-center group-hover:text-cyan transition-colors">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default TechStackMarquee;
