import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code, Smartphone, Palette, Bot,
  ArrowRight, Users, Clock, Zap, Award, Star,
  ChevronLeft, ChevronRight, Send, Loader2,
  CheckCircle2, Tag, TrendingUp, Calculator,
  MessageCircle, Shield, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import HeroSection from "@/components/HeroSection";
import SEO from "@/components/SEO";
import TechStackMarquee from "@/components/TechStackMarquee";
import EstimateModal from "@/components/EstimateModal";
import apiClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const services = [
  { icon: Code, title: "Software & Web Development", desc: "Custom websites and web applications built with modern technologies.", wa: "Hi Devionic! I'm interested in Software & Web Development. Could we discuss my project?" },
  { icon: Smartphone, title: "iOS & Android Apps", desc: "Native and cross-platform mobile applications.", wa: "Hi Devionic! I need a Mobile App (iOS/Android) built. I'd love to discuss the details." },
  { icon: Palette, title: "UI/UX Design", desc: "Beautiful, user-centered interfaces that convert.", wa: "Hi Devionic! I'm looking for professional UI/UX Design services. Can we connect?" },
  { icon: Bot, title: "AI Automation & Tools", desc: "Intelligent automation to streamline your operations.", wa: "Hi Devionic! I'm interested in AI Automation solutions for my business. Let's talk!" },
];

const whyUs = [
  { icon: Users, title: "Experienced Team", desc: "Skilled professionals with years of expertise." },
  { icon: Zap, title: "Fast Delivery", desc: "On-time project delivery, every time." },
  { icon: Award, title: "Affordable Pricing", desc: "Premium quality at competitive prices." },
  { icon: Clock, title: "24/7 Support", desc: "Round-the-clock assistance for all clients." },
];

const process = [
  { step: "01", title: "Consultation", desc: "Understanding your needs and goals." },
  { step: "02", title: "Planning", desc: "Strategic roadmap and architecture." },
  { step: "03", title: "Development", desc: "Building your solution with precision." },
  { step: "04", title: "Testing", desc: "Thorough QA and performance testing." },
  { step: "05", title: "Deployment", desc: "Smooth launch and go-live." },
  { step: "06", title: "Support", desc: "Ongoing maintenance and optimization." },
];

const featuredCaseStudies = [
  {
    id: 1,
    category: "Enterprise Software",
    title: "Enterprise ERP & Inventory Suite",
    outcome: "65% Time Saved",
    metric: "65%",
    metricLabel: "Time Saved",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: 2,
    category: "IoT & Telematics",
    title: "Fleet Telematics & Vehicle Tracking App",
    outcome: "30% Fuel Efficiency",
    metric: "30%",
    metricLabel: "Fuel Savings",
    tags: ["Flutter", "WebSockets", "Maps API"],
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: 3,
    category: "Automation & Logistics",
    title: "Parcel Dispatch Automation Platform",
    outcome: "5,000+ Daily Labels",
    metric: "5k+",
    metricLabel: "Daily Labels",
    tags: ["Full-Stack", "REST APIs", "Courier Integrations"],
    cover: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=900",
  },
];

