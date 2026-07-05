import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, X, CheckCircle2, XCircle,
  Code, Smartphone, Palette, Bot, Share2, TrendingUp,
  Shield, Image, Film, ShoppingCart, Youtube, Briefcase,
  Network, BarChart3, Globe, Headphones, Monitor, Cpu, Database,
  Lock, Mail, Cloud, Zap, Settings, Users, FileText, Camera,
  Mic, Music, Printer, Wifi, Search, Heart, Star as StarIcon, Award,
  type LucideIcon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import StatsCard from "./StatsCard";
import { Layers, CheckCircle2 as Check2, XCircle as XC, Star as StarI2, ThumbsUp, MessageSquare, DollarSign, Clock } from "lucide-react";

const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: "Code", icon: Code }, { name: "Smartphone", icon: Smartphone }, { name: "Palette", icon: Palette },
  { name: "Bot", icon: Bot }, { name: "Share2", icon: Share2 }, { name: "TrendingUp", icon: TrendingUp },
  { name: "Shield", icon: Shield }, { name: "Image", icon: Image }, { name: "Film", icon: Film },
  { name: "ShoppingCart", icon: ShoppingCart }, { name: "Youtube", icon: Youtube }, { name: "Briefcase", icon: Briefcase },
  { name: "Network", icon: Network }, { name: "BarChart3", icon: BarChart3 }, { name: "Globe", icon: Globe },
  { name: "Headphones", icon: Headphones }, { name: "Monitor", icon: Monitor }, { name: "Cpu", icon: Cpu },
  { name: "Database", icon: Database }, { name: "Lock", icon: Lock }, { name: "Mail", icon: Mail },
  { name: "Cloud", icon: Cloud }, { name: "Zap", icon: Zap }, { name: "Settings", icon: Settings },
  { name: "Users", icon: Users }, { name: "FileText", icon: FileText }, { name: "Camera", icon: Camera },
  { name: "Mic", icon: Mic }, { name: "Music", icon: Music }, { name: "Printer", icon: Printer },
  { name: "Wifi", icon: Wifi }, { name: "Search", icon: Search }, { name: "Heart", icon: Heart },
  { name: "Star", icon: StarIcon }, { name: "Award", icon: Award },
];

type Service = Tables<"services">;
type Job = Tables<"jobs">;

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const tableHeaderClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider";

