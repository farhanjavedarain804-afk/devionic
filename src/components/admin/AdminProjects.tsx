import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Save, X, Search, Eye, FolderKanban, Clock, CheckCircle2, Rocket, Code, TestTube, Wrench, PackageCheck, Truck, Settings } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const thClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left py-3 px-4";

const projectStatuses = [
  { value: "planning", label: "Planning", icon: Clock, color: "bg-muted text-muted-foreground" },
  { value: "design", label: "Design", icon: Wrench, color: "bg-[hsl(270,60%,50%)]/10 text-[hsl(270,60%,50%)]" },
  { value: "development", label: "Development", icon: Code, color: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]" },
  { value: "testing", label: "Testing", icon: TestTube, color: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]" },
  { value: "review", label: "Review", icon: Eye, color: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,55%)]" },
  { value: "completed", label: "Completed", icon: CheckCircle2, color: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" },
  { value: "delivered", label: "Delivered", icon: Truck, color: "bg-accent/10 text-accent" },
  { value: "maintenance", label: "Maintenance", icon: Settings, color: "bg-[hsl(0,60%,50%)]/10 text-[hsl(0,60%,50%)]" },
];

const getStatusConfig = (status: string) => projectStatuses.find(s => s.value === status) || projectStatuses[0];

interface Milestone {
  title: string;
  status: "pending" | "in_progress" | "completed";
  date?: string;
}

