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
import { Network, Plus, Edit, Trash2, Users, MapPin, Mail, Phone, User, Activity } from "lucide-react";

const emptyForm = { name: "", code: "", location: "", contact_email: "", contact_phone: "", status: "active" };

const AdminBranches = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["dms-branches"],
    queryFn: async () => {
      const res = await apiClient.get("/dms/admin/branches");
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
    mutationFn: (data: typeof emptyForm) => apiClient.post("/dms/admin/branches", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dms-branches"] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast({ title: "Branch Created", description: "The new branch has been added." });
    },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.patch(`/admin/branches/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dms-branches"] });
      setEditBranch(null);
      toast({ title: "Branch Updated" });
    },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/branches/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dms-branches"] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setDeleteTarget(null);
      toast({ title: "Branch Deleted", variant: "destructive" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleOpenEdit = (b: any) => {
    setEditBranch(b);
    setForm({ 
      name: b.name, code: b.code, location: b.location || "", 
      contact_email: b.contact_email || "", contact_phone: b.contact_phone || "", status: b.status || "active"
    });
  };

  const getUsersInBranch = (branchId: string) => allUsers.filter((u: any) => u.branch_id === branchId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
            <Network size={22} className="text-accent" /> Branches Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage corporate branches, locations, and assign users to branches
          </p>
        </div>
        <Button variant="cyan" onClick={() => { setForm(emptyForm); setCreateOpen(true); }} className="gap-2">
          <Plus size={16} /> New Branch
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Branches" value={branches.length} icon={Network} />
        <StatsCard title="Active Branches" value={branches.filter((b: any) => b.status === 'active').length} icon={Activity} color="bg-green-500/10" iconColor="text-green-500" />
        <StatsCard title="Total Assigned Admins" value={allUsers.filter((u: any) => u.branch_id && (u.role === 'admin' || u.role === 'superadmin')).length} icon={Users} color="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard title="Branch Clients" value={allUsers.filter((u: any) => u.branch_id && u.role === 'user').length} icon={User} color="bg-purple-500/10" iconColor="text-purple-500" />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 border text-center py-12 text-muted-foreground">Loading branches...</div>
      ) : branches.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border text-center py-12 text-muted-foreground">
          <Network size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No branches yet</p>
          <p className="text-sm mt-1">Create your first branch to start categorizing users</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {branches.map((b: any) => {
            const usersInBranch = getUsersInBranch(b.id);
            const admins = usersInBranch.filter((u: any) => u.role === 'admin' || u.role === 'superadmin').length;
            const clients = usersInBranch.length - admins;
            
            return (
              <div key={b.id} className="bg-white rounded-2xl p-6 border hover:shadow-md transition-shadow relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-2 h-full ${b.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Network size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">{b.name}</h3>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded mr-1">
                        {b.code}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${b.status === 'active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0 pr-4">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenEdit(b)}>
                      <Edit size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(b)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs text-muted-foreground">
                  {b.location && <div className="flex items-center gap-2"><MapPin size={12}/> {b.location}</div>}
                  {b.contact_email && <div className="flex items-center gap-2"><Mail size={12}/> {b.contact_email}</div>}
                  {b.contact_phone && <div className="flex items-center gap-2"><Phone size={12}/> {b.contact_phone}</div>}
                </div>

                <div className="flex gap-4 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{admins}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Admins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{clients}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{usersInBranch.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Users</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={18} className="text-accent" /> Create New Branch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Branch Name *</Label>
                <Input placeholder="e.g. Lahore Branch" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Branch Code *</Label>
                <Input placeholder="e.g. LHR" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location / Address</Label>
              <Input placeholder="Full address" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" placeholder="branch@example.com" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input placeholder="Phone number" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="cyan" disabled={createMutation.isPending || !form.name || !form.code} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Creating..." : "Create Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editBranch} onOpenChange={(o) => !o && setEditBranch(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit size={18} className="text-accent" /> Edit Branch
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Branch Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Branch Code *</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location / Address</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBranch(null)}>Cancel</Button>
            <Button variant="cyan" disabled={updateMutation.isPending || !form.name || !form.code}
              onClick={() => updateMutation.mutate({ id: editBranch.id, data: form })}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and unassign all its users.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Branch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBranches;
