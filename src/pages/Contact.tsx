import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, Shield, Headphones, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PhoneInput from "@/components/PhoneInput";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const highlights = [
  { icon: Clock, title: "Quick Response", desc: "We respond within 24 hours" },
  { icon: Shield, title: "Confidential", desc: "Your information is secure" },
  { icon: Headphones, title: "24/7 Support", desc: "Always available for you" },
  { icon: Globe, title: "Global Reach", desc: "Serving clients worldwide" },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/public/inquiries", {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null,
        subject: form.subject.trim() || null, message: form.message.trim(),
      });
      toast({ title: "Message sent successfully! We'll get back to you soon." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      toast({ title: error.response?.data?.message || "Failed to send message", variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <SEO 
        title="Contact Us" 
        description="Get in touch with Devionic (Private) Limited. Whether you have a project inquiry or need technical support, our team is here to help."
        canonical="/contact"
      />
      <PageHero title="Contact" highlight="Us" subtitle="Ready to start your project? Get in touch today." />

      <section className="py-12 bg-background">
        <ContentContainer variant="default">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <p className="text-muted-foreground">Have a question, project idea, or need a quote? We'd love to hear from you. Our team is ready to assist you with any inquiries.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((item, i) => (
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

      <section className="py-20 bg-secondary/50">
        <ContentContainer variant="default">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <SectionHeading subtitle="Get In Touch" title="Let's Talk" />
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border">
                  <MapPin size={20} className="text-accent mt-0.5 shrink-0" />
                  <div><h4 className="font-semibold text-card-foreground text-sm">Address</h4><p className="text-muted-foreground text-sm">Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450</p></div>
                </div>
                <a href="tel:+923177121841" className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-accent/30 transition-colors">
                  <Phone size={20} className="text-accent mt-0.5" />
                  <div><h4 className="font-semibold text-card-foreground text-sm">Phone / WhatsApp</h4><p className="text-muted-foreground text-sm">+92-317-7121841</p></div>
                </a>
                <a href="mailto:info@devionic.com" className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border hover:border-accent/30 transition-colors">
                  <Mail size={20} className="text-accent mt-0.5" />
                  <div><h4 className="font-semibold text-card-foreground text-sm">Email</h4><p className="text-muted-foreground text-sm">info@devionic.com</p></div>
                </a>
              </div>
            </div>
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 border border-border space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={100} /></div>
                  <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Email *</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" maxLength={255} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Phone</label><PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></div>
                  <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Subject</label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Project inquiry" maxLength={200} /></div>
                </div>
                <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Message *</label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." rows={5} maxLength={2000} /></div>
                <Button variant="cyan" size="lg" type="submit" className="w-full" disabled={submitting}>
                  <Send size={18} /> {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Contact;
