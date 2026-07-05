import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus, Eye, Trash2, Search, PhoneCall, Star, TrendingUp, Users } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const thClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left py-3 px-4";

const defaultQuestions = [
  "How satisfied are you with the overall service?",
  "How would you rate the communication?",
  "How would you rate the quality of work?",
  "How likely are you to recommend us?",
  "How satisfied are you with the timeline?",
];

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  return (
    <div className="flex gap-1 items-center">
      {/* 5 green stars (1-5) */}
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(value === s ? 0 : s)}
          className={`p-0.5 transition-colors ${value >= s ? "text-[hsl(142,70%,45%)]" : "text-muted-foreground/30"}`}>
          <Star size={20} fill={value >= s ? "currentColor" : "none"} />
        </button>
      ))}
      {/* 1 red star (-1) */}
      <button type="button" onClick={() => onChange(value === -1 ? 0 : -1)}
        className={`p-0.5 ml-2 transition-colors ${value === -1 ? "text-destructive" : "text-muted-foreground/30"}`}>
        <Star size={20} fill={value === -1 ? "currentColor" : "none"} />
      </button>
      <span className="text-xs text-muted-foreground ml-1">
        {value === -1 ? "(-1)" : value > 0 ? `(${value})` : ""}
      </span>
    </div>
  );
};

