import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import {
  Users, FileText, Receipt, MessageSquare, AlertTriangle, Briefcase,
  DollarSign, TrendingUp, Star, Inbox, ArrowRight, UserCheck, ScrollText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(174,100%,40%)", "hsl(207,74%,25%)", "hsl(174,60%,60%)", "hsl(207,50%,40%)", "hsl(40,90%,55%)"];

const AdminOverview = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/stats");
      return response.data || {};
    },
  });

  const s = stats || {};
  const data = {
    services: Number(s.services || 0),
    portfolio: Number(s.portfolio || 0),
    jobs: Number(s.jobs || 0),
    inquiries: Number(s.inquiries || 0),
    unreadInq: Number(s.unreadInq || 0),
    serviceInquiries: Number(s.serviceInquiries || 0),
    unreadSvcInq: Number(s.unreadSvcInq || 0),
    complaints: Number(s.complaints || 0),
    pendingComplaints: Number(s.pendingComplaints || 0),
    customers: Number(s.customers || 0),
    invoices: Number(s.invoices || 0),
    quotations: Number(s.quotations || 0),
    testimonials: Number(s.testimonials || 0),
    staff: Number(s.staff || 0),
    totalRevenue: Number(s.totalRevenue || 0),
    quoteRequests: Number(s.quoteRequests || 0),
    documents: Number(s.documents || 0)
  };

  const statCards = [
    { label: "Total Revenue", value: `PKR ${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-[hsl(142,70%,45%)]", onClick: () => onNavigate("invoices") },
    { label: "Customers", value: data.customers, icon: Users, color: "bg-accent", onClick: () => onNavigate("customers") },
    { label: "Invoices", value: data.invoices, icon: FileText, color: "bg-[hsl(207,74%,25%)]", onClick: () => onNavigate("invoices") },
    { label: "Staff", value: data.staff, icon: UserCheck, color: "bg-[hsl(270,60%,50%)]", onClick: () => onNavigate("staff") },
  ];

  const quickStats = [
    { label: "Service Inquiries", value: data.serviceInquiries, badge: data.unreadSvcInq > 0 ? `${data.unreadSvcInq} new` : null, icon: Inbox, onClick: () => onNavigate("service-inquiries") },
    { label: "General Inquiries", value: data.inquiries, badge: data.unreadInq > 0 ? `${data.unreadInq} new` : null, icon: MessageSquare, onClick: () => onNavigate("general-inquiries") },
    { label: "Quote Requests", value: data.quoteRequests, icon: Receipt, onClick: () => onNavigate("quote-requests") },
    { label: "Complaints", value: data.complaints, badge: data.pendingComplaints > 0 ? `${data.pendingComplaints} pending` : null, icon: AlertTriangle, onClick: () => onNavigate("complaints") },
    { label: "Active Jobs", value: data.jobs, icon: Briefcase, onClick: () => onNavigate("jobs") },
    { label: "Testimonials", value: data.testimonials, icon: Star, onClick: () => onNavigate("testimonials") },
    { label: "Documents", value: data.documents, icon: ScrollText, onClick: () => onNavigate("documents-organizer") },
    { label: "Quotations", value: data.quotations, icon: Receipt, onClick: () => onNavigate("quotations") },
  ];

  const chartData = [
    { name: "Services", value: data.services },
    { name: "Customers", value: data.customers },
    { name: "Invoices", value: data.invoices },
    { name: "Staff", value: data.staff },
    { name: "Jobs", value: data.jobs },
  ];

  const pieData = [
    { name: "Paid Invoices", value: data.invoices || 1 },
    { name: "Quotations", value: data.quotations || 1 },
    { name: "Inquiries", value: data.inquiries + data.serviceInquiries || 1 },
    { name: "Complaints", value: data.complaints || 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <button key={card.label} onClick={card.onClick} className="bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 text-left group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon size={22} className="text-[hsl(0,0%,100%)]" />
              </div>
              <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-foreground font-heading">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 font-heading">Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(207,20%,45%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(207,20%,45%)" }} />
              <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(210,20%,88%)", borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="value" fill="hsl(174,100%,40%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 font-heading">Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(210,20%,88%)", borderRadius: 12, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickStats.map((item) => (
          <button key={item.label} onClick={item.onClick} className="bg-[hsl(0,0%,100%)] rounded-2xl p-5 border border-border hover:shadow-md hover:border-accent/30 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <item.icon size={20} className="text-accent" />
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent">{item.badge}</span>
              )}
            </div>
            <p className="text-xl font-bold text-foreground font-heading">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
