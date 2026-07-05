import { useState, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, Trash2, Pencil, Save, X, Download, Upload, AlertTriangle, Clock, CheckCircle2, XCircle, AlertCircle, Inbox, MessageSquare, FileQuestion, ShieldAlert, ArrowRight, Pause, Ban, Loader2, Search, PlayCircle, PauseCircle, HelpCircle } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const thClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left py-3 px-4";

// Enhanced status configuration with more statuses
const statusConfig: Record<string, { label: string; color: string; icon: any; dbStatus: string }> = {
  pending: { label: "Pending", color: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]", icon: Clock, dbStatus: "pending" },
  in_progress: { label: "In Progress", color: "bg-accent/10 text-accent", icon: PlayCircle, dbStatus: "in_progress" },
  investigating: { label: "Investigating", color: "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]", icon: Search, dbStatus: "investigating" },
  on_hold: { label: "On Hold", color: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]", icon: PauseCircle, dbStatus: "on_hold" },
  awaiting_response: { label: "Awaiting Response", color: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]", icon: HelpCircle, dbStatus: "awaiting_response" },
  overdue: { label: "Overdue", color: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]", icon: AlertTriangle, dbStatus: "pending" },
  critical: { label: "Critical", color: "bg-destructive/10 text-destructive", icon: AlertCircle, dbStatus: "pending" },
  solved: { label: "Solved", color: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]", icon: CheckCircle2, dbStatus: "solved" },
  dismissed: { label: "Dismissed", color: "bg-muted text-muted-foreground", icon: XCircle, dbStatus: "dismissed" },
};

// Get display status (handles time-based escalation for pending items)
const getDisplayStatus = (dbStatus: string, createdAt: string, module?: string) => {
  // If status is explicitly set to something other than pending, use it
  if (dbStatus && dbStatus !== "pending" && statusConfig[dbStatus]) {
    return dbStatus;
  }
  // For pending status, check time escalation
  if (!dbStatus || dbStatus === "pending") {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    // Complaints: 12h → overdue, 24h → critical
    if (module === "complaints") {
      if (hoursElapsed > 24) return "critical";
      if (hoursElapsed > 12) return "overdue";
      return "pending";
    }
    // Default: 24h → overdue, 48h → critical
    if (hoursElapsed > 48) return "critical";
    if (hoursElapsed > 24) return "overdue";
    return "pending";
  }
  return dbStatus;
};

// Safe JSON parsing for attachments
const parseAttachments = (attachments: any): string[] => {
  if (!attachments) return [];
  if (Array.isArray(attachments)) return attachments;
  if (typeof attachments === 'string') {
    try {
      const parsed = JSON.parse(attachments);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

// Statuses that can be manually set
const manualStatuses = ["pending", "in_progress", "investigating", "on_hold", "awaiting_response", "solved", "dismissed"];

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

const StatusFilterTabs = ({ counts, active, onChange }: { counts: Record<string, number>; active: string; onChange: (s: string) => void }) => {
  const tabs = ["all", "pending", "in_progress", "investigating", "on_hold", "awaiting_response", "overdue", "critical", "solved", "dismissed"];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${active === t ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          {t === "all" ? "All" : statusConfig[t]?.label || t} ({counts[t] || 0})
        </button>
      ))}
    </div>
  );
};