const AdminFeedbackCalls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "", project_reference: "",
    q1_rating: 0, q2_rating: 0, q3_rating: 0, q4_rating: 0, q5_rating: 0,
    notes: "", called_by: "",
  });

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["admin-feedback-calls"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/feedback_calls");
      return response.data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers-minimal"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/customers");
      return response.data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const total = data.q1_rating + data.q2_rating + data.q3_rating + data.q4_rating + data.q5_rating;
      await apiClient.post("/dms/admin/feedback_calls", { ...data, total_score: total });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feedback-calls"] }); toast({ title: "Feedback recorded" }); setAddOpen(false); resetForm(); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/feedback_calls/${id}`);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-feedback-calls"] }); toast({ title: "Deleted" }); },
    onError: (e: any) => toast({ title: e.response?.data?.message || e.message, variant: "destructive" }),
  });

  const resetForm = () => setForm({ customer_name: "", customer_phone: "", customer_email: "", project_reference: "", q1_rating: 0, q2_rating: 0, q3_rating: 0, q4_rating: 0, q5_rating: 0, notes: "", called_by: "" });

  const filtered = calls.filter((c: any) =>
    [c.customer_name, c.display_id, c.customer_email].some(v => (v || "").toLowerCase().includes(search.toLowerCase()))
  );

  const avgScore = calls.length > 0 ? (calls.reduce((s: number, c: any) => s + (c.total_score || 0), 0) / calls.length).toFixed(1) : "0";
  const maxPossible = 25;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Calls" value={calls.length} icon={PhoneCall} />
        <StatsCard title="Avg Score" value={`${avgScore}/${maxPossible}`} icon={Star} />
        <StatsCard title="Positive (15+)" value={calls.filter((c: any) => (c.total_score || 0) >= 15).length} icon={TrendingUp} />
        <StatsCard title="Customers Called" value={new Set(calls.map((c: any) => c.customer_email || c.customer_name)).size} icon={Users} />
      </div>

      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-foreground">Feedback Calls</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="cyan" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={16} /> New Call</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className={thClass}>ID</th>
              <th className={thClass}>Customer</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Score</th>
              <th className={thClass}>Called By</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Actions</th>
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No feedback calls</td></tr>
              ) : filtered.map((c: any) => {
                const score = c.total_score || 0;
                const scoreColor = score >= 20 ? "text-[hsl(142,70%,45%)]" : score >= 10 ? "text-[hsl(40,90%,55%)]" : "text-destructive";
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{c.display_id}</td>
                    <td className="py-3 px-4 text-sm font-medium">{c.customer_name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{c.customer_phone || "—"}</td>
                    <td className="py-3 px-4"><span className={`text-sm font-bold ${scoreColor}`}>{score}/{maxPossible}</span></td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{c.called_by || "—"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(c.call_date || c.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => setViewItem(c)} className="p-1.5 hover:bg-muted rounded-lg"><Eye size={14} className="text-muted-foreground" /></button>
                        <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(c.id); }} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 size={14} className="text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record Feedback Call</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium mb-1 block">Select Customer *</label>
                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerOpen}
                      className="w-full justify-between h-11"
                    >
                      {form.customer_name || "Search customers..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Search customer name or email..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                           <CommandItem 
                            onSelect={() => {
                              setForm({ ...form, customer_name: "", customer_phone: "", customer_email: "" });
                              setCustomerOpen(false);
                            }}
                            className="font-medium text-accent"
                          >
                            <Plus className="mr-2 h-4 w-4" /> Custom / New Customer
                          </CommandItem>
                          {customers.map((customer: any) => (
                            <CommandItem
                              key={customer.id}
                              value={`${customer.full_name} ${customer.email}`}
                              onSelect={() => {
                                setForm({
                                  ...form,
                                  customer_name: customer.full_name,
                                  customer_phone: customer.contact_number || "",
                                  customer_email: customer.email || "",
                                });
                                setCustomerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.customer_email === customer.email ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{customer.full_name}</span>
                                <span className="text-[10px] text-muted-foreground">{customer.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Customer Name</label><Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1 block">Phone</label><Input value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1 block">Email</label><Input value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} /></div>
                <div><label className="text-sm font-medium mb-1 block">Project/Reference</label><Input value={form.project_reference} onChange={e => setForm({ ...form, project_reference: e.target.value })} /></div>
              </div>
            </div>
            <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm font-semibold text-foreground mb-2">Rate Each Question (5 Green Stars = 5, Red Star = -1)</p>
              {defaultQuestions.map((q, i) => {
                const key = `q${i + 1}_rating` as keyof typeof form;
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <label className="text-sm text-foreground">{i + 1}. {q}</label>
                    <StarRating value={form[key] as number} onChange={v => setForm({ ...form, [key]: v })} />
                  </div>
                );
              })}
            </div>
            <div><label className="text-sm font-medium mb-1 block">Called By</label><Input value={form.called_by} onChange={e => setForm({ ...form, called_by: e.target.value })} placeholder="Agent name" /></div>
            <div><label className="text-sm font-medium mb-1 block">Notes</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="cyan" onClick={() => {
              if (!form.customer_name.trim()) { toast({ title: "Customer name required", variant: "destructive" }); return; }
              addMutation.mutate(form);
            }}>Save Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Feedback Details</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">ID:</span> <span className="font-mono">{viewItem.display_id}</span></p>
              <p><span className="text-muted-foreground">Customer:</span> {viewItem.customer_name}</p>
              {viewItem.customer_phone && <p><span className="text-muted-foreground">Phone:</span> {viewItem.customer_phone}</p>}
              {viewItem.customer_email && <p><span className="text-muted-foreground">Email:</span> {viewItem.customer_email}</p>}
              {viewItem.project_reference && <p><span className="text-muted-foreground">Reference:</span> {viewItem.project_reference}</p>}
              <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
                {defaultQuestions.map((q, i) => {
                  const score = viewItem[`q${i + 1}_rating`] || 0;
                  const color = score === -1 ? "text-destructive" : score >= 4 ? "text-[hsl(142,70%,45%)]" : score >= 2 ? "text-[hsl(40,90%,55%)]" : "text-muted-foreground";
                  return (
                    <div key={i}>
                      <p className="text-xs text-muted-foreground">{i + 1}. {q}</p>
                      <p className={`font-bold ${color}`}>{score === -1 ? "-1 ★" : `${score}/5 ★`}</p>
                    </div>
                  );
                })}
                <div className="border-t border-border pt-2 mt-2">
                  <p className="font-bold text-foreground">Total: {viewItem.total_score}/{maxPossible}</p>
                </div>
              </div>
              {viewItem.called_by && <p><span className="text-muted-foreground">Called By:</span> {viewItem.called_by}</p>}
              {viewItem.notes && <p><span className="text-muted-foreground">Notes:</span> {viewItem.notes}</p>}
              <p><span className="text-muted-foreground">Date:</span> {new Date(viewItem.call_date || viewItem.created_at).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedbackCalls;