const Index = () => {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tForm, setTForm] = useState({ name: "", role: "", company: "", message: "", rating: 5 });
  const [estimateOpen, setEstimateOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const response = await apiClient.get("/public/testimonials");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const displayTestimonials = Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : [
    { id: "1", name: "Ahmad R.", role: "CEO", company: "TechVenture", message: "Devionic transformed our business with a stunning website and powerful digital marketing strategy. Highly recommended!", rating: 5, verified: true },
    { id: "2", name: "Sarah K.", role: "Founder", company: "StyleHub", message: "Their UI/UX design and e-commerce solution helped us increase sales by 200%. Exceptional team!", rating: 5, verified: true },
    { id: "3", name: "Bilal M.", role: "Director", company: "CloudSync", message: "Professional, reliable, and innovative. Devionic delivered our AI automation project ahead of schedule.", rating: 5, verified: true },
    { id: "4", name: "John D.", role: "CTO", company: "DataFlow", message: "The mobile app they built is smooth and user-friendly. Great communication throughout the entire project.", rating: 5, verified: true },
    { id: "5", name: "Emma W.", role: "Marketing Lead", company: "GrowthX", message: "Outstanding results! Our web traffic doubled within months of launching the new portal.", rating: 5, verified: true },
  ];

  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
      setSlidesPerView(window.innerWidth < 768 ? 1 : 2);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const maxSlide = Math.max(0, displayTestimonials.length - slidesPerView);
  const nextSlide = () => setCurrentSlide(s => (s >= maxSlide ? 0 : s + 1));
  const prevSlide = () => setCurrentSlide(s => (s <= 0 ? maxSlide : s - 1));

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => setCurrentSlide(s => (s >= maxSlide ? 0 : s + 1)), 5000);
    return () => clearInterval(interval);
  }, [maxSlide, isPaused]);

  const submitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tForm.name.trim() || !tForm.message.trim()) {
      toast({ title: "Name and message are required", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/public/testimonials", tForm);
      toast({ title: "Thank you! Your testimonial has been submitted for review." });
      setTForm({ name: "", role: "", company: "", message: "", rating: 5 });
      setShowTestimonialForm(false);
    } catch (err: any) { toast({ title: err.response?.data?.message || err.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  return (
    <Layout>
      <SEO
        title="Professional IT Solutions"
        description="Devionic (Private) Limited — Premier software development, mobile apps, AI automation, and digital transformation services delivered globally from Pakistan."
        canonical="/"
      />

      {/* Estimate Modal */}
      <EstimateModal open={estimateOpen} onClose={() => setEstimateOpen(false)} />

      <HeroSection />

      {/* About Snapshot */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading subtitle="About Us" title="Inspiring Innovation Digitally" description="Devionic (Private) Limited is a forward thinking technology company based in Pakistan, delivering innovative software, web, mobile, AI, and digital solutions that empower businesses to innovate, grow, and succeed in an increasingly connected world." />
          <div className="text-center">
            <Link to="/about"><Button variant="cyan" size="lg">Learn More <ArrowRight size={18} /></Button></Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading subtitle="Our Services" title="Complete IT Solutions" description="From web development to AI automation, we offer comprehensive digital services to meet every business need." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div key={service.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
                <div className="block group h-full">
                  <div className="bg-card rounded-2xl p-8 h-full border border-border/40 hover:border-cyan/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan/10 flex flex-col group-hover:-translate-y-2">
                    <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-6">
                      <service.icon size={24} className="text-cyan" />
                    </div>
                    <h3 className="font-semibold text-card-foreground text-lg mb-3">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">{service.desc}</p>
                    <a
                      href={`https://wa.me/923177121841?text=${encodeURIComponent(service.wa)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 flex items-center gap-2 text-xs font-semibold text-cyan hover:gap-3 transition-all"
                    >
                      <MessageCircle size={13} /> Enquire on WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services"><Button variant="cyan" size="lg">View All Services <ArrowRight size={18} /></Button></Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED CASE STUDIES ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading
            subtitle="Featured Case Studies"
            title="Real Impact, Measurable Results"
            description="We don't just build software — we solve real business challenges. Here's proof."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {featuredCaseStudies.map((cs, i) => (
              <motion.div
                key={cs.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-cyan/40 hover:shadow-2xl hover:shadow-cyan/5 transition-all duration-500 group flex flex-col"
              >
                {/* Cover */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-colors z-10" />
                  <img
                    src={cs.cover}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 z-20 bg-cyan text-navy-dark text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {cs.category}
                  </span>
                  <div className="absolute bottom-3 right-3 z-20 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 text-right border border-white/10">
                    <p className="text-2xl font-bold text-cyan leading-none">{cs.metric}</p>
                    <p className="text-white/70 text-[10px] font-medium">{cs.metricLabel}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-card-foreground mb-3 group-hover:text-cyan transition-colors">{cs.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cs.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-cyan text-[10px] font-semibold rounded-full border border-cyan/20">
                        <Tag size={8} />{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <TrendingUp size={14} className="text-cyan" />
                    <span className="text-sm font-semibold text-foreground">{cs.outcome}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/case-studies">
              <Button variant="outline" size="lg" className="hover:bg-cyan hover:text-navy-dark hover:border-cyan transition-all">
                View All Case Studies <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-navy-gradient">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading subtitle="Why Choose Us" title="What Sets Us Apart" light />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="text-center p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] transition-colors">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan/20 to-blue-500/20 flex items-center justify-center">
                  <item.icon size={28} className="text-cyan" />
                </div>
                <h3 className="text-primary-foreground font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-primary-foreground/60 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK MARQUEE ── */}
      <TechStackMarquee />

      {/* Process */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeading subtitle="Our Process" title="How We Work" description="A structured approach to deliver exceptional results." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((item, i) => (
              <motion.div key={item.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="flex gap-6 p-8 bg-card rounded-2xl border border-border/40 hover:border-cyan/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <span className="text-5xl font-bold text-cyan/20 font-heading shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-card-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENHANCED TESTIMONIALS ── */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <SectionHeading subtitle="Testimonials" title="What Our Clients Say" />
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground mr-2 bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                <span className="text-foreground">{currentSlide + 1}</span> / {displayTestimonials.length}
              </div>
              <div className="flex items-center gap-2">
                <motion.button onClick={prevSlide} whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full border border-border hover:bg-muted transition-colors text-foreground">
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button onClick={nextSlide} whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full border border-border hover:bg-muted transition-colors text-foreground">
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="overflow-hidden relative px-1"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div
              className="flex"
              style={{ gap: '24px' }}
              animate={{ x: -(currentSlide * ((containerWidth - (slidesPerView > 1 ? 24 : 0)) / slidesPerView + (slidesPerView > 1 ? 24 : 24))) }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {displayTestimonials.map((t: any, i: number) => (
                <div
                  key={t.id}
                  style={{ minWidth: slidesPerView > 1 ? `calc(50% - 12px)` : `100%` }}
                  className="flex-shrink-0"
                >
                  <div className="bg-card rounded-xl p-8 border border-border h-full flex flex-col hover:border-cyan/30 transition-colors shadow-sm">
                    {/* Stars + Verified badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1">
                        {Array.from({ length: t.rating || 5 }).map((_, j) => (
                          <Star key={j} size={15} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      {(t.verified !== false) && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-cyan bg-cyan/10 border border-cyan/20 px-2.5 py-1 rounded-full">
                          <BadgeCheck size={11} />
                          Verified Client
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-6 italic flex-1 leading-relaxed">"{t.message}"</p>
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan/30 to-primary/50 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {t.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground text-sm">{t.name}</p>
                        <p className="text-muted-foreground text-xs">{t.role}{t.company ? `, ${t.company}` : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => setShowTestimonialForm(!showTestimonialForm)}>
              <Star size={16} /> Share Your Experience
            </Button>
          </div>

          <AnimatePresence>
            {showTestimonialForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <form onSubmit={submitTestimonial} className="max-w-lg mx-auto mt-8 bg-card rounded-xl p-6 border border-border space-y-4">
                  <h3 className="font-bold text-card-foreground text-center">Submit Your Testimonial</h3>
                  <p className="text-xs text-muted-foreground text-center">Your testimonial will be reviewed by our team before publishing.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium mb-1 block">Name *</label><Input value={tForm.name} onChange={e => setTForm({ ...tForm, name: e.target.value })} placeholder="Your name" maxLength={100} /></div>
                    <div><label className="text-sm font-medium mb-1 block">Company</label><Input value={tForm.company} onChange={e => setTForm({ ...tForm, company: e.target.value })} placeholder="Company" maxLength={100} /></div>
                  </div>
                  <div><label className="text-sm font-medium mb-1 block">Role</label><Input value={tForm.role} onChange={e => setTForm({ ...tForm, role: e.target.value })} placeholder="e.g. CEO, Manager" maxLength={100} /></div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => setTForm({ ...tForm, rating: s })}
                          className={`p-0.5 transition-colors ${tForm.rating >= s ? "text-yellow-400" : "text-muted-foreground/30"}`}>
                          <Star size={24} fill={tForm.rating >= s ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-sm font-medium mb-1 block">Your Experience *</label><Textarea value={tForm.message} onChange={e => setTForm({ ...tForm, message: e.target.value })} placeholder="Share your experience with Devionic..." rows={4} maxLength={1000} /></div>
                  <Button variant="cyan" type="submit" className="w-full" disabled={submitting}>
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit Testimonial</>}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA with Estimate Modal trigger ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Let's Build Something <span className="text-accent">Great Together</span>
            </h2>
            <p className="text-foreground/70 mb-8 max-w-xl mx-auto">Ready to take your business to the next level? Get a free project estimate in under 2 minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="cyan"
                size="xl"
                onClick={() => setEstimateOpen(true)}
                className="gap-2"
              >
                <Calculator size={18} /> Get a Free Estimate
              </Button>
              <Link to="/contact"><Button variant="outline" className="border-border text-foreground hover:bg-secondary" size="xl">Contact Us</Button></Link>
              <a href="https://wa.me/923177121841?text=Hi%20Devionic!%20I%27d%20like%20to%20discuss%20a%20project%20with%20your%20team." target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-green-500/30 text-green-600 hover:bg-green-50" size="xl">
                  <MessageCircle size={18} /> WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
