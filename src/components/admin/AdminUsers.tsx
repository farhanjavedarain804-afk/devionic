import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, UserCheck, UserX, Clock, Users, ShieldCheck, 
  Building, Phone, Mail, Calendar, CheckCircle2, XCircle,
  MoreVertical, Eye, Edit, Key, Trash2, Globe, Monitor, MapPin, Server,
  Building2, Network, Shield
} from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ALL_MODULE_IDS = [
  'overview', 'users', 'departments', 'services', 'jobs', 'applications', 'testimonials',
  'general-inquiries', 'quote-requests', 'complaints', 'customers', 'invoices',
  'quotations', 'bookings', 'projects', 'staff', 'attendance', 'attendance-report',
  'payroll', 'transactions', 'financials', 'feedback-calls', 'audit',
  'verification-tracking', 'analytics', 'admin-logs', 'notifications',
  'documents-organizer', 'settings', 'profile'
] as const;

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";

const AdminUsers = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Modal States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);

  // Form States
  const [editForm, setEditForm] = useState({ full_name: "", company_name: "", contact_number: "" });
  const [credsForm, setCredsForm] = useState({ email: "", password: "" });
  const [permsForm, setPermsForm] = useState({ role: "user", department_id: "", branch_id: "", use_custom: false, custom_permissions: [] as string[] });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/users");
      return response.data || [];
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

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approve" | "reject" | "pending" }) => {
      const is_approved = status === "approve";
      const is_rejected = status === "reject";
      await apiClient.patch(`/admin/users/${id}/status`, { is_approved, is_rejected });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast({ 
        title: `User ${variables.status === "approve" ? "Approved" : "Rejected"}`,
        variant: variables.status === "reject" ? "destructive" : "default"
      });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.patch(`/admin/users/${id}/profile`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setEditOpen(false);
      toast({ title: "Profile updated successfully" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateCreds = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.patch(`/admin/users/${id}/credentials`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setCredsOpen(false);
      toast({ title: "Credentials updated successfully" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const updatePerms = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.patch(`/admin/users/${id}/permissions`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setPermsOpen(false);
      toast({ title: "Permissions updated successfully" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setDeleteOpen(false);
      toast({ title: "User deleted successfully", variant: "destructive" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const filtered = profiles.filter((p: any) => {
    const matchSearch = 
      (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.contact_number || "").includes(search) ||
      (p.account_email || "").toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "all") return matchSearch;
    if (filterStatus === "pending") return matchSearch && !p.is_approved && !p.is_rejected;
    if (filterStatus === "approved") return matchSearch && p.is_approved;
    if (filterStatus === "rejected") return matchSearch && p.is_rejected;
    return matchSearch;
  });

  const stats = {
    total: profiles.length,
    pending: profiles.filter((p: any) => !p.is_approved && !p.is_rejected).length,
    approved: profiles.filter((p: any) => p.is_approved).length,
    rejected: profiles.filter((p: any) => p.is_rejected).length,
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      company_name: user.company_name || "",
      contact_number: user.contact_number || "",
    });
    setEditOpen(true);
  };

  const handleCreds = (user: any) => {
    setSelectedUser(user);
    setCredsForm({ email: user.account_email, password: "" });
    setCredsOpen(true);
  };

  const handleView = (user: any) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const handleDelete = (user: any) => { setSelectedUser(user); setDeleteOpen(true); };
  const handlePerms = (user: any) => {
    setSelectedUser(user);
    const cp = user.custom_permissions;
    setPermsForm({
      role: user.role || 'user',
      department_id: user.department_id || '',
      branch_id: user.branch_id || '',
      use_custom: Array.isArray(cp) && cp.length > 0,
      custom_permissions: Array.isArray(cp) ? cp : [],
    });
    setPermsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage Client Portal users and their session details</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={stats.total} icon={Users} />
        <StatsCard 
          title="Pending" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-[hsl(40,90%,55%)]/10" 
          iconColor="text-[hsl(40,90%,55%)]" 
        />
        <StatsCard 
          title="Approved" 
          value={stats.approved} 
          icon={ShieldCheck} 
          color="bg-[hsl(142,70%,45%)]/10" 
          iconColor="text-[hsl(142,70%,45%)]" 
        />
        <StatsCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={UserX} 
          color="bg-destructive/10" 
          iconColor="text-destructive" 
        />
      </div>

      <div className={`${cardClass} flex flex-col sm:flex-row gap-3`}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or company..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "cyan" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(s)}
              className="capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">User Details</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Contact & Email</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Role / Dept</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Status</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No users found.</td></tr>
              ) : (
                filtered.map((user: any) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">{user.full_name}</span>
                        {user.company_name && (
                           <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                             <Building size={10} /> {user.company_name}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground flex items-center gap-1.5">
                          <Mail size={12} className="text-muted-foreground" /> {user.account_email}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone size={12} className="text-muted-foreground" /> {user.contact_number || "N/A"}
                        </span>
                      </div>
                    </td>
                     <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          user.role === 'admin' || user.role === 'superadmin' 
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {user.role}
                        </span>
                        {(user.department_name || user.branch_name) && (
                          <div className="flex gap-1 flex-wrap mt-0.5">
                            {user.branch_name && (
                              <span className="text-[10px] bg-accent/10 text-accent font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Network size={10} /> {user.branch_code}
                              </span>
                            )}
                            {user.department_name && (
                              <span className="text-[10px] bg-muted font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 text-muted-foreground">
                                <Layers size={10} /> {user.department_code}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_approved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]">
                          <CheckCircle2 size={10} /> Approved
                        </span>
                      ) : user.is_rejected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          <XCircle size={10} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleView(user)}>
                              <Eye size={14} className="mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit size={14} className="mr-2" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreds(user)}>
                              <Key size={14} className="mr-2" /> Change Credentials
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handlePerms(user)}>
                                <Shield size={14} className="mr-2 text-blue-500" /> Permissions & Dept
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                            
                              {!user.is_approved && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: user.id, status: "approve" })}>
                                  <UserCheck size={14} className="mr-2 text-[hsl(142,70%,45%)]" /> Approve User
                                </DropdownMenuItem>
                              )}
                              {(user.is_approved || !user.is_rejected) && !user.is_rejected && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: user.id, status: "reject" })}>
                                  <UserX size={14} className="mr-2 text-destructive" /> Reject User
                                </DropdownMenuItem>
                              )}
                              {(user.is_approved || user.is_rejected) && (
                                <DropdownMenuItem onClick={() => updateStatus.mutate({ id: user.id, status: "pending" })}>
                                  <Clock size={14} className="mr-2" /> Reset to Pending
                                </DropdownMenuItem>
                              )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleDelete(user)} className="text-destructive focus:text-destructive">
                              <Trash2 size={14} className="mr-2" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye size={20} className="text-cyan-500" />
              User Information
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Users size={16} /> Basic Details
                  </h4>
                  <div className="space-y-2 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedUser.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedUser.account_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company:</span>
                      <span className="font-medium">{selectedUser.company_name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{selectedUser.contact_number || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} /> Account Status
                  </h4>
                  <div className={`p-3 rounded-lg border flex items-center justify-center font-bold text-xs uppercase tracking-wider ${
                    selectedUser.is_approved ? "bg-green-500/10 border-green-500/20 text-green-600" :
                    selectedUser.is_rejected ? "bg-red-500/10 border-red-500/20 text-red-600" :
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
                  }`}>
                    {selectedUser.is_approved ? "Fully Approved" :
                     selectedUser.is_rejected ? "Account Rejected" :
                     "Pending Review"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Globe size={16} /> Last Session Metadata
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                    <Server size={16} className="text-blue-500 mt-1" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">IP Address & DNS</span>
                      <span className="text-sm font-mono font-medium">{selectedUser.last_login_ip || "N/A"}</span>
                      <span className="text-[11px] text-muted-foreground">{selectedUser.last_login_dns || "No reverse DNS found"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                    <MapPin size={16} className="text-red-500 mt-1" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Geo Location</span>
                      <span className="text-sm font-medium">{selectedUser.last_login_location || "Location Unknown"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                    <Monitor size={16} className="text-green-500 mt-1" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Device & OS</span>
                      <span className="text-sm font-medium">{selectedUser.last_login_device} • {selectedUser.last_login_browser}</span>
                      <span className="text-[11px] text-muted-foreground">Running on {selectedUser.last_login_os}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewOpen(false)} variant="outline">Close Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ename">Full Name</Label>
              <Input 
                id="ename" 
                value={editForm.full_name} 
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ecompany">Company Name</Label>
              <Input 
                id="ecompany" 
                value={editForm.company_name} 
                onChange={(e) => setEditForm({...editForm, company_name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ephone">Contact Number</Label>
              <Input 
                id="ephone" 
                value={editForm.contact_number} 
                onChange={(e) => setEditForm({...editForm, contact_number: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button 
              variant="cyan" 
              onClick={() => updateProfile.mutate({ id: selectedUser.id, data: editForm })}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={credsOpen} onOpenChange={setCredsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Credentials</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (Username)</Label>
              <Input 
                id="email" 
                value={credsForm.email} 
                onChange={(e) => setCredsForm({...credsForm, email: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">New Password</Label>
              <Input 
                id="pass" 
                type="password" 
                placeholder="Leave blank to keep current"
                value={credsForm.password} 
                onChange={(e) => setCredsForm({...credsForm, password: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredsOpen(false)}>Cancel</Button>
            <Button 
              variant="cyan" 
              onClick={() => updateCreds.mutate({ id: selectedUser.id, data: credsForm })}
              disabled={updateCreds.isPending}
            >
               {updateCreds.isPending ? "Updating..." : "Update Credentials"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions & Department Dialog */}
      <Dialog open={permsOpen} onOpenChange={setPermsOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={18} className="text-blue-500" /> Permissions & Department
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted/40 rounded-xl border border-border text-sm">
                <span className="font-medium">{selectedUser.full_name}</span>
                <span className="text-muted-foreground ml-2">({selectedUser.account_email})</span>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={permsForm.role}
                  onChange={e => setPermsForm({ ...permsForm, role: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="user">Client User</option>
                  <option value="admin">Admin (DMS Access)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Branch Assignment</Label>
                  <select
                    value={permsForm.branch_id}
                    onChange={e => setPermsForm({ ...permsForm, branch_id: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="">-- No Branch --</option>
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Department Assignment</Label>
                  <select
                    value={permsForm.department_id}
                    onChange={e => setPermsForm({ ...permsForm, department_id: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="">-- No Department --</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">User will see only modules assigned to their department.</p>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={permsForm.use_custom}
                    onChange={e => setPermsForm({ ...permsForm, use_custom: e.target.checked, custom_permissions: [] })}
                    className="rounded"
                  />
                  Override with custom module permissions
                </label>
              </div>

              {permsForm.use_custom && (
                <div className="space-y-2">
                  <Label>Custom Module Access</Label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                    {ALL_MODULE_IDS.map(modId => {
                      const selected = permsForm.custom_permissions.includes(modId);
                      return (
                        <button key={modId} type="button"
                          onClick={() => {
                            const cur = permsForm.custom_permissions;
                            setPermsForm({ ...permsForm, custom_permissions: selected ? cur.filter(m => m !== modId) : [...cur, modId] });
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border text-left transition-all ${
                            selected ? 'bg-accent/10 border-accent/40 text-accent font-semibold' : 'bg-muted/30 border-border text-muted-foreground hover:border-accent/20'
                          }`}
                        >
                          <span className="truncate capitalize">{modId.replace(/-/g, ' ')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermsOpen(false)}>Cancel</Button>
            <Button variant="cyan"
              disabled={updatePerms.isPending}
              onClick={() => updatePerms.mutate({
                id: selectedUser.id,
                data: {
                  role: permsForm.role,
                  branch_id: permsForm.branch_id || null,
                  department_id: permsForm.department_id || null,
                  custom_permissions: permsForm.use_custom && permsForm.custom_permissions.length > 0
                    ? permsForm.custom_permissions
                    : null,
                }
              })}
            >
              {updatePerms.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for 
              <span className="font-bold text-foreground"> {selectedUser?.full_name} </span> 
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteUser.mutate(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
