import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarCheck, CalendarX, Clock, Eye, Users, CalendarClock, CalendarMinus } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const AdminAttendanceReport = () => {
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewingStaff, setViewingStaff] = useState<any>(null);

  const { data: staff = [] } = useQuery({
    queryKey: ["report-staff"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/attendance/staff");
      return response.data || [];
    },
  });

  const monthIndex = months.indexOf(month);
  const startDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const endDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${lastDay}`;

  const { data: attendance = [] } = useQuery({
    queryKey: ["monthly-attendance", month, year],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/attendance/monthly?start=${startDate}&end=${endDate}`);
      return response.data || [];
    },
  });

  const getStaffStats = (staffId: string) => {
    const records = attendance.filter((a: any) => a.staff_id === staffId);
    const present = records.filter((a: any) => a.status === "present").length;
    const absent = records.filter((a: any) => a.status === "absent").length;
    const late = records.filter((a: any) => a.status === "late").length;
    const halfDay = records.filter((a: any) => a.status === "half_day").length;
    const leave = records.filter((a: any) => a.status === "leave").length;
    return { records, present, absent, late, halfDay, leave, total: records.length };
  };

  const totalPresent = attendance.filter((a: any) => a.status === "present").length;
  const totalAbsent = attendance.filter((a: any) => a.status === "absent").length;
  const totalLate = attendance.filter((a: any) => a.status === "late").length;
  const totalLeave = attendance.filter((a: any) => a.status === "leave").length;
  const totalHalfDay = attendance.filter((a: any) => a.status === "half_day").length;

  const formatDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return "—";
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      present: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
      absent: "bg-destructive/10 text-destructive",
      late: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
      half_day: "bg-[hsl(207,70%,50%)]/10 text-[hsl(207,70%,50%)]",
      leave: "bg-[hsl(270,60%,50%)]/10 text-[hsl(270,60%,50%)]",
    };
    const labels: Record<string, string> = { present: "Present", absent: "Absent", late: "Late", half_day: "Half Day", leave: "Leave" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>{labels[status] || status}</span>;
  };

  const viewingStats = viewingStaff ? getStaffStats(viewingStaff.id) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Monthly Attendance Report</h2>
          <p className="text-sm text-muted-foreground">{month} {year}</p>
        </div>
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard title="Staff" value={staff.length} icon={Users} />
        <StatsCard title="Present" value={totalPresent} icon={CalendarCheck} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Absent" value={totalAbsent} icon={CalendarX} color="bg-destructive/10" iconColor="text-destructive" />
        <StatsCard title="Late" value={totalLate} icon={CalendarClock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="Half Day" value={totalHalfDay} icon={CalendarMinus} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="On Leave" value={totalLeave} icon={Clock} color="bg-[hsl(270,60%,50%)]/10" iconColor="text-[hsl(270,60%,50%)]" />
      </div>

      {/* Summary Table */}
      <div className={cardClass}>
        <h3 className="font-bold text-foreground mb-4">Employee Summary — {month} {year}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Employee</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-center py-3 px-2">Present</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-center py-3 px-2">Absent</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-center py-3 px-2">Late</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-center py-3 px-2">Half Day</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-center py-3 px-2">Leave</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-center py-3 px-2 hidden sm:table-cell">Total</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s: any) => {
                const stats = getStaffStats(s.id);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.position}</p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold text-[hsl(142,70%,45%)]">{stats.present}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold text-destructive">{stats.absent}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold text-[hsl(40,90%,55%)]">{stats.late}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold text-[hsl(207,70%,50%)]">{stats.halfDay}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold text-[hsl(270,60%,50%)]">{stats.leave}</span>
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span className="text-sm font-bold text-foreground">{stats.total}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingStaff(s)}>
                        <Eye size={14} className="text-accent" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {staff.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No active staff members.</p>}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!viewingStaff} onOpenChange={v => { if (!v) setViewingStaff(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingStaff?.name} — {month} {year} Attendance</DialogTitle>
          </DialogHeader>
          {viewingStats && (
            <div className="space-y-4">
              {/* Mini Stats */}
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="rounded-lg bg-[hsl(142,70%,45%)]/10 p-2">
                  <p className="text-lg font-bold text-[hsl(142,70%,45%)]">{viewingStats.present}</p>
                  <p className="text-[10px] text-muted-foreground">Present</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2">
                  <p className="text-lg font-bold text-destructive">{viewingStats.absent}</p>
                  <p className="text-[10px] text-muted-foreground">Absent</p>
                </div>
                <div className="rounded-lg bg-[hsl(40,90%,55%)]/10 p-2">
                  <p className="text-lg font-bold text-[hsl(40,90%,55%)]">{viewingStats.late}</p>
                  <p className="text-[10px] text-muted-foreground">Late</p>
                </div>
                <div className="rounded-lg bg-[hsl(207,70%,50%)]/10 p-2">
                  <p className="text-lg font-bold text-[hsl(207,70%,50%)]">{viewingStats.halfDay}</p>
                  <p className="text-[10px] text-muted-foreground">Half Day</p>
                </div>
                <div className="rounded-lg bg-[hsl(270,60%,50%)]/10 p-2">
                  <p className="text-lg font-bold text-[hsl(270,60%,50%)]">{viewingStats.leave}</p>
                  <p className="text-[10px] text-muted-foreground">Leave</p>
                </div>
              </div>

              {/* Daily Records */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Date</th>
                      <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Status</th>
                      <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Check In</th>
                      <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Check Out</th>
                      <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingStats.records
                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((r: any) => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 text-sm text-foreground">
                            {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
                          </td>
                          <td className="py-2 px-3">{statusBadge(r.status)}</td>
                          <td className="py-2 px-3 text-xs text-muted-foreground font-mono">
                            {r.check_in ? new Date(r.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground font-mono">
                            {r.check_out ? new Date(r.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                          <td className="py-2 px-3 text-xs font-medium text-foreground">
                            {formatDuration(r.check_in, r.check_out)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {viewingStats.records.length === 0 && (
                  <p className="text-muted-foreground text-center py-6 text-sm">No attendance records for this month.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendanceReport;
