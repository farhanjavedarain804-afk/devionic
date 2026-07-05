import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code, Smartphone, Palette, Bot, Share2, TrendingUp,
  Shield, Image, Film, ShoppingCart, Youtube, Briefcase,
  Network, BarChart3, Globe, Headphones, ArrowRight, MessageCircle,
  X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PhoneInput from "@/components/PhoneInput";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import type { ComponentType } from "react";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }),
};

type ServiceCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
};

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Code, Smartphone, Palette, Bot, Share2, TrendingUp,
  Shield, Image, Film, ShoppingCart, Youtube, Briefcase,
  Network, BarChart3, Globe, Headphones,
};

const fallbackServices: ServiceCard[] = [
  {
    id: "fallback-web-development",
    title: "Software & Web Development",
    description: "Custom websites, portals, and web applications built for performance and growth.",
    icon: "Code",
    features: ["React", "Vite", "Node.js", "Responsive Design"],
  },
  {
    id: "fallback-mobile-apps",
    title: "Mobile App Development",
    description: "Native and cross-platform iOS and Android apps tailored to your business goals.",
    icon: "Smartphone",
    features: ["iOS", "Android", "Flutter", "React Native"],
  },
  {
    id: "fallback-ui-ux",
    title: "UI/UX Design",
    description: "Beautiful interfaces and user journeys designed to improve engagement and conversions.",
    icon: "Palette",
    features: ["Wireframes", "Prototypes", "Design Systems", "User Research"],
  },
  {
    id: "fallback-ai-automation",
    title: "AI Automation & Tools",
    description: "Smart automations and internal tools that save time and streamline operations.",
    icon: "Bot",
    features: ["Workflow Automation", "Dashboards", "Bots", "Integrations"],
  },
  {
    id: "fallback-digital-marketing",
    title: "Digital Marketing",
    description: "SEO, social media, and digital campaigns to help your brand reach the right audience.",
    icon: "TrendingUp",
    features: ["SEO", "Social Media", "Ads", "Analytics"],
  },
  {
    id: "fallback-cyber-security",
    title: "Cyber Security",
    description: "Security reviews and protection measures to keep your data and systems safe.",
    icon: "Shield",
    features: ["Risk Review", "Hardening", "Monitoring", "Best Practices"],
  },
  {
    id: "fallback-graphics",
    title: "Graphic Design",
    description: "Branding, social graphics, and visual assets that make your business stand out.",
    icon: "Image",
    features: ["Logos", "Brand Kits", "Social Posts", "Marketing Assets"],
  },
  {
    id: "fallback-video-editing",
    title: "Video Editing",
    description: "Engaging video content for promotions, explainers, reels, and campaigns.",
    icon: "Film",
    features: ["Reels", "Promos", "Motion Graphics", "Thumbnails"],
  },
  {
    id: "fallback-ecommerce",
    title: "E-commerce Solutions",
    description: "Online stores and checkout flows built to convert visitors into customers.",
    icon: "ShoppingCart",
    features: ["Product Catalogs", "Checkout", "Payments", "Order Management"],
  },
  {
    id: "fallback-brand-strategy",
    title: "Brand & Content Strategy",
    description: "Content planning and brand positioning that keeps your message consistent.",
    icon: "Briefcase",
    features: ["Strategy", "Copywriting", "Brand Voice", "Planning"],
  },
];

const pendingQuotesStorageKey = "devionic_pending_quotes";

type PendingQuoteRequest = {
  createdAt: string;
  payload: Record<string, string>;
};

