import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";
import { 
  FolderKanban, FileText, Receipt, ArrowLeftRight, 
  Clock, CheckCircle2, AlertCircle, TrendingUp, MessageSquare 
} from "lucide-react";
import StatsCard from "../admin/StatsCard";

const UserOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const user = getCurrentUser();
      if (!user) return null;

      const [projects, quotes, invoices, transactions] = await Promise.all([
        apiClient.get("/projects"),
        apiClient.get("/quotations"),
        apiClient.get("/invoices"),
        apiClient.get("/financials"),
      ]);

      return {
        projects: projects.data.length || 0,
        quotes: quotes.data.length || 0,
        invoices: invoices.data.length || 0,
        transactions: transactions.data.length || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card rounded-2xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-heading">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm">Quick summary of your activity with Devionic</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Active Projects" 
          value={stats?.projects || 0} 
          icon={FolderKanban} 
          color="bg-accent/10" 
          iconColor="text-accent" 
        />
        <StatsCard 
          title="Quotations" 
          value={stats?.quotes || 0} 
          icon={FileText} 
          color="bg-blue-500/10" 
          iconColor="text-blue-500" 
        />
        <StatsCard 
          title="Total Invoices" 
          value={stats?.invoices || 0} 
          icon={Receipt} 
          color="bg-emerald-500/10" 
          iconColor="text-emerald-500" 
        />
        <StatsCard 
          title="Transactions" 
          value={stats?.transactions || 0} 
          icon={ArrowLeftRight} 
          color="bg-purple-500/10" 
          iconColor="text-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Clock size={18} className="text-accent" /> Recent Activity
            </h3>
            <button className="text-xs text-accent hover:underline font-medium">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-border/50">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">New invoice generated for project website-re-design</p>
                <p className="text-[10px] text-muted-foreground">Today at 2:45 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-border/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Quotation request submitted successfully</p>
                <p className="text-[10px] text-muted-foreground">Yesterday at 11:20 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Project status updated to "In Progress"</p>
                <p className="text-[10px] text-muted-foreground">March 24, 2024</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[hsl(207,74%,12%)] rounded-2xl p-6 text-[hsl(0,0%,100%)] relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-[hsl(210,20%,70%)] mb-6">Our support team is available 24/7 to assist you with any questions.</p>
            <div className="space-y-3">
              <a href="/dashboard/chat" className="flex items-center justify-between p-3 rounded-xl bg-[hsl(207,50%,20%)] hover:bg-accent transition-all group">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className="text-accent group-hover:text-accent-foreground" />
                  <span className="text-xs font-medium">Start Live Chat</span>
                </div>
                <ArrowLeftRight size={14} className="rotate-[-45deg]" />
              </a>
              <a href="/dashboard/complaints" className="flex items-center justify-between p-3 rounded-xl bg-[hsl(207,50%,20%)] hover:bg-destructive/20 transition-all group">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-400" />
                  <span className="text-xs font-medium">Report Issue</span>
                </div>
                <ArrowLeftRight size={14} className="rotate-[-45deg]" />
              </a>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default UserOverview;
