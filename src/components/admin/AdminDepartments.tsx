import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StatsCard from "./StatsCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2, Plus, Edit, Trash2, Layers, Users, CheckSquare, Square,
  LayoutDashboard, Settings, Briefcase, FileText, Receipt, MessageSquare,
  AlertTriangle, Star, Clock, DollarSign, Wallet, BarChart3, ScrollText,
  ArrowLeftRight, Bell, User, CalendarDays, FolderKanban, Calendar,
  PhoneCall, ClipboardCheck, Shield, Network,
} from "lucide-react";

const ALL_MODULES: { id: string; label: string; icon: any; group: string }[] = [
  { id: "overview",               label: "Dashboard Overview",    icon: LayoutDashboard, group: "Main" },
  { id: "users",                  label: "User Profiles",         icon: Users,           group: "Main" },
  { id: "departments",            label: "Departments",           icon: Network,         group: "Main" },
  { id: "services",               label: "Services",              icon: Settings,        group: "Content" },
  { id: "jobs",                   label: "Jobs",                  icon: Briefcase,       group: "Content" },
  { id: "applications",           label: "Applications",          icon: Users,           group: "Content" },
  { id: "testimonials",           label: "Testimonials",          icon: Star,            group: "Content" },
  { id: "general-inquiries",      label: "General Inquiries",     icon: MessageSquare,   group: "Inquiries" },
  { id: "quote-requests",         label: "Quote Requests",        icon: FileText,        group: "Inquiries" },
  { id: "complaints",             label: "Complaints",            icon: AlertTriangle,   group: "Inquiries" },
  { id: "customers",              label: "Customers",             icon: Users,           group: "Billing" },
  { id: "invoices",               label: "Invoices",              icon: FileText,        group: "Billing" },
  { id: "quotations",             label: "Quotations",            icon: Receipt,         group: "Billing" },
  { id: "bookings",               label: "Bookings",              icon: Calendar,        group: "Billing" },
  { id: "projects",               label: "Projects",              icon: FolderKanban,    group: "Billing" },
  { id: "staff",                  label: "Staff",                 icon: Users,           group: "HR" },
  { id: "attendance",             label: "Attendance",            icon: Clock,           group: "HR" },
  { id: "attendance-report",      label: "Attendance Report",     icon: CalendarDays,    group: "HR" },
  { id: "payroll",                label: "Payroll",               icon: DollarSign,      group: "HR" },
  { id: "transactions",           label: "Transactions",          icon: ArrowLeftRight,  group: "Finance" },
  { id: "financials",             label: "Financials",            icon: Wallet,          group: "Finance" },
  { id: "feedback-calls",         label: "Feedback Calls",        icon: PhoneCall,       group: "System" },
  { id: "audit",                  label: "Audit Trail",           icon: ClipboardCheck,  group: "System" },
  { id: "verification-tracking",  label: "Verification & Tracking", icon: Shield,        group: "System" },
  { id: "analytics",              label: "Analytics",             icon: BarChart3,       group: "System" },
  { id: "admin-logs",             label: "Admin Logs",            icon: ScrollText,      group: "System" },
  { id: "notifications",          label: "Notifications",         icon: Bell,            group: "System" },
  { id: "documents-organizer",    label: "Documents Organizer",   icon: Layers,          group: "System" },
  { id: "settings",               label: "Settings",              icon: Settings,        group: "System" },
  { id: "profile",                label: "Profile",               icon: User,            group: "System" },
];

const MODULE_GROUPS = [...new Set(ALL_MODULES.map(m => m.group))];