const loadPendingQuotes = (): PendingQuoteRequest[] => {
  try {
    const stored = localStorage.getItem(pendingQuotesStorageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const savePendingQuotes = (requests: PendingQuoteRequest[]) => {
  localStorage.setItem(pendingQuotesStorageKey, JSON.stringify(requests));
};

const Services = () => {
  const { toast } = useToast();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<ServiceCard[]>(fallbackServices);
  const [quoteForm, setQuoteForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    company_name: "",
    country: "",
    budget: "", 
    timeline: "", 
    description: "" 
  });

  useEffect(() => {
    const syncPendingQuotes = async () => {
      const pendingQuotes = loadPendingQuotes();
      if (!pendingQuotes.length) return;

      const remainingQuotes: PendingQuoteRequest[] = [];

      for (const pendingQuote of pendingQuotes) {
        try {
          await apiClient.post("/public/quotes", pendingQuote.payload);
        } catch {
          remainingQuotes.push(pendingQuote);
          break;
        }
      }

      savePendingQuotes(remainingQuotes);

      if (pendingQuotes.length && remainingQuotes.length < pendingQuotes.length) {
        toast({ title: "Pending quote requests synced", description: "A saved quote request was sent successfully." });
      }
    };

    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/public/services");
        if (Array.isArray(response.data) && response.data.length > 0) {
          setServices(response.data);
        }
      } catch (err) {
        console.warn("Using fallback services because live services could not be loaded:", err);
      }
    };

    fetchServices();
    syncPendingQuotes();
  }, [toast]);

  const openQuote = (serviceTitle?: string) => { setSelectedService(serviceTitle || ""); setQuoteOpen(true); };

  const submitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name.trim() || !quoteForm.email.trim() || !quoteForm.description.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/public/quotes", { 
        ...quoteForm, 
        service: selectedService 
      });
      toast({ title: "Quote request submitted! We'll contact you shortly." });
      setQuoteOpen(false);
      setQuoteForm({ 
        name: "", 
        email: "", 
        phone: "", 
        company_name: "",
        country: "",
        budget: "", 
        timeline: "", 
        description: "" 
      });
    } catch {
      const pendingQuotes = loadPendingQuotes();
      pendingQuotes.push({
        createdAt: new Date().toISOString(),
        payload: { ...quoteForm, service: selectedService },
      });
      savePendingQuotes(pendingQuotes);

      toast({
        title: "Saved locally for later sync",
        description: "We couldn't reach the API, so your quote request was queued.",
      });
      setQuoteOpen(false);
      setQuoteForm({ 
        name: "", 
        email: "", 
        phone: "", 
        company_name: "",
        country: "",
        budget: "", 
        timeline: "", 
        description: "" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO 
        title="Our Services" 
        description="Explore our wide range of professional IT services, including web development, mobile app creation, and AI automation tailored for your growth."
        canonical="/services"
      />
      <PageHero title="Our" highlight="Services" subtitle="Comprehensive IT solutions tailored to your business needs." />

      {/* Why Choose Our Services */}
      <section className="py-16 bg-background">
        <ContentContainer variant="default">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-muted-foreground leading-relaxed">
              At Devionic, we deliver comprehensive technology solutions tailored to the evolving needs of modern businesses. From custom software, websites, and mobile applications to AI driven automation, cloud services, marketing, creativity and digital transformation, our expert team combines innovation, creativity, and technical excellence to help organizations achieve sustainable growth and lasting success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "100% Secure", desc: "Enterprise-grade security for all solutions" },
              { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock technical assistance" },
              { icon: Globe, title: "Global Standards", desc: "International quality benchmarks" },
              { icon: TrendingUp, title: "Proven Results", desc: "Track record of successful deliveries" },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
                className="p-6 bg-card rounded-xl border border-border text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={22} className="text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      <section className="py-20 bg-secondary/50">
        <ContentContainer variant="default">
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, i) => {
                const IconComponent = iconMap[service.icon] || Code;
                return (
                  <motion.div key={service.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
                    className="bg-card rounded-xl p-8 border border-border hover:border-accent/30 transition-all duration-300 group flex flex-col">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                        <IconComponent size={24} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-card-foreground mb-2">{service.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(service.features || []).map((f: string) => (
                            <span key={f} className="text-xs px-3 py-1 bg-secondary rounded-full text-secondary-foreground">{f}</span>
                          ))}
                        </div>
                        <Link to={`/services/${service.id}`} className="inline-flex items-center text-sm font-semibold text-accent hover:text-accent/80 transition-colors mt-2">
                          View Details <ArrowRight size={14} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <a href={`https://wa.me/923177121841?text=${encodeURIComponent(`Hi, I'm interested in your ${service.title} service.`)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="cyan" size="sm" className="w-full"><MessageCircle size={16} /> WhatsApp</Button>
                      </a>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openQuote(service.title)}>
                        Get Quote <ArrowRight size={16} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-6">Need a custom solution? Let's talk!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="cyan" size="lg" onClick={() => openQuote()}>Get a Quote <ArrowRight size={18} /></Button>
                <a href="https://wa.me/923177121841" target="_blank" rel="noopener noreferrer"><Button variant="outline" size="lg">WhatsApp Us</Button></a>
              </div>
            </div>
          </>
        </ContentContainer>
      </section>

      {/* Get Quote Modal */}
      {quoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setQuoteOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-8 border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">Get a Quote</h2>
                {selectedService && <p className="text-sm text-accent font-semibold">{selectedService}</p>}
              </div>
              <button onClick={() => setQuoteOpen(false)} className="p-2 hover:bg-muted rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={submitQuote} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Full Name *</label>
                  <Input value={quoteForm.name} onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })} placeholder="Your full name" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Company Name (Optional)</label>
                  <Input value={quoteForm.company_name} onChange={e => setQuoteForm({ ...quoteForm, company_name: e.target.value })} placeholder="Your company" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Country *</label>
                  <Input value={quoteForm.country} onChange={e => setQuoteForm({ ...quoteForm, country: e.target.value })} placeholder="Your country" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Email *</label>
                  <Input type="email" value={quoteForm.email} onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })} placeholder="your@email.com" maxLength={255} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Phone</label>
                  <PhoneInput value={quoteForm.phone} onChange={v => setQuoteForm({ ...quoteForm, phone: v })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Budget</label>
                  <Input value={quoteForm.budget} onChange={e => setQuoteForm({ ...quoteForm, budget: e.target.value })} placeholder="Estimated budget" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-1 block">Timeline</label>
                  <Input value={quoteForm.timeline} onChange={e => setQuoteForm({ ...quoteForm, timeline: e.target.value })} placeholder="Expected timeline" maxLength={100} />
                </div>
              </div>
              <div><label className="text-sm font-medium text-card-foreground mb-1 block">Description *</label><Textarea value={quoteForm.description} onChange={e => setQuoteForm({ ...quoteForm, description: e.target.value })} placeholder="Describe what you need..." rows={4} maxLength={3000} /></div>
              <Button variant="cyan" size="lg" type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Request Quote"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Services;
