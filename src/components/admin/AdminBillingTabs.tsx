import { useState, useRef, useEffect } from "react";
import devionicLogoFull from "@/assets/devionic-logo-full.png";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Save, X, Eye, Download, FileText, Receipt, Users, Search, UserCheck, Building, MapPin, DollarSign, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Package, FolderKanban, Mail, Phone, Printer, Globe } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { generateDocNumber, getHtmlPrintHeader, getHtmlPrintFooter, formatDateSafe, parseItems } from "@/lib/pdf-utils";
import { downloadDocumentPDF, downloadBillingReportPDF } from "@/lib/pdf-download";
import { format, isValid } from "date-fns";
import QRCode from "qrcode";


const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";

// ===== CUSTOMERS =====
const AdminCustomers = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", address: "", city: "", company: "", notes: "" });

  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/customers");
      return response.data || [];
    },
  });

  const filtered = customers.filter((c: any) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name, email: form.email || null, phone: form.phone || null,
        whatsapp: form.whatsapp || null, address: form.address || null,
        city: form.city || null, company: form.company || null, notes: form.notes || null,
      };
      if (editing) await apiClient.put(`/admin/customers/${editing.id}`, payload);
      else await apiClient.post("/dms/admin/customers", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-customers"] }); setEditing(null); setAdding(false); toast({ title: "Customer saved" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/admin/customers/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-customers"] }); toast({ title: "Deleted" }); },
  });

  const startEdit = (c: any) => { setEditing(c); setAdding(false); setForm({ name: c.name, email: c.email || "", phone: c.phone || "", whatsapp: c.whatsapp || "", address: c.address || "", city: c.city || "", company: c.company || "", notes: c.notes || "" }); };
  const startAdd = () => { setAdding(true); setEditing(null); setViewing(null); setForm({ name: "", email: "", phone: "", whatsapp: "", address: "", city: "", company: "", notes: "" }); };
  const cancel = () => { setEditing(null); setAdding(false); setViewing(null); };

  const { data: relatedInvoices = [] } = useQuery({
    queryKey: ["customer-invoices", viewing?.id],
    queryFn: async () => {
      const resp = await apiClient.get("/invoices");
      return (resp.data || []).filter((i: any) => i.customer_id === viewing?.id);
    },
    enabled: !!viewing,
  });

  const { data: relatedQuotations = [] } = useQuery({
    queryKey: ["customer-quotations", viewing?.id],
    queryFn: async () => {
      const resp = await apiClient.get("/quotations");
      return (resp.data || []).filter((q: any) => q.customer_id === viewing?.id);
    },
    enabled: !!viewing,
  });

  const { data: relatedProjects = [] } = useQuery({
    queryKey: ["customer-projects", viewing?.id],
    queryFn: async () => {
      const resp = await apiClient.get("/projects");
      return (resp.data || []).filter((p: any) => p.customer_id === viewing?.id);
    },
    enabled: !!viewing,
  });

  const withCompany = customers.filter((c: any) => c.company).length;
  const withCity = customers.filter((c: any) => c.city).length;
  const thisMonth = customers.filter((c: any) => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Customers</h2>
          <p className="text-sm text-muted-foreground">{customers.length} customers</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-9 w-60" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Add Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Customers" value={customers.length} icon={Users} />
        <StatsCard title="This Month" value={thisMonth} icon={UserCheck} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="With Company" value={withCompany} icon={Building} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="With City" value={withCity} icon={MapPin} color="bg-[hsl(270,60%,50%)]/10" iconColor="text-[hsl(270,60%,50%)]" />
      </div>

      <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "New"} Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
              <Input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <Input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="ghost" onClick={cancel}>Cancel</Button>
              <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={v => { if (!v) cancel(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Name</p><p className="text-sm font-semibold">{viewing.name}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Company</p><p className="text-sm font-semibold">{viewing.company || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p><p className="text-sm">{viewing.email || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Phone</p><p className="text-sm">{viewing.phone || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">WhatsApp</p><p className="text-sm">{viewing.whatsapp || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">City</p><p className="text-sm">{viewing.city || "—"}</p></div>
                  </div>
                  <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Address</p><p className="text-sm bg-muted/30 p-3 rounded-xl border border-border/50">{viewing.address || "No address provided"}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Internal Notes</p><p className="text-sm bg-accent/5 p-3 rounded-xl border border-accent/10 italic text-muted-foreground">{viewing.notes || "No notes available"}</p></div>
                </div>
                <div className="space-y-4">
                  <div className="bg-accent/5 rounded-2xl p-4 border border-accent/10">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-3 tracking-wider">Summary</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Invoices</span>
                        <span className="font-bold text-foreground">{relatedInvoices.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Quotations</span>
                        <span className="font-bold text-foreground">{relatedQuotations.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Projects</span>
                        <span className="font-bold text-foreground">{relatedProjects.length}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-accent/10">
                        <p className="text-[10px] text-muted-foreground">Customer since {new Date(viewing.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="invoices" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="invoices">Invoices ({relatedInvoices.length})</TabsTrigger>
                  <TabsTrigger value="quotations">Quotations ({relatedQuotations.length})</TabsTrigger>
                  <TabsTrigger value="projects">Projects ({relatedProjects.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="invoices" className="mt-4">
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">ID</th>
                          <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Date</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">Total</th>
                          <th className="text-center py-2 px-3 font-semibold text-xs text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedInvoices.map((inv: any) => (
                          <tr key={inv.id} className="border-t border-border">
                            <td className="py-2 px-3 font-mono text-xs text-accent">{inv.invoice_number}</td>
                            <td className="py-2 px-3 text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                            <td className="py-2 px-3 text-right font-semibold">{Number(inv.total).toLocaleString()} {inv.currency}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inv.status === 'paid' ? 'bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]' : 
                                inv.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                              }`}>{inv.status}</span>
                            </td>
                          </tr>
                        ))}
                        {relatedInvoices.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-xs italic">No invoices found for this customer</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="quotations" className="mt-4">
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">ID</th>
                          <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Date</th>
                          <th className="text-right py-2 px-3 font-semibold text-xs text-muted-foreground">Total</th>
                          <th className="text-center py-2 px-3 font-semibold text-xs text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedQuotations.map((quo: any) => (
                          <tr key={quo.id} className="border-t border-border">
                            <td className="py-2 px-3 font-mono text-xs text-accent">{quo.quotation_number}</td>
                            <td className="py-2 px-3 text-xs">{new Date(quo.created_at).toLocaleDateString()}</td>
                            <td className="py-2 px-3 text-right font-semibold">{Number(quo.total).toLocaleString()} {quo.currency}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                quo.status === 'accepted' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                              }`}>{quo.status}</span>
                            </td>
                          </tr>
                        ))}
                        {relatedQuotations.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-xs italic">No quotations found for this customer</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="projects" className="mt-4">
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">ID</th>
                          <th className="text-left py-2 px-3 font-semibold text-xs text-muted-foreground">Project</th>
                          <th className="text-center py-2 px-3 font-semibold text-xs text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedProjects.map((p: any) => (
                          <tr key={p.id} className="border-t border-border">
                            <td className="py-2 px-3 font-mono text-xs text-accent">{p.display_id}</td>
                            <td className="py-2 px-3">
                              <p className="font-medium text-xs truncate max-w-[150px]">{p.title}</p>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{p.status}</span>
                            </td>
                          </tr>
                        ))}
                        {relatedProjects.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-xs italic">No projects found for this customer</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button variant="ghost" onClick={cancel}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">ID</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Customer</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Company</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">Contact</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">City</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-accent">{c.display_id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{c.company || "-"}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{c.city || "-"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(c)} title="View Detail"><Eye size={14} className="text-accent" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)} title="Edit"><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(c.id)} title="Delete"><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No customers found.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== SERVICE SEARCH COMPONENT =====
const ServiceSearch = ({ onSelect }: { onSelect: (service: any) => void }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["billing-services"],
    queryFn: async () => {
      const response = await apiClient.get("/public/services");
      return response.data || [];
    },
  });

  const filtered = services.filter((s: any) =>
    (s.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services to add..."
          className="pl-8 h-9 text-sm"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && search.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3">No services found</p>
          ) : (
            filtered.map((s: any) => (
              <button
                key={s.id}
                className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-2 border-b border-border/30 last:border-0"
                onClick={() => { onSelect(s); setSearch(""); setOpen(false); }}
              >
                <Package size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.code && <span className="font-mono">{s.code} · </span>}
                    Min: {Number(s.minimum_charges || 0).toLocaleString()} PKR
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
};

// ===== DOCUMENT MANAGER HOOK =====
interface LineItem { description: string; quantity: number; rate: number; amount: number; }
const emptyItem: LineItem = { description: "", quantity: 1, rate: 0, amount: 0 };

const useDocumentManager = (tableName: "invoices" | "quotations", queryKey: string) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [form, setForm] = useState({
    client_name: "", client_email: "", client_phone: "", client_address: "",
    items: [{ ...emptyItem }] as LineItem[],
    tax_rate: 0, discount: 0, currency: "PKR", due_date: "", notes: "", status: "draft",
  });

  const { data: docs = [] } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await apiClient.get(`/${tableName}`);
      return response.data || [];
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["billing-customers"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/customers");
      return response.data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const totals = calcTotals(form.items, form.tax_rate, form.discount);
      const payload: any = {
        client_name: form.client_name, client_email: form.client_email || null,
        client_phone: form.client_phone || null, client_address: form.client_address || null,
        items: form.items, tax_rate: form.tax_rate, discount: form.discount,
        currency: form.currency, notes: form.notes || null, status: form.status,
        customer_id: selectedCustomerId || null,
        ...totals,
      };
      if (tableName === "invoices") payload.due_date = form.due_date || null;
      else payload.valid_until = form.due_date || null;

      if (customerMode === "new" && form.client_name && !selectedCustomerId) {
        const response = await apiClient.post("/dms/admin/customers", {
          name: form.client_name, email: form.client_email || null,
          phone: form.client_phone || null, address: form.client_address || null,
        });
        if (response.data && response.data.id) payload.customer_id = response.data.id;
      }

      if (editing) {
        await apiClient.put(`/${tableName}/${editing.id}`, payload);
      } else {
        await apiClient.post(`/${tableName}`, payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      qc.invalidateQueries({ queryKey: ["billing-customers"] });
      setEditing(null); setAdding(false);
      toast({ title: "Saved successfully" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const recordPayment = async (doc: any, paymentAmount: number, method: string = "cash", refNumber?: string) => {
    if (tableName !== "invoices") return;
    const currentPaid = Number(doc.paid_amount) || 0;
    const newPaid = currentPaid + paymentAmount;
    const total = Number(doc.total);
    const newStatus = newPaid >= total ? "paid" : "partial";

    await apiClient.patch(`/invoices/${doc.id}`, { paid_amount: newPaid, status: newStatus });

    await apiClient.post("/transactions", {
      type: "income",
      category: "Invoice Payment",
      description: `Payment for ${doc.invoice_number} from ${doc.client_name}`,
      amount: paymentAmount,
      payment_method: method,
      reference_type: "invoice",
      reference_id: doc.id,
      reference_number: refNumber || doc.invoice_number,
      from_name: doc.client_name,
      to_name: "DEVIONIC (PRIVATE) LIMITED",
    });

    await apiClient.post("/financials", {
      entry_date: new Date().toISOString().split("T")[0],
      type: "income",
      category: "Invoice Payment",
      description: `Payment received for ${doc.invoice_number} from ${doc.client_name}`,
      amount: paymentAmount,
      reference_type: "invoice",
      reference_id: doc.id,
      reference_number: doc.invoice_number,
    });

    qc.invalidateQueries({ queryKey: [queryKey] });
    qc.invalidateQueries({ queryKey: ["admin-financials"] });
    qc.invalidateQueries({ queryKey: ["admin-transactions"] });

    toast({ title: newStatus === "paid" ? "Invoice fully paid!" : "Partial payment recorded" });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/${tableName}/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast({ title: "Deleted" }); },
  });

  const startEdit = (d: any) => {
    setEditing(d); setAdding(false); setViewing(null);
    setSelectedCustomerId(d.customer_id || "");
    setCustomerMode(d.customer_id ? "existing" : "new");
    const parsed = parseItems(d.items);
    setForm({
      client_name: d.client_name, client_email: d.client_email || "", client_phone: d.client_phone || "",
      client_address: d.client_address || "", 
      items: parsed.length ? parsed : [{ ...emptyItem }],
      tax_rate: Number(d.tax_rate) || 0, discount: Number(d.discount) || 0, currency: d.currency || "PKR",
      due_date: d.due_date || d.valid_until || "", notes: d.notes || "", status: d.status || "draft",
    });
  };

  const startAdd = () => {
    setAdding(true); setEditing(null); setViewing(null);
    setSelectedCustomerId(""); setCustomerMode("new");
    setForm({ client_name: "", client_email: "", client_phone: "", client_address: "", items: [{ ...emptyItem }], tax_rate: 0, discount: 0, currency: "PKR", due_date: "", notes: "", status: "draft" });
  };

  const startAddFromQuoteRequest = (req: any, mode: "existing" | "new", customerId?: string) => {
    setAdding(true); setEditing(null); setViewing(null);
    setCustomerMode(mode);
    if (mode === "existing" && customerId) {
      setSelectedCustomerId(customerId);
      const customer = customers.find((c: any) => c.id === customerId);
      if (customer) {
        setForm({
          client_name: customer.name, client_email: customer.email || "",
          client_phone: customer.phone || "", client_address: customer.address || "",
          items: [{ ...emptyItem }], tax_rate: 0, discount: 0, currency: "PKR",
          due_date: "", notes: `Quote Request: ${req.display_id}\nService: ${req.service || "N/A"}\nDescription: ${req.description}`,
          status: "draft",
        });
        return;
      }
    }
    setSelectedCustomerId("");
    setForm({
      client_name: req.name || "", client_email: req.email || "",
      client_phone: req.phone || "", client_address: "",
      items: [{ ...emptyItem }], tax_rate: 0, discount: 0, currency: "PKR",
      due_date: "", notes: `Quote Request: ${req.display_id}\nService: ${req.service || "N/A"}\nDescription: ${req.description}`,
      status: "draft",
    });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems.length ? newItems : [{ ...emptyItem }] });
  };
  const updateItem = (index: number, key: keyof LineItem, val: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [key]: val };
    if (key === "quantity" || key === "rate") {
      newItems[index].amount = Number(newItems[index].quantity) * Number(newItems[index].rate);
    }
    setForm({ ...form, items: newItems });
  };

  const addServiceItem = (service: any) => {
    const newItem: LineItem = {
      description: service.title,
      quantity: 1,
      rate: Number(service.minimum_charges || 0),
      amount: Number(service.minimum_charges || 0)
    };
    if (form.items.length === 1 && !form.items[0].description) {
      setForm({ ...form, items: [newItem] });
    } else {
      setForm({ ...form, items: [...form.items, newItem] });
    }
  };

  const calcTotals = (items: LineItem[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const tax_amount = (subtotal * taxRate) / 100;
    const total = subtotal + tax_amount - discount;
    return { subtotal, tax_amount, total };
  };

  const selectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find((c: any) => c.id === id);
    if (c) {
      setForm({
        ...form,
        client_name: c.name,
        client_email: c.email || "",
        client_phone: c.phone || "",
        client_address: c.address || ""
      });
    }
  };

  const cancel = () => { setEditing(null); setAdding(false); };

  return { docs, form, setForm, editing, adding, viewing, setViewing, startEdit, startAdd, startAddFromQuoteRequest, cancel, save, remove, updateItem, addItem, removeItem, addServiceItem, calcTotals, customers, customerMode, setCustomerMode, selectedCustomerId, selectCustomer, customerSearch, setCustomerSearch, recordPayment };
};

// ===== BANK ACCOUNT INTERFACE =====
interface BankAccount {
  id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  branch_code: string;
  is_default: boolean;
}



const DevionicLogo = ({ className = "", width = 200 }: { className?: string; width?: number }) => (
  <img
    src={devionicLogoFull}
    alt="Devionic"
    style={{ width, maxWidth: "100%" }}
    className={className}
  />
);

const DocumentPreview = ({ doc, number, isInvoice, verifyUrl, onClose, bankAccounts }: any) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const generatePreview = async () => {
      try {
        const sorted = [...(bankAccounts || [])].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
        const mappedItems = parseItems(doc.items).map((it: any) => ({
          description: String(it.description || "No Description"),
          quantity: typeof it.quantity === 'number' ? it.quantity : Number(it.quantity) || 0,
          rate: typeof it.rate === 'number' ? it.rate : Number(it.rate) || 0,
          amount: typeof it.amount === 'number' ? it.amount : Number(it.amount) || 0,
        }));

        const url = await downloadDocumentPDF({
          type: isInvoice ? "invoice" : "quotation",
          number: String(number || ""),
          status: String(doc.status || "N/A"),
          createdAt: doc.created_at || new Date().toISOString(),
          dueDate: doc.due_date,
          validUntil: doc.valid_until,
          currency: String(doc.currency || "PKR"),
          clientName: String(doc.client_name || "Client Name"),
          clientEmail: doc.client_email,
          clientPhone: doc.client_phone,
          clientAddress: doc.client_address,
          items: mappedItems,
          subtotal: Number(doc.subtotal) || 0,
          taxRate: Number(doc.tax_rate) || 0,
          taxAmount: Number(doc.tax_amount) || 0,
          discount: Number(doc.discount) || 0,
          total: Number(doc.total || 0),
          paidAmount: Number(doc.paid_amount || 0),
          notes: String(doc.notes || ""),
          verificationId: String(doc.verification_id || ""),
          bankAccounts: sorted,
        }, "preview");

        if (url) setPdfUrl(url);
      } catch (error: any) {
        console.error("Preview Generation Error:", error);
        toast({ 
          title: "Preview Failed", 
          description: "Could not generate document preview.", 
          variant: "destructive" 
        });
      }
    };

    generatePreview();
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [doc]);

  const handlePrint = async () => {
    try {
      const sorted = [...(bankAccounts || [])].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      const mappedItems = parseItems(doc.items).map((it: any) => ({
        description: String(it.description || "No Description"),
        quantity: typeof it.quantity === 'number' ? it.quantity : Number(it.quantity) || 0,
        rate: typeof it.rate === 'number' ? it.rate : Number(it.rate) || 0,
        amount: typeof it.amount === 'number' ? it.amount : Number(it.amount) || 0,
      }));

      await downloadDocumentPDF({
        type: isInvoice ? "invoice" : "quotation",
        number: String(number || ""),
        status: String(doc.status || "N/A"),
        createdAt: doc.created_at || new Date().toISOString(),
        dueDate: doc.due_date,
        validUntil: doc.valid_until,
        currency: String(doc.currency || "PKR"),
        clientName: String(doc.client_name || "Client Name"),
        clientEmail: doc.client_email,
        clientPhone: doc.client_phone,
        clientAddress: doc.client_address,
        items: mappedItems,
        subtotal: Number(doc.subtotal) || 0,
        taxRate: Number(doc.tax_rate) || 0,
        taxAmount: Number(doc.tax_amount) || 0,
        discount: Number(doc.discount) || 0,
        total: Number(doc.total || 0),
        paidAmount: Number(doc.paid_amount || 0),
        notes: String(doc.notes || ""),
        verificationId: String(doc.verification_id || ""),
        bankAccounts: sorted,
      }, "print");
    } catch (error: any) {
      toast({ title: "Print Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    try {
      const sorted = [...(bankAccounts || [])].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
      const mappedItems = parseItems(doc.items).map((it: any) => ({
        description: String(it.description || "No Description"),
        quantity: typeof it.quantity === 'number' ? it.quantity : Number(it.quantity) || 0,
        rate: typeof it.rate === 'number' ? it.rate : Number(it.rate) || 0,
        amount: typeof it.amount === 'number' ? it.amount : Number(it.amount) || 0,
      }));

      await downloadDocumentPDF({
        type: isInvoice ? "invoice" : "quotation",
        number: String(number || ""),
        status: String(doc.status || "N/A"),
        createdAt: doc.created_at || new Date().toISOString(),
        dueDate: doc.due_date,
        validUntil: doc.valid_until,
        currency: String(doc.currency || "PKR"),
        clientName: String(doc.client_name || "Client Name"),
        clientEmail: doc.client_email,
        clientPhone: doc.client_phone,
        clientAddress: doc.client_address,
        items: mappedItems,
        subtotal: Number(doc.subtotal) || 0,
        taxRate: Number(doc.tax_rate) || 0,
        taxAmount: Number(doc.tax_amount) || 0,
        discount: Number(doc.discount) || 0,
        total: Number(doc.total || 0),
        paidAmount: Number(doc.paid_amount || 0),
        notes: String(doc.notes || ""),
        verificationId: String(doc.verification_id || ""),
        bankAccounts: sorted,
      });
      toast({ title: "PDF Generated", description: `Document ${number} has been downloaded.` });
    } catch (error: any) {
      toast({ title: "Download Failed", description: "Failed to generate PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d1b2a] border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl gap-2 h-9 px-3 border border-slate-700/50"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Back</span>
            </Button>
            <div className="flex items-center gap-4 border-l border-slate-700/50 pl-6">
              <div className="h-10 w-10 rounded-xl bg-[#00bac7]/20 flex items-center justify-center">
                {isInvoice ? <FileText size={20} className="text-[#00bac7]" /> : <Receipt size={20} className="text-[#00bac7]" />}
              </div>
              <div>
                <span className="block font-black text-white text-lg leading-none tracking-tight">{number}</span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 block">{isInvoice ? "Invoice" : "Quotation"} · {doc.status}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={handleDownload} className="h-10 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl px-4">
              <Download size={15} className="mr-2" /> Download
            </Button>
            <Button size="sm" onClick={handlePrint} className="h-10 text-xs bg-[#00bac7] text-white hover:bg-[#00a3b5] rounded-xl px-4 shadow-lg shadow-[#00bac7]/20">
              <Printer size={15} className="mr-2" /> Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 text-slate-400 hover:text-white rounded-xl">
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Invoice Preview Body - PDF Viewer */}
        <div className="bg-slate-100/50 flex-1 relative flex items-center justify-center overflow-hidden">
          {pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full border-none shadow-inner"
              title="Document Preview"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00bac7] border-t-transparent" />
              <p className="text-sm text-muted-foreground font-medium">Generating high-fidelity preview...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== DOCUMENT FORM =====
const DocumentForm = ({ type, manager }: { type: "invoice" | "quotation"; manager: ReturnType<typeof useDocumentManager> }) => {
  const { form, setForm, editing, adding, cancel, save, updateItem, addItem, removeItem, addServiceItem, calcTotals, customers, customerMode, setCustomerMode, selectedCustomerId, selectCustomer, customerSearch, setCustomerSearch } = manager;
  const filteredCustomers = customers.filter((c: any) =>
    (c.name || "").toLowerCase().includes((customerSearch || "").toLowerCase()) ||
    (c.email || "").toLowerCase().includes((customerSearch || "").toLowerCase()) ||
    (c.company || "").toLowerCase().includes((customerSearch || "").toLowerCase())
  );

  const totals = calcTotals(form.items, form.tax_rate, form.discount);

  return (
    <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "New"} {type === "invoice" ? "Invoice" : "Quotation"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Customer Selection */}
          <div className="flex gap-2 mb-2">
            <Button variant={customerMode === "existing" ? "cyan" : "outline"} size="sm" onClick={() => setCustomerMode("existing")}>
              <Users size={14} /> Existing Customer
            </Button>
            <Button variant={customerMode === "new" ? "cyan" : "outline"} size="sm" onClick={() => setCustomerMode("new")}>
              <Plus size={14} /> New Customer
            </Button>
          </div>

          {customerMode === "existing" && (
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, company..."
                  className="pl-8"
                  value={customerSearch || ""}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-border rounded-xl">
                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 text-center">No customers found</p>
                ) : (
                  filteredCustomers.map((c: any) => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between border-b border-border/30 last:border-0 ${selectedCustomerId === c.id ? 'bg-accent/10' : ''}`}
                      onClick={() => selectCustomer(c.id)}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}{c.company ? ` (${c.company})` : ''}</p>
                        <p className="text-[10px] text-muted-foreground">{c.email} · {c.phone || "No phone"} · {c.city || "No city"}</p>
                      </div>
                      {selectedCustomerId === c.id && <CheckCircle2 size={16} className="text-accent shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Client Name *" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
            <Input placeholder="Client Email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} />
            <Input placeholder="Client Phone" value={form.client_phone} onChange={e => setForm({ ...form, client_phone: e.target.value })} />
            <Input placeholder="Client Address" value={form.client_address} onChange={e => setForm({ ...form, client_address: e.target.value })} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">{type === "invoice" ? "Due Date" : "Valid Until"}</label>
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Currency</label>
              <Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service Search */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Add Service</label>
            <ServiceSearch onSelect={addServiceItem} />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Line Items</label>
              <Button variant="ghost" size="sm" onClick={addItem}><Plus size={14} /> Add Item</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5"><Input placeholder="Description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", Number(e.target.value))} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(i, "rate", Number(e.target.value))} /></div>
                  <div className="col-span-2 text-right text-sm font-semibold text-foreground">{item.amount.toLocaleString()}</div>
                  <div className="col-span-1">{form.items.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i)}><X size={14} /></Button>}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Tax Rate (%)</label><Input type="number" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: Number(e.target.value) })} /></div>
            <div><label className="text-xs text-muted-foreground">Discount ({form.currency})</label><Input type="number" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} /></div>
          </div>

          <div className="text-right space-y-1 text-sm border-t border-border pt-4">
            <p className="text-muted-foreground">Subtotal: {totals.subtotal.toLocaleString()} {form.currency}</p>
            {form.tax_rate > 0 && <p className="text-muted-foreground">Tax: {totals.tax_amount.toLocaleString()} {form.currency}</p>}
            {form.discount > 0 && <p className="text-muted-foreground">Discount: -{form.discount.toLocaleString()} {form.currency}</p>}
            <p className="text-lg font-bold text-foreground">Total: {totals.total.toLocaleString()} {form.currency}</p>
          </div>

          <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button variant="ghost" onClick={cancel}>Cancel</Button>
            <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
// ===== PROCEEDED QUOTE REQUESTS SECTION =====
const ProceededQuoteRequests = ({ manager }: { manager: ReturnType<typeof useDocumentManager> }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data: allRequests = [] } = useQuery({
    queryKey: ["admin-quote-requests"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/quote_requests");
      return response.data || [];
    },
  });

  // Filter out requests that are already processed or cancelled
  const activeRequests = allRequests.filter((req: any) => 
    req.status !== "contracted" && req.status !== "cancelled" && req.status !== "in_progress"
  );

  const handlePrepareQuotation = async (req: any) => {
    setLoading(req.id);
    try {
      // Check if customer already exists by email
      let customerId: string | null = null;
      const existingCustomer = manager.customers.find((c: any) => 
        c.email?.toLowerCase() === req.email?.toLowerCase()
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer from quote request data
        const response = await apiClient.post("/dms/admin/customers", {
          name: req.name,
          email: req.email || null,
          phone: req.phone || null,
        });
        
        if (response.data && response.data.id) {
          customerId = response.data.id;
          qc.invalidateQueries({ queryKey: ["billing-customers"] });
          qc.invalidateQueries({ queryKey: ["admin-customers"] });
        }
      }

      // Update quote request status to "in_progress" (being converted)
      await apiClient.patch(`/admin/quote_requests/${req.id}`, { status: "in_progress" });
      qc.invalidateQueries({ queryKey: ["admin-quote-requests"] });

      // Start quotation form with pre-filled data
      manager.startAddFromQuoteRequest(req, customerId ? "existing" : "new", customerId || undefined);
      toast({ title: existingCustomer ? "Existing customer found" : "Customer created automatically" });
    } catch (err: any) {
      toast({ title: "Error preparing quotation", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`${cardClass} space-y-4`}>
      <div className="flex items-center gap-2">
        <ArrowRight size={18} className="text-accent" />
        <h3 className="text-lg font-bold text-foreground font-heading">Quote Inquiries</h3>
        <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">{activeRequests.length}</span>
      </div>
      <p className="text-sm text-muted-foreground">Click on an inquiry to auto-create customer and prepare quotation.</p>

      <div className="space-y-2">
        {activeRequests.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">No active quote requests available.</p>
        )}
        {activeRequests.map((req: any) => (
          <button
            key={req.id}
            disabled={loading === req.id}
            onClick={() => handlePrepareQuotation(req)}
            className="w-full text-left border border-border rounded-xl px-4 py-3 hover:bg-muted/30 hover:border-accent/50 transition-all flex items-center justify-between group disabled:opacity-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-accent">{req.display_id}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{req.name}</p>
                <p className="text-[10px] text-muted-foreground">{req.service || "No service"} · {req.email}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{req.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                let badgeClass = "bg-muted text-muted-foreground";
                if (req.status === "proceed") badgeClass = "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]";
                else if (req.status === "pending") badgeClass = "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]";
                else if (req.status === "investigating") badgeClass = "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]";
                else if (req.status === "on_hold") badgeClass = "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]";
                
                return (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                    {req.status?.replace("_", " ") || "Pending"}
                  </span>
                );
              })()}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                {req.budget || "—"}
              </span>
              {loading === req.id ? (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== PAYMENT DIALOG =====
const PaymentDialog = ({ invoice, open, onClose, onPaymentRecorded }: { invoice: any; open: boolean; onClose: () => void; onPaymentRecorded: (amount: number, method: string, refNumber?: string) => void }) => {
  const remaining = Number(invoice?.total || 0) - Number(invoice?.paid_amount || 0);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState(remaining.toString());
  const [method, setMethod] = useState("cash");
  const [refNumber, setRefNumber] = useState("");

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "online", label: "Online Payment" },
    { value: "mobile_wallet", label: "Mobile Wallet" },
  ];

  const handleSubmit = () => {
    const payAmount = paymentType === "full" ? remaining : parseFloat(amount) || 0;
    if (payAmount <= 0 || payAmount > remaining) return;
    onPaymentRecorded(payAmount, method, refNumber || undefined);
    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign size={18} className="text-accent" />
            Record Payment - {invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold">{Number(invoice.total).toLocaleString()} {invoice.currency}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-semibold text-[hsl(142,70%,45%)]">{Number(invoice.paid_amount || 0).toLocaleString()} {invoice.currency}</span>
            </div>
            <div className="flex justify-between text-sm mt-1 pt-2 border-t border-border">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-bold text-accent">{remaining.toLocaleString()} {invoice.currency}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant={paymentType === "full" ? "cyan" : "outline"} size="sm" className="flex-1" onClick={() => { setPaymentType("full"); setAmount(remaining.toString()); }}>
              Full Payment
            </Button>
            <Button variant={paymentType === "partial" ? "cyan" : "outline"} size="sm" className="flex-1" onClick={() => setPaymentType("partial")}>
              Partial Payment
            </Button>
          </div>

          {paymentType === "partial" && (
            <Input type="number" placeholder="Payment Amount" value={amount} onChange={e => setAmount(e.target.value)} max={remaining} />
          )}

          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              {paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {method !== "cash" && (
            <Input placeholder={method === "cheque" ? "Cheque Number" : "Reference Number"} value={refNumber} onChange={e => setRefNumber(e.target.value)} />
          )}

          <div className="flex gap-2">
            <Button variant="cyan" className="flex-1" onClick={handleSubmit}>
              <CheckCircle2 size={16} /> Record Payment
            </Button>
            <Button variant="ghost" onClick={onClose}><X size={16} /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DocumentList = ({ type, onNavigate }: { type: "invoice" | "quotation"; onNavigate?: (tab: string) => void }) => {
  const manager = useDocumentManager(type === "invoice" ? "invoices" : "quotations", `admin-${type}s`);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [paymentInvoice, setPaymentInvoice] = useState<any>(null);

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]",
    partial: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
    paid: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    overdue: "bg-destructive/10 text-destructive",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const draftCount = manager.docs.filter((d: any) => d.status === "draft").length;
  const paidCount = manager.docs.filter((d: any) => d.status === "paid").length;
  const partialCount = manager.docs.filter((d: any) => d.status === "partial").length;
  const sentCount = manager.docs.filter((d: any) => d.status === "sent").length;
  const totalValue = manager.docs.reduce((s: number, d: any) => s + Number(d.total), 0);
  const totalPaid = manager.docs.reduce((s: number, d: any) => s + Number(d.paid_amount || 0), 0);

  const handlePaymentRecorded = async (amount: number, method: string, refNumber?: string) => {
    if (!paymentInvoice) return;
    await manager.recordPayment(paymentInvoice, amount, method, refNumber);
    qc.invalidateQueries({ queryKey: ["admin-transactions"] });
    setPaymentInvoice(null);
  };

  const sendToProject = async (invoice: any) => {
    // Check if project already exists by fetching all projects and filtering
    try {
      const projectsResp = await apiClient.get("/projects");
      const allProjects = projectsResp.data || [];
      const existing = allProjects.find((p: any) => p.invoice_id === invoice.id);
      if (existing) {
        toast({ title: "Project already exists for this invoice", description: `Project already linked: ${existing.title}`, variant: "destructive" });
        return;
      }
    } catch {
      // If we can't check, proceed with creation anyway
    }

    try {
      await apiClient.post("/projects", {
        title: `Project for ${invoice.client_name}`,
        description: invoice.notes || `From ${invoice.invoice_number}`,
        client_email: invoice.client_email,
        customer_id: invoice.customer_id || null,
        invoice_id: invoice.id,
        budget: Number(invoice.total) || 0,
        status: "planning",
        start_date: new Date().toISOString(),
        milestones: [],
      });

      try {
        await apiClient.post("/dms/admin/notifications", {
          title: "Project Created",
          message: `Project created from ${invoice.invoice_number}`,
          type: "info",
        });
      } catch { /* notification failure is non-critical */ }

      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "Project created successfully!" });
    } catch (err: any) {
      toast({ title: "Project Link Failed", description: err.message, variant: "destructive" });
    }
  };

  const downloadReport = async () => {
    try {
      await downloadBillingReportPDF({
        type: type === "invoice" ? "invoices" : "quotation",
        docs: manager.docs,
        totalValue,
        totalPaid: type === "invoice" ? totalPaid : undefined,
      });
      toast({ title: "Report Generated" });
    } catch (err: any) {
      toast({ title: "Report Error", description: err.message, variant: "destructive" });
    }
  };

  // Fetch site settings to get bank accounts
  const { data: settings = [] } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const response = await apiClient.get("/site_settings");
      return response.data || [];
    },
  });

  const bankAccounts = (() => {
    const setting = settings.find((s: any) => s.key === "bank_accounts");
    if (!setting) return [];
    try {
      return JSON.parse(setting.value);
    } catch {
      return [];
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">{type === "invoice" ? "Invoices" : "Quotations"}</h2>
          <p className="text-sm text-muted-foreground">{manager.docs.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport} className="gap-2">
            <FileText size={16} /> Generate Report
          </Button>
          <Button variant="cyan" onClick={manager.startAdd}><Plus size={16} /> Create {type === "invoice" ? "Invoice" : "Quotation"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title={`Total ${type === "invoice" ? "Invoices" : "Quotations"}`} value={manager.docs.length} icon={type === "invoice" ? FileText : Receipt} />
        <StatsCard title="Draft" value={draftCount} icon={FileText} color="bg-muted" iconColor="text-muted-foreground" />
        <StatsCard title={type === "invoice" ? "Paid" : "Sent"} value={type === "invoice" ? paidCount : sentCount} icon={DollarSign} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        {type === "invoice" && <StatsCard title="Partial" value={partialCount} icon={CreditCard} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />}
        <StatsCard title={type === "invoice" ? "Total Received" : "Total Value"} value={`PKR ${(type === "invoice" ? totalPaid : totalValue).toLocaleString()}`} icon={DollarSign} color="bg-accent/10" iconColor="text-accent" />
      </div>

      {/* Proceeded Quote Requests - only in Quotations */}
      {type === "quotation" && <ProceededQuoteRequests manager={manager} />}

      {manager.viewing && (
        <DocumentPreview
          doc={manager.viewing}
          isInvoice={type === "invoice"}
          number={type === "invoice" ? manager.viewing.invoice_number : manager.viewing.quotation_number}
          verifyUrl={`${window.location.origin}/verify?id=${manager.viewing.verification_id || manager.viewing.id}`}
          onClose={() => manager.setViewing(null)}
          bankAccounts={bankAccounts}
        />
      )}
      <DocumentForm type={type} manager={manager} />

      {/* Payment Dialog for Invoices */}
      {type === "invoice" && (
        <PaymentDialog
          invoice={paymentInvoice}
          open={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Number</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Client</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">Amount</th>
                {type === "invoice" && <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Paid</th>}
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Status</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Date</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manager.docs.map((d: any) => {
                const num = type === "invoice" ? d.invoice_number : d.quotation_number;
                const paid = Number(d.paid_amount || 0);
                const total = Number(d.total);
                const canRecordPayment = type === "invoice" && d.status !== "paid" && d.status !== "draft";
                const canSendToProject = type === "invoice" && (d.status === "sent" || d.status === "partial" || d.status === "paid");

                return (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {type === "invoice" ? <FileText size={14} className="text-accent" /> : <Receipt size={14} className="text-accent" />}
                        <span className="font-semibold text-foreground text-sm">{num}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{d.client_name}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground hidden sm:table-cell">{total.toLocaleString()} {d.currency}</td>
                    {type === "invoice" && (
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className={`text-sm font-semibold ${paid >= total ? 'text-[hsl(142,70%,45%)]' : paid > 0 ? 'text-[hsl(40,90%,55%)]' : 'text-muted-foreground'}`}>
                          {paid.toLocaleString()}
                        </span>
                        {paid > 0 && paid < total && <span className="text-[10px] text-muted-foreground block">/{total.toLocaleString()}</span>}
                      </td>
                    )}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[d.status] || ''}`}>{d.status?.toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => manager.setViewing(d)} title="View"><Eye size={14} /></Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-accent"
                          title="Download PDF"
                          onClick={async () => {
                            try {
                              const sorted = [...(bankAccounts || [])].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
                              const mappedItems = parseItems(d.items).map((it: any) => ({
                                description: String(it.description || "No Description"),
                                quantity: Number(it.quantity) || 0,
                                rate: Number(it.rate) || 0,
                                amount: Number(it.amount) || 0,
                              }));
                              await downloadDocumentPDF({
                                type: type === "invoice" ? "invoice" : "quotation",
                                number: num,
                                status: d.status || "N/A",
                                createdAt: d.created_at || new Date().toISOString(),
                                dueDate: d.due_date,
                                validUntil: d.valid_until,
                                currency: d.currency || "PKR",
                                clientName: d.client_name || "Client Name",
                                clientEmail: d.client_email,
                                clientPhone: d.client_phone,
                                clientAddress: d.client_address,
                                items: mappedItems,
                                subtotal: Number(d.subtotal) || 0,
                                taxRate: Number(d.tax_rate) || 0,
                                taxAmount: Number(d.tax_amount) || 0,
                                discount: Number(d.discount) || 0,
                                total: Number(d.total) || 0,
                                paidAmount: Number(d.paid_amount || 0),
                                notes: d.notes,
                                verificationId: d.verification_id,
                                bankAccounts: sorted,
                              });
                              toast({ title: "PDF Generated", description: `Invoice ${num} downloaded successfully.` });
                            } catch (error: any) {
                              console.error("List Download Error Core:", error);
                              console.error("Row Data when error occurred:", d);
                              toast({ 
                                title: "Download Failed", 
                                description: `Error: ${error.message || "Failed to generate PDF"}. Check console for details.`, 
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                          <Download size={14} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-cyan-500"
                          title="Print"
                          onClick={async () => {
                            try {
                              toast({ title: "Preparing print...", description: "Generating high-fidelity document." });
                              const sorted = [...(bankAccounts || [])].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
                              const mappedItems = parseItems(d.items).map((it: any) => ({
                                description: String(it.description || "No Description"),
                                quantity: Number(it.quantity) || 0,
                                rate: Number(it.rate) || 0,
                                amount: Number(it.amount) || 0,
                              }));
                              await downloadDocumentPDF({
                                type: type === "invoice" ? "invoice" : "quotation",
                                number: num,
                                status: d.status || "N/A",
                                createdAt: d.created_at || new Date().toISOString(),
                                dueDate: d.due_date,
                                validUntil: d.valid_until,
                                currency: d.currency || "PKR",
                                clientName: d.client_name || "Client Name",
                                clientEmail: d.client_email,
                                clientPhone: d.client_phone,
                                clientAddress: d.client_address,
                                items: mappedItems,
                                subtotal: Number(d.subtotal) || 0,
                                taxRate: Number(d.tax_rate) || 0,
                                taxAmount: Number(d.tax_amount) || 0,
                                discount: Number(d.discount) || 0,
                                total: Number(d.total) || 0,
                                paidAmount: Number(d.paid_amount || 0),
                                notes: d.notes,
                                verificationId: d.verification_id,
                                bankAccounts: sorted,
                              }, "print");
                            } catch (error: any) {
                              console.error("Print Failed:", error);
                              toast({ 
                                title: "Print Failed", 
                                description: error.message || "Failed to generate print document.", 
                                variant: "destructive" 
                              });
                            }
                          }}
                        >
                        <Printer size={14} />
                      </Button>

                        {/* Quotation: Approve → Create Invoice only */}
                        {type === "quotation" && d.status === "draft" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Approve → Create Invoice" onClick={async () => {
                            try {
                              toast({ title: "Approving quotation...", description: "Generating invoice and updating status." });
                              await apiClient.post("/invoices", {
                                client_name: d.client_name, client_email: d.client_email, client_phone: d.client_phone,
                                client_address: d.client_address, items: d.items, tax_rate: d.tax_rate, discount: d.discount,
                                currency: d.currency, notes: d.notes, subtotal: d.subtotal, tax_amount: d.tax_amount,
                                total: d.total, customer_id: d.customer_id, status: "sent",
                              });
                              await apiClient.patch(`/quotations/${d.id}`, { status: "sent" });
                              try {
                                await apiClient.post("/dms/admin/notifications", { 
                                  title: "Quotation Approved", 
                                  message: `${d.quotation_number} has been approved and converted to an invoice.`, 
                                  type: "info" 
                                });
                              } catch (notifErr) { console.warn("Notification failed, but invoice was created."); }
                              
                              qc.invalidateQueries({ queryKey: ["admin-quotations"] });
                              qc.invalidateQueries({ queryKey: ["admin-invoices"] });
                              toast({ title: "Approved!", description: "Quotation approved and Invoice generated successfully." });
                            } catch (err: any) {
                              console.error("Approve Error:", err);
                              toast({ 
                                title: "Approval Failed", 
                                description: err.response?.data?.message || err.message, 
                                variant: "destructive" 
                              });
                            }
                          }}><CheckCircle2 size={14} className="text-[hsl(142,70%,45%)]" /></Button>
                        )}

                        {/* Invoice: Record Payment */}
                        {canRecordPayment && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Record Payment" onClick={() => setPaymentInvoice(d)}>
                            <DollarSign size={14} className="text-[hsl(142,70%,45%)]" />
                          </Button>
                        )}

                        {/* Invoice: Send to Project */}
                        {canSendToProject && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Send to Project" 
                            onClick={async () => {
                              try {
                                toast({ title: "Sending to projects...", description: "Please wait while we link this invoice." });
                                await sendToProject(d);
                              } catch (err: any) {
                                toast({ title: "Project Link Failed", description: err.message, variant: "destructive" });
                              }
                            }}
                          >
                            <FolderKanban size={14} className="text-[hsl(207,70%,50%)]" />
                          </Button>
                        )}

                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => manager.startEdit(d)} title="Edit"><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => manager.remove.mutate(d.id)} title="Delete"><Trash2 size={14} className="text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {manager.docs.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No {type}s yet.</p>}
        </div>
      </div>
    </div>
  );
};

const AdminBillingTabs = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "customers": return <AdminCustomers />;
    case "invoices": return <DocumentList type="invoice" />;
    case "quotations": return <DocumentList type="quotation" />;
    default: return null;
  }
};

export default AdminBillingTabs;