const groupColors: Record<string, string> = {
  Main:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Content:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Inquiries: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Billing:   "bg-green-500/10 text-green-400 border-green-500/20",
  HR:        "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Finance:   "bg-teal-500/10 text-teal-400 border-teal-500/20",
  System:    "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const cardClass = "bg-white rounded-2xl p-6 border border-border";

const emptyForm = { name: "", code: "", description: "", modules: [] as string[] };

const AdminDepartments = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editDept, setEditDept] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["dms-departments"],
    queryFn: async () => {
      const res = await apiClient.get("/dms/admin/departments");
      return res.data || [];
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const res = await apiClient.get("/dms/admin/users");
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => apiClient.post("/dms/admin/departments", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dms-departments"] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast({ title: "Department Created", description: "The new department has been added to DMS." });
    },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.patch(`/admin/departments/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dms-departments"] });
      setEditDept(null);
      toast({ title: "Department Updated" });
    },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/departments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dms-departments"] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setDeleteTarget(null);
      toast({ title: "Department Deleted", variant: "destructive" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const toggleModule = (moduleId: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(moduleId)) setter(current.filter(m => m !== moduleId));
    else setter([...current, moduleId]);
  };

  const selectAll = (setter: (v: string[]) => void) => setter(ALL_MODULES.map(m => m.id));
  const selectNone = (setter: (v: string[]) => void) => setter([]);

  const handleOpenEdit = (dept: any) => {
    setEditDept(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description || "", modules: dept.modules || [] });
  };

  const getUsersInDept = (deptId: string) => allUsers.filter((u: any) => u.department_id === deptId);

  const ModuleSelector = ({ modules, setModules }: { modules: string[]; setModules: (v: string[]) => void }) => (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => selectAll(setModules)} className="text-xs gap-1">
          <CheckSquare size={12} /> Select All
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => selectNone(setModules)} className="text-xs gap-1">
          <Square size={12} /> Clear
        </Button>
        <span className="ml-auto text-xs text-muted-foreground self-center">{modules.length}/{ALL_MODULES.length} selected</span>
      </div>
      {MODULE_GROUPS.map(group => (
        <div key={group}>
          <p className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md border inline-block mb-2 ${groupColors[group]}`}>
            {group}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_MODULES.filter(m => m.group === group).map(mod => {
              const selected = modules.includes(mod.id);
              return (
                <button
                  key={mod.id} type="button"
                  onClick={() => toggleModule(mod.id, modules, setModules)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs border transition-all text-left
                    ${selected
                      ? "bg-accent/10 border-accent/40 text-accent font-semibold"
                      : "bg-muted/30 border-border text-muted-foreground hover:border-accent/20 hover:text-foreground"
                    }`}
                >
                  <mod.icon size={12} className="shrink-0" />
                  <span className="truncate">{mod.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
            <Building2 size={22} className="text-accent" /> Departments
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage organizational departments and assign DMS modules to each
          </p>
        </div>
        <Button variant="cyan" onClick={() => { setForm(emptyForm); setCreateOpen(true); }} className="gap-2">
          <Plus size={16} /> New Department
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Departments" value={departments.length} icon={Building2} />
        <StatsCard title="Total DMS Users" value={allUsers.filter((u: any) => u.role === 'admin' || u.role === 'superadmin').length} icon={Users} />
        <StatsCard title="Client Users" value={allUsers.filter((u: any) => u.role === 'user').length} icon={User} color="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard title="Available Modules" value={ALL_MODULES.length} icon={Layers} color="bg-purple-500/10" iconColor="text-purple-500" />
      </div>

      {isLoading ? (
        <div className={`${cardClass} text-center py-12 text-muted-foreground`}>Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className={`${cardClass} text-center py-12 text-muted-foreground`}>
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No departments yet</p>
          <p className="text-sm mt-1">Create your first department to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {departments.map((dept: any) => {
            const usersInDept = getUsersInDept(dept.id);
            const moduleCount = (dept.modules || []).length;
            return (
              <div key={dept.id} className={`${cardClass} hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Building2 size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">{dept.name}</h3>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {dept.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenEdit(dept)}>
                      <Edit size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(dept)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                {dept.description && (
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{dept.description}</p>
                )}
                <div className="flex gap-4 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{moduleCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Modules</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{usersInDept.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Members</p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-1 items-center justify-end">
                    {(dept.modules || []).slice(0, 5).map((modId: string) => {
                      const mod = ALL_MODULES.find(m => m.id === modId);
                      if (!mod) return null;
                      return (
                        <span key={modId} className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                          {mod.label}
                        </span>
                      );
                    })}
                    {moduleCount > 5 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        +{moduleCount - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={18} className="text-accent" /> Create New Department
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input placeholder="e.g. Human Resources" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Department Code</Label>
                <Input placeholder="e.g. HR" value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Brief description of this department" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Assigned Modules</Label>
              <ModuleSelector modules={form.modules} setModules={v => setForm({ ...form, modules: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="cyan" disabled={createMutation.isPending || !form.name || !form.code}
              onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDept} onOpenChange={(o) => !o && setEditDept(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={18} className="text-accent" /> Edit Department
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Department Code</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Assigned Modules</Label>
              <ModuleSelector modules={form.modules} setModules={v => setForm({ ...form, modules: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDept(null)}>Cancel</Button>
            <Button variant="cyan" disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ id: editDept.id, data: form })}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and unassign all its members.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Department"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDepartments;
