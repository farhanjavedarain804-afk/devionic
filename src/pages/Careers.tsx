import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase, ArrowRight, GraduationCap, Eye, Zap, Award, Users, Heart, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const perks = [
  { icon: Zap, title: "Growth Opportunities", desc: "Clear career paths and continuous learning" },
  { icon: Award, title: "Competitive Salary", desc: "Market-rate compensation packages" },
  { icon: Users, title: "Team Culture", desc: "Collaborative and supportive environment" },
  { icon: Heart, title: "Work-Life Balance", desc: "Flexible schedules and leave policies" },
];

const Careers = () => {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await apiClient.get("/public/jobs");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: internships = [], isLoading: loadingInternships } = useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const response = await apiClient.get("/public/internships");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  return (
    <Layout>
      <SEO 
        title="Careers | Join Our Team" 
        description="Build your career with Devionic. Explore our open positions and join a team of passionate professionals shaping the future of technology."
        canonical="/careers"
      />
      <PageHero title="Join Our" highlight="Team" subtitle="Build your career with Devionic and shape the future of technology." />

      <section className="py-12 bg-background">
        <ContentContainer variant="narrow" className="text-center">
          <div className="prose prose-lg mx-auto text-muted-foreground space-y-4">
            <p>Devionic is more than just a workplace — it's a launchpad for your career. We believe in nurturing talent, fostering creativity, and building a culture where every team member can thrive.</p>
          </div>
        </ContentContainer>
      </section>

      {/* Perks Cards */}
      <section className="py-12 bg-secondary/50">
        <ContentContainer variant="default">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {perks.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
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

      <section className="py-20 bg-background">
        <ContentContainer variant="default">
          <SectionHeading subtitle="Open Positions" title="Current Opportunities" description="Explore our open positions and find the right role for you." />

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Loading positions...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No open positions at the moment.</p>
              <p className="text-muted-foreground">Check back later or send your resume to info@devionic.com</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job, i) => (
                <motion.div key={job.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-navy-gradient p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-primary-foreground mb-1">{job.title}</h3>
                          <p className="text-primary-foreground/60 text-sm">{job.department}</p>
                          {(job as any).id_code && <p className="text-accent/80 text-xs font-mono mt-1">{(job as any).id_code}</p>}
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 bg-accent/20 text-accent rounded-full border border-accent/30 whitespace-nowrap">{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed line-clamp-3">{job.description}</p>
                    <div className="flex flex-wrap gap-3 mb-5">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
                        <MapPin size={14} className="text-accent" /><span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
                        <Clock size={14} className="text-accent" /><span>{job.type}</span>
                      </div>
                    </div>
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><GraduationCap size={14} className="text-accent" /> Requirements</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 5).map((req) => (
                            <span key={req} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">{req}</span>
                          ))}
                          {job.requirements.length > 5 && <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full">+{job.requirements.length - 5} more</span>}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Link to={`/careers/${job.id}`} className="flex-1"><Button variant="outline" className="w-full"><Eye size={16} /> See Details</Button></Link>
                      <Link to={`/careers/apply/${job.id}`} className="flex-1"><Button variant="cyan" className="w-full">Apply Now <ArrowRight size={16} /></Button></Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentContainer>
      </section>

      {/* Internships Section */}
      <section className="py-20 bg-secondary/50">
        <ContentContainer variant="default">
          <SectionHeading subtitle="Grow With Us" title="Internship Opportunities" description="Kick-start your career with hands-on experience, mentorship, and real-world projects at Devionic." />

          {loadingInternships ? (
            <div className="text-center text-muted-foreground py-12">Loading internships...</div>
          ) : internships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No internship openings at the moment.</p>
              <p className="text-muted-foreground">Check back later or apply with a general internship application below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internships.map((internship, i) => (
                <motion.div key={internship.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group">
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-6 relative overflow-hidden border-b border-accent/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                            <GraduationCap size={22} className="text-accent" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-1">{internship.title}</h3>
                            <p className="text-muted-foreground text-sm">{internship.department}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 bg-accent/20 text-accent rounded-full border border-accent/30 whitespace-nowrap">Internship</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed line-clamp-3">{internship.description}</p>
                    <div className="flex flex-wrap gap-3 mb-5">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
                        <MapPin size={14} className="text-accent" /><span>{internship.location}</span>
                      </div>
                      {internship.duration && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
                          <CalendarDays size={14} className="text-accent" /><span>{internship.duration}</span>
                        </div>
                      )}
                      {internship.stipend && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg">
                          <Award size={14} className="text-accent" /><span>{internship.stipend}</span>
                        </div>
                      )}
                    </div>
                    {internship.requirements && internship.requirements.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><GraduationCap size={14} className="text-accent" /> Requirements</p>
                        <div className="flex flex-wrap gap-2">
                          {internship.requirements.slice(0, 5).map((req: string) => (
                            <span key={req} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full font-medium">{req}</span>
                          ))}
                          {internship.requirements.length > 5 && <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full">+{internship.requirements.length - 5} more</span>}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Link to={`/careers/internship-apply/${internship.id}`} className="flex-1"><Button variant="cyan" className="w-full">Apply Now <ArrowRight size={16} /></Button></Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentContainer>
      </section>

      {/* General Application + Internship CTA */}
      <section className="py-20 bg-navy-gradient">
        <ContentContainer variant="default" className="text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Don't See Your Role? <span className="text-accent">Reach Out Anyway</span>
            </h2>
            <p className="text-primary-foreground/60 mb-8 max-w-xl mx-auto">We're always looking for talented individuals. Send your resume to info@devionic.com</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/careers/apply/general"><Button variant="hero" size="xl">Submit General Application</Button></Link>
              <Link to="/careers/internship-apply/general"><Button variant="outline" size="xl" className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20"><GraduationCap size={18} /> Apply for Internship</Button></Link>
            </div>
          </motion.div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Careers;