const AdminProjects = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const response = await apiClient.get("/projects");
      return response.data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["project-customers"],
    queryFn: async () => {
      const response = await apiClient.get("/customers");
      return response.data || [];
    },
  });

  const filtered = projects.filter((p: any) => {
    const matchSearch = (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.display_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/projects/${id}`, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Status updated" });
    },
  });

  const updateMilestones = useMutation({
    mutationFn: async ({ id, milestones }: { id: string; milestones: Milestone[] }) => {
      await apiClient.patch(`/projects/${id}`, { milestones });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Milestones updated" });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.patch(`/projects/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      setEditingId(null);
      toast({ title: "Project updated" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/projects/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-projects"] }); toast({ title: "Deleted" }); },
  });

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "—";
    const c = customers.find((c: any) => c.id === customerId);
    return c ? `${c.name}${c.company ? ` (${c.company})` : ''}` : "—";
  };

  const statusCounts: Record<string, number> = { all: projects.length };
  projectStatuses.forEach(s => { statusCounts[s.value] = projects.filter((p: any) => p.status === s.value).length; });

  const viewingProject = projects.find((p: any) => p.id === viewingId);
  const editingProject = projects.find((p: any) => p.id === editingId);

  const getMilestones = (project: any): Milestone[] => {
    if (!project?.milestones || !Array.isArray(project.milestones)) return [];
    return project.milestones as unknown as Milestone[];
  };

  const addMilestone = (projectId: string) => {
    if (!milestoneInput.trim()) return;
    const project = projects.find((p: any) => p.id === projectId);
    const milestones: Milestone[] = [...getMilestones(project), { title: milestoneInput, status: "pending" }];
    updateMilestones.mutate({ id: projectId, milestones });
    setMilestoneInput("");
  };

  const toggleMilestoneStatus = (projectId: string, idx: number) => {
    const project = projects.find((p: any) => p.id === projectId);
    const milestones: Milestone[] = [...getMilestones(project)];
    const current = milestones[idx].status;
    milestones[idx].status = current === "pending" ? "in_progress" : current === "in_progress" ? "completed" : "pending";
    if (milestones[idx].status === "completed") milestones[idx].date = new Date().toISOString().split("T")[0];
    updateMilestones.mutate({ id: projectId, milestones });
  };

  const removeMilestone = (projectId: string, idx: number) => {
    const project = projects.find((p: any) => p.id === projectId);
    const milestones: Milestone[] = getMilestones(project).filter((_: any, i: number) => i !== idx);
    updateMilestones.mutate({ id: projectId, milestones });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Project Management</h2>
          <p className="text-sm text-muted-foreground">{projects.length} projects</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value={projects.length} icon={FolderKanban} />
        <StatsCard title="In Development" value={statusCounts.development || 0} icon={Code} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Completed" value={statusCounts.completed || 0} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Delivered" value={statusCounts.delivered || 0} icon={Truck} color="bg-accent/10" iconColor="text-accent" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-9 w-60" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {projectStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", ...projectStatuses.map(s => s.value)].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filterStatus === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {s === "all" ? "All" : getStatusConfig(s).label} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Projects Table */}
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={thClass}>ID</th>
                <th className={thClass}>Project</th>
                <th className={`${thClass} hidden md:table-cell`}>Customer</th>
                <th className={`${thClass} hidden lg:table-cell`}>Budget</th>
                <th className={thClass}>Status</th>
                <th className={`${thClass} hidden lg:table-cell`}>Milestones</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const cfg = getStatusConfig(p.status);
                const milestones = getMilestones(p);
                const completedMilestones = milestones.filter(m => m.status === "completed").length;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-accent">{p.display_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground text-sm">{p.title}</p>
                      {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{getCustomerName(p.customer_id)}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground hidden lg:table-cell">
                      {Number(p.budget) > 0 ? `PKR ${Number(p.budget).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Select value={p.status} onValueChange={v => updateStatus.mutate({ id: p.id, status: v })}>
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {projectStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {milestones.length > 0 ? (
                        <span className="text-xs text-muted-foreground">{completedMilestones}/{milestones.length} done</span>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setViewingId(p.id)}>
                          <Eye size={14} /> View
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(p.id)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(p.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No projects found. Projects are created automatically when quotations are approved.</p>}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingProject} onOpenChange={v => { if (!v) setViewingId(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground">ID</p><p className="text-sm font-mono font-bold text-accent">{viewingProject.display_id}</p></div>
                <div><p className="text-xs text-muted-foreground">Title</p><p className="text-sm font-medium text-foreground">{viewingProject.title}</p></div>
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="text-sm font-medium text-foreground">{getCustomerName(viewingProject.customer_id)}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusConfig(viewingProject.status).color}`}>
                    {getStatusConfig(viewingProject.status).label}
                  </span>
                </div>
                <div><p className="text-xs text-muted-foreground">Budget</p><p className="text-sm font-medium text-foreground">{Number(viewingProject.budget) > 0 ? `PKR ${Number(viewingProject.budget).toLocaleString()}` : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm font-medium text-foreground">{new Date(viewingProject.created_at).toLocaleDateString()}</p></div>
              </div>
              {viewingProject.description && (
                <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl whitespace-pre-line">{viewingProject.description}</p></div>
              )}

              {/* Milestones */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Milestones</p>
                <div className="space-y-2">
                  {getMilestones(viewingProject).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                      <button onClick={() => toggleMilestoneStatus(viewingProject.id, i)} className="shrink-0">
                        <CheckCircle2 size={18} className={m.status === "completed" ? "text-[hsl(142,70%,45%)]" : m.status === "in_progress" ? "text-[hsl(40,90%,55%)]" : "text-muted-foreground"} />
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${m.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.title}</p>
                        {m.date && <p className="text-[10px] text-muted-foreground">Completed: {m.date}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === "completed" ? "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]" : m.status === "in_progress" ? "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]" : "bg-muted text-muted-foreground"
                      }`}>{m.status.replace("_", " ")}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMilestone(viewingProject.id, i)}>
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Add milestone..." value={milestoneInput} onChange={e => setMilestoneInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addMilestone(viewingProject.id); }} />
                  <Button variant="cyan" size="sm" onClick={() => addMilestone(viewingProject.id)}>Add</Button>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Change Status:</span>
                <Select value={viewingProject.status} onValueChange={v => updateStatus.mutate({ id: viewingProject.id, status: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={v => { if (!v) setEditingId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <EditProjectForm project={editingProject} onSave={(data) => updateProject.mutate({ id: editingProject.id, data })} onCancel={() => setEditingId(null)} isPending={updateProject.isPending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditProjectForm = ({ project, onSave, onCancel, isPending }: { project: any; onSave: (data: any) => void; onCancel: () => void; isPending: boolean }) => {
  const [form, setForm] = useState({
    title: project.title,
    description: project.description || "",
    budget: project.budget || 0,
    start_date: project.start_date || "",
    end_date: project.end_date || "",
    notes: project.notes || "",
  });

  return (
    <div className="space-y-4">
      <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
      <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="text-xs text-muted-foreground">Budget (PKR)</label><Input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} /></div>
        <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
        <div><label className="text-xs text-muted-foreground">End Date</label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
      </div>
      <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
      <div className="flex gap-2">
        <Button variant="cyan" onClick={() => onSave(form)} disabled={isPending}><Save size={16} /> Save</Button>
        <Button variant="ghost" onClick={onCancel}><X size={16} /> Cancel</Button>
      </div>
    </div>
  );
};

export default AdminProjects;
