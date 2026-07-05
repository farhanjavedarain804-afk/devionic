import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, ShieldCheck, FileSearch, Fingerprint, AlertCircle, User, FileText, Receipt, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import { format } from "date-fns";
import ContentContainer from "@/components/ContentContainer";

const statusColors: Record<string, string> = {
  pending: "text-[hsl(40,90%,55%)]",
  in_progress: "text-[hsl(207,70%,50%)]",
  investigating: "text-[hsl(280,70%,50%)]",
  on_hold: "text-[hsl(30,80%,50%)]",
  awaiting_response: "text-[hsl(200,70%,50%)]",
  resolved: "text-[hsl(142,70%,45%)]",
  solved: "text-[hsl(142,70%,45%)]",
  rejected: "text-destructive",
  dismissed: "text-destructive",
  draft: "text-muted-foreground",
  sent: "text-[hsl(207,70%,50%)]",
  paid: "text-[hsl(142,70%,45%)]",
  overdue: "text-[hsl(40,90%,55%)]",
  partial: "text-[hsl(40,90%,55%)]",
  hired: "text-[hsl(142,70%,45%)]",
  shortlisted: "text-[hsl(200,80%,50%)]",
  under_review: "text-accent",
  active: "text-[hsl(142,70%,45%)]",
  inactive: "text-muted-foreground",
  permanent: "text-[hsl(142,70%,45%)]",
  contract: "text-[hsl(207,70%,50%)]",
  intern: "text-[hsl(280,70%,50%)]",
};

