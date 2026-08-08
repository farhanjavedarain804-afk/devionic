import { Calendar, MessageCircle, Code2, Smartphone, Cloud, TrendingUp, Shield, Brain, Users, Briefcase, Trophy, Menu, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { ParticleField } from "./ParticleField";
import { WireframeGlobe } from "./WireframeGlobe";
import { WelcomeRobot } from "./WelcomeRobot";
import devionicLogo from "@/assets/devionic-logo.png.asset.json";

const nav = ["Home", "About", "Services", "Careers", "Contact", "Complaint & Ticket", "Verification"];

const orbitCards = [
  { icon: Code2, label: "Web Development", pos: "top-[0%] left-[18%]", delay: "0s" },
  { icon: Smartphone, label: "Mobile Apps", pos: "top-[0%] right-[18%]", delay: "0.5s" },
  { icon: Shield, label: "Cyber Security", pos: "top-[38%] -right-[2%]", delay: "1s" },
  { icon: Cloud, label: "Cloud Solutions", pos: "bottom-[18%] right-[12%]", delay: "1.5s" },
  { icon: TrendingUp, label: "Digital Transformation", pos: "bottom-[18%] left-[12%]", delay: "2s" },
  { icon: Brain, label: "AI & Automation", pos: "top-[38%] -left-[2%]", delay: "2.5s" },
];

const stats = [
  { icon: Users, value: "150+", label: "Happy Clients" },
  { icon: Briefcase, value: "250+", label: "Projects Delivered" },
  { icon: Trophy, value: "98%", label: "Client Satisfaction" },
];


export function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Animated grid + particles */}
      <div className="absolute inset-0 hero-grid-bg" aria-hidden />
      <ParticleField />

      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute -top-40 -right-32 h-[500px] w-[500px] rounded-full blur-3xl animate-pulse-glow"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.16 180 / 0.35), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full blur-3xl animate-pulse-glow"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.18 220 / 0.28), transparent 70%)", animationDelay: "1.5s" }}
        aria-hidden
      />

      {/* Nav */}
      <header className="glass-nav sticky top-0 z-30">
       <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
        <a href="#" className="group flex items-center gap-2">
          <img
            src={devionicLogo.url}
            alt="Devionic"
            className="h-9 w-auto brightness-0 invert transition-opacity group-hover:opacity-90 lg:h-10"
          />
        </a>

        <nav className="hidden items-center gap-7 xl:flex">
          {nav.map((item, i) => (
            <a
              key={item}
              href="#"
              className={`group relative text-sm font-medium transition-colors ${
                i === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all ${
                  i === 0 ? "w-6 shadow-[0_0_8px_var(--color-primary)]" : "w-0 group-hover:w-6"
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="group relative hidden xl:block">
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
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/10">
              <LogIn className="h-4 w-4 text-primary" />
              Sign In
            </a>
            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-primary/10">
              <UserPlus className="h-4 w-4 text-primary" />
              Create Account
            </a>
          </div>
        </div>
        <button className="rounded-lg border border-primary/40 p-2 text-primary xl:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
       </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-10 lg:pt-20">
        {/* Left copy */}
        <div className="animate-fade-up">
          <h1 className="font-display text-[38px] font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-[56px]">
            <span className="block">Your Trusted</span>
            <span className="block">
              Partner in <span className="text-gradient-primary">Technology</span>
            </span>
            <span className="block">
              <span className="relative inline-block">
                <span className="text-gradient-primary">Innovation</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 5 Q 50 1, 100 4 T 198 3" fill="none" stroke="oklch(0.82 0.16 180)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                </svg>
              </span>
              {" & "}
              <span className="text-foreground">Digital Growth.</span>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[17px]">
            We deliver innovative and scalable technology solutions that help businesses transform ideas into
            impactful digital experiences, streamline operations, and achieve sustainable growth.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button className="btn-primary-glow group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-[15px] font-semibold">
              <Calendar className="h-4.5 w-4.5" />
              Get Free Consultation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button className="group inline-flex items-center gap-2.5 rounded-xl border border-primary/30 bg-white/[0.02] px-7 py-3.5 text-[15px] font-semibold text-foreground backdrop-blur transition hover:border-primary/70 hover:bg-primary/10">
              <MessageCircle className="h-4.5 w-4.5 text-primary transition-transform group-hover:scale-110" />
              WhatsApp Now
            </button>
          </div>

          {/* Stats */}
          <div className="mt-14 grid max-w-lg grid-cols-3 gap-4 border-t border-primary/15 pt-8">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div
                key={label}
                className="flex flex-col gap-2 animate-fade-up"
                style={{ animationDelay: `${0.4 + i * 0.15}s` }}
              >
                <Icon className="h-4 w-4 text-primary/80" strokeWidth={1.8} />
                <div className="font-display text-3xl font-bold text-foreground">{value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3D globe */}
        <div className="relative mx-auto h-[520px] w-full max-w-[620px] lg:h-[620px]">
          {/* Orbit rings */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <div
              className="absolute h-[420px] w-[420px] rounded-full border border-primary/25 animate-spin-slow lg:h-[480px] lg:w-[480px]"
              style={{ boxShadow: "inset 0 0 40px oklch(0.82 0.16 180 / 0.15)" }}
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
              <span className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/70" />
            </div>
            <div className="absolute h-[340px] w-[340px] rounded-full border border-dashed border-primary/20 animate-spin-reverse lg:h-[380px] lg:w-[380px]" />
            <div className="absolute h-[540px] w-[540px] rounded-full border border-primary/10 animate-spin-slow lg:h-[600px] lg:w-[600px]" />
          </div>

          {/* Globe */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative animate-float-slow">
              {/* Outer glow */}
              <div
                className="absolute inset-6 rounded-full blur-3xl animate-pulse-glow"
                style={{ background: "radial-gradient(circle, oklch(0.82 0.16 180 / 0.6), transparent 60%)" }}
              />
              {/* SVG Wireframe globe */}
              <div className="relative">
                <WireframeGlobe size={320} />
              </div>

              {/* Base platform */}
              <div className="absolute left-1/2 top-full -mt-2 h-28 w-[360px] -translate-x-1/2 lg:w-[420px]" aria-hidden>
                <div
                  className="absolute inset-x-0 top-0 h-10 rounded-[50%]"
                  style={{
                    background: "radial-gradient(ellipse at center, oklch(0.82 0.16 180 / 0.55), transparent 70%)",
                    filter: "blur(2px)",
                  }}
                />
                <div className="absolute inset-x-4 top-4 h-8 rounded-[50%] border border-primary/40" />
                <div className="absolute inset-x-12 top-8 h-8 rounded-[50%] border border-primary/25" />
                <div className="absolute inset-x-24 top-12 h-8 rounded-[50%] border border-primary/15" />
              </div>
            </div>
          </div>

          {/* Service cards */}
          {orbitCards.map(({ icon: Icon, label, pos, delay }) => (
            <div
              key={label}
              className={`absolute ${pos} corner-bracket service-card-3d animate-float-card rounded-lg px-3.5 py-2.5 lg:px-4 lg:py-3`}
              style={{ animationDelay: delay }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 lg:h-9 lg:w-9">
                  <Icon className="h-4 w-4 text-primary lg:h-4.5 lg:w-4.5" strokeWidth={1.75} />
                </div>
                <div className="text-left text-[11px] font-semibold leading-tight text-foreground lg:text-xs">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome robot popup */}
      <WelcomeRobot />
    </section>
  );
}