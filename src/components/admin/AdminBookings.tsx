import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Eye, Trash2, Pencil, Search, Calendar, DollarSign, Users, CheckCircle2 } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const thClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left py-3 px-4";

const statusColors: Record<string, string> = {
  confirmed: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
  pending: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
  in_progress: "bg-accent/10 text-accent",
  completed: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminBookings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ title: "", client_name: "", client_email: "", client_phone: "", service: "", description: "", status: "confirmed", booking_date: new Date().toISOString().split("T")[0], amount: "", notes: "" });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/bookings");
      return response.data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post("/dms/admin/bookings", data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Booking added" }); setAddOpen(false); resetForm(); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      await apiClient.patch(`/admin/bookings/${id}`, data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Booking updated" }); setEditItem(null); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/bookings/${id}`);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Booking deleted" }); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const resetForm = () => setForm({ title: "", client_name: "", client_email: "", client_phone: "", service: "", description: "", status: "confirmed", booking_date: new Date().toISOString().split("T")[0], amount: "", notes: "" });

  const filtered = bookings.filter((b: any) =>
    [b.title, b.client_name, b.display_id, b.service, b.status].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b: any) => b.status === "confirmed").length,
    completed: bookings.filter((b: any) => b.status === "completed").length,
    revenue: bookings.reduce((s: number, b: any) => s + Number(b.amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings" value={stats.total} icon={Calendar} />
        <StatsCard title="Confirmed" value={stats.confirmed} icon={CheckCircle2} />
        <StatsCard title="Completed" value={stats.completed} icon={Users} />
        <StatsCard title="Revenue" value={`PKR ${stats.revenue.toLocaleString()}`} icon={DollarSign} />
      </div>

      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-foreground">All Bookings</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="cyan" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={16} /> Add</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>ID</th>
              <th className={thClass}>Title</th>
              <th className={thClass}>Client</th>
              <th className={thClass}>Service</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Source</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Actions</th>
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">No bookings found</td></tr>
              ) : filtered.map((b: any) => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{b.display_id}</td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{b.title}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{b.client_name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{b.service || "—"}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{b.booking_date}</td>
                  <td className="py-3 px-4 text-sm font-medium">PKR {Number(b.amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">{b.source}</span></td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>{b.status}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => setViewItem(b)} className="p-1.5 hover:bg-muted rounded-lg"><Eye size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => { setEditItem(b); setForm({ title: b.title, client_name: b.client_name, client_email: b.client_email || "", client_phone: b.client_phone || "", service: b.service || "", description: b.description || "", status: b.status, booking_date: b.booking_date, amount: String(b.amount || ""), notes: b.notes || "" }); }} className="p-1.5 hover:bg-muted rounded-lg"><Pencil size={14} className="text-muted-foreground" /></button>
                      <button onClick={() => { if (confirm("Delete this booking?")) deleteMutation.mutate(b.id); }} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen || !!editItem} onOpenChange={() => { setAddOpen(false); setEditItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Edit Booking" : "Add Booking"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Booking title" /></div>
              <div><label className="text-sm font-medium mb-1 block">Client Name *</label><Input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" /></div>
              <div><label className="text-sm font-medium mb-1 block">Email</label><Input value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} placeholder="Email" /></div>
              <div><label className="text-sm font-medium mb-1 block">Phone</label><Input value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} placeholder="Phone" /></div>
              <div><label className="text-sm font-medium mb-1 block">Service</label><Input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="Service" /></div>
              <div><label className="text-sm font-medium mb-1 block">Amount (PKR)</label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" /></div>
              <div><label className="text-sm font-medium mb-1 block">Date</label><Input type="date" value={form.booking_date} onChange={e => setForm({ ...form, booking_date: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div><label className="text-sm font-medium mb-1 block">Notes</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditItem(null); }}>Cancel</Button>
            <Button variant="cyan" onClick={() => {
              if (!form.title.trim() || !form.client_name.trim()) { toast({ title: "Title and Client Name are required", variant: "destructive" }); return; }
              const payload = { ...form, amount: Number(form.amount) || 0, source: "manual" };
              if (editItem) updateMutation.mutate({ id: editItem.id, ...payload });
              else addMutation.mutate(payload);
            }}>{editItem ? "Update" : "Add Booking"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">ID:</span> <span className="font-mono">{viewItem.display_id}</span></p>
              <p><span className="text-muted-foreground">Title:</span> {viewItem.title}</p>
              <p><span className="text-muted-foreground">Client:</span> {viewItem.client_name}</p>
              {viewItem.client_email && <p><span className="text-muted-foreground">Email:</span> {viewItem.client_email}</p>}
              {viewItem.client_phone && <p><span className="text-muted-foreground">Phone:</span> {viewItem.client_phone}</p>}
              {viewItem.service && <p><span className="text-muted-foreground">Service:</span> {viewItem.service}</p>}
              <p><span className="text-muted-foreground">Date:</span> {viewItem.booking_date}</p>
              <p><span className="text-muted-foreground">Amount:</span> PKR {Number(viewItem.amount || 0).toLocaleString()}</p>
              <p><span className="text-muted-foreground">Source:</span> <span className="capitalize">{viewItem.source}</span></p>
              {viewItem.reference_number && <p><span className="text-muted-foreground">Reference:</span> {viewItem.reference_number}</p>}
              <p><span className="text-muted-foreground">Status:</span> <span className="capitalize font-medium">{viewItem.status}</span></p>
              {viewItem.description && <p><span className="text-muted-foreground">Description:</span> {viewItem.description}</p>}
              {viewItem.notes && <p><span className="text-muted-foreground">Notes:</span> {viewItem.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
