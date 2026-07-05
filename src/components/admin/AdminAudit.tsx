import { useState, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Download, Loader2, AlertTriangle, CheckCircle2, Info, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border shadow-sm";

type AuditItem = { module: string; check: string; status: "pass" | "warn" | "fail"; detail: string; value?: number };

const AdminAudit = () => {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<AuditItem[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  const runAudit = async () => {
    setRunning(true);
    try {
      const response = await apiClient.get("/dms/admin/audit/run");
      setResults(response.data);
      toast({ title: "Audit completed" });
    } catch (err: any) {
      toast({ title: "Audit failed: " + (err.response?.data?.message || err.message), variant: "destructive" });
    }
    setRunning(false);
  };

  const downloadPDFReport = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Audit-Report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const chartData = results.map(r => ({ name: r.module, value: r.value || 0 }));
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const passes = results.filter(r => r.status === "pass").length;
  const warns = results.filter(r => r.status === "warn").length;
  const fails = results.filter(r => r.status === "fail").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Audit Report</h1>
          <p className="text-muted-foreground">Comprehensive metrics and health check</p>
        </div>
        <div className="flex gap-3">
          {results.length > 0 && (
            <Button variant="outline" onClick={downloadPDFReport} className="gap-2">
              <Download size={16} /> PDF Report
            </Button>
          )}
          <Button variant="cyan" onClick={runAudit} disabled={running} className="gap-2">
            {running ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
            Run Audit
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6 bg-background p-4 rounded-xl border border-transparent">
        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard title="Pass Rate" value={`${Math.round((passes / results.length) * 100)}%`} icon={CheckCircle2} />
              <StatsCard title="Warnings" value={warns} icon={AlertTriangle} />
              <StatsCard title="Critical Issues" value={fails} icon={AlertTriangle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={cardClass}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Module Metrics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(207, 74%, 25%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={cardClass}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><PieChartIcon size={18} /> Alert Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Pass", value: passes },
                          { name: "Warn", value: warns },
                          { name: "Fail", value: fails }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h3 className="font-bold mb-4">Detailed Health Checks</h3>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 ${
                    r.status === "pass" ? "border-green-500/10 bg-green-500/5" :
                    r.status === "warn" ? "border-yellow-500/10 bg-yellow-500/5" : "border-red-500/10 bg-red-500/5"
                  }`}>
                    {r.status === "pass" ? <CheckCircle2 className="text-green-500 mt-1" size={18} /> :
                     r.status === "warn" ? <AlertTriangle className="text-yellow-500 mt-1" size={18} /> :
                     <AlertTriangle className="text-red-500 mt-1" size={18} />}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm tracking-tight">{r.check}</span>
                        <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-muted rounded">{r.module}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;