// Status change dropdown component
const StatusChanger = ({ currentStatus, onStatusChange, isPending }: { currentStatus: string; onStatusChange: (status: string) => void; isPending: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Change Status:</span>
      <Select value={currentStatus} onValueChange={onStatusChange} disabled={isPending}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {manualStatuses.map(s => {
            const cfg = statusConfig[s];
            const Icon = cfg.icon;
            return (
              <SelectItem key={s} value={s}>
                <div className="flex items-center gap-2">
                  <Icon size={12} />
                  {cfg.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {isPending && <Loader2 size={14} className="animate-spin text-accent" />}
    </div>
  );
};

const ResolutionDialog = ({
  open, onClose, onSubmit, isPending
}: { open: boolean; onClose: () => void; onSubmit: (notes: string, files: File[]) => void; isPending: boolean }) => {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleSubmit = () => { onSubmit(notes, files); setNotes(""); setFiles([]); };
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Resolution Details</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description / Note <span className="text-destructive">*</span></label>
            <Textarea placeholder="Describe how this was resolved..." value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Attachments <span className="text-xs text-muted-foreground">(Optional)</span></label>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />
            <Button variant="outline" size="sm" className="gap-1" onClick={() => fileRef.current?.click()}><Upload size={14} /> Choose Files</Button>
            {files.length > 0 && <div className="mt-2 space-y-1">{files.map((f, i) => <p key={i} className="text-xs text-muted-foreground">{f.name}</p>)}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="cyan" onClick={handleSubmit} disabled={isPending || !notes.trim()}><Save size={14} /> Submit Resolution</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const uploadFiles = async (files: File[], folder: string) => {
  // In a real Node.js backend, you'd upload to a storage service (S3, Cloudinary, or local disk)
  // For now, we'll simulate the upload by returning placeholder URLs or handling it via a dedicated upload route.
  // Since we are migrating, we should implement a file upload route in the backend. 
  // For this task, I'll assume we'll use a placeholder or the user will provide a storage solution.
  // I will implement a basic upload route reference here.
  const urls: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const { data } = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    if (data && data.url) urls.push(data.url);
  }
  return urls;
};

const DetailDialog = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);

// Calculate counts including all statuses
const calculateCounts = (items: any[]) => {
  const counts: Record<string, number> = { 
    all: items.length, 
    pending: 0, 
    in_progress: 0, 
    investigating: 0, 
    on_hold: 0, 
    awaiting_response: 0, 
    overdue: 0, 
    critical: 0, 
    solved: 0, 
    dismissed: 0 
  };
  items.forEach((e: any) => { 
    counts[e.displayStatus] = (counts[e.displayStatus] || 0) + 1; 
  });
  return counts;
};

// ===== SERVICE INQUIRIES =====
const AdminServiceInquiries = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolveTarget, setResolveTarget] = useState<any>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ inquiry: any; status: string } | null>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { data: inquiries = [] } = useQuery({
    queryKey: ["admin-service-inquiries"],
    queryFn: async () => {
      const response = await apiClient.get("/service_inquiries");
      return response.data || [];
    },
  });

  const enriched = inquiries.map((inq: any) => ({ ...inq, displayStatus: getDisplayStatus(inq.status || "pending", inq.created_at) }));
  const counts = calculateCounts(enriched);
  const filtered = filterStatus === "all" ? enriched : enriched.filter((e: any) => e.displayStatus === filterStatus);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes, files }: { id: string; status: string; notes?: string; files?: File[] }) => {
      const payload: any = { status };
      if (status === "solved") {
        payload.resolved_at = new Date().toISOString();
        payload.resolved_notes = notes || null;
        if (files && files.length > 0) payload.resolved_attachments = await uploadFiles(files, "service-inquiry-resolutions");
      }
      payload.is_read = true;
      await apiClient.patch(`/service_inquiries/${id}`, payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-service-inquiries"] }); setResolveTarget(null); toast({ title: "Status updated" }); },
    onError: (e: any) => toast({ 
      title: "Service Status Update Failed", 
      description: e.response?.data?.message || e.message,
      variant: "destructive" 
    }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/service_inquiries/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-service-inquiries"] }); toast({ title: "Deleted" }); },
  });

  const handleStatusChange = (inq: any, newStatus: string) => {
    if (newStatus === "solved") setResolveTarget(inq);
    else updateStatus.mutate({ id: inq.id, status: newStatus });
  };

  const viewingInq = enriched.find((i: any) => i.id === viewingId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading">Service Inquiries</h2>
        <p className="text-sm text-muted-foreground">{inquiries.length} total, {inquiries.filter((i: any) => !i.is_read).length} unread</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={counts.all} icon={Inbox} />
        <StatsCard title="Pending" value={counts.pending} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="In Progress" value={counts.in_progress} icon={PlayCircle} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="Critical" value={counts.critical + counts.overdue} icon={AlertCircle} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Solved" value={counts.solved} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
      </div>
      <StatusFilterTabs counts={counts} active={filterStatus} onChange={setFilterStatus} />
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>ID</th><th className={thClass}>Name</th>
              <th className={`${thClass} hidden sm:table-cell`}>Service</th>
              <th className={`${thClass} hidden lg:table-cell`}>Date</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((inq: any) => (
                <tr key={inq.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${!inq.is_read ? 'bg-accent/5' : ''}`}>
                  <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-accent">{inq.display_id}</span></td>
                  <td className="py-3 px-4"><p className="font-semibold text-foreground text-sm">{inq.full_name}</p></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{inq.service_title || "—"}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(inq.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={inq.displayStatus} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setViewingId(inq.id)}><Eye size={14} /> View</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(inq.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No inquiries found.</p>}
        </div>
      </div>
      <DetailDialog open={!!viewingInq} onClose={() => setViewingId(null)} title="Inquiry Details">
        {viewingInq && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">ID</p><p className="text-sm font-mono font-bold text-accent">{viewingInq.display_id}</p></div>
              <div><p className="text-xs text-muted-foreground">Full Name</p><p className="text-sm font-medium text-foreground">{viewingInq.full_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{viewingInq.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{viewingInq.phone || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="text-sm font-medium text-foreground">{viewingInq.whatsapp || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">City</p><p className="text-sm font-medium text-foreground">{viewingInq.city || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Service</p><p className="text-sm font-medium text-foreground">{viewingInq.service_title || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-sm font-medium text-foreground">{viewingInq.approved_budget || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Timeline</p><p className="text-sm font-medium text-foreground">{viewingInq.project_timeline || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{new Date(viewingInq.created_at).toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={viewingInq.displayStatus} /></div>
            </div>
            {viewingInq.address && <div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm text-foreground">{viewingInq.address}</p></div>}
            <div><p className="text-xs text-muted-foreground mb-1">Project Description</p><p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl whitespace-pre-line">{viewingInq.project_description}</p></div>
            {viewingInq.attachments && viewingInq.attachments.length > 0 && (
              <div><p className="text-xs text-muted-foreground mb-2">Attachments</p>
                <div className="flex flex-wrap gap-2">{viewingInq.attachments.map((url: string, i: number) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent hover:underline bg-accent/5 px-3 py-1.5 rounded-lg"><Download size={12} /> Attachment {i + 1}</a>
                ))}</div>
              </div>
            )}
            {viewingInq.resolved_notes && <div><p className="text-xs text-muted-foreground mb-1">Resolution Notes</p><p className="text-sm text-foreground bg-[hsl(142,70%,45%)]/5 p-3 rounded-xl whitespace-pre-line">{viewingInq.resolved_notes}</p></div>}
            
            {/* Status Changer */}
            <div className="pt-4 border-t border-border">
              <StatusChanger 
                currentStatus={viewingInq.status || "pending"} 
                onStatusChange={(newStatus) => handleStatusChange(viewingInq, newStatus)} 
                isPending={updateStatus.isPending} 
              />
            </div>
          </div>
        )}
      </DetailDialog>
      <ResolutionDialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} isPending={updateStatus.isPending}
        onSubmit={(notes, files) => { if (resolveTarget) updateStatus.mutate({ id: resolveTarget.id, status: "solved", notes, files }); }} />
    </div>
  );
};

// ===== GENERAL INQUIRIES =====
const AdminGeneralInquiries = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolveTarget, setResolveTarget] = useState<any>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ inquiry: any; status: string } | null>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { data: inquiries = [] } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const response = await apiClient.get("/inquiries");
      return response.data || [];
    },
  });

  const { data: inquiryNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["inquiry-notes"],
    queryFn: async () => {
      const response = await apiClient.get("/inquiry_notes");
      return response.data || [];
    },
  });

  const enriched = inquiries.map((inq: any) => ({ ...inq, displayStatus: getDisplayStatus(inq.status || "pending", inq.created_at) }));
  const counts = calculateCounts(enriched);
  const filtered = filterStatus === "all" ? enriched : enriched.filter((e: any) => e.displayStatus === filterStatus);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note, files }: { id: string; status: string; note: string; files?: File[] }) => {
      const payload: any = { status, is_read: true };
      if (status === "solved") {
        payload.resolved_at = new Date().toISOString();
        payload.resolved_notes = note;
        if (files && files.length > 0) payload.resolved_attachments = await uploadFiles(files, "inquiry-resolutions");
      }
      await apiClient.patch(`/inquiries/${id}`, payload);
      
      const attachmentUrls = files && files.length > 0 ? await uploadFiles(files, "inquiry-notes") : [];
      await apiClient.post("/inquiry_notes", {
        inquiry_id: id,
        status,
        note,
        attachments: attachmentUrls,
      });
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-inquiries"] }); 
      refetchNotes();
      setStatusChangeTarget(null); 
      setResolveTarget(null);
      toast({ title: "Status updated with note" }); 
    },
    onError: (e: any) => toast({ 
      title: "Status Update Failed", 
      description: e.response?.data?.message || e.message,
      variant: "destructive" 
    }),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiClient.put(`/inquiry_notes/${id}`, { note });
    },
    onSuccess: () => { refetchNotes(); setEditingNote(null); toast({ title: "Note updated" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/inquiry_notes/${id}`);
    },
    onSuccess: () => { refetchNotes(); toast({ title: "Note deleted" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/inquiries/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-inquiries"] }); toast({ title: "Deleted" }); },
  });

  const handleStatusChange = (inq: any, newStatus: string) => {
    setStatusChangeTarget({ inquiry: inq, status: newStatus });
  };

  const handleStatusSubmit = (note: string, files: File[]) => {
    if (statusChangeTarget) {
      updateStatus.mutate({ id: statusChangeTarget.inquiry.id, status: statusChangeTarget.status, note, files });
    }
  };

  const viewingInq = enriched.find((i: any) => i.id === viewingId);
  const viewingInquiryNotes = inquiryNotes.filter((n: any) => n.inquiry_id === viewingId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading">General Inquiries</h2>
        <p className="text-sm text-muted-foreground">{inquiries.length} total, {inquiries.filter((i: any) => !i.is_read).length} unread</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={counts.all} icon={MessageSquare} />
        <StatsCard title="Pending" value={counts.pending} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="In Progress" value={counts.in_progress} icon={PlayCircle} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="Critical" value={counts.critical + counts.overdue} icon={AlertCircle} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Solved" value={counts.solved} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
      </div>
      <StatusFilterTabs counts={counts} active={filterStatus} onChange={setFilterStatus} />
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>ID</th><th className={thClass}>Name</th>
              <th className={`${thClass} hidden sm:table-cell`}>Subject</th>
              <th className={`${thClass} hidden lg:table-cell`}>Date</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((inq: any) => (
                <tr key={inq.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${!inq.is_read ? 'bg-accent/5' : ''}`}>
                  <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-accent">{inq.display_id}</span></td>
                  <td className="py-3 px-4"><p className="font-semibold text-foreground text-sm">{inq.name}</p></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{inq.subject || "—"}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(inq.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={inq.displayStatus} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setViewingId(inq.id)}><Eye size={14} /> View</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(inq.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No inquiries found.</p>}
        </div>
      </div>
      <DetailDialog open={!!viewingInq} onClose={() => setViewingId(null)} title="Inquiry Details">
        {viewingInq && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">ID</p><p className="text-sm font-mono font-bold text-accent">{viewingInq.display_id}</p></div>
              <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium text-foreground">{viewingInq.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{viewingInq.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{viewingInq.phone || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Subject</p><p className="text-sm font-medium text-foreground">{viewingInq.subject || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{new Date(viewingInq.created_at).toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={viewingInq.displayStatus} /></div>
            </div>
            <div><p className="text-xs text-muted-foreground mb-1">Message</p><p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl whitespace-pre-line">{viewingInq.message}</p></div>
            {viewingInq.resolved_notes && <div><p className="text-xs text-muted-foreground mb-1">Resolution Notes</p><p className="text-sm text-foreground bg-[hsl(142,70%,45%)]/5 p-3 rounded-xl whitespace-pre-line">{viewingInq.resolved_notes}</p></div>}
            
            {/* Status Update History */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Status Update History
              </h4>
              {viewingInquiryNotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Status</th>
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Date & Time</th>
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Note</th>
                        <th className="text-xs font-semibold text-muted-foreground text-right py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInquiryNotes.map((n: any) => {
                        const nCfg = statusConfig[n.status] || statusConfig.pending;
                        const NIcon = nCfg.icon;
                        return (
                          <tr key={n.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${nCfg.color}`}>
                                <NIcon size={10} /> {nCfg.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
                            <td className="py-2 px-3 text-xs text-foreground max-w-[200px]">
                              <p className="line-clamp-2">{n.note}</p>
                              {(() => {
                                const files = parseAttachments(n.attachments);
                                return files.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {files.map((url: string, i: number) => (
                                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-[10px] bg-accent/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Download size={10} /> File {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNote(n)}><Pencil size={12} className="text-accent" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote.mutate(n.id)}><Trash2 size={12} className="text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-xl">No status updates yet.</p>
              )}
            </div>
            
            {/* Status Changer */}
            <div className="pt-4 border-t border-border">
              <StatusChanger 
                currentStatus={viewingInq.status || "pending"} 
                onStatusChange={(newStatus) => handleStatusChange(viewingInq, newStatus)} 
                isPending={updateStatus.isPending} 
              />
            </div>
          </div>
        )}
      </DetailDialog>

      <StatusNoteDialog
        open={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onSubmit={handleStatusSubmit}
        isPending={updateStatus.isPending}
        targetStatus={statusChangeTarget?.status || "pending"}
      />

      {editingNote && (
        <EditNoteDialog
          open={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSubmit={(note) => updateNote.mutate({ id: editingNote.id, note })}
          isPending={updateNote.isPending}
          initialNote={editingNote.note}
        />
      )}

      <ResolutionDialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} isPending={updateStatus.isPending}
        onSubmit={(notes, files) => { if (resolveTarget) updateStatus.mutate({ id: resolveTarget.id, status: "solved", note: notes, files }); }} />
    </div>
  );
};

// ===== QUOTE REQUESTS =====
const quoteStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]", icon: Clock },
  contracted: { label: "Contracted", color: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]", icon: CheckCircle2 },
  in_progress: { label: "In Progress", color: "bg-accent/10 text-accent", icon: ArrowRight },
  proceed: { label: "Proceed", color: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]", icon: Pause },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: Ban },
};

const AdminQuoteRequests = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ quoteRequest: any; status: string } | null>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { data: requests = [] } = useQuery({
    queryKey: ["admin-quote-requests"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/quote_requests");
      return response.data || [];
    },
  });

  const { data: quoteNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["quote-notes"],
    queryFn: async () => {
      const response = await apiClient.get("/quote_request_notes");
      return response.data || [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => { await apiClient.patch(`/admin/quote_requests/${id}`, { is_read: true }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-quote-requests"] }),
  });

  const updateQRStatus = useMutation({
    mutationFn: async ({ id, status, note, files }: { id: string; status: string; note: string; files?: File[] }) => {
      await apiClient.patch(`/admin/quote_requests/${id}`, { status, is_read: true });
      const attachmentUrls = files && files.length > 0 ? await uploadFiles(files, "quote-notes") : [];
      await apiClient.post("/quote_request_notes", {
        quote_request_id: id,
        status,
        note,
        attachments: attachmentUrls,
      });
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-quote-requests"] }); 
      refetchNotes();
      setStatusChangeTarget(null);
      toast({ title: "Status updated with note" }); 
    },
    onError: (e: any) => toast({ 
      title: "Quote Status Update Failed", 
      description: e.response?.data?.message || e.message,
      variant: "destructive" 
    }),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiClient.put(`/quote_request_notes/${id}`, { note });
    },
    onSuccess: () => { refetchNotes(); setEditingNote(null); toast({ title: "Note updated" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/quote_request_notes/${id}`);
    },
    onSuccess: () => { refetchNotes(); toast({ title: "Note deleted" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleStatusSubmit = (note: string, files: File[]) => {
    if (statusChangeTarget) {
      updateQRStatus.mutate({ id: statusChangeTarget.quoteRequest.id, status: statusChangeTarget.status, note, files });
    }
  };

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/quote_requests/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-quote-requests"] }); toast({ title: "Deleted" }); },
  });

  const unreadCount = requests.filter((r: any) => !r.is_read).length;
  const viewingReq = requests.find((r: any) => r.id === viewingId);

  const statusCounts: Record<string, number> = { all: requests.length };
  Object.keys(quoteStatusConfig).forEach(s => { statusCounts[s] = requests.filter((r: any) => (r.status || "pending") === s).length; });

  const filtered = filterStatus === "all" ? requests : requests.filter((r: any) => (r.status || "pending") === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading">Quote Requests</h2>
        <p className="text-sm text-muted-foreground">{requests.length} total</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Requests" value={requests.length} icon={FileQuestion} />
        <StatsCard title="Pending" value={statusCounts.pending || 0} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="In Progress" value={statusCounts.in_progress || 0} icon={ArrowRight} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="Proceed" value={statusCounts.proceed || 0} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Cancelled" value={statusCounts.cancelled || 0} icon={Ban} color="bg-destructive/10" iconColor="text-destructive" />
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", ...Object.keys(quoteStatusConfig)].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filterStatus === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {s === "all" ? "All" : quoteStatusConfig[s]?.label || s} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>ID</th><th className={thClass}>Name</th>
              <th className={`${thClass} hidden sm:table-cell`}>Service</th>
              <th className={`${thClass} hidden md:table-cell`}>Budget</th>
              <th className={`${thClass} hidden lg:table-cell`}>Date</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((req: any) => {
                const reqStatus = req.status || "pending";
                const cfg = quoteStatusConfig[reqStatus] || quoteStatusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={req.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${!req.is_read ? 'bg-accent/5' : ''}`}>
                    <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-accent">{req.display_id}</span></td>
                    <td className="py-3 px-4"><p className="font-semibold text-foreground text-sm">{req.name}</p><p className="text-xs text-muted-foreground sm:hidden">{req.email}</p></td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{req.service || "—"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{req.budget || "—"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => { setViewingId(req.id); if (!req.is_read) markRead.mutate(req.id); }}>
                          <Eye size={14} /> View
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(req.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No quote requests found.</p>}
        </div>
      </div>

      <DetailDialog open={!!viewingReq} onClose={() => setViewingId(null)} title="Quote Request Details">
        {viewingReq && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const req = viewingReq as any;
                return (
                  <>
                    <div><p className="text-xs text-muted-foreground">ID</p><p className="text-sm font-mono font-bold text-accent">{req.display_id}</p></div>
                    <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium text-foreground">{req.name}</p></div>
                    <div><p className="text-xs text-muted-foreground">Company</p><p className="text-sm font-medium text-foreground">{req.company_name || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Country</p><p className="text-sm font-medium text-foreground">{req.country || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{req.email}</p></div>
                    <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{req.phone || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Service</p><p className="text-sm font-medium text-foreground">{req.service || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-sm font-medium text-foreground">{req.budget || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Timeline</p><p className="text-sm font-medium text-foreground">{req.timeline || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{new Date(req.created_at).toLocaleString()}</p></div>
                  </>
                );
              })()}
              <div><p className="text-xs text-muted-foreground">Status</p>
                {(() => { const s = viewingReq.status || "pending"; const c = quoteStatusConfig[s] || quoteStatusConfig.pending; const I = c.icon; return <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.color}`}><I size={10} /> {c.label}</span>; })()}
              </div>
            </div>
            <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl whitespace-pre-line">{viewingReq.description}</p></div>

            {/* Status Update History */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Status Update History
              </h4>
              {(() => {
                const viewingQuoteNotes = quoteNotes.filter((n: any) => n.quote_request_id === viewingReq.id);
                return viewingQuoteNotes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Status</th>
                          <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Date & Time</th>
                          <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Note</th>
                          <th className="text-xs font-semibold text-muted-foreground text-right py-2 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingQuoteNotes.map((n: any) => {
                          const nCfg = quoteStatusConfig[n.status] || quoteStatusConfig.pending;
                          const NIcon = nCfg.icon;
                          return (
                            <tr key={n.id} className="border-b border-border/30 hover:bg-muted/20">
                              <td className="py-2 px-3">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${nCfg.color}`}>
                                  <NIcon size={10} /> {nCfg.label}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
                              <td className="py-2 px-3 text-xs text-foreground max-w-[200px]">
                                <p className="line-clamp-2">{n.note}</p>
                                {(() => {
                                  const files = parseAttachments(n.attachments);
                                  return files.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {files.map((url: string, i: number) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-[10px] bg-accent/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <Download size={10} /> File {i + 1}
                                        </a>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNote(n)}><Pencil size={12} className="text-accent" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote.mutate(n.id)}><Trash2 size={12} className="text-destructive" /></Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-xl">No status updates yet.</p>
                );
              })()}
            </div>

            {/* Status Changer */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Change Status:</span>
                <Select 
                  value={viewingReq.status || "pending"} 
                  onValueChange={(newStatus) => setStatusChangeTarget({ quoteRequest: viewingReq, status: newStatus })}
                  disabled={updateQRStatus.isPending}
                >
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(quoteStatusConfig).map(s => {
                      const cfg = quoteStatusConfig[s];
                      const Icon = cfg.icon;
                      return (
                        <SelectItem key={s} value={s}>
                          <div className="flex items-center gap-2">
                            <Icon size={12} />
                            {cfg.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {updateQRStatus.isPending && <Loader2 size={14} className="animate-spin text-accent" />}
              </div>
            </div>
          </div>
        )}
      </DetailDialog>

      <StatusNoteDialog
        open={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onSubmit={handleStatusSubmit}
        isPending={updateQRStatus.isPending}
        targetStatus={statusChangeTarget?.status || "pending"}
      />

      {editingNote && (
        <EditNoteDialog
          open={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSubmit={(note) => updateNote.mutate({ id: editingNote.id, note })}
          isPending={updateNote.isPending}
          initialNote={editingNote.note}
        />
      )}
    </div>
  );
};

// ===== STATUS NOTE DIALOG (mandatory note for status changes) =====
const StatusNoteDialog = ({
  open, onClose, onSubmit, isPending, targetStatus
}: { open: boolean; onClose: () => void; onSubmit: (note: string, attachments: File[]) => void; isPending: boolean; targetStatus: string }) => {
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleSubmit = () => { onSubmit(note, files); setNote(""); setFiles([]); };
  const handleClose = () => { setNote(""); setFiles([]); onClose(); };
  const cfg = statusConfig[targetStatus] || statusConfig.pending;
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground">Changing status to:</p>
            <p className="text-sm font-bold text-foreground capitalize">{cfg.label}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Note <span className="text-destructive">*</span></label>
            <Textarea placeholder="Add a note about this status change (required)..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Attachment <span className="text-xs text-muted-foreground">(Optional)</span></label>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />
            <Button variant="outline" size="sm" className="gap-1" onClick={() => fileRef.current?.click()}><Upload size={14} /> Choose Files</Button>
            {files.length > 0 && <div className="mt-2 space-y-1">{files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{f.name}</span>
                <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80"><X size={12} /></button>
              </div>
            ))}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="cyan" onClick={handleSubmit} disabled={isPending || !note.trim()}><Save size={14} /> Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ===== EDIT NOTE DIALOG =====
const EditNoteDialog = ({
  open, onClose, onSubmit, isPending, initialNote
}: { open: boolean; onClose: () => void; onSubmit: (note: string) => void; isPending: boolean; initialNote: string }) => {
  const [note, setNote] = useState(initialNote);
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Note</DialogTitle></DialogHeader>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Note <span className="text-destructive">*</span></label>
          <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="cyan" onClick={() => onSubmit(note)} disabled={isPending || !note.trim()}><Save size={14} /> Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ===== COMPLAINTS =====
const AdminComplaints = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ complaint: any; status: string } | null>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { data: complaints = [] } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const response = await apiClient.get("/complaints");
      return response.data || [];
    },
  });

  const { data: complaintNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["complaint-notes"],
    queryFn: async () => {
      const response = await apiClient.get("/complaint_notes");
      return response.data || [];
    },
  });

  const enriched = complaints.map((c: any) => ({ ...c, displayStatus: getDisplayStatus(c.status, c.created_at, "complaints") }));
  const counts = calculateCounts(enriched);
  const filtered = filterStatus === "all" ? enriched : enriched.filter((e: any) => e.displayStatus === filterStatus);

  const criticalComplaints = enriched.filter((c: any) => c.displayStatus === "critical" || c.displayStatus === "overdue");

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note, files }: { id: string; status: string; note: string; files?: File[] }) => {
      const payload: any = { status };
      if (status === "solved") {
        payload.resolved_at = new Date().toISOString();
        payload.resolved_notes = note;
        payload.admin_notes = note;
        if (files && files.length > 0) payload.resolved_attachments = await uploadFiles(files, "complaint-resolutions");
      }
      await apiClient.patch(`/complaints/${id}`, payload);
      const attachmentUrls = files && files.length > 0 ? await uploadFiles(files, "complaint-notes") : [];
      await apiClient.post("/complaint_notes", {
        complaint_id: id,
        status,
        note,
        attachments: attachmentUrls,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-complaints"] });
      refetchNotes();
      setStatusChangeTarget(null);
      toast({ title: "Status updated with note" });
    },
    onError: (e: any) => toast({ 
      title: "Complaint Status Update Failed", 
      description: e.response?.data?.message || e.message,
      variant: "destructive" 
    }),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiClient.put(`/complaint_notes/${id}`, { note });
    },
    onSuccess: () => { refetchNotes(); setEditingNote(null); toast({ title: "Note updated" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/complaint_notes/${id}`);
    },
    onSuccess: () => { refetchNotes(); toast({ title: "Note deleted" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleStatusChange = (c: any, newStatus: string) => {
    setStatusChangeTarget({ complaint: c, status: newStatus });
  };

  const handleStatusSubmit = (note: string, files: File[]) => {
    if (statusChangeTarget) {
      updateStatus.mutate({ id: statusChangeTarget.complaint.id, status: statusChangeTarget.status, note, files });
    }
  };

  const viewingComplaint = enriched.find((x: any) => x.id === viewingId);
  const viewingNotes = complaintNotes.filter((n: any) => n.complaint_id === viewingId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading">Complaints</h2>
        <p className="text-sm text-muted-foreground">{complaints.length} total • Auto-escalation: 12h → Overdue, 24h → Critical</p>
      </div>

      {criticalComplaints.length > 0 && (
        <div className="bg-destructive/5 border-2 border-destructive/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-destructive" size={20} />
            <h3 className="text-base font-bold text-destructive">⚠️ Critical — First 12 Hours</h3>
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold">{criticalComplaints.length}</span>
          </div>
          <div className="space-y-2">
            {criticalComplaints.map((c: any) => {
              const hoursAgo = Math.round((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60));
              return (
                <div key={c.id} className="flex items-center justify-between bg-background/80 rounded-xl px-4 py-3 border border-destructive/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-accent">{c.tracking_id}</span>
                    <span className="text-sm font-medium text-foreground truncate">{c.subject}</span>
                    <StatusBadge status={c.displayStatus} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-destructive font-semibold">{hoursAgo}h ago</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setViewingId(c.id)}><Eye size={12} /> View</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={counts.all} icon={ShieldAlert} />
        <StatsCard title="Pending" value={counts.pending} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="In Progress" value={counts.in_progress} icon={PlayCircle} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="Critical" value={counts.critical + counts.overdue} icon={AlertCircle} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Solved" value={counts.solved} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
      </div>
      <StatusFilterTabs counts={counts} active={filterStatus} onChange={setFilterStatus} />
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>Tracking ID</th>
              <th className={`${thClass} hidden sm:table-cell`}>Subject</th>
              <th className={`${thClass} hidden md:table-cell`}>Name</th>
              <th className={`${thClass} hidden lg:table-cell`}>Date</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${c.displayStatus === "critical" ? "bg-destructive/5" : c.displayStatus === "overdue" ? "bg-[hsl(25,90%,55%)]/5" : ""}`}>
                  <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-accent">{c.tracking_id}</span></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell"><p className="line-clamp-1">{c.subject}</p></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{c.name}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={c.displayStatus} /></td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setViewingId(c.id)}><Eye size={14} /> View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No complaints found.</p>}
        </div>
      </div>

      <DetailDialog open={!!viewingComplaint} onClose={() => setViewingId(null)} title="Complaint Details">
        {viewingComplaint && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">Tracking ID</p><p className="text-sm font-mono font-bold text-accent">{viewingComplaint.tracking_id}</p></div>
              <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium text-foreground">{viewingComplaint.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{viewingComplaint.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{viewingComplaint.phone || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={viewingComplaint.displayStatus} /></div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{new Date(viewingComplaint.created_at).toLocaleString()}</p></div>
            </div>
            <div><p className="text-xs text-muted-foreground mb-1">Subject</p><p className="text-sm font-semibold text-foreground">{viewingComplaint.subject}</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl whitespace-pre-line">{viewingComplaint.description}</p></div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Status Update History
              </h4>
              {viewingNotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Status</th>
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Date & Time</th>
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Note</th>
                        <th className="text-xs font-semibold text-muted-foreground text-right py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingNotes.map((n: any) => {
                        const nCfg = statusConfig[n.status] || statusConfig.pending;
                        const NIcon = nCfg.icon;
                        return (
                          <tr key={n.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${nCfg.color}`}>
                                <NIcon size={10} /> {nCfg.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
                            <td className="py-2 px-3 text-xs text-foreground max-w-[200px]">
                              <p className="line-clamp-2">{n.note}</p>
                              {(() => {
                                const files = parseAttachments(n.attachments);
                                return files.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {files.map((url: string, i: number) => (
                                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-[10px] bg-accent/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Download size={10} /> File {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNote(n)}><Pencil size={12} className="text-accent" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote.mutate(n.id)}><Trash2 size={12} className="text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-xl">No status updates yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <StatusChanger 
                currentStatus={viewingComplaint.status || "pending"} 
                onStatusChange={(newStatus) => handleStatusChange(viewingComplaint, newStatus)} 
                isPending={updateStatus.isPending} 
              />
            </div>
          </div>
        )}
      </DetailDialog>

      <StatusNoteDialog
        open={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onSubmit={handleStatusSubmit}
        isPending={updateStatus.isPending}
        targetStatus={statusChangeTarget?.status || "pending"}
      />

      {editingNote && (
        <EditNoteDialog
          open={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSubmit={(note) => updateNote.mutate({ id: editingNote.id, note })}
          isPending={updateNote.isPending}
          initialNote={editingNote.note}
        />
      )}
    </div>
  );
};

// ===== TICKETS =====
const AdminTickets = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statusChangeTarget, setStatusChangeTarget] = useState<{ ticket: any; status: string } | null>(null);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { data: tickets = [] } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const response = await apiClient.get("/tickets");
      return response.data || [];
    },
  });

  const { data: ticketNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["ticket-notes"],
    queryFn: async () => {
      const response = await apiClient.get("/ticket_notes");
      return response.data || [];
    },
  });

  const enriched = tickets.map((c: any) => ({ ...c, displayStatus: getDisplayStatus(c.status, c.created_at, "complaints") }));
  const counts = calculateCounts(enriched);
  const filtered = filterStatus === "all" ? enriched : enriched.filter((e: any) => e.displayStatus === filterStatus);

  const criticalTickets = enriched.filter((c: any) => c.displayStatus === "critical" || c.displayStatus === "overdue");

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note, files }: { id: string; status: string; note: string; files?: File[] }) => {
      const payload: any = { status };
      if (status === "solved") {
        payload.resolved_at = new Date().toISOString();
        payload.resolved_notes = note;
        payload.admin_notes = note;
        if (files && files.length > 0) payload.resolved_attachments = await uploadFiles(files, "ticket-resolutions");
      }
      await apiClient.patch(`/tickets/${id}`, payload);
      const attachmentUrls = files && files.length > 0 ? await uploadFiles(files, "ticket-notes") : [];
      await apiClient.post("/ticket_notes", {
        ticket_id: id,
        status,
        note,
        attachments: attachmentUrls,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      refetchNotes();
      setStatusChangeTarget(null);
      toast({ title: "Status updated with note" });
    },
    onError: (e: any) => toast({ 
      title: "Ticket Status Update Failed", 
      description: e.response?.data?.message || e.message,
      variant: "destructive" 
    }),
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiClient.put(`/ticket_notes/${id}`, { note });
    },
    onSuccess: () => { refetchNotes(); setEditingNote(null); toast({ title: "Note updated" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/ticket_notes/${id}`);
    },
    onSuccess: () => { refetchNotes(); toast({ title: "Note deleted" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleStatusChange = (c: any, newStatus: string) => {
    setStatusChangeTarget({ ticket: c, status: newStatus });
  };

  const handleStatusSubmit = (note: string, files: File[]) => {
    if (statusChangeTarget) {
      updateStatus.mutate({ id: statusChangeTarget.ticket.id, status: statusChangeTarget.status, note, files });
    }
  };

  const viewingTicket = enriched.find((x: any) => x.id === viewingId);
  const viewingNotes = ticketNotes.filter((n: any) => n.ticket_id === viewingId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading">Support Tickets</h2>
        <p className="text-sm text-muted-foreground">{tickets.length} total • Auto-escalation: 12h → Overdue, 24h → Critical</p>
      </div>

      {criticalTickets.length > 0 && (
        <div className="bg-destructive/5 border-2 border-destructive/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-destructive" size={20} />
            <h3 className="text-base font-bold text-destructive">⚠️ Critical — First 12 Hours</h3>
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold">{criticalTickets.length}</span>
          </div>
          <div className="space-y-2">
            {criticalTickets.map((c: any) => {
              const hoursAgo = Math.round((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60));
              return (
                <div key={c.id} className="flex items-center justify-between bg-background/80 rounded-xl px-4 py-3 border border-destructive/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-accent">{c.tracking_id}</span>
                    <span className="text-sm font-medium text-foreground truncate">{c.subject}</span>
                    <StatusBadge status={c.displayStatus} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-destructive font-semibold">{hoursAgo}h ago</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setViewingId(c.id)}><Eye size={12} /> View</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={counts.all} icon={ShieldAlert} />
        <StatsCard title="Pending" value={counts.pending} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="In Progress" value={counts.in_progress} icon={PlayCircle} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="Critical" value={counts.critical + counts.overdue} icon={AlertCircle} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Solved" value={counts.solved} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
      </div>
      <StatusFilterTabs counts={counts} active={filterStatus} onChange={setFilterStatus} />
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>Tracking ID</th>
              <th className={`${thClass} hidden sm:table-cell`}>Subject</th>
              <th className={`${thClass} hidden md:table-cell`}>Name</th>
              <th className={`${thClass} hidden lg:table-cell`}>Date</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${c.displayStatus === "critical" ? "bg-destructive/5" : c.displayStatus === "overdue" ? "bg-[hsl(25,90%,55%)]/5" : ""}`}>
                  <td className="py-3 px-4"><span className="font-mono text-xs font-bold text-accent">{c.tracking_id}</span></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell"><p className="line-clamp-1">{c.subject}</p></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{c.name}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={c.displayStatus} /></td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setViewingId(c.id)}><Eye size={14} /> View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No tickets found.</p>}
        </div>
      </div>

      <DetailDialog open={!!viewingTicket} onClose={() => setViewingId(null)} title="Ticket Details">
        {viewingTicket && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">Tracking ID</p><p className="text-sm font-mono font-bold text-accent">{viewingTicket.tracking_id}</p></div>
              <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium text-foreground">{viewingTicket.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-foreground">{viewingTicket.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium text-foreground">{viewingTicket.phone || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={viewingTicket.displayStatus} /></div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{new Date(viewingTicket.created_at).toLocaleString()}</p></div>
            </div>
            <div><p className="text-xs text-muted-foreground mb-1">Subject</p><p className="text-sm font-semibold text-foreground">{viewingTicket.subject}</p></div>
            <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl whitespace-pre-line">{viewingTicket.description}</p></div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Status Update History
              </h4>
              {viewingNotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Status</th>
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Date & Time</th>
                        <th className="text-xs font-semibold text-muted-foreground text-left py-2 px-3">Note</th>
                        <th className="text-xs font-semibold text-muted-foreground text-right py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingNotes.map((n: any) => {
                        const nCfg = statusConfig[n.status] || statusConfig.pending;
                        const NIcon = nCfg.icon;
                        return (
                          <tr key={n.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${nCfg.color}`}>
                                <NIcon size={10} /> {nCfg.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
                            <td className="py-2 px-3 text-xs text-foreground max-w-[200px]">
                              <p className="line-clamp-2">{n.note}</p>
                              {(() => {
                                const files = parseAttachments(n.attachments);
                                return files.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {files.map((url: string, i: number) => (
                                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-[10px] bg-accent/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Download size={10} /> File {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingNote(n)}><Pencil size={12} className="text-accent" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote.mutate(n.id)}><Trash2 size={12} className="text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-xl">No status updates yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <StatusChanger 
                currentStatus={viewingTicket.status || "pending"} 
                onStatusChange={(newStatus) => handleStatusChange(viewingTicket, newStatus)} 
                isPending={updateStatus.isPending} 
              />
            </div>
          </div>
        )}
      </DetailDialog>

      <StatusNoteDialog
        open={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onSubmit={handleStatusSubmit}
        isPending={updateStatus.isPending}
        targetStatus={statusChangeTarget?.status || "pending"}
      />

      {editingNote && (
        <EditNoteDialog
          open={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSubmit={(note) => updateNote.mutate({ id: editingNote.id, note })}
          isPending={updateNote.isPending}
          initialNote={editingNote.note}
        />
      )}
    </div>
  );
};

const AdminInquiriesTabs = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "service-inquiries": return <AdminServiceInquiries />;
    case "general-inquiries": return <AdminGeneralInquiries />;
    case "quote-requests": return <AdminQuoteRequests />;
    case "complaints": return <AdminComplaints />;
    case "tickets": return <AdminTickets />;
    default: return null;
  }
};

export default AdminInquiriesTabs;
