import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Printer, Eye, Shield, CheckCircle2, FileText, Users, MessageSquare, Briefcase, Receipt, Clock, DollarSign, AlertTriangle } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery } from "@tanstack/react-query";
import { printThermalSlip, downloadThermalSlip, type ThermalSlipData } from "@/lib/thermal-slip";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";

interface VerificationRecord {
  id: string;
  module: string;
  displayId: string;
  title: string;
  status: string;
  updatedAt: string;
  details: { label: string; value: string }[];
}

const AdminVerificationTracking = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");
  const [slipDialog, setSlipDialog] = useState<VerificationRecord | null>(null);
  const [slipSize, setSlipSize] = useState<"58mm" | "80mm">("80mm");

  // Fetch all modules with status updates
  const { data: invoices = [] } = useQuery({
    queryKey: ["vt-invoices"],
    queryFn: async () => { const response = await apiClient.get("/invoices"); return response.data || []; },
  });
  const { data: quotations = [] } = useQuery({
    queryKey: ["vt-quotations"],
    queryFn: async () => { const response = await apiClient.get("/quotations"); return response.data || []; },
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["vt-applications"],
    queryFn: async () => { const response = await apiClient.get("/applications"); return response.data || []; },
  });
  const { data: complaints = [] } = useQuery({
    queryKey: ["vt-complaints"],
    queryFn: async () => { const response = await apiClient.get("/complaints"); return response.data || []; },
  });
  const { data: serviceInquiries = [] } = useQuery({
    queryKey: ["vt-service-inquiries"],
    queryFn: async () => { const response = await apiClient.get("/service_inquiries"); return response.data || []; },
  });
  const { data: generalInquiries = [] } = useQuery({
    queryKey: ["vt-inquiries"],
    queryFn: async () => { const response = await apiClient.get("/inquiries"); return response.data || []; },
  });
  const { data: transactions = [] } = useQuery({
    queryKey: ["vt-transactions"],
    queryFn: async () => { const response = await apiClient.get("/transactions"); return response.data || []; },
  });
  const { data: salarySlips = [] } = useQuery({
    queryKey: ["vt-salary-slips"],
    queryFn: async () => { const response = await apiClient.get("/salary_slips"); return response.data || []; },
  });
  const { data: quoteRequests = [] } = useQuery({
    queryKey: ["vt-quote-requests"],
    queryFn: async () => { const response = await apiClient.get("/quote_requests"); return response.data || []; },
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["vt-projects"],
    queryFn: async () => { const response = await apiClient.get("/projects"); return response.data || []; },
  });

  // Aggregate all records
  const allRecords: VerificationRecord[] = [
    ...invoices.map((i: any) => ({
      id: i.id, module: "Invoice", displayId: i.invoice_number, title: `${i.client_name} - ${Number(i.total).toLocaleString()} ${i.currency}`,
      status: i.status || "draft", updatedAt: i.updated_at || i.created_at,
      details: [{ label: "Client", value: i.client_name }, { label: "Total", value: `${Number(i.total).toLocaleString()} ${i.currency}` }, { label: "Paid", value: `${Number(i.paid_amount || 0).toLocaleString()} ${i.currency}` }],
    })),
    ...quotations.map((q: any) => ({
      id: q.id, module: "Quotation", displayId: q.quotation_number, title: `${q.client_name} - ${Number(q.total).toLocaleString()} ${q.currency}`,
      status: q.status || "draft", updatedAt: q.updated_at || q.created_at,
      details: [{ label: "Client", value: q.client_name }, { label: "Total", value: `${Number(q.total).toLocaleString()} ${q.currency}` }],
    })),
    ...applications.map((a: any) => ({
      id: a.id, module: "Application", displayId: a.application_number, title: `${a.full_name} - ${a.job_title}`,
      status: a.status, updatedAt: a.updated_at || a.created_at,
      details: [{ label: "Name", value: a.full_name }, { label: "Position", value: a.job_title }, { label: "CNIC", value: a.cnic }],
    })),
    ...complaints.map((c: any) => ({
      id: c.id, module: "Complaint", displayId: c.tracking_id, title: `${c.name} - ${c.subject}`,
      status: c.status, updatedAt: c.updated_at || c.created_at,
      details: [{ label: "Name", value: c.name }, { label: "Subject", value: c.subject }, { label: "Email", value: c.email }],
    })),
    ...serviceInquiries.map((s: any) => ({
      id: s.id, module: "Service Inquiry", displayId: s.display_id, title: `${s.full_name} - ${s.service_title || "General"}`,
      status: s.status || "pending", updatedAt: s.created_at,
      details: [{ label: "Name", value: s.full_name }, { label: "Service", value: s.service_title || "—" }, { label: "Email", value: s.email }],
    })),
    ...generalInquiries.map((g: any) => ({
      id: g.id, module: "General Inquiry", displayId: g.display_id, title: `${g.name} - ${g.subject || "General"}`,
      status: g.status || "pending", updatedAt: g.created_at,
      details: [{ label: "Name", value: g.name }, { label: "Subject", value: g.subject || "—" }, { label: "Email", value: g.email }],
    })),
    ...transactions.map((t: any) => ({
      id: t.id, module: "Transaction", displayId: t.display_id, title: `${t.description} - PKR ${Number(t.amount).toLocaleString()}`,
      status: t.type, updatedAt: t.created_at,
      details: [{ label: "Type", value: t.type }, { label: "Category", value: t.category }, { label: "Amount", value: `PKR ${Number(t.amount).toLocaleString()}` }, { label: "Method", value: (t.payment_method || "cash").replace("_", " ") }],
    })),
    ...salarySlips.map((s: any) => ({
      id: s.id, module: "Salary Slip", displayId: s.verification_id, title: `${s.month} ${s.year} - PKR ${Number(s.net_salary).toLocaleString()}`,
      status: s.status || "draft", updatedAt: s.created_at,
      details: [{ label: "Period", value: `${s.month} ${s.year}` }, { label: "Net Salary", value: `PKR ${Number(s.net_salary).toLocaleString()}` }],
    })),
    ...quoteRequests.map((q: any) => ({
      id: q.id, module: "Quote Request", displayId: q.display_id, title: `${q.name} - ${q.service || "General"}`,
      status: q.status || "pending", updatedAt: q.created_at,
      details: [{ label: "Name", value: q.name }, { label: "Service", value: q.service || "—" }, { label: "Budget", value: q.budget || "—" }],
    })),
    ...projects.map((p: any) => ({
      id: p.id, module: "Project", displayId: p.display_id, title: p.title,
      status: p.status, updatedAt: p.updated_at || p.created_at,
      details: [{ label: "Title", value: p.title }, { label: "Status", value: p.status }, { label: "Budget", value: p.budget ? `PKR ${Number(p.budget).toLocaleString()}` : "—" }],
    })),
  ].sort((a, b) => {
    const da = new Date(a.updatedAt || 0).getTime();
    const db = new Date(b.updatedAt || 0).getTime();
    return db - da;
  });

  const modules = [...new Set(allRecords.map(r => r.module))];

  const filtered = allRecords.filter(r => {
    const matchSearch = !search || r.displayId.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase()) || r.module.toLowerCase().includes(search.toLowerCase());
    const matchModule = filterModule === "all" || r.module === filterModule;
    return matchSearch && matchModule;
  });

  const moduleIcons: Record<string, any> = {
    "Invoice": FileText, "Quotation": Receipt, "Application": Briefcase, "Complaint": AlertTriangle,
    "Service Inquiry": MessageSquare, "General Inquiry": MessageSquare, "Transaction": DollarSign,
    "Salary Slip": DollarSign, "Quote Request": FileText, "Project": FileText,
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground", pending: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
    sent: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]", paid: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    partial: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]", overdue: "bg-destructive/10 text-destructive",
    cancelled: "bg-destructive/10 text-destructive", hired: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    rejected: "bg-destructive/10 text-destructive", solved: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    income: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]", expense: "bg-destructive/10 text-destructive",
    issued: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]",
    in_progress: "bg-accent/10 text-accent", proceed: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    shortlisted: "bg-[hsl(200,80%,50%)]/10 text-[hsl(200,80%,50%)]", interview: "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]",
    under_review: "bg-accent/10 text-accent", planning: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
    design: "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]", development: "bg-accent/10 text-accent",
    testing: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]", review: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
    completed: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]", delivered: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    maintenance: "bg-accent/10 text-accent", dismissed: "bg-muted text-muted-foreground",
  };

  const handlePrint = async (record: VerificationRecord) => {
    const d = new Date(record.updatedAt);
    const dateStr = !isNaN(d.getTime()) ? d.toLocaleString() : "N/A";
    const slipData: ThermalSlipData = {
      module: record.module, recordId: record.id, displayId: record.displayId,
      title: record.title, status: record.status, updatedAt: dateStr,
      details: record.details,
    };
    await printThermalSlip(slipData, slipSize);
    toast({ title: "Printing verification slip..." });
  };

  const handleDownload = async (record: VerificationRecord) => {
    const d = new Date(record.updatedAt);
    const dateStr = !isNaN(d.getTime()) ? d.toLocaleString() : "N/A";
    const slipData: ThermalSlipData = {
      module: record.module, recordId: record.id, displayId: record.displayId,
      title: record.title, status: record.status, updatedAt: dateStr,
      details: record.details,
    };
    await downloadThermalSlip(slipData, slipSize);
    toast({ title: "Verification slip downloaded!" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
          <Shield size={24} className="text-accent" /> Verification & Tracking
        </h2>
        <p className="text-sm text-muted-foreground">Track, verify, and download verification slips for all records across modules.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Records" value={allRecords.length} icon={FileText} />
        <StatsCard title="Invoices" value={invoices.length} icon={FileText} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="Applications" value={applications.length} icon={Users} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Transactions" value={transactions.length} icon={DollarSign} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Complaints" value={complaints.length} icon={AlertTriangle} color="bg-destructive/10" iconColor="text-destructive" />
      </div>

      <div className={`${cardClass} flex flex-col sm:flex-row gap-3`}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID, title, or module..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={slipSize} onValueChange={(v: "58mm" | "80mm") => setSlipSize(v)}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="80mm">80mm Thermal</SelectItem>
            <SelectItem value="58mm">58mm Thermal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Module</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">ID</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Title</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Status</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Updated</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((record) => {
                const ModuleIcon = moduleIcons[record.module] || FileText;
                return (
                  <tr key={`${record.module}-${record.id}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ModuleIcon size={14} className="text-accent shrink-0" />
                        <span className="text-xs font-medium text-foreground">{record.module}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-accent">{record.displayId}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      <p className="line-clamp-1 max-w-xs">{record.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[record.status] || "bg-muted text-muted-foreground"}`}>
                        {record.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details" onClick={() => setSlipDialog(record)}>
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Download Slip" onClick={() => handleDownload(record)}>
                          <Download size={14} className="text-accent" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Print Slip" onClick={() => handlePrint(record)}>
                          <Printer size={14} className="text-[hsl(207,70%,50%)]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No records found.</p>}
          {filtered.length > 100 && <p className="text-xs text-muted-foreground text-center py-3">Showing first 100 of {filtered.length} records. Use search to filter.</p>}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!slipDialog} onOpenChange={v => { if (!v) setSlipDialog(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={18} className="text-accent" /> Verification Details
            </DialogTitle>
          </DialogHeader>
          {slipDialog && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Module</span>
                  <span className="text-sm font-bold text-foreground">{slipDialog.module}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Record ID</span>
                  <span className="font-mono text-sm font-bold text-accent">{slipDialog.displayId}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[slipDialog.status] || "bg-muted text-muted-foreground"}`}>
                    {slipDialog.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Updated</span>
                  <span className="text-sm text-foreground">{new Date(slipDialog.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Details</p>
                {slipDialog.details.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                    <span className="text-sm text-foreground font-medium">{d.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Slip Size:</span>
                <Select value={slipSize} onValueChange={(v: "58mm" | "80mm") => setSlipSize(v)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80mm">80mm</SelectItem>
                    <SelectItem value="58mm">58mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="cyan" className="flex-1" onClick={() => { handleDownload(slipDialog); setSlipDialog(null); }}>
                  <Download size={14} /> Download Slip
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { handlePrint(slipDialog); setSlipDialog(null); }}>
                  <Printer size={14} /> Print Slip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerificationTracking;
