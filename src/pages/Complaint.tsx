import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Clock, CheckCircle2, XCircle, Loader2, Shield, FileText, Headphones, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
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

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  in_progress: { icon: Loader2, color: "text-blue-500", label: "In Progress" },
  resolved: { icon: CheckCircle2, color: "text-green-500", label: "Resolved" },
  solved: { icon: CheckCircle2, color: "text-green-500", label: "Solved" },
  rejected: { icon: XCircle, color: "text-destructive", label: "Rejected" },
  dismissed: { icon: XCircle, color: "text-muted-foreground", label: "Dismissed" },
};

const infoCards = [
  { icon: Shield, title: "Confidential", desc: "Your concerns are handled with strict confidentiality" },
  { icon: Clock, title: "12-Hour Response", desc: "We respond to all requests within 12 hours" },
  { icon: FileText, title: "Track Anytime", desc: "Use your tracking ID to check status 24/7" },
  { icon: Headphones, title: "Dedicated Support", desc: "Our team is committed to resolution" },
];

const RequestCard = ({ type, title }: { type: "complaint" | "ticket", title: string }) => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"submit" | "track">("submit");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [tracking, setTracking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.subject.trim() || !form.description.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const endpoint = type === "complaint" ? "/public/complaints" : "/public/tickets";
      const response = await apiClient.post(endpoint, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null,
        subject: form.subject.trim(), description: form.description.trim(),
      });
      const data = response.data;
      const submittedAt = new Date().toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
      const typeLabel = type === "complaint" ? "Complaint" : "Ticket";
      toast({ title: `${typeLabel} Submitted Successfully!`, description: `Tracking ID: ${data.tracking_id} — Submitted on: ${submittedAt}` });
      setForm({ name: "", email: "", phone: "", subject: "", description: "" });
    } catch (error: any) {
      const typeLabel = type === "complaint" ? "complaint" : "ticket";
      toast({ title: error.response?.data?.message || `Failed to submit ${typeLabel}`, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleTrack = async () => {
    if (!trackingInput.trim()) { toast({ title: "Please enter a tracking ID", variant: "destructive" }); return; }
    setTracking(true); setTrackResult(null);
    try {
      const input = trackingInput.trim().toUpperCase();
      const endpoint = input.startsWith("TCK-") ? `/public/tickets/track/${input}` : `/public/complaints/track/${input}`;
      const response = await apiClient.get(endpoint);
      setTrackResult({ ...response.data, type: input.startsWith("TCK-") ? "ticket" : "complaint" });
    } catch (error: any) {
      toast({ title: error.response?.data?.message || "No record found with this tracking ID", variant: "destructive" });
    }
    finally { setTracking(false); }
  };

  const sc = trackResult ? statusConfig[trackResult.status] || statusConfig.pending : null;

  return (
    <div className="w-full bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-black font-heading text-foreground mb-3">{title}</h3>
        <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 text-left">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">When to use this:</strong><br/>
            {type === "complaint" 
              ? "File a formal grievance, report serious service dissatisfaction, or escalate an unresolved issue directly to our management team. We treat these with the highest priority and strict confidentiality." 
              : "Open a ticket for general inquiries, technical assistance, project updates, service requests, or standard customer support. This is the fastest way to get help from our team."}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-secondary/50 p-1.5 rounded-xl">
        <Button variant={tab === "submit" ? "cyan" : "ghost"} onClick={() => setTab("submit")} className="flex-1 text-xs sm:text-sm h-10">
          <AlertTriangle size={16} className="mr-1.5" /> Submit {type === "complaint" ? "Complaint" : "Ticket"}
        </Button>
        <Button variant={tab === "track" ? "cyan" : "ghost"} onClick={() => setTab("track")} className="flex-1 text-xs sm:text-sm h-10">
          <Search size={16} className="mr-1.5" /> Track Status
        </Button>
      </div>

      {tab === "submit" && (
        <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-card-foreground mb-1.5 block uppercase tracking-wider">Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" maxLength={100} className="bg-background" /></div>
            <div><label className="text-xs font-semibold text-card-foreground mb-1.5 block uppercase tracking-wider">Email *</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" maxLength={255} className="bg-background" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-card-foreground mb-1.5 block uppercase tracking-wider">Phone *</label><PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} /></div>
            <div><label className="text-xs font-semibold text-card-foreground mb-1.5 block uppercase tracking-wider">Subject *</label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief subject" maxLength={200} className="bg-background" /></div>
          </div>
          <div><label className="text-xs font-semibold text-card-foreground mb-1.5 block uppercase tracking-wider">Description *</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide detailed information..." rows={5} maxLength={3000} className="bg-background resize-none" /></div>
          <Button variant="cyan" size="lg" type="submit" className="w-full font-bold" disabled={submitting}>
            {submitting ? "Submitting..." : `Submit ${type === "complaint" ? "Complaint" : "Ticket"}`}
          </Button>
        </motion.form>
      )}

      {tab === "track" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-card-foreground block uppercase tracking-wider">Tracking ID</label>
            <div className="flex gap-3">
              <Input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder={type === "complaint" ? "CMP-XXXXXXXX" : "TCK-XXXXXXXX"} className="flex-1 bg-background font-mono" />
              <Button variant="cyan" onClick={handleTrack} disabled={tracking} className="shrink-0">
                <Search size={18} className="mr-2" /> {tracking ? "Searching..." : "Track"}
              </Button>
            </div>
          </div>
          
          {trackResult && sc && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background rounded-xl p-6 border border-border space-y-4 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className={`p-3 rounded-full bg-background border border-border shadow-sm ${sc.color}`}>
                  <sc.icon size={24} />
                </div>
                <div><p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Status</p><p className={`font-black text-xl ${sc.color}`}>{sc.label}</p></div>
              </div>
              <div className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Tracking ID:</span> <span className="font-mono font-bold px-2 py-1 bg-secondary rounded-md">{trackResult.tracking_id}</span></div>
                <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground whitespace-nowrap">Subject:</span> <span className="text-right font-medium">{trackResult.subject}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Submitted:</span> <span className="font-medium text-xs">{new Date(trackResult.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                {trackResult.updated_at && trackResult.updated_at !== trackResult.created_at && (
                  <div className="flex justify-between items-center"><span className="text-muted-foreground">Last Updated:</span> <span className="font-medium text-xs">{new Date(trackResult.updated_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                )}
                {(trackResult.resolved_notes || trackResult.admin_notes) && (
                  <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 flex items-center gap-1"><Shield size={12}/> Official Response</p>
                    <p className="text-card-foreground text-sm leading-relaxed">{trackResult.resolved_notes || trackResult.admin_notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const Complaint = () => {
  return (
    <Layout>
      <SEO 
        title="Complaint & Ticket" 
        description="We take your concerns seriously. Use our official portal to submit or track your complaint or ticket with Devionic (Private) Limited."
        canonical="/complaint"
      />
      <PageHero title="Complaint &" highlight="Ticket" subtitle="We take your concerns seriously. Submit or track your complaint or ticket below." />

      <section className="py-12 bg-background border-b border-border/50">
        <ContentContainer variant="default">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-black font-heading mb-4 text-[#0F2642]">How Can We Help You?</h2>
            <p className="text-muted-foreground text-lg mb-6">At Devionic, we value your feedback and are committed to resolving any issues promptly. Choose the appropriate channel below for the fastest resolution.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {infoCards.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="p-6 bg-card rounded-2xl border border-border/60 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#00D6C4]/10 flex items-center justify-center rotate-3">
                  <item.icon size={26} className="text-[#00D6C4] -rotate-3" />
                </div>
                <h3 className="font-bold text-card-foreground text-base mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      <section className="py-20 bg-secondary/30">
        <ContentContainer variant="wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <RequestCard type="complaint" title="File a Formal Complaint" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <RequestCard type="ticket" title="Open a Support Ticket" />
            </motion.div>
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Complaint;
