import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, X, Search, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { downloadFinancialReportPDF } from "@/lib/pdf-download";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const thClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left py-3 px-4";

const categories = [
  "Invoice Payment", "Service Payment", "Project Payment", "Consultation Fee",
  "Office Rent", "Utilities", "Salaries", "Software Subscriptions",
  "Hardware", "Marketing", "Travel", "Miscellaneous",
];

const AdminFinancials = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    type: "income", category: "", description: "", amount: "", notes: "",
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["admin-financials"],
    queryFn: async () => {
      const response = await apiClient.get("/financials");
      return response.data || [];
    },
  });

  const filtered = entries.filter((e: any) => {
    const matchSearch =
      (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.reference_number || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || e.type === filterType;
    return matchSearch && matchType;
  });

  const totalIncome = entries.filter((e: any) => e.type === "income").reduce((s: number, e: any) => s + Number(e.amount), 0);
  const totalExpense = entries.filter((e: any) => e.type === "expense").reduce((s: number, e: any) => s + Number(e.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        entry_date: form.entry_date, type: form.type, category: form.category,
        description: form.description, amount: parseFloat(form.amount) || 0, notes: form.notes || null,
      };
      if (editing) {
        await apiClient.patch(`/financials/${editing.id}`, payload);
      } else {
        const response = await apiClient.post("/financials", payload);
        const fin = response.data;
        if (fin) {
          await apiClient.post("/transactions", {
            type: form.type, category: form.category, description: form.description,
            amount: parseFloat(form.amount) || 0, payment_method: "cash",
            reference_type: "manual", reference_id: fin.id, reference_number: fin.display_id,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-financials"] });
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      setEditing(null); setAdding(false);
      toast({ title: "Entry saved" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/financials/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-financials"] }); toast({ title: "Deleted" }); },
  });

  const startEdit = (e: any) => {
    setEditing(e); setAdding(false);
    setForm({ entry_date: e.entry_date, type: e.type, category: e.category, description: e.description, amount: e.amount?.toString() || "", notes: e.notes || "" });
  };

  const startAdd = () => {
    setAdding(true); setEditing(null);
    setForm({ entry_date: new Date().toISOString().split("T")[0], type: "income", category: "", description: "", amount: "", notes: "" });
  };

   const cancel = () => { setEditing(null); setAdding(false); };

  const downloadReport = async () => {
    try {
      await downloadFinancialReportPDF({
        entries: filtered,
        totalIncome,
        totalExpense,
        netBalance,
      });
      toast({ title: "Report Generated", description: "Financial report has been downloaded." });
    } catch (err) {
      console.error("Report PDF Error:", err);
      toast({ title: "Failed to generate report", variant: "destructive" });
    }
  };

  const formDialog = (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "New"} Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input type="date" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} />
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Amount (PKR)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Financials</h2>
          <p className="text-sm text-muted-foreground">{entries.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport} className="gap-2">
            <FileText size={16} /> Generate Report
          </Button>
          <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Add Entry</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ArrowUpRight size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Income</p>
            <p className="text-xl font-bold text-emerald-600">PKR {totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ArrowDownRight size={22} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">PKR {totalExpense.toLocaleString()}</p>
          </div>
        </div>
        <div className={`${cardClass} flex items-center gap-4`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-accent/10" : "bg-red-100"}`}>
            <DollarSign size={22} className={netBalance >= 0 ? "text-accent" : "text-red-600"} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Net Balance</p>
            <p className={`text-xl font-bold ${netBalance >= 0 ? "text-accent" : "text-red-600"}`}>PKR {netBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {formDialog}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search entries..." className="pl-9 w-60" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className={thClass}>ID</th>
                <th className={thClass}>Date</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Category</th>
                <th className={`${thClass} hidden md:table-cell`}>Description</th>
                <th className={`${thClass} hidden lg:table-cell`}>Ref</th>
                <th className={`${thClass} text-right`}>Amount</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e: any) => (
                <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-accent">{e.display_id}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{new Date(e.entry_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      e.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {e.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{e.category}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    <p className="line-clamp-1">{e.description}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {e.reference_number ? (
                      <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-mono">{e.reference_number}</span>
                    ) : "—"}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-semibold ${e.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {e.type === "income" ? "+" : "-"}PKR {Number(e.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(e)}><Pencil size={14} /></Button>
                      {!e.reference_type && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(e.id)}><Trash2 size={14} className="text-destructive" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No entries found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminFinancials;
