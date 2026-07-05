import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, ShieldCheck, Building, Network, Plus, Trash2, Edit, Key, MoreVertical
} from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";

const AdminTeamUsers = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form States
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", role: "admin", department_id: "none", branch_id: "none", company_name: "Head Office", contact_number: ""
  });

  const { data: teamUsers = [], isLoading } = useQuery({
    queryKey: ["admin-team-users"],
    queryFn: async () => {
      const res = await apiClient.get("/dms/admin/users/team");
      return res.data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["dms-departments"],
    queryFn: async () => {
      const res = await apiClient.get("/dms/admin/departments");
      return res.data || [];
    },
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["dms-branches"],
    queryFn: async () => {
      const res = await apiClient.get("/dms/admin/branches");
      return res.data || [];
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: typeof form) => {
      await apiClient.post("/dms/admin/users/team", {
        ...data,
        department_id: data.department_id === "none" ? null : data.department_id,
        branch_id: data.branch_id === "none" ? null : data.branch_id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team-users"] });
      setCreateOpen(false);
      setForm({ full_name: "", email: "", password: "", role: "admin", department_id: "none", branch_id: "none", company_name: "Head Office", contact_number: "" });
      toast({ title: "Team user created successfully" });
    },
    onError: (e: any) => toast({ title: "Failed to create user", description: e.message, variant: "destructive" }),
  });

  const updatePermissions = useMutation({
    mutationFn: async (data: { id: string, role: string, department_id: string, branch_id: string }) => {
      await apiClient.patch(`/admin/users/${data.id}/permissions`, {
        role: data.role,
        department_id: data.department_id === "none" ? null : data.department_id,
        branch_id: data.branch_id === "none" ? null : data.branch_id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team-users"] });
      setEditOpen(false);
      toast({ title: "Permissions updated successfully" });
    },
    onError: (e: any) => toast({ title: "Failed to update permissions", description: e.message, variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-team-users"] });
      setDeleteOpen(false);
      toast({ title: "User deleted successfully" });
    },
    onError: (e: any) => toast({ title: "Failed to delete user", description: e.message, variant: "destructive" }),
  });

  const filteredUsers = teamUsers.filter((u: any) => 
    (u.full_name?.toLowerCase().includes(search.toLowerCase())) ||
    (u.account_email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Team Users Management</h2>
          <p className="text-sm text-muted-foreground">Manage administrative staff and branch assignments</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus size={16} /> Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Team Members" value={teamUsers.length} icon={ShieldCheck} />
        <StatsCard title="Head Office Staff" value={teamUsers.filter((u: any) => !u.branch_id).length} icon={Building} color="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard title="Branch Staff" value={teamUsers.filter((u: any) => u.branch_id).length} icon={Network} color="bg-purple-500/10" iconColor="text-purple-500" />
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search team members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Role</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading team users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No team members found.</td></tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{user.full_name}</div>
                      <div className="text-xs text-muted-foreground">{user.account_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {user.branch_id ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600">
                          <Network size={12} /> {user.branch_name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600">
                          <Building size={12} /> Head Office
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.department_id ? user.department_name : "General"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] tracking-wider font-bold text-accent">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setForm({
                              ...form,
                              role: user.role,
                              department_id: user.department_id || "none",
                              branch_id: user.branch_id || "none"
                            });
                            setEditOpen(true);
                          }}>
                            <Edit size={14} className="mr-2" /> Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setDeleteOpen(true);
                          }} className="text-destructive">
                            <Trash2 size={14} className="mr-2" /> Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@devionic.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Secure password" />
            </div>
            <div className="space-y-2">
              <Label>Phone (Optional)</Label>
              <Input value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} placeholder="+92..." />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department_id} onValueChange={v => setForm({...form, department_id: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General / All Access (No Dept)</SelectItem>
                  {departments.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Branch Location</Label>
              <Select value={form.branch_id} onValueChange={v => setForm({...form, branch_id: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Head Office (No Branch)</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createUser.mutate(form)} disabled={createUser.isPending}>
              {createUser.isPending ? "Creating..." : "Create Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Permissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                  <SelectItem value="user">Demote to Client (User)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department_id} onValueChange={v => setForm({...form, department_id: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General / All Access</SelectItem>
                  {departments.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Branch Location</Label>
              <Select value={form.branch_id} onValueChange={v => setForm({...form, branch_id: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Head Office</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => updatePermissions.mutate({ id: selectedUser.id, role: form.role, department_id: form.department_id, branch_id: form.branch_id })} disabled={updatePermissions.isPending}>
              {updatePermissions.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedUser?.full_name}</strong> from the system and revoke their login access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUser.mutate(selectedUser.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteUser.isPending ? "Deleting..." : "Delete Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTeamUsers;