const Verification = () => {
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [tracking, setTracking] = useState(false);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      toast({ title: "Please enter a tracking or verification ID", variant: "destructive" });
      return;
    }
    setTracking(true);
    setTrackResult(null);
    const id = trackingId.trim().toUpperCase();

    try {
      const response = await apiClient.get(`/verify/${id}`);
      setTrackResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast({ title: "No record found with this ID", variant: "destructive" });
      } else {
        toast({ title: "Verification search failed", variant: "destructive" });
      }
    }
    setTracking(false);
  };

  const formatDate = (date: string) => {
    try { return format(new Date(date), "dd MMM yyyy"); } catch { return date; }
  };

  const renderResult = () => {
    if (!trackResult) return null;

    const VerifiedBadge = () => (
      <div className="flex items-center gap-2 mt-3 p-3 bg-[hsl(142,70%,45%)]/10 rounded-lg border border-[hsl(142,70%,45%)]/30">
        <ShieldCheck size={20} className="text-[hsl(142,70%,45%)]" />
        <span className="text-[hsl(142,70%,45%)] font-semibold text-sm">✓ Verified — Issued by Devionic (Private) Limited</span>
      </div>
    );

    const InfoRow = ({ label, value, mono = false, statusColor = "" }: { label: string; value: any; mono?: boolean; statusColor?: string }) => (
      <p className="text-sm">
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className={`font-medium ${mono ? "font-mono" : ""} ${statusColor}`}>{value}</span>
      </p>
    );

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-secondary/50 rounded-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <CheckCircle2 size={20} className="text-[hsl(142,70%,45%)]" />
          <span className="font-bold text-foreground capitalize">{trackResult.type.replace("_", " ")} Found</span>
        </div>

        {/* Complaint */}
        {trackResult.type === "complaint" && (
          <div className="space-y-2">
            <InfoRow label="Tracking ID" value={trackResult.tracking_id} mono />
            <InfoRow label="Subject" value={trackResult.subject} />
            <InfoRow label="Name" value={trackResult.name} />
            <InfoRow label="Submitted" value={formatDate(trackResult.created_at)} />
            <InfoRow label="Status" value={trackResult.status?.replace("_", " ").toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            {(trackResult.resolved_notes || trackResult.admin_notes) && (
              <div className="text-sm bg-accent/5 p-3 rounded-lg mt-2">
                <span className="text-muted-foreground">Response:</span> {trackResult.resolved_notes || trackResult.admin_notes}
              </div>
            )}
            <VerifiedBadge />
          </div>
        )}

        {/* Job Application */}
        {trackResult.type === "application" && (
          <div className="space-y-2">
            <InfoRow label="Application #" value={trackResult.application_number} mono />
            <InfoRow label="Verification ID" value={trackResult.verification_id} mono />
            <InfoRow label="Applicant" value={trackResult.full_name} />
            <InfoRow label="Position" value={trackResult.job_title} />
            <InfoRow label="Email" value={trackResult.email} />
            <InfoRow label="Applied On" value={formatDate(trackResult.created_at)} />
            <InfoRow label="Status" value={trackResult.status?.replace("_", " ").toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            {trackResult.admin_notes && (
              <div className="text-sm bg-accent/5 p-3 rounded-lg mt-2">
                <span className="text-muted-foreground">Response:</span> {trackResult.admin_notes}
              </div>
            )}
            <VerifiedBadge />
          </div>
        )}

        {/* Invoice */}
        {trackResult.type === "invoice" && (
          <div className="space-y-2">
            <InfoRow label="Invoice #" value={trackResult.invoice_number} mono />
            <InfoRow label="Verification ID" value={trackResult.verification_id} mono />
            <InfoRow label="Client" value={trackResult.client_name} />
            {trackResult.client_email && <InfoRow label="Client Email" value={trackResult.client_email} />}
            <InfoRow label="Amount" value={`${Number(trackResult.total).toLocaleString()} ${trackResult.currency}`} />
            <InfoRow label="Issue Date" value={formatDate(trackResult.created_at)} />
            {trackResult.due_date && <InfoRow label="Due Date" value={formatDate(trackResult.due_date)} />}
            <InfoRow label="Status" value={trackResult.status?.toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            <VerifiedBadge />
          </div>
        )}

        {/* Quotation */}
        {trackResult.type === "quotation" && (
          <div className="space-y-2">
            <InfoRow label="Quotation #" value={trackResult.quotation_number} mono />
            <InfoRow label="Verification ID" value={trackResult.verification_id} mono />
            <InfoRow label="Client" value={trackResult.client_name} />
            {trackResult.client_email && <InfoRow label="Client Email" value={trackResult.client_email} />}
            <InfoRow label="Amount" value={`${Number(trackResult.total).toLocaleString()} ${trackResult.currency}`} />
            <InfoRow label="Issue Date" value={formatDate(trackResult.created_at)} />
            {trackResult.valid_until && <InfoRow label="Valid Until" value={formatDate(trackResult.valid_until)} />}
            <InfoRow label="Status" value={trackResult.status?.toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            <VerifiedBadge />
          </div>
        )}

        {/* General Inquiry */}
        {trackResult.type === "inquiry" && (
          <div className="space-y-2">
            <InfoRow label="Inquiry ID" value={trackResult.display_id} mono />
            <InfoRow label="Name" value={trackResult.name} />
            <InfoRow label="Email" value={trackResult.email} />
            {trackResult.subject && <InfoRow label="Subject" value={trackResult.subject} />}
            <InfoRow label="Submitted" value={formatDate(trackResult.created_at)} />
            <InfoRow label="Status" value={trackResult.status?.replace("_", " ").toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            {trackResult.resolved_notes && (
              <div className="text-sm bg-accent/5 p-3 rounded-lg mt-2">
                <span className="text-muted-foreground">Response:</span> {trackResult.resolved_notes}
              </div>
            )}
            <VerifiedBadge />
          </div>
        )}

        {/* Service Inquiry */}
        {trackResult.type === "service_inquiry" && (
          <div className="space-y-2">
            <InfoRow label="Inquiry ID" value={trackResult.display_id} mono />
            <InfoRow label="Name" value={trackResult.full_name} />
            <InfoRow label="Email" value={trackResult.email} />
            {trackResult.service_title && <InfoRow label="Service" value={trackResult.service_title} />}
            <InfoRow label="Submitted" value={formatDate(trackResult.created_at)} />
            <InfoRow label="Status" value={trackResult.status?.replace("_", " ").toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            {trackResult.resolved_notes && (
              <div className="text-sm bg-accent/5 p-3 rounded-lg mt-2">
                <span className="text-muted-foreground">Response:</span> {trackResult.resolved_notes}
              </div>
            )}
            <VerifiedBadge />
          </div>
        )}

        {/* Staff */}
        {trackResult.type === "staff" && (
          <div className="space-y-2">
            <InfoRow label="Staff ID" value={trackResult.display_id} mono />
            <InfoRow label="Name" value={trackResult.name} />
            <InfoRow label="Position" value={trackResult.position} />
            {trackResult.department && <InfoRow label="Department" value={trackResult.department} />}
            <InfoRow label="Staff Type" value={trackResult.staff_type?.toUpperCase()} statusColor={statusColors[trackResult.staff_type] || ""} />
            {trackResult.join_date && <InfoRow label="Joined" value={formatDate(trackResult.join_date)} />}
            <InfoRow label="Status" value={trackResult.is_active ? "ACTIVE" : "INACTIVE"} statusColor={trackResult.is_active ? statusColors.active : statusColors.inactive} />
            <VerifiedBadge />
          </div>
        )}

        {/* Salary Slip */}
        {trackResult.type === "salary_slip" && (
          <div className="space-y-2">
            <InfoRow label="Slip ID" value={trackResult.verification_id} mono />
            <InfoRow label="Employee" value={trackResult.staff?.name || "N/A"} />
            <InfoRow label="Employee ID" value={trackResult.staff?.display_id || "N/A"} mono />
            {trackResult.staff?.position && <InfoRow label="Position" value={trackResult.staff.position} />}
            {trackResult.staff?.department && <InfoRow label="Department" value={trackResult.staff.department} />}
            <InfoRow label="Period" value={`${trackResult.month} ${trackResult.year}`} />
            <InfoRow label="Basic Salary" value={`PKR ${Number(trackResult.basic_salary || 0).toLocaleString()}`} />
            <InfoRow label="Allowances" value={`PKR ${Number(trackResult.allowances || 0).toLocaleString()}`} />
            <InfoRow label="Deductions" value={`PKR ${Number(trackResult.deductions || 0).toLocaleString()}`} />
            <InfoRow label="Net Salary" value={`PKR ${Number(trackResult.net_salary || 0).toLocaleString()}`} />
            <InfoRow label="Status" value={trackResult.status?.toUpperCase()} statusColor={statusColors[trackResult.status] || ""} />
            <VerifiedBadge />
          </div>
        )}

        {/* Transaction */}
        {trackResult.type === "transaction" && (
          <div className="space-y-2">
            <InfoRow label="Transaction ID" value={trackResult.display_id} mono />
            <InfoRow label="Type" value={trackResult.type?.toUpperCase()} statusColor={trackResult.type === "income" ? "text-[hsl(142,70%,45%)]" : "text-destructive"} />
            <InfoRow label="Category" value={trackResult.category} />
            <InfoRow label="Amount" value={`PKR ${Number(trackResult.amount).toLocaleString()}`} />
            <InfoRow label="Description" value={trackResult.description} />
            {trackResult.from_name && <InfoRow label="From" value={trackResult.from_name} />}
            {trackResult.to_name && <InfoRow label="To" value={trackResult.to_name} />}
            <InfoRow label="Payment Method" value={trackResult.payment_method?.toUpperCase()} />
            <InfoRow label="Date" value={formatDate(trackResult.transaction_date)} />
            {trackResult.reference_number && <InfoRow label="Reference #" value={trackResult.reference_number} mono />}
            <VerifiedBadge />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Layout>
      <PageHero title="Track &" highlight="Verify" subtitle="Verify documents, track complaints, check application status, and more." />

      <section className="py-16 bg-background">
        <ContentContainer variant="default">
          <SectionHeading subtitle="Verification Portal" title="Verify Any Devionic Document" description="Our verification system ensures authenticity of all documents, receipts, invoices, quotations, salary slips, and employee records issued by Devionic (Private) Limited." />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: FileText, title: "Invoices & Quotations", desc: "", color: "text-[hsl(207,70%,50%)]" },
              { icon: Receipt, title: "Transactions & Salary", desc: "", color: "text-[hsl(142,70%,45%)]" },
              { icon: AlertCircle, title: "Complaints & Inquiries", desc: "", color: "text-[hsl(40,90%,55%)]" },
              { icon: User, title: "Applications & Staff", desc: "", color: "text-accent" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-5 bg-card rounded-xl border border-border">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={18} className={item.color} />
                </div>
                <h3 className="font-semibold text-card-foreground mb-1 text-sm">{item.title}</h3>
                <p className="text-muted-foreground text-xs font-mono">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
              <h3 className="text-lg font-bold text-card-foreground mb-2 text-center">Enter Your Tracking / Verification ID</h3>
              <div className="flex gap-3">
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your ID here..."
                  className="flex-1 h-12 text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
                <Button variant="cyan" size="lg" onClick={handleTrack} disabled={tracking} className="h-12">
                  <Search size={18} /> {tracking ? "Searching..." : "Verify"}
                </Button>
              </div>

              {renderResult()}
            </div>
          </div>
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default Verification;
