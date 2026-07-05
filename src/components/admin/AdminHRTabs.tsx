import { useState, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Save, X, UserCheck, Clock, Download, CheckCircle2, XCircle, Users, Briefcase, DollarSign, CalendarCheck, CalendarX, CalendarClock, FileText, Receipt } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { generateDocNumber, getHtmlPrintHeader, getHtmlPrintFooter, getHtmlPrintStyles } from "@/lib/pdf-utils";
import { downloadSalarySlipPDF } from "@/lib/pdf-download";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";


const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";

// ===== STAFF MANAGEMENT =====
const AdminStaff = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", position: "", department: "", staff_type: "permanent", salary: 0, join_date: "", cnic: "", bank_account: "" });

  const { data: staff = [] } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const response = await apiClient.get("/staff");
      return response.data || [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name, email: form.email || null, phone: form.phone || null,
        position: form.position, department: form.department || null,
        staff_type: form.staff_type, salary: form.salary,
        join_date: form.join_date || null, cnic: form.cnic || null, bank_account: form.bank_account || null,
      };
      if (editing) await apiClient.put(`/staff/${editing.id}`, payload);
      else await apiClient.post("/staff", payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-staff"] }); setEditing(null); setAdding(false); toast({ title: "Staff saved" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await apiClient.patch(`/staff/${id}`, { is_active: active });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-staff"] }); toast({ title: "Updated" }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/staff/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-staff"] }); toast({ title: "Deleted" }); },
  });

  const startEdit = (s: any) => {
    setEditing(s); setAdding(false);
    setForm({ name: s.name, email: s.email || "", phone: s.phone || "", position: s.position, department: s.department || "", staff_type: s.staff_type, salary: s.salary || 0, join_date: s.join_date || "", cnic: s.cnic || "", bank_account: s.bank_account || "" });
  };
  const startAdd = () => { setAdding(true); setEditing(null); setForm({ name: "", email: "", phone: "", position: "", department: "", staff_type: "permanent", salary: 0, join_date: "", cnic: "", bank_account: "" }); };
   const cancel = () => { setEditing(null); setAdding(false); };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(13, 42, 63);
    doc.text("Staff Directory Report", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), "PPP p")}`, 20, 30);
    doc.text(`Total Staff: ${staff.length}`, 20, 35);
    doc.text(`Active Staff: ${activeStaff}`, 20, 40);
    doc.text(`Total Monthly Payroll: PKR ${totalSalary.toLocaleString()}`, 20, 45);

    const tableData = staff.map((s: any) => [
      s.display_id,
      s.name,
      s.position,
      s.department,
      s.staff_type,
      s.salary.toLocaleString(),
      s.is_active ? "Active" : "Inactive"
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["ID", "Name", "Position", "Dept", "Type", "Salary (PKR)", "Status"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [13, 42, 63] },
    });

    doc.save(`Staff-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const activeStaff = staff.filter((s: any) => s.is_active).length;
  const permanentStaff = staff.filter((s: any) => s.staff_type === "permanent").length;
  const totalSalary = staff.filter((s: any) => s.is_active).reduce((s: number, st: any) => s + Number(st.salary || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Staff Management</h2>
          <p className="text-sm text-muted-foreground">{activeStaff} active, {staff.filter((s: any) => !s.is_active).length} inactive</p>
          <p className="text-xs text-muted-foreground mt-1">Staff are automatically added when applicants are marked as "Hired"</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport} className="gap-2">
            <FileText size={16} /> Generate Report
          </Button>
          <Button variant="cyan" onClick={startAdd}><Plus size={16} /> Add Staff</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Staff" value={staff.length} icon={Users} />
        <StatsCard title="Active" value={activeStaff} icon={UserCheck} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Permanent" value={permanentStaff} icon={Briefcase} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Total Payroll" value={`PKR ${totalSalary.toLocaleString()}`} icon={DollarSign} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" subtitle="Active staff" />
      </div>

      <Dialog open={adding || !!editing} onOpenChange={v => { if (!v) cancel(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Position *" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
              <Input placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              <Select value={form.staff_type} onValueChange={v => setForm({ ...form, staff_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <div><label className="text-xs text-muted-foreground">Salary (PKR)</label><Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} /></div>
              <div><label className="text-xs text-muted-foreground">Join Date</label><Input type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} /></div>
              <Input placeholder="CNIC" value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} />
              <Input placeholder="Bank Account" value={form.bank_account} onChange={e => setForm({ ...form, bank_account: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="ghost" onClick={cancel}>Cancel</Button>
              <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">ID</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Staff</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Position</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">Type</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Salary</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Status</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s: any) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-bold text-accent">{s.display_id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email || s.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{s.position}<br /><span className="text-xs">{s.department}</span></td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.staff_type === 'permanent' ? 'bg-accent/10 text-accent' : 'bg-[hsl(270,60%,50%)]/10 text-[hsl(270,60%,50%)]'}`}>
                      {s.staff_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-foreground hidden lg:table-cell">PKR {Number(s.salary).toLocaleString()}</td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.is_active ? 'bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]' : 'bg-destructive/10 text-destructive'}`}>
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive.mutate({ id: s.id, active: !s.is_active })}>
                        {s.is_active ? <XCircle size={14} className="text-destructive" /> : <CheckCircle2 size={14} className="text-[hsl(142,70%,45%)]" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(s)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(s.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No staff members yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== ATTENDANCE =====
const AdminAttendance = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: staff = [] } = useQuery({
    queryKey: ["attendance-staff"],
    queryFn: async () => {
      const response = await apiClient.get("/staff?is_active=true");
      return response.data || [];
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["admin-attendance", selectedDate],
    queryFn: async () => {
      const response = await apiClient.get(`/attendance?date=${selectedDate}`);
      return response.data || [];
    },
  });

  const checkIn = useMutation({
    mutationFn: async (staffId: string) => {
      const existing = attendance.find((a: any) => a.staff_id === staffId);
      if (existing) {
        await apiClient.patch("/attendance", { staff_id: staffId, date: selectedDate, check_in: new Date().toISOString() });
      } else {
        await apiClient.post("/attendance", { staff_id: staffId, date: selectedDate, check_in: new Date().toISOString(), status: "present" });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-attendance", selectedDate] }); toast({ title: "Checked in" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const checkOut = useMutation({
    mutationFn: async (staffId: string) => {
      const existing = attendance.find((a: any) => a.staff_id === staffId);
      if (existing) {
        await apiClient.patch("/attendance", { staff_id: staffId, date: selectedDate, check_out: new Date().toISOString() });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-attendance", selectedDate] }); toast({ title: "Checked out" }); },
  });

  const markStatus = useMutation({
    mutationFn: async ({ staffId, status }: { staffId: string; status: string }) => {
      const existing = attendance.find((a: any) => a.staff_id === staffId);
      if (existing) {
        await apiClient.patch("/attendance", { staff_id: staffId, date: selectedDate, status });
      } else {
        await apiClient.post("/attendance", { staff_id: staffId, date: selectedDate, status });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-attendance", selectedDate] }); toast({ title: "Status updated" }); },
  });

  const getAttendance = (staffId: string) => attendance.find((a: any) => a.staff_id === staffId);

  const statusColors: Record<string, string> = {
    present: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
    absent: "bg-destructive/10 text-destructive",
    late: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
    half_day: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]",
    leave: "bg-[hsl(270,60%,50%)]/10 text-[hsl(270,60%,50%)]",
  };

  const presentCount = attendance.filter((a: any) => a.status === "present").length;
  const absentCount = attendance.filter((a: any) => a.status === "absent").length;
  const lateCount = attendance.filter((a: any) => a.status === "late").length;
  const leaveCount = attendance.filter((a: any) => a.status === "leave").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Attendance</h2>
          <p className="text-sm text-muted-foreground">{staff.length} active staff members</p>
        </div>
        <Input type="date" className="w-auto" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Staff" value={staff.length} icon={Users} />
        <StatsCard title="Present" value={presentCount} icon={CalendarCheck} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Absent" value={absentCount} icon={CalendarX} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Late" value={lateCount} icon={CalendarClock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="On Leave" value={leaveCount} icon={Clock} color="bg-[hsl(270,60%,50%)]/10" iconColor="text-[hsl(270,60%,50%)]" />
      </div>

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Staff</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Status</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">Check In</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">Check Out</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s: any) => {
                const att = getAttendance(s.id);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.position}</p>
                      {att?.display_id && <p className="text-[10px] font-mono text-accent">{att.display_id}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <Select value={att?.status || ""} onValueChange={v => markStatus.mutate({ staffId: s.id, status: v })}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue placeholder="Mark..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="half_day">Half Day</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden sm:table-cell">
                      {att?.check_in ? new Date(att.check_in).toLocaleTimeString() : "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden sm:table-cell">
                      {att?.check_out ? new Date(att.check_out).toLocaleTimeString() : "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => checkIn.mutate(s.id)} disabled={!!att?.check_in}>
                          <Clock size={12} /> In
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => checkOut.mutate(s.id)} disabled={!att?.check_in || !!att?.check_out}>
                          <Clock size={12} /> Out
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {staff.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No active staff members.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== PAYROLL / SALARY SLIPS =====
const AdminPayroll = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ staff_id: "", month: "", year: new Date().getFullYear(), basic_salary: 0, allowances: 0, deductions: 0, notes: "", status: "draft" });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const { data: staff = [] } = useQuery({
    queryKey: ["payroll-staff"],
    queryFn: async () => {
      const response = await apiClient.get("/staff");
      return response.data || [];
    },
  });

  const { data: slips = [] } = useQuery({
    queryKey: ["admin-salary-slips"],
    queryFn: async () => {
      const response = await apiClient.get("/salary_slips");
      return response.data || [];
    },
  });

  const selectStaff = (staffId: string) => {
    const member = staff.find((s: any) => s.id === staffId);
    setForm({ ...form, staff_id: staffId, basic_salary: member?.salary || 0 });
  };

  const netSalary = form.basic_salary + form.allowances - form.deductions;

  const save = useMutation({
    mutationFn: async () => {
      await apiClient.post("/salary_slips", {
        staff_id: form.staff_id, month: form.month, year: form.year,
        basic_salary: form.basic_salary, allowances: form.allowances,
        deductions: form.deductions, net_salary: netSalary,
        notes: form.notes || null, status: form.status,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-salary-slips"] }); setAdding(false); toast({ title: "Salary slip created" }); },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/salary_slips/${id}`, { status });

      // When marking as paid, create financial entry and transaction receipt
      if (status === "paid") {
        const slip = slips.find((s: any) => s.id === id);
        if (slip) {
          const member = getStaffMember(slip.staff_id);
          const empName = member?.name || "Unknown";

          // Create transaction record
          await apiClient.post("/transactions", {
            type: "expense",
            category: "Salaries",
            description: `Salary payment to ${empName} for ${slip.month} ${slip.year}`,
            amount: Number(slip.net_salary) || 0,
            payment_method: member?.bank_account ? "bank_transfer" : "cash",
            reference_type: "salary_slip",
            reference_id: slip.id,
            reference_number: slip.verification_id,
            from_name: "DEVIONIC (PRIVATE) LIMITED",
            to_name: empName,
          });

          // Add to financials
          await apiClient.post("/financials", {
            entry_date: new Date().toISOString().split("T")[0],
            type: "expense",
            category: "Salaries",
            description: `Salary paid to ${empName} for ${slip.month} ${slip.year}`,
            amount: Number(slip.net_salary) || 0,
            reference_type: "salary_slip",
            reference_id: slip.id,
            reference_number: slip.verification_id,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-salary-slips"] });
      qc.invalidateQueries({ queryKey: ["admin-financials"] });
      toast({ title: "Updated" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/salary_slips/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-salary-slips"] }); toast({ title: "Deleted" }); },
  });

  const getStaffName = (staffId: string) => staff.find((s: any) => s.id === staffId)?.name || "Unknown";
  const getStaffMember = (staffId: string) => staff.find((s: any) => s.id === staffId);

  const handlePrint = async () => {
    if (!viewing) return;
    const pw = window.open("", "_blank");
    if (!pw) return;
    const member = getStaffMember(viewing.staff_id);
    const docNum = generateDocNumber(slips.indexOf(viewing) + 1, "SAL");
    const verifyUrl = `${window.location.origin}/verify?id=${viewing.verification_id}`;
    const headerHtml = await getHtmlPrintHeader(docNum, verifyUrl);
    const salarySlipHtml = buildSalarySlipHtml(viewing, member);
    pw.document.write(`<html><head><title>Salary Slip - ${docNum}</title><style>${getHtmlPrintStyles()}${salarySlipStyles}</style></head><body><div class="page-wrapper">${headerHtml}<div class="content">${salarySlipHtml}</div>${getHtmlPrintFooter(viewing.verification_id, verifyUrl)}</div></body></html>`);
    pw.document.close();
    pw.print();
  };

  const handleDownloadSlip = async () => {
    if (!viewing) return;
    const member = getStaffMember(viewing.staff_id);
    await downloadSalarySlipPDF({
      verificationId: viewing.verification_id,
      month: viewing.month,
      year: viewing.year,
      empName: member?.name || "Unknown",
      position: member?.position || "N/A",
      department: member?.department || "N/A",
      joinDate: member?.join_date ? new Date(member.join_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
      cnic: member?.cnic || "N/A",
      bankAccount: member?.bank_account || "N/A",
      staffType: member?.staff_type || "N/A",
      basicSalary: Number(viewing.basic_salary) || 0,
      allowances: Number(viewing.allowances) || 0,
      deductions: Number(viewing.deductions) || 0,
      netSalary: Number(viewing.net_salary) || 0,
      notes: viewing.notes,
      status: viewing.status,
    });
  };

  const buildSalarySlipHtml = (slip: any, member: any) => {
    const empName = member?.name || "Unknown";
    const position = member?.position || "N/A";
    const department = member?.department || "N/A";
    const joinDate = member?.join_date ? new Date(member.join_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
    const cnic = member?.cnic || "N/A";
    const bankAccount = member?.bank_account || "N/A";
    const staffType = member?.staff_type || "N/A";
    const basic = Number(slip.basic_salary) || 0;
    const allowances = Number(slip.allowances) || 0;
    const deductions = Number(slip.deductions) || 0;
    const net = Number(slip.net_salary) || 0;
    const totalEarnings = basic + allowances;

    return `
      <h2 class="slip-title">PAYSLIP <span class="slip-period">${slip.month?.toUpperCase()} ${slip.year}</span></h2>
      <div class="slip-company">DEVIONIC (PRIVATE) LIMITED</div>
      <div class="slip-address">Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450</div>

      <table class="info-grid">
        <tr>
          <td class="info-label">Emp ID</td><td class="info-value">${slip.verification_id}</td>
          <td class="info-label">Date Joined</td><td class="info-value">${joinDate}</td>
          <td class="info-label">Department</td><td class="info-value">${department}</td>
        </tr>
        <tr>
          <td class="info-label">Designation</td><td class="info-value">${position}</td>
          <td class="info-label">Payment Mode</td><td class="info-value">${bankAccount !== "N/A" ? "Bank Transfer" : "Cash"}</td>
          <td class="info-label">Staff Type</td><td class="info-value" style="text-transform:capitalize;">${staffType}</td>
        </tr>
        <tr>
          <td class="info-label">Employee Name</td><td class="info-value" colspan="3">${empName}</td>
          <td class="info-label">CNIC</td><td class="info-value">${cnic}</td>
        </tr>
        <tr>
          <td class="info-label">Bank Account</td><td class="info-value" colspan="5">${bankAccount}</td>
        </tr>
      </table>

      <div class="section-heading">SALARY DETAILS</div>
      <table class="info-grid">
        <tr>
          <td class="info-label">Working Days</td><td class="info-value">30</td>
          <td class="info-label">Days Payable</td><td class="info-value">30</td>
          <td class="info-label">Loss of Pay Days</td><td class="info-value">0</td>
        </tr>
      </table>

      <div class="earnings-deductions">
        <div class="ed-col">
          <div class="ed-heading">EARNINGS</div>
          <table class="ed-table">
            <tr><td>Basic Salary</td><td class="amount">PKR ${basic.toLocaleString()}</td></tr>
            <tr><td>Allowances</td><td class="amount">PKR ${allowances.toLocaleString()}</td></tr>
            <tr class="total-row"><td><strong>Total Earnings (A)</strong></td><td class="amount"><strong>PKR ${totalEarnings.toLocaleString()}</strong></td></tr>
          </table>
        </div>
        <div class="ed-col">
          <div class="ed-heading">DEDUCTIONS</div>
          <table class="ed-table">
            <tr><td>Total Deductions</td><td class="amount">PKR ${deductions.toLocaleString()}</td></tr>
            <tr class="total-row"><td><strong>Total Deductions (B)</strong></td><td class="amount"><strong>PKR ${deductions.toLocaleString()}</strong></td></tr>
          </table>
        </div>
      </div>

      <table class="net-table">
        <tr><td class="net-label">Net Salary Payable (A - B)</td><td class="net-value">PKR ${net.toLocaleString()}</td></tr>
      </table>

      ${slip.notes ? `<div class="slip-notes"><strong>Notes:</strong> ${slip.notes}</div>` : ""}
      <div class="slip-note">**Note: All amounts displayed in this payslip are in <strong>PKR</strong></div>
      <div class="slip-disclaimer">*This is a system generated salary slip and does not require signature.</div>
    `;
  };

  const salarySlipStyles = `
    .slip-title { font-size: 20px; font-weight: bold; color: #333; margin: 0 0 4px; }
    .slip-period { font-weight: 400; color: #666; }
    .slip-company { font-size: 13px; font-weight: bold; color: #222; }
    .slip-address { font-size: 11px; color: #666; margin-bottom: 16px; }
    .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .info-grid td { padding: 6px 10px; border: 1px solid #ddd; font-size: 11px; }
    .info-label { color: #888; font-size: 10px; text-transform: uppercase; background: #fafafa; width: 15%; }
    .info-value { color: #222; font-weight: 500; }
    .section-heading { font-size: 14px; font-weight: bold; color: #333; border-bottom: 2px solid #333; padding-bottom: 4px; margin: 16px 0 8px; }
    .earnings-deductions { display: flex; gap: 20px; margin: 16px 0; }
    .ed-col { flex: 1; }
    .ed-heading { font-size: 12px; font-weight: bold; color: #333; margin-bottom: 8px; text-transform: uppercase; }
    .ed-table { width: 100%; border-collapse: collapse; }
    .ed-table td { padding: 6px 8px; font-size: 11px; border-bottom: 1px solid #eee; }
    .ed-table .amount { text-align: right; font-family: monospace; }
    .ed-table .total-row td { border-top: 2px solid #333; border-bottom: 2px solid #333; background: #f8f8f8; }
    .net-table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #333; }
    .net-table td { padding: 10px 12px; font-size: 14px; }
    .net-label { font-weight: bold; background: #f0f0f0; }
    .net-value { text-align: right; font-weight: bold; font-size: 18px; font-family: monospace; }
    .slip-notes { font-size: 11px; color: #555; margin: 12px 0; padding: 8px; background: #f9f9f9; border-radius: 4px; }
    .slip-note { font-size: 10px; color: #888; margin-top: 16px; }
    .slip-disclaimer { font-size: 10px; color: #999; font-style: italic; margin-top: 8px; }
  `;

  // Preview in the admin panel
  const renderSlipPreview = () => {
    if (!viewing) return null;
    const member = getStaffMember(viewing.staff_id);
    const empName = member?.name || "Unknown";
    const position = member?.position || "N/A";
    const department = member?.department || "N/A";
    const joinDate = member?.join_date ? new Date(member.join_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "N/A";
    const basic = Number(viewing.basic_salary) || 0;
    const allowances = Number(viewing.allowances) || 0;
    const deductions = Number(viewing.deductions) || 0;
    const net = Number(viewing.net_salary) || 0;
    const totalEarnings = basic + allowances;

    return (
      <div className={`${cardClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">Salary Slip - {viewing.month} {viewing.year}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadSlip}><Download size={14} /> Download</Button>
            <Button variant="cyan" size="sm" onClick={handlePrint}><Receipt size={14} /> Print</Button>
            <Button variant="ghost" size="sm" onClick={() => setViewing(null)}><X size={14} /></Button>
          </div>
        </div>
        <div ref={printRef} className="bg-white p-4 rounded border border-border">
          <h2 className="text-xl font-bold text-foreground">PAYSLIP <span className="font-normal text-muted-foreground">{viewing.month?.toUpperCase()} {viewing.year}</span></h2>
          <p className="text-sm font-bold text-foreground">DEVIONIC (PRIVATE) LIMITED</p>
          <p className="text-xs text-muted-foreground mb-4">Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450</p>
          
          <div className="grid grid-cols-3 gap-px bg-border text-xs mb-4">
            <div className="bg-muted/30 p-2"><span className="text-muted-foreground block text-[10px] uppercase">Emp ID</span>{viewing.verification_id}</div>
            <div className="bg-white p-2"><span className="text-muted-foreground block text-[10px] uppercase">Date Joined</span>{joinDate}</div>
            <div className="bg-muted/30 p-2"><span className="text-muted-foreground block text-[10px] uppercase">Department</span>{department}</div>
            <div className="bg-white p-2"><span className="text-muted-foreground block text-[10px] uppercase">Designation</span>{position}</div>
            <div className="bg-muted/30 p-2"><span className="text-muted-foreground block text-[10px] uppercase">Employee</span>{empName}</div>
            <div className="bg-white p-2"><span className="text-muted-foreground block text-[10px] uppercase">CNIC</span>{member?.cnic || "N/A"}</div>
          </div>

          <h3 className="text-sm font-bold text-foreground border-b-2 border-foreground pb-1 mb-3">SALARY DETAILS</h3>
          <div className="grid grid-cols-2 gap-6 text-sm mb-4">
            <div>
              <h4 className="font-bold text-xs uppercase mb-2">Earnings</h4>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Basic Salary</span><span className="font-mono">PKR {basic.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Allowances</span><span className="font-mono">PKR {allowances.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold border-t border-b border-foreground py-1 mt-2"><span>Total Earnings (A)</span><span className="font-mono">PKR {totalEarnings.toLocaleString()}</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase mb-2">Deductions</h4>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Total Deductions</span><span className="font-mono">PKR {deductions.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold border-t border-b border-foreground py-1 mt-2"><span>Total Deductions (B)</span><span className="font-mono">PKR {deductions.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div className="border-2 border-foreground p-3 flex justify-between items-center mb-4">
            <span className="font-bold text-base">Net Salary Payable (A - B)</span>
            <span className="font-bold text-xl font-mono">PKR {net.toLocaleString()}</span>
          </div>

          {viewing.notes && <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded mb-2">Notes: {viewing.notes}</p>}
          <p className="text-[10px] text-muted-foreground">**Note: All amounts displayed in this payslip are in <strong>PKR</strong></p>
          <p className="text-[10px] text-muted-foreground italic mt-1">*This is a system generated salary slip and does not require signature.</p>
        </div>
      </div>
    );
  };

  const draftSlips = slips.filter((s: any) => s.status === "draft").length;
  const issuedSlips = slips.filter((s: any) => s.status === "issued").length;
  const paidSlips = slips.filter((s: any) => s.status === "paid").length;
  const totalPaid = slips.filter((s: any) => s.status === "paid").reduce((sum: number, s: any) => sum + Number(s.net_salary || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Payroll & Salary Slips</h2>
          <p className="text-sm text-muted-foreground">{slips.length} salary slips</p>
        </div>
        <Button variant="cyan" onClick={() => setAdding(true)}><Plus size={16} /> Issue Salary Slip</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Slips" value={slips.length} icon={FileText} />
        <StatsCard title="Draft" value={draftSlips} icon={FileText} color="bg-muted" iconColor="text-muted-foreground" />
        <StatsCard title="Issued" value={issuedSlips} icon={CheckCircle2} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Paid" value={paidSlips} icon={DollarSign} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Total Paid" value={`PKR ${totalPaid.toLocaleString()}`} icon={DollarSign} color="bg-accent/10" iconColor="text-accent" />
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Salary Slip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Select value={form.staff_id} onValueChange={selectStaff}>
                <SelectTrigger><SelectValue placeholder="Select staff member..." /></SelectTrigger>
                <SelectContent>
                  {staff.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} - {s.position}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Select value={form.month} onValueChange={v => setForm({ ...form, month: v })}>
                  <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                  <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground">Basic Salary</label><Input type="number" value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: Number(e.target.value) })} /></div>
              <div><label className="text-xs text-muted-foreground">Allowances</label><Input type="number" value={form.allowances} onChange={e => setForm({ ...form, allowances: Number(e.target.value) })} /></div>
              <div><label className="text-xs text-muted-foreground">Deductions</label><Input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: Number(e.target.value) })} /></div>
            </div>
            <p className="text-right text-lg font-bold text-foreground">Net Salary: PKR {netSalary.toLocaleString()}</p>
            <Textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button variant="cyan" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Issue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderSlipPreview()}

      <div className={cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Employee</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">Period</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Net Salary</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Status</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slips.map((slip: any) => (
                <tr key={slip.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground text-sm">{getStaffName(slip.staff_id)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{slip.verification_id}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{slip.month} {slip.year}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-foreground">PKR {Number(slip.net_salary).toLocaleString()}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <Select value={slip.status} onValueChange={v => updateStatus.mutate({ id: slip.id, status: v })}>
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="issued">Issued</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(slip)}><Download size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove.mutate(slip.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {slips.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No salary slips yet.</p>}
        </div>
      </div>
    </div>
  );
};

const AdminHRTabs = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "staff": return <AdminStaff />;
    case "attendance": return <AdminAttendance />;
    case "payroll": return <AdminPayroll />;
    default: return null;
  }
};

export default AdminHRTabs;
