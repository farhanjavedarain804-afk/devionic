import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Save, X, Search, Receipt, ArrowUpRight, ArrowDownRight, DollarSign, ArrowLeftRight, CreditCard, Printer, FileText, AlertTriangle, Download } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printTransactionReceipt, downloadTransactionReceipt } from "@/lib/transaction-receipt";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const thClass = "text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left py-3 px-4";

const categories = [
  "Invoice Payment", "Service Payment", "Project Payment", "Consultation Fee",
  "Office Rent", "Utilities", "Salaries", "Software Subscriptions",
  "Hardware", "Marketing", "Travel", "Salary Payment", "Miscellaneous",
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online Payment" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
  { value: "pay_order", label: "Pay Order" },
];

const AdminTransactions = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [form, setForm] = useState({
    transaction_date: new Date().toISOString().split("T")[0],
    type: "income", category: "", description: "", amount: "",
    payment_method: "cash", from_name: "", to_name: "", reference_number: "", notes: "",
  });

  // Receipt form state
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    displayId: "", date: "", time: "", type: "income" as "income" | "expense",
    category: "", description: "", amount: 0, currency: "PKR",
    paymentMethod: "cash", fromName: "", toName: "", referenceNumber: "", notes: "", fee: 0,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const response = await apiClient.get("/transactions");
      return response.data || [];
    },
  });

  const filtered = transactions.filter((t: any) => {
    const matchSearch =
      (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.display_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.from_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.to_name || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchType;
  });

  const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const thisMonth = transactions.filter((t: any) => {
    const d = new Date(t.transaction_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        transaction_date: form.transaction_date, type: form.type, category: form.category,
        description: form.description, amount: parseFloat(form.amount) || 0,
        payment_method: form.payment_method, from_name: form.from_name || null,
        to_name: form.to_name || null, reference_number: form.reference_number || null, notes: form.notes || null,
      };
      if (editing) {
        await apiClient.patch(`/transactions/${editing.id}`, payload);
      } else {
        const response = await apiClient.post("/transactions", payload);
        const txn = response.data;
        await apiClient.post("/financials", {
          entry_date: form.transaction_date, type: form.type, category: form.category,
          description: form.description, amount: parseFloat(form.amount) || 0,
          reference_type: "transaction", reference_number: txn?.display_id || "",
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      qc.invalidateQueries({ queryKey: ["admin-financials"] });
      setEditing(null); setAdding(false);
      toast({ title: "Transaction saved" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/transactions/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-transactions"] }); toast({ title: "Deleted" }); },
  });

  const startEdit = (t: any) => {
    setEditing(t); setAdding(false);
    setForm({
      transaction_date: t.transaction_date, type: t.type, category: t.category,
      description: t.description, amount: t.amount?.toString() || "",
      payment_method: t.payment_method || "cash", from_name: t.from_name || "",
      to_name: t.to_name || "", reference_number: t.reference_number || "", notes: t.notes || "",
    });
  };

  const startAdd = () => {
    setAdding(true); setEditing(null);
    setForm({ transaction_date: new Date().toISOString().split("T")[0], type: "income", category: "", description: "", amount: "", payment_method: "cash", from_name: "", to_name: "", reference_number: "", notes: "" });
  };

  const cancel = () => { setEditing(null); setAdding(false); };

  const getRefLabel = (method: string) => {
    switch (method) {
      case "cheque": return "Cheque Number";
      case "online": return "Transaction ID";
      case "mobile_wallet": return "Transaction ID";
      case "pay_order": return "Pay Order Number";
      case "bank_transfer": return "Reference Number";
      default: return "Reference Number";
    }
  };

  const showRefField = form.payment_method !== "cash";
  const showReceiptRefField = receiptForm.paymentMethod !== "cash";

  // Open receipt form pre-filled from a transaction
  const openReceiptForm = (t: any) => {
    const d = new Date(t.transaction_date);
    const now = new Date();
    setReceiptForm({
      displayId: t.display_id,
      date: d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: t.type as "income" | "expense",
      category: t.category,
      description: t.description,
      amount: Number(t.amount),
      currency: "PKR",
      paymentMethod: t.payment_method || "cash",
      fromName: t.from_name || "",
      toName: t.to_name || "",
      referenceNumber: t.reference_number || t.display_id,
      notes: t.notes || "",
      fee: 0,
    });
    setReceiptDialog(true);
  };

  const handlePrintReceipt = () => {
    printTransactionReceipt({
      displayId: receiptForm.displayId, date: receiptForm.date, time: receiptForm.time,
      type: receiptForm.type, category: receiptForm.category, description: receiptForm.description,
      amount: receiptForm.amount, currency: receiptForm.currency, paymentMethod: receiptForm.paymentMethod,
      fromName: receiptForm.fromName || undefined, toName: receiptForm.toName || undefined,
      referenceNumber: receiptForm.referenceNumber || undefined, notes: receiptForm.notes || undefined,
      fee: receiptForm.fee,
    });
    setReceiptDialog(false);
  };

  const handleDownloadReceipt = () => {
    downloadTransactionReceipt({
      displayId: receiptForm.displayId, date: receiptForm.date, time: receiptForm.time,
      type: receiptForm.type, category: receiptForm.category, description: receiptForm.description,
      amount: receiptForm.amount, currency: receiptForm.currency, paymentMethod: receiptForm.paymentMethod,
      fromName: receiptForm.fromName || undefined, toName: receiptForm.toName || undefined,
      referenceNumber: receiptForm.referenceNumber || undefined, notes: receiptForm.notes || undefined,
      fee: receiptForm.fee,
    });
    setReceiptDialog(false);
  };

  const formDialog = (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "New"} Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Input type="date" value={form.transaction_date} onChange={e => setForm({ ...form, transaction_date: e.target.value })} />
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
          <div className="grid sm:grid-cols-3 gap-3">
            <Input placeholder="From (Name)" value={form.from_name} onChange={e => setForm({ ...form, from_name: e.target.value })} />
            <Input placeholder="To (Name)" value={form.to_name} onChange={e => setForm({ ...form, to_name: e.target.value })} />
            <Select value={form.payment_method} onValueChange={v => setForm({ ...form, payment_method: v, reference_number: "" })}>
              <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {showRefField && (
            <Input placeholder={getRefLabel(form.payment_method)} value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })} />
          )}
          <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
          <div className="flex gap-2">
            <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save</Button>
            <Button variant="ghost" onClick={cancel}><X size={16} /> Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Receipt Form Dialog
  const receiptFormDialog = (
    <Dialog open={receiptDialog} onOpenChange={v => { if (!v) setReceiptDialog(false); }}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Receipt size={20} className="text-accent" /> Generate Transaction Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Receipt ID & Date/Time */}
          <div className="rounded-xl bg-muted/50 p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Receipt ID</p>
            <p className="font-mono text-sm font-bold text-accent">{receiptForm.displayId}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
              <Input value={receiptForm.date} onChange={e => setReceiptForm({ ...receiptForm, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
              <Input value={receiptForm.time} onChange={e => setReceiptForm({ ...receiptForm, time: e.target.value })} />
            </div>
          </div>

          {/* Type & Category */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <Select value={receiptForm.type} onValueChange={v => setReceiptForm({ ...receiptForm, type: v as "income" | "expense" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <Select value={receiptForm.category} onValueChange={v => setReceiptForm({ ...receiptForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description & Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Input value={receiptForm.description} onChange={e => setReceiptForm({ ...receiptForm, description: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
              <Input type="number" value={receiptForm.amount} onChange={e => setReceiptForm({ ...receiptForm, amount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fee</label>
              <Input type="number" value={receiptForm.fee} onChange={e => setReceiptForm({ ...receiptForm, fee: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
              <Input value={receiptForm.currency} onChange={e => setReceiptForm({ ...receiptForm, currency: e.target.value })} />
            </div>
          </div>

          {/* From / To */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From (Name)</label>
              <Input value={receiptForm.fromName} onChange={e => setReceiptForm({ ...receiptForm, fromName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To (Name)</label>
              <Input value={receiptForm.toName} onChange={e => setReceiptForm({ ...receiptForm, toName: e.target.value })} />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Method</label>
              <Select value={receiptForm.paymentMethod} onValueChange={v => setReceiptForm({ ...receiptForm, paymentMethod: v, referenceNumber: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {showReceiptRefField && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{getRefLabel(receiptForm.paymentMethod)}</label>
                <Input value={receiptForm.referenceNumber} onChange={e => setReceiptForm({ ...receiptForm, referenceNumber: e.target.value })} />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
            <Textarea value={receiptForm.notes} onChange={e => setReceiptForm({ ...receiptForm, notes: e.target.value })} rows={2} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1">
              <Download size={16} /> Download
            </Button>
            <Button variant="cyan" onClick={handlePrintReceipt} className="flex-1">
              <Printer size={16} /> Print
            </Button>
            <Button variant="ghost" onClick={() => setReceiptDialog(false)}><X size={16} /> Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Compute overdue/critical invoice stats
  const { data: invoices = [] } = useQuery({
    queryKey: ["txn-invoices"],
    queryFn: async () => {
      const response = await apiClient.get("/invoices");
      return response.data || [];
    },
  });

  const totalPaidInvoices = invoices.filter((i: any) => i.status === "paid").length;
  const totalUnpaidInvoices = invoices.filter((i: any) => i.status !== "paid" && i.status !== "cancelled").length;
  const totalCashReceived = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalCashDue = invoices.filter((i: any) => i.status !== "paid" && i.status !== "cancelled").reduce((s: number, i: any) => s + (Number(i.total) - Number(i.paid_amount || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Transactions</h2>
          <p className="text-sm text-muted-foreground">{transactions.length} transactions • Transactions are auto-created from invoices & salary payments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Income" value={`PKR ${totalIncome.toLocaleString()}`} icon={ArrowUpRight} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Total Expense" value={`PKR ${totalExpense.toLocaleString()}`} icon={ArrowDownRight} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Cash Received" value={`PKR ${totalCashReceived.toLocaleString()}`} icon={CreditCard} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Cash Due" value={`PKR ${totalCashDue.toLocaleString()}`} icon={AlertTriangle} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Net Balance" value={`PKR ${netBalance.toLocaleString()}`} icon={DollarSign} color="bg-accent/10" iconColor="text-accent" />
        <StatsCard title="This Month" value={thisMonth} icon={ArrowLeftRight} />
        <StatsCard title="Invoices Paid" value={totalPaidInvoices} icon={FileText} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Invoices Unpaid" value={totalUnpaidInvoices} icon={FileText} color="bg-destructive/10" iconColor="text-destructive" />
      </div>

      {formDialog}
      {receiptFormDialog}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9 w-60" value={search} onChange={e => setSearch(e.target.value)} />
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
                <th className={`${thClass} hidden lg:table-cell`}>From/To</th>
                <th className={`${thClass} hidden lg:table-cell`}>Method</th>
                <th className={`${thClass} text-right`}>Amount</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t: any) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-accent">{t.display_id}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{new Date(t.transaction_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {t.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{t.category}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    <p className="line-clamp-1">{t.description}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {t.from_name && <span className="block text-xs">From: {t.from_name}</span>}
                    {t.to_name && <span className="block text-xs">To: {t.to_name}</span>}
                    {!t.from_name && !t.to_name && "—"}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize">{(t.payment_method || "cash").replace("_", " ")}</span>
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {t.type === "income" ? "+" : "-"}PKR {Number(t.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Generate Receipt" onClick={() => openReceiptForm(t)}>
                        <Receipt size={14} className="text-accent" />
                      </Button>
                      {!t.reference_type && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(t)}><Pencil size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(t.id)}><Trash2 size={14} className="text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No transactions found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
