import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code, Smartphone, Palette, Bot, Share2, TrendingUp,
  Shield, Image, Film, ShoppingCart, Briefcase,
  Network, BarChart3, Globe, Headphones, ArrowLeft, ArrowRight,
  CheckCircle2, Server, Database, Cloud, Zap, Cpu, Settings,
  Lock, Eye, RefreshCw, MessageSquare, Layers, Monitor,
  GitBranch, Search, Target, Play, Star, Brush, Type,
  Package, CreditCard, Truck, BarChart2, Users, Mail,
  Video, Scissors, Volume2, Layout, FileText, Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LayoutWrapper from "@/components/Layout";
import SEO from "@/components/SEO";
import apiClient from "@/lib/apiClient";
import ContentContainer from "@/components/ContentContainer";
import type { ComponentType } from "react";

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

type TechItem = {
  name: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

type ServiceMeta = {
  capabilities: string[];
  technologies: TechItem[];
};

// ------------------------------------------------------------------
// Full per-service metadata: 8 capabilities + 8 unique technologies
// ------------------------------------------------------------------
const SERVICE_META: Record<string, ServiceMeta> = {
  // ---- Software & Web Development ----
  "software": {
    capabilities: [
      "Custom Web Application Development",
      "Responsive & Mobile-First Design",
      "RESTful API Design & Integration",
      "Database Architecture & Optimization",
      "Authentication & Role-Based Access Control",
      "Performance Optimization & Caching",
      "Continuous Integration / Deployment (CI/CD)",
      "Scalable Cloud-Based Infrastructure",
    ],
    technologies: [
      { name: "React.js", icon: Code },
      { name: "Node.js", icon: Server },
      { name: "MySQL / PostgreSQL", icon: Database },
      { name: "AWS / Cloud", icon: Cloud },
      { name: "TypeScript", icon: FileText },
      { name: "Docker", icon: Package },
      { name: "Git & GitHub", icon: GitBranch },
      { name: "Vite / Webpack", icon: Zap },
    ],
  },

  // ---- Mobile App Development ----
  "mobile": {
    capabilities: [
      "Cross-Platform iOS & Android Apps",
      "Native Performance Optimization",
      "Offline-First App Architecture",
      "Push Notifications & Real-Time Updates",
      "Third-Party SDK & API Integration",
      "App Store & Play Store Deployment",
      "User Analytics & Crash Reporting",
      "Secure Local & Cloud Data Storage",
    ],
    technologies: [
      { name: "Flutter", icon: Smartphone },
      { name: "React Native", icon: Code },
      { name: "iOS (Swift)", icon: Cpu },
      { name: "Android (Kotlin)", icon: Play },
      { name: "Firebase", icon: Cloud },
      { name: "REST APIs", icon: Network },
      { name: "SQLite / Hive", icon: Database },
      { name: "Figma (UI)", icon: Palette },
    ],
  },

  // ---- UI/UX Design ----
  "ui": {
    capabilities: [
      "User Research & Persona Development",
      "Information Architecture Planning",
      "Low & High-Fidelity Wireframing",
      "Interactive Prototype Creation",
      "Component-Based Design Systems",
      "Accessibility (WCAG) Compliance",
      "Usability Testing & Iteration",
      "Brand-Aligned Visual Language",
    ],
    technologies: [
      { name: "Figma", icon: Palette },
      { name: "Adobe XD", icon: Brush },
      { name: "Illustrator", icon: Image },
      { name: "Prototyping", icon: Layers },
      { name: "Design Systems", icon: Layout },
      { name: "User Testing", icon: Users },
      { name: "Typography", icon: Type },
      { name: "Color Theory", icon: Star },
    ],
  },

  // ---- AI Automation & Tools ----
  "ai": {
    capabilities: [
      "Business Process Automation",
      "AI-Powered Chatbots & Virtual Assistants",
      "Custom ML Model Training & Deployment",
      "Data Pipeline Design & Management",
      "Natural Language Processing (NLP)",
      "Automated Reporting & Dashboards",
      "API & Webhook Workflow Integration",
      "Predictive Analytics & Insights",
    ],
    technologies: [
      { name: "Python", icon: Code },
      { name: "TensorFlow / PyTorch", icon: Bot },
      { name: "OpenAI API", icon: Zap },
      { name: "LangChain", icon: Network },
      { name: "PostgreSQL / MongoDB", icon: Database },
      { name: "n8n / Zapier", icon: RefreshCw },
      { name: "Cloud Functions", icon: Cloud },
      { name: "Data APIs", icon: BarChart3 },
    ],
  },

  // ---- Digital Marketing ----
  "marketing": {
    capabilities: [
      "Search Engine Optimization (SEO)",
      "Pay-Per-Click (PPC) Advertising",
      "Social Media Strategy & Management",
      "Content Marketing & Blog Strategy",
      "Email Campaign Design & Automation",
      "Conversion Rate Optimization (CRO)",
      "Performance Analytics & Reporting",
      "Competitor Research & Market Analysis",
    ],
    technologies: [
      { name: "Google Ads", icon: Target },
      { name: "Meta Ads Manager", icon: Share2 },
      { name: "SEO Tools (Ahrefs)", icon: Search },
      { name: "Google Analytics", icon: BarChart2 },
      { name: "Mailchimp / Brevo", icon: Mail },
      { name: "Hootsuite / Buffer", icon: MessageSquare },
      { name: "Canva / Adobe", icon: Palette },
      { name: "Google Search Console", icon: Globe },
    ],
  },

  // ---- Cyber Security ----
  "security": {
    capabilities: [
      "Vulnerability Assessment & Penetration Testing",
      "Web Application Firewall (WAF) Setup",
      "SSL/TLS Certificate Management",
      "Data Encryption & Secure Storage",
      "Intrusion Detection & Monitoring",
      "Role-Based Access Control (RBAC)",
      "Security Audit & Compliance Reports",
      "Incident Response & Recovery Planning",
    ],
    technologies: [
      { name: "OWASP Standards", icon: Shield },
      { name: "SSL / TLS", icon: Lock },
      { name: "Firewalls & WAFs", icon: Eye },
      { name: "Kali Linux Tools", icon: Cpu },
      { name: "SIEM Systems", icon: Monitor },
      { name: "Encryption (AES/RSA)", icon: Server },
      { name: "Two-Factor Auth", icon: Settings },
      { name: "GDPR Compliance", icon: FileText },
    ],
  },

  // ---- Graphic Design ----
  "graphic": {
    capabilities: [
      "Brand Identity & Logo Design",
      "Business Card & Stationery Design",
      "Social Media Post & Cover Design",
      "Marketing Flyer & Brochure Design",
      "Product Packaging & Label Design",
      "Banner & Outdoor Advertising Design",
      "Infographic & Data Visualization",
      "Presentation & Pitch Deck Design",
    ],
    technologies: [
      { name: "Adobe Photoshop", icon: Image },
      { name: "Adobe Illustrator", icon: Brush },
      { name: "Adobe InDesign", icon: FileText },
      { name: "Canva Pro", icon: Palette },
      { name: "Figma", icon: Layers },
      { name: "CorelDRAW", icon: Star },
      { name: "After Effects", icon: Zap },
      { name: "Typography Tools", icon: Type },
    ],
  },

  // ---- Video Editing ----
  "video": {
    capabilities: [
      "Promotional & Brand Video Production",
      "Short-Form Reels & TikTok Editing",
      "YouTube Video Post-Production",
      "Motion Graphics & Animated Text",
      "Color Grading & Visual Enhancement",
      "Sound Design & Audio Mixing",
      "Explainer & Whiteboard Animations",
      "Video Thumbnail & Cover Design",
    ],
    technologies: [
      { name: "Adobe Premiere Pro", icon: Film },
      { name: "Adobe After Effects", icon: Zap },
      { name: "DaVinci Resolve", icon: Video },
      { name: "Final Cut Pro", icon: Scissors },
      { name: "Adobe Audition", icon: Mic },
      { name: "Motion Graphics", icon: Play },
      { name: "Sound Design", icon: Volume2 },
      { name: "Color Grading", icon: Eye },
    ],
  },

  // ---- E-commerce Solutions ----
  "ecommerce": {
    capabilities: [
      "Custom Online Store Development",
      "Product Catalog & Inventory Management",
      "Secure Payment Gateway Integration",
      "Order Tracking & Fulfilment System",
      "Customer Account & Wishlist Portals",
      "Multi-Currency & Multi-Language Support",
      "Shopping Cart Optimization & UX",
      "Sales Analytics & Revenue Reporting",
    ],
    technologies: [
      { name: "WooCommerce", icon: ShoppingCart },
      { name: "Shopify", icon: Package },
      { name: "Payment Gateways", icon: CreditCard },
      { name: "React.js / Next.js", icon: Code },
      { name: "MySQL / PostgreSQL", icon: Database },
      { name: "Shipping APIs", icon: Truck },
      { name: "Cloud Hosting", icon: Cloud },
      { name: "Analytics Tools", icon: BarChart2 },
    ],
  },

  // ---- Brand & Content Strategy ----
  "brand": {
    capabilities: [
      "Brand Vision & Mission Development",
      "Target Audience Research & Segmentation",
      "Content Calendar Planning & Scheduling",
      "Brand Voice & Tone Guidelines",
      "SEO-Driven Blog & Article Writing",
      "Social Media Content Creation",
      "Competitor Brand Analysis",
      "Brand Performance Measurement & Reporting",
    ],
    technologies: [
      { name: "Content Strategy", icon: FileText },
      { name: "SEO Research Tools", icon: Search },
      { name: "Analytics Platforms", icon: BarChart3 },
      { name: "Social Scheduling", icon: Globe },
      { name: "Copywriting Tools", icon: Type },
      { name: "Market Research", icon: Target },
      { name: "Branding Frameworks", icon: Briefcase },
      { name: "Email Marketing", icon: Mail },
    ],
  },
};

// Match a service title to its metadata key
const getServiceMeta = (title: string): ServiceMeta => {
  const t = title.toLowerCase();
  if (t.includes("web") || t.includes("software")) return SERVICE_META["software"];
  if (t.includes("mobile") || t.includes("app")) return SERVICE_META["mobile"];
  if (t.includes("ui") || t.includes("ux") || t.includes("design") && !t.includes("graphic")) return SERVICE_META["ui"];
  if (t.includes("ai") || t.includes("automation")) return SERVICE_META["ai"];
  if (t.includes("marketing") || t.includes("digital")) return SERVICE_META["marketing"];
  if (t.includes("cyber") || t.includes("security")) return SERVICE_META["security"];
  if (t.includes("graphic")) return SERVICE_META["graphic"];
  if (t.includes("video")) return SERVICE_META["video"];
  if (t.includes("ecommerce") || t.includes("e-commerce") || t.includes("commerce")) return SERVICE_META["ecommerce"];
  if (t.includes("brand") || t.includes("content") || t.includes("strategy")) return SERVICE_META["brand"];
  // Final fallback
  return {
    capabilities: [
      "Professional & Timely Delivery",
      "Customized Solutions for Your Needs",
      "Expert Team with Proven Track Record",
      "Regular Progress Updates & Communication",
      "Quality Assurance & Testing",
      "Post-Launch Support & Maintenance",
      "Scalable & Future-Proof Approach",
      "Competitive & Transparent Pricing",
    ],
    technologies: [
      { name: "Strategic Planning", icon: Briefcase },
      { name: "Analytics", icon: BarChart3 },
      { name: "Cloud Services", icon: Cloud },
      { name: "Automation", icon: Settings },
      { name: "Execution Tools", icon: Zap },
      { name: "Monitoring", icon: Monitor },
      { name: "Optimization", icon: TrendingUp },
      { name: "Reporting", icon: FileText },
    ],
  };
};

const processWorkflow = [
  { step: "01", title: "Discovery & Planning", desc: "We start by understanding your goals, audience, and technical requirements to create a robust roadmap." },
  { step: "02", title: "Strategy & Design", desc: "Our team crafts a comprehensive strategy and beautiful designs tailored to your brand identity." },
  { step: "03", title: "Development & Execution", desc: "We build and execute the solution using cutting-edge technologies and best practices." },
  { step: "04", title: "Launch & Support", desc: "After rigorous testing, we launch your project and provide ongoing support to ensure lasting success." },
];

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Code, Smartphone, Palette, Bot, Share2, TrendingUp,
  Shield, Image, Film, ShoppingCart, Briefcase,
  Network, BarChart3, Globe, Headphones,
};