// ===== SERVICES =====
const AdminServices = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", icon: "Code", features: "", code: "", minimum_charges: "" });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/content/services");
      return response.data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { title: form.title, description: form.description, icon: form.icon, features: form.features.split(",").map(f => f.trim()).filter(Boolean), minimum_charges: form.minimum_charges ? parseFloat(form.minimum_charges) : 0 };
      if (form.code) payload.code = form.code;
      if (editing) await apiClient.patch(`/admin/content/services/${editing.id}`, payload);
      else await apiClient.post("/dms/admin/content/services", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); setEditing(null); setAdding(false); toast({ title: "Service saved" }); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/admin/content/services/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-services"] }); toast({ title: "Service deleted" }); },
  });

  const startEdit = (s: Service) => { setEditing(s); setAdding(false); setForm({ title: s.title, description: s.description, icon: s.icon, features: (s.features || []).join(", "), code: (s as any).code || "", minimum_charges: (s as any).minimum_charges?.toString() || "" }); };
  const startAdd = () => { setAdding(true); setEditing(null); setForm({ title: "", description: "", icon: "Code", features: "", code: "", minimum_charges: "" }); };
  const cancel = () => { setEditing(null); setAdding(false); };

  const activeServices = services.filter(s => s.is_active !== false).length;
  const inactiveServices = services.length - activeServices;
  const avgCharges = services.length > 0 ? Math.round(services.reduce((s, sv) => s + (Number((sv as any).minimum_charges) || 0), 0) / services.length) : 0;

  const formDialog = (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Select value={form.icon} onValueChange={v => setForm({ ...form, icon: v })}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {(() => { const found = availableIcons.find(i => i.name === form.icon); const IconComp = found?.icon || Code; return <IconComp size={16} />; })()}
                  <SelectValue placeholder="Select icon" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availableIcons.map(({ name, icon: IconComp }) => (
                  <SelectItem key={name} value={name}>
                    <div className="flex items-center gap-2"><IconComp size={16} /><span>{name}</span></div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Service Code (auto-generated if empty)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Minimum Charges (PKR)" type="number" value={form.minimum_charges} onChange={e => setForm({ ...form, minimum_charges: e.target.value })} />
          </div>
          <Input placeholder="Features (comma separated)" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
          <div className="flex gap-2">
            <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save</Button>
            <Button variant="ghost" onClick={cancel}><X size={16} /> Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Services</h2>
          <p className="text-sm text-muted-foreground">{services.length} services listed</p>
        </div>
        <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Add Service</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Services" value={services.length} icon={Layers} />
        <StatsCard title="Active" value={activeServices} icon={Check2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Inactive" value={inactiveServices} icon={XC} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Avg Min. Charges" value={`PKR ${avgCharges.toLocaleString()}`} icon={DollarSign} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
      </div>

      {formDialog}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={`${tableHeaderClass} text-left py-3 px-4`}>Service</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden lg:table-cell`}>Code</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden sm:table-cell`}>Min. Charges</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden md:table-cell`}>Features</th>
                <th className={`${tableHeaderClass} text-right py-3 px-4`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-mono">{(s as any).code || "—"}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-sm font-medium text-foreground">{(s as any).minimum_charges ? `PKR ${Number((s as any).minimum_charges).toLocaleString()}` : "—"}</span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(s.features || []).slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(s.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No services yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== JOBS =====
const AdminJobs = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Job | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "Layyah, Pakistan", type: "Full-time", description: "", requirements: "", salary: "", closing_date: "", is_active: true });

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/content/jobs");
      return response.data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: form.title, department: form.department, location: form.location,
        type: form.type, description: form.description,
        requirements: form.requirements.split(",").map(r => r.trim()).filter(Boolean),
        salary: form.salary || null, closing_date: form.closing_date || null, is_active: form.is_active,
      };
      if (editing) await apiClient.patch(`/admin/content/jobs/${editing.id}`, payload);
      else await apiClient.post("/dms/admin/content/jobs", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); setEditing(null); setAdding(false); toast({ title: "Job saved" }); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/admin/content/jobs/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); toast({ title: "Deleted" }); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await apiClient.patch(`/admin/content/jobs/${id}`, { is_active: active });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-jobs"] }); toast({ title: "Updated" }); },
  });

  const startEdit = (j: Job) => {
    setEditing(j); setAdding(false);
    setForm({
      title: j.title, department: j.department, location: j.location, type: j.type,
      description: j.description, requirements: (j.requirements || []).join(", "),
      salary: (j as any).salary || "", closing_date: (j as any).closing_date || "", is_active: j.is_active !== false,
    });
  };
  const startAdd = () => { setAdding(true); setEditing(null); setForm({ title: "", department: "", location: "Layyah, Pakistan", type: "Full-time", description: "", requirements: "", salary: "", closing_date: "", is_active: true }); };
  const cancel = () => { setEditing(null); setAdding(false); };

  const activeJobs = jobs.filter(j => j.is_active).length;
  const closingSoon = jobs.filter(j => {
    if (!(j as any).closing_date || !j.is_active) return false;
    const diff = (new Date((j as any).closing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const formDialog = (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Job" : "Create New Job"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Job Title <span className="text-destructive">*</span></label>
            <Input placeholder="e.g. Senior Web Developer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Category / Department <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Engineering, Marketing" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Location <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Layyah, Pakistan" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Job Type</label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Salary <span className="text-muted-foreground text-xs">(Optional)</span></label>
              <Input placeholder="e.g. PKR 50,000 - 80,000" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Closing Date <span className="text-destructive">*</span></label>
              <Input type="date" value={form.closing_date} onChange={e => setForm({ ...form, closing_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Job Description <span className="text-destructive">*</span></label>
            <Textarea placeholder="Describe the role, responsibilities..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Requirements <span className="text-destructive">*</span></label>
            <Textarea placeholder="Comma separated" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} />
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.is_active ? 'bg-accent' : 'bg-muted-foreground/30'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">When enabled, this job will be visible to applicants</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.department || !form.description}>
              <Save size={16} /> {editing ? "Update Job" : "Create Job"}
            </Button>
            <Button variant="ghost" onClick={cancel}><X size={16} /> Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Job Postings</h2>
          <p className="text-sm text-muted-foreground">{jobs.length} positions · {activeJobs} active</p>
        </div>
        <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Create New Job</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Jobs" value={jobs.length} icon={Briefcase} />
        <StatsCard title="Active" value={activeJobs} icon={Check2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Inactive" value={jobs.length - activeJobs} icon={XC} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Closing Soon" value={closingSoon} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" subtitle="Within 7 days" />
      </div>

      {formDialog}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={`${tableHeaderClass} text-left py-3 px-4`}>Position</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden md:table-cell`}>Department</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden sm:table-cell`}>Type</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden lg:table-cell`}>Salary</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden lg:table-cell`}>Closing</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden md:table-cell`}>Status</th>
                <th className={`${tableHeaderClass} text-right py-3 px-4`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-sm">{j.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">{j.department} · {j.type}</p>
                    {(j as any).id_code && <p className="text-[10px] font-mono text-muted-foreground">{(j as any).id_code}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{j.department}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">{j.type}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{(j as any).salary || "—"}</td>
                  <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">
                    {(j as any).closing_date ? new Date((j as any).closing_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.is_active ? 'bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]' : 'bg-destructive/10 text-destructive'}`}>
                      {j.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive.mutate({ id: j.id, active: !j.is_active })}>
                        {j.is_active ? <XCircle size={14} className="text-destructive" /> : <CheckCircle2 size={14} className="text-[hsl(142,70%,45%)]" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(j)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(j.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No jobs yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== INTERNSHIPS =====
const AdminInternships = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "Layyah, Pakistan", duration: "3 months", stipend: "Unpaid", description: "", requirements: "", is_active: true });

  const { data: internships = [] } = useQuery({
    queryKey: ["admin-internships"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/content/internships");
      return response.data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: form.title, department: form.department, location: form.location,
        type: "Internship", description: form.description,
        requirements: form.requirements.split(",").map((r: string) => r.trim()).filter(Boolean),
        duration: form.duration, stipend: form.stipend, is_active: form.is_active,
      };
      if (editing) await apiClient.patch(`/admin/content/internships/${editing.id}`, payload);
      else await apiClient.post("/dms/admin/content/internships", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-internships"] }); setEditing(null); setAdding(false); toast({ title: "Internship saved" }); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/admin/content/internships/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-internships"] }); toast({ title: "Deleted" }); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await apiClient.patch(`/admin/content/internships/${id}`, { is_active: active });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-internships"] }); toast({ title: "Updated" }); },
  });

  const startEdit = (it: any) => {
    setEditing(it); setAdding(false);
    setForm({
      title: it.title, department: it.department || "", location: it.location || "Layyah, Pakistan",
      duration: it.duration || "3 months", stipend: it.stipend || "Unpaid",
      description: it.description || "", requirements: (it.requirements || []).join(", "),
      is_active: it.is_active !== false,
    });
  };
  const startAdd = () => {
    setAdding(true); setEditing(null);
    setForm({ title: "", department: "", location: "Layyah, Pakistan", duration: "3 months", stipend: "Unpaid", description: "", requirements: "", is_active: true });
  };
  const cancel = () => { setEditing(null); setAdding(false); };

  const activeCount = internships.filter((it: any) => it.is_active).length;

  const formDialog = (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Internship" : "Create New Internship"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Internship Title <span className="text-destructive">*</span></label>
            <Input placeholder="e.g. Web Development Intern" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Department <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Engineering, Design" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Location <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Layyah, Pakistan" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Duration</label>
              <Input placeholder="e.g. 3 months, 6 months" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Stipend</label>
              <Input placeholder="e.g. Unpaid, PKR 10,000/month" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description <span className="text-destructive">*</span></label>
            <Textarea placeholder="Describe the internship, what the intern will learn and do..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Requirements</label>
            <Textarea placeholder="Comma separated (e.g. HTML, CSS, JavaScript)" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={3} />
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.is_active ? 'bg-accent' : 'bg-muted-foreground/30'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">When enabled, this internship will be visible to applicants</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.department || !form.description}>
              <Save size={16} /> {editing ? "Update Internship" : "Create Internship"}
            </Button>
            <Button variant="ghost" onClick={cancel}><X size={16} /> Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Internship Postings</h2>
          <p className="text-sm text-muted-foreground">{internships.length} internships · {activeCount} active</p>
        </div>
        <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Create New Internship</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total" value={internships.length} icon={Briefcase} />
        <StatsCard title="Active" value={activeCount} icon={Check2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Inactive" value={internships.length - activeCount} icon={XC} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Departments" value={new Set(internships.map((it: any) => it.department).filter(Boolean)).size} icon={Layers} color="bg-accent/10" iconColor="text-accent" />
      </div>

      {formDialog}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={`${tableHeaderClass} text-left py-3 px-4`}>Position</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden md:table-cell`}>Department</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden sm:table-cell`}>Duration</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden lg:table-cell`}>Stipend</th>
                <th className={`${tableHeaderClass} text-left py-3 px-4 hidden md:table-cell`}>Status</th>
                <th className={`${tableHeaderClass} text-right py-3 px-4`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((it: any) => (
                <tr key={it.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-sm">{it.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">{it.department} · {it.duration}</p>
                    {it.id_code && <p className="text-[10px] font-mono text-muted-foreground">{it.id_code}</p>}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{it.department || "—"}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">{it.duration || "—"}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{it.stipend || "—"}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${it.is_active ? 'bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]' : 'bg-destructive/10 text-destructive'}`}>
                      {it.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive.mutate({ id: it.id, active: !it.is_active })}>
                        {it.is_active ? <XCircle size={14} className="text-destructive" /> : <CheckCircle2 size={14} className="text-[hsl(142,70%,45%)]" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(it)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(it.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {internships.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No internships yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== TESTIMONIALS =====
const AdminTestimonials = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", company: "", message: "", rating: 5 });

  const { data: testimonials = [] } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/content/testimonials");
      return response.data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, role: form.role || null, company: form.company || null, message: form.message, rating: form.rating, is_approved: true, is_active: true };
      if (editing) await apiClient.patch(`/admin/content/testimonials/${editing.id}`, payload);
      else await apiClient.post("/dms/admin/content/testimonials", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); setEditing(null); setAdding(false); toast({ title: "Testimonial saved" }); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const toggleApproval = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      await apiClient.patch(`/admin/content/testimonials/${id}`, { is_approved: approved });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); toast({ title: "Updated" }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/admin/content/testimonials/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); toast({ title: "Deleted" }); },
  });

  const startEdit = (t: any) => { setEditing(t); setAdding(false); setForm({ name: t.name, role: t.role || "", company: t.company || "", message: t.message, rating: t.rating || 5 }); };
  const startAdd = () => { setAdding(true); setEditing(null); setForm({ name: "", role: "", company: "", message: "", rating: 5 }); };
  const cancel = () => { setEditing(null); setAdding(false); };

  const approvedCount = testimonials.filter((t: any) => t.is_approved).length;
  const pendingCount = testimonials.filter((t: any) => !t.is_approved).length;
  const avgRating = testimonials.length > 0 ? (testimonials.reduce((s: number, t: any) => s + (t.rating || 5), 0) / testimonials.length).toFixed(1) : "0";

  const formDialog = (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Testimonial</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            <Input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          </div>
          <Textarea placeholder="Testimonial message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          <Input type="number" placeholder="Rating (1-5)" value={form.rating} min={1} max={5} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} />
          <div className="flex gap-2">
            <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save</Button>
            <Button variant="ghost" onClick={cancel}><X size={16} /> Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Testimonials</h2>
          <p className="text-sm text-muted-foreground">{testimonials.length} testimonials</p>
        </div>
        <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Add Testimonial</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total" value={testimonials.length} icon={MessageSquare} />
        <StatsCard title="Approved" value={approvedCount} icon={ThumbsUp} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="Avg Rating" value={avgRating} icon={StarI2} color="bg-[hsl(270,60%,50%)]/10" iconColor="text-[hsl(270,60%,50%)]" subtitle="Out of 5" />
      </div>

      {formDialog}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t: any) => (
          <div key={t.id} className={`${cardClass} relative`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-accent">{t.display_id}</span>
                  <h3 className="font-semibold text-foreground text-sm">{t.name}</h3>
                  {t.is_approved ? (
                    <span className="text-[10px] px-2 py-0.5 bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)] rounded-full font-bold">Approved</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)] rounded-full font-bold">Pending</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t.role}{t.company ? `, ${t.company}` : ""}</p>
                <p className="text-sm text-muted-foreground mt-2 italic">"{t.message}"</p>
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} size={12} className="text-accent fill-accent" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleApproval.mutate({ id: t.id, approved: !t.is_approved })}>
                  {t.is_approved ? <XCircle size={14} className="text-destructive" /> : <CheckCircle2 size={14} className="text-[hsl(142,70%,45%)]" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}><Pencil size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove.mutate(t.id)}><Trash2 size={14} className="text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {testimonials.length === 0 && <p className="text-muted-foreground text-center py-8">No testimonials yet.</p>}
    </div>
  );
};

const Star = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const AdminContentTabs = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "services": return <AdminServices />;
    case "jobs": return <AdminJobs />;
    case "internships": return <AdminInternships />;
    case "testimonials": return <AdminTestimonials />;
    default: return null;
  }
};

export default AdminContentTabs;
