import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import apiClient from "@/lib/apiClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, Briefcase, GraduationCap, ArrowRight,
  ArrowLeft, CheckCircle, Users, Calendar,
  Building2, ChevronRight, Send, FileText, Target,
  Loader2, Shield, TrendingUp, Heart, Award
} from "lucide-react";

/* ── Animation variants ────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.07, duration: 0.5 },
  }),
};

/* ── Why Join perks ─────────────────────────────────────────────── */
const perks = [
  { icon: TrendingUp, title: "Career Growth", desc: "Structured advancement paths with regular performance reviews and skill development programs." },
  { icon: Award,      title: "Competitive Pay", desc: "Market-leading compensation with transparent salary bands and performance bonuses." },
  { icon: Users,      title: "Great Culture", desc: "A collaborative, inclusive workplace where every voice is valued and ideas are welcomed." },
  { icon: Heart,      title: "Work-Life Balance", desc: "Flexible scheduling, generous leave, and a leadership team that respects personal time." },
];

/* ═══════════════════════════════════════════════════════════════ */
const JobDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const response = await apiClient.get(`/public/jobs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  /* ── Loading ─────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-accent/20" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-accent animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm tracking-wide uppercase font-medium">Loading position</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Not Found ───────────────────────────────────────────────── */
  if (isError || !job) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
            <div className="w-24 h-24 rounded-3xl bg-muted border border-border flex items-center justify-center mx-auto mb-8">
              <FileText size={36} className="text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Position Unavailable</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              This role may have been filled, expired, or removed. Browse our current openings below.
            </p>
            <Link to="/careers">
              <Button variant="cyan" size="lg">
                <ArrowLeft size={16} className="mr-2" /> Browse Openings
              </Button>
            </Link>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const postedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <Layout>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║  HERO BANNER                                             ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section className="relative pt-24 pb-16 bg-navy-gradient overflow-hidden">
        {/* Background grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(174,100%,40%) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(174,100%,40%) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
        {/* Glowing orb */}
        <div className="absolute -right-48 -top-48 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
        <div className="absolute -left-32 bottom-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
          {/* Breadcrumb */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeIn}
            className="flex items-center gap-2 text-sm text-primary-foreground/40 mb-10"
          >
            <Link to="/careers" className="hover:text-accent transition-colors duration-200 font-medium">Careers</Link>
            <ChevronRight size={14} />
            <span className="text-primary-foreground/60 line-clamp-1">{job.title}</span>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* ── Left hero content ── */}
            <div className="lg:col-span-2">
              {/* Department pill */}
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 border border-accent/25 px-4 py-1.5 rounded-full tracking-widest uppercase mb-6">
                  <Building2 size={11} />
                  {job.department}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial="hidden" animate="visible" custom={1} variants={fadeUp}
                className="text-3xl sm:text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-[1.15] tracking-tight"
              >
                {job.title}
              </motion.h1>

              {/* Meta chips */}
              <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { icon: MapPin, val: job.location },
                  { icon: Clock,  val: job.type },
                  ...(postedDate ? [{ icon: Calendar, val: postedDate }] : []),
                  ...(job.id_code ? [{ icon: Target,   val: job.id_code }] : []),
                ].map(({ icon: Icon, val }, i) => (
                  <div key={i}
                    className="flex items-center gap-2 text-sm text-primary-foreground/70 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-xl"
                  >
                    <Icon size={13} className="text-accent" />
                    <span>{val}</span>
                  </div>
                ))}
              </motion.div>


            </div>

            {/* ── Sticky apply card (hero column) ── */}
            <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-7 sticky top-28">
                <h3 className="text-xl font-bold text-primary-foreground mb-2">Ready to apply?</h3>
                <p className="text-primary-foreground/50 text-sm mb-6 leading-relaxed">
                  Our HR team typically responds within 3–5 business days of receiving your application.
                </p>
                <Link to={`/careers/apply/${job.id}`} className="block mb-3">
                  <Button variant="cyan" size="lg" className="w-full font-bold shadow-lg">
                    <Send size={15} className="mr-2" /> Apply for this Role
                  </Button>
                </Link>
                <Link to="/careers" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    <ArrowLeft size={15} className="mr-2" /> View All Positions
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════════════╗
          ║  MAIN CONTENT                                            ║
          ╚══════════════════════════════════════════════════════════╝ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12 items-start">

            {/* ── Left: Detail panels ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* About the Role */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0} variants={fadeUp}>
                <SectionPanel
                  icon={<Briefcase size={18} className="text-accent" />}
                  title="About the Role"
                >
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                    {job.description}
                  </p>
                </SectionPanel>
              </motion.div>

              {/* Requirements */}
              {job.requirements?.length > 0 && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={1} variants={fadeUp}>
                  <SectionPanel
                    icon={<GraduationCap size={18} className="text-accent" />}
                    title="Requirements"
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      {job.requirements.map((req: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                          <CheckCircle size={16} className="text-accent shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground leading-snug">{req}</span>
                        </div>
                      ))}
                    </div>
                  </SectionPanel>
                </motion.div>
              )}

              {/* Why Join Devionic */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={2} variants={fadeUp}>
                <SectionPanel
                  icon={<Shield size={18} className="text-accent" />}
                  title="Why Join Devionic?"
                >
                  <div className="grid sm:grid-cols-2 gap-5">
                    {perks.map((perk, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                          <perk.icon size={18} className="text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm mb-1">{perk.title}</h4>
                          <p className="text-muted-foreground text-xs leading-relaxed">{perk.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionPanel>
              </motion.div>

              {/* CTA bar */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border"
              >
                <Link to={`/careers/apply/${job.id}`} className="flex-1">
                  <Button variant="cyan" size="lg" className="w-full font-bold">
                    Apply for this Position <ArrowRight size={17} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/careers" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full">
                    <ArrowLeft size={17} className="mr-2" /> All Positions
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* ── Right: Sidebar ──────────────────────────────────── */}
            <div className="space-y-6">

              {/* Position Summary */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-secondary/50">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <FileText size={14} className="text-accent" /> Position Summary
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { icon: Building2, label: "Department", value: job.department },
                      { icon: MapPin,    label: "Location",   value: job.location },
                      { icon: Clock,     label: "Type",       value: job.type },
                      ...(postedDate   ? [{ icon: Calendar, label: "Posted",    value: postedDate }] : []),
                      ...(job.id_code  ? [{ icon: Target,   label: "Job Code",  value: job.id_code }] : []),
                    ].map(({ icon: Icon, label, value }, i) => (
                      <div key={i} className="flex items-center gap-3 px-6 py-4">
                        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>



              {/* Apply card (sidebar) */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}>
                <div className="relative bg-navy-gradient rounded-2xl overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />
                  <div className="relative p-6">
                    <h3 className="font-bold text-primary-foreground text-base mb-2">Interested in this role?</h3>
                    <p className="text-primary-foreground/50 text-xs mb-5 leading-relaxed">
                      Join Devionic and work on meaningful projects with a world-class team.
                    </p>
                    <Link to={`/careers/apply/${job.id}`}>
                      <Button variant="cyan" className="w-full font-bold" size="lg">
                        <Send size={14} className="mr-2" /> Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}>
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-semibold">Questions?</p>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Reach out to our HR team directly
                  </p>
                  <a href="mailto:info@devionic.com"
                    className="text-accent font-bold text-sm hover:underline underline-offset-4 transition-all"
                  >
                    info@devionic.com
                  </a>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

/* ── Reusable section panel ─────────────────────────────────────── */
const SectionPanel = ({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden">
    {/* Header bar */}
    <div className="flex items-center gap-3 px-7 py-5 border-b border-border bg-secondary/40">
      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
    {/* Body */}
    <div className="px-7 py-6">{children}</div>
  </div>
);

export default JobDetail;