const fallbackServices: ServiceCard[] = [
  { id: "fallback-web-development", title: "Software & Web Development", description: "Custom websites, portals, and web applications built for performance and growth.", icon: "Code", features: ["Custom Web Apps", "Responsive Design", "API Integration", "Database Design", "Authentication Systems", "Performance Tuning", "CI/CD Pipelines", "Cloud Deployment"] },
  { id: "fallback-mobile-apps", title: "Mobile App Development", description: "Native and cross-platform iOS and Android apps tailored to your business goals.", icon: "Smartphone", features: ["iOS Development", "Android Development", "Flutter Apps", "React Native", "Push Notifications", "Offline Support", "App Store Deployment", "Analytics Integration"] },
  { id: "fallback-ui-ux", title: "UI/UX Design", description: "Beautiful interfaces and user journeys designed to improve engagement and conversions.", icon: "Palette", features: ["User Research", "Wireframing", "Prototypes", "Design Systems", "Accessibility", "Usability Testing", "Interaction Design", "Visual Design"] },
  { id: "fallback-ai-automation", title: "AI Automation & Tools", description: "Smart automations and internal tools that save time and streamline operations.", icon: "Bot", features: ["Workflow Automation", "AI Chatbots", "ML Models", "Data Pipelines", "NLP Integration", "Automated Reports", "API Workflows", "Predictive Analytics"] },
  { id: "fallback-digital-marketing", title: "Digital Marketing", description: "SEO, social media, and digital campaigns to help your brand reach the right audience.", icon: "TrendingUp", features: ["SEO Optimization", "PPC Advertising", "Social Media", "Content Strategy", "Email Campaigns", "CRO Techniques", "Analytics Reports", "Market Research"] },
  { id: "fallback-cyber-security", title: "Cyber Security", description: "Security reviews and protection measures to keep your data and systems safe.", icon: "Shield", features: ["Penetration Testing", "WAF Setup", "SSL Management", "Data Encryption", "Intrusion Detection", "RBAC Controls", "Security Audits", "Incident Response"] },
  { id: "fallback-graphics", title: "Graphic Design", description: "Branding, social graphics, and visual assets that make your business stand out.", icon: "Image", features: ["Logo Design", "Brand Identity", "Social Media Posts", "Flyers & Brochures", "Packaging Design", "Banner Ads", "Infographics", "Pitch Decks"] },
  { id: "fallback-video-editing", title: "Video Editing", description: "Engaging video content for promotions, explainers, reels, and campaigns.", icon: "Film", features: ["Promotional Videos", "Reels & Shorts", "YouTube Editing", "Motion Graphics", "Color Grading", "Sound Mixing", "Explainer Animations", "Thumbnail Design"] },
  { id: "fallback-ecommerce", title: "E-commerce Solutions", description: "Online stores and checkout flows built to convert visitors into customers.", icon: "ShoppingCart", features: ["Online Store Setup", "Product Catalogs", "Payment Gateways", "Order Tracking", "Customer Portals", "Multi-Currency", "Cart Optimization", "Sales Analytics"] },
  { id: "fallback-brand-strategy", title: "Brand & Content Strategy", description: "Content planning and brand positioning that keeps your message consistent.", icon: "Briefcase", features: ["Brand Vision", "Audience Research", "Content Calendars", "Brand Voice", "Blog Writing", "Social Content", "Competitor Analysis", "Performance Reports"] },
];

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/public/services");
        const services: ServiceCard[] = Array.isArray(response.data) ? response.data : [];
        let found = services.find(s => String(s.id) === String(id));
        if (!found) found = fallbackServices.find(s => String(s.id) === String(id));
        setService(found || null);
      } catch {
        const found = fallbackServices.find(s => String(s.id) === String(id));
        setService(found || null);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Loading service details...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!service) {
    return (
      <LayoutWrapper>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/services")}>Back to Services</Button>
        </div>
      </LayoutWrapper>
    );
  }

  const IconComponent = iconMap[service.icon] || Code;
  const meta = getServiceMeta(service.title);
  // Merge API features + extra capabilities (deduplicated), minimum 8
  const allCapabilities = Array.from(new Set([...(service.features || []), ...meta.capabilities])).slice(0, Math.max(8, (service.features || []).length + meta.capabilities.length));
  const displayCapabilities = allCapabilities.length >= 8 ? allCapabilities : [...allCapabilities, ...meta.capabilities].slice(0, 8);
  const technologies = meta.technologies;

  return (
    <LayoutWrapper>
      <SEO
        title={`${service.title} | Devionic`}
        description={service.description}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
        <div className="absolute -right-40 -top-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />
        <ContentContainer variant="default" className="relative z-10">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to all services
          </button>

          <div className="max-w-4xl">
            <motion.div
              initial="hidden" animate="visible" custom={0} variants={fadeUp}
              className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6"
            >
              <IconComponent size={32} className="text-accent" />
            </motion.div>
            <motion.h1
              initial="hidden" animate="visible" custom={1} variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              {service.title}
            </motion.h1>
            <motion.p
              initial="hidden" animate="visible" custom={2} variants={fadeUp}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
            >
              {service.description}
            </motion.p>
          </div>
        </ContentContainer>
      </section>

      {/* Overview & Key Capabilities */}
      <section className="py-20 bg-card">
        <ContentContainer variant="default">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={0} variants={fadeUp}>
              <h2 className="text-3xl font-bold mb-6">Service Overview</h2>
              <div className="text-muted-foreground space-y-4">
                <p className="text-lg leading-relaxed">
                  At Devionic, our <strong className="text-foreground">{service.title}</strong> services are designed to bring your vision to life through cutting-edge technology and strategic planning. We focus on scalability, performance, and delivering exceptional user experiences.
                </p>
                <p className="text-lg leading-relaxed">
                  Our approach combines deep technical expertise with a keen understanding of business objectives, ensuring that every solution we deliver drives measurable results and sustainable growth for your organization.
                </p>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={1} variants={fadeUp}
              className="bg-background rounded-2xl p-8 border border-border"
            >
              <h3 className="text-xl font-bold mb-6">Key Capabilities</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {displayCapabilities.map((cap, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground leading-snug">{cap}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </ContentContainer>
      </section>

      {/* Core Technologies */}
      <section className="py-20 bg-background border-y border-border">
        <ContentContainer variant="default">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Technologies</h2>
            <p className="text-muted-foreground">We utilize industry-leading tools and frameworks purpose-built for {service.title}.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {technologies.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-accent/40 hover:bg-accent/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <tech.icon size={24} className="text-accent" />
                </div>
                <span className="font-semibold text-sm">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* Process Workflow */}
      <section className="py-20 bg-card">
        <ContentContainer variant="default">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Process</h2>
            <p className="text-muted-foreground">A proven, structured methodology that ensures successful delivery every time.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {processWorkflow.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} custom={i} variants={fadeUp}
                className="relative"
              >
                <div className="text-6xl font-black text-accent/10 mb-3 leading-none">{step.step}</div>
                <div className="w-8 h-0.5 bg-accent/40 mb-4" />
                <h3 className="text-base font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {i < processWorkflow.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-[1px] bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent/5">
        <ContentContainer variant="default" className="text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your project?</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Let's discuss how our <strong className="text-foreground">{service.title}</strong> expertise can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/923177121841?text=${encodeURIComponent(`Hi, I'm interested in your ${service.title} service.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="cyan" size="lg" className="w-full sm:w-auto">
                  <Headphones className="mr-2" size={18} /> Discuss on WhatsApp
                </Button>
              </a>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate("/services")}>
                View All Services <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>
          </motion.div>
        </ContentContainer>
      </section>
    </LayoutWrapper>
  );
};

export default ServiceDetail;
