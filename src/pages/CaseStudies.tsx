import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, TrendingUp, Tag, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import ContentContainer from "@/components/ContentContainer";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import TechStackMarquee from "@/components/TechStackMarquee";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const caseStudies = [
  {
    id: 1,
    category: "Enterprise Software",
    title: "Enterprise ERP & Inventory Suite",
    client: "Manufacturing Group — Punjab, Pakistan",
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=900",
    problem: "The client operated across 3 warehouses with manual Excel-based inventory tracking, leading to stock discrepancies, delayed purchase orders, and over PKR 2M in annual shrinkage losses.",
    solution: "We designed and delivered a fully custom ERP suite with modules for Procurement, Inventory, HR, Payroll, and Financial Reporting. A real-time dashboard gave management instant visibility across all locations.",
    outcome: "65% reduction in order processing time, PKR 1.8M annual savings from shrinkage reduction, and 100% paperless operations within 6 months.",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Prisma", "REST API", "Docker"],
    metric: "65%",
    metricLabel: "Time Saved",
    duration: "6 months",
  },
  {
    id: 2,
    category: "IoT & Telematics",
    title: "IoT Fleet Telematics & Vehicle Tracking",
    client: "Logistics Company — Lahore, Pakistan",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=900",
    problem: "A mid-sized logistics firm was losing over 30% of fuel budget to inefficient routing, unauthorized vehicle use, and driver behavior issues — with zero real-time visibility into its 120-vehicle fleet.",
    solution: "We built a Flutter mobile app for drivers and a web dashboard for management, integrating IoT GPS trackers via WebSockets for live tracking. AI-assisted route optimization was added to minimize fuel consumption.",
    outcome: "30% improvement in fuel efficiency, 45% reduction in unauthorized mileage, and complete live fleet visibility for the operations team within 3 months.",
    tags: ["Flutter", "WebSockets", "Google Maps API", "Node.js", "MongoDB", "AWS IoT"],
    metric: "30%",
    metricLabel: "Fuel Efficiency",
    duration: "4 months",
  },
  {
    id: 3,
    category: "Automation & Logistics",
    title: "Logistics & Parcel Dispatch Automation",
    client: "E-commerce Fulfillment Center — Karachi, Pakistan",
    cover: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=900",
    problem: "The client was manually generating shipping labels, tracking numbers, and courier handover sheets, limiting them to 500 shipments/day maximum with frequent errors causing failed deliveries.",
    solution: "We developed a full-stack dispatch automation platform integrated with 6 major courier APIs (TCS, Leopards, Trax, Swyft, MNP, Pakistan Post). Bulk label printing, automated tracking, and real-time status sync were built from scratch.",
    outcome: "5,000+ daily shipping labels generated automatically. 95% reduction in manual data entry errors. 10x increase in dispatch capacity with the same team size.",
    tags: ["Full-Stack Web", "REST APIs", "Courier Integrations", "React", "Express", "MySQL"],
    metric: "5,000+",
    metricLabel: "Daily Labels",
    duration: "3 months",
  },
];

const CaseStudies = () => {
  return (
    <Layout>
      <SEO
        title="Case Studies & Portfolio"
        description="Explore Devionic's real-world case studies — enterprise ERP systems, IoT fleet telematics, and logistics automation delivering measurable business results."
        canonical="/case-studies"
      />

      <PageHero
        title="Case Studies &"
        highlight="Portfolio"
        subtitle="Real projects. Measurable impact. Discover how we've helped businesses solve complex challenges with technology."
      />

      {/* Case Studies Grid */}
      <section className="py-20 bg-background">
        <ContentContainer variant="default">
          <SectionHeading
            subtitle="Featured Case Studies"
            title="Real Impact, Measurable Results"
            description="Each project below represents a genuine client challenge solved with custom technology. The numbers speak for themselves."
          />

          <div className="space-y-12">
            {caseStudies.map((cs, i) => (
              <motion.div
                key={cs.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="bg-card border border-border rounded-3xl overflow-hidden hover:border-cyan/40 hover:shadow-2xl hover:shadow-cyan/5 transition-all duration-500 group"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  {/* Image */}
                  <div className="relative h-72 lg:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/20 transition-colors z-10" />
                    <img
                      src={cs.cover}
                      alt={cs.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-cyan text-navy-dark text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {cs.category}
                      </span>
                    </div>
                    {/* Metric overlay */}
                    <div className="absolute bottom-4 right-4 z-20 text-right">
                      <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                        <p className="text-4xl font-bold text-cyan">{cs.metric}</p>
                        <p className="text-white/80 text-xs font-medium">{cs.metricLabel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                      <Clock size={13} />
                      <span>{cs.duration} project</span>
                      <span className="mx-1">·</span>
                      <span>{cs.client}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-card-foreground mb-5 group-hover:text-cyan transition-colors">{cs.title}</h3>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Problem</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{cs.problem}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Our Solution</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{cs.solution}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-cyan mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground font-medium leading-relaxed">{cs.outcome}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {cs.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-cyan text-xs font-medium rounded-full border border-cyan/20">
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link to="/contact">
                      <Button variant="outline" className="hover:bg-cyan hover:text-navy-dark hover:border-cyan transition-all group/btn">
                        Discuss a Similar Project
                        <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      {/* Tech Stack */}
      <TechStackMarquee />

      {/* CTA */}
      <section className="py-20 bg-white">
        <ContentContainer variant="default">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Build Your <span className="text-accent">Success Story?</span>
            </h2>
            <p className="text-foreground/70 mb-8 max-w-xl mx-auto">
              Every project starts with a conversation. Let's discuss how we can engineer measurable results for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="cyan" size="lg">Start a Project</Button>
              </Link>
              <a href="https://wa.me/923177121841?text=Hi%20Devionic!%20I%20saw%20your%20case%20studies%20and%20would%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary" size="lg">
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default CaseStudies;
