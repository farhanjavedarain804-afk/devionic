import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3, Users, Globe, Monitor, Clock, Eye, MapPin, Activity,
  Smartphone, Laptop, Tablet, RefreshCw, FileText, User, Wifi, Shield, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const COLORS = ["#00bac7", "#0d1b2a", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#f97316", "#3b82f6"];

// ===== ANALYTICS =====
const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState("7d");

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case "24h": return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const { data: pageViews = [], refetch: refetchViews } = useQuery({
    queryKey: ["analytics-pageviews", dateRange],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/page-views?from=${encodeURIComponent(getDateFilter())}`);
      return response.data || [];
    },
  });

  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ["analytics-sessions", dateRange],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/sessions?from=${encodeURIComponent(getDateFilter())}`);
      return response.data || [];
    },
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ["analytics-online"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/sessions");
      return (response.data || []).filter((s: any) => s.is_online);
    },
    refetchInterval: 15000,
  });

  const handleRefresh = () => { refetchViews(); refetchSessions(); };

  // Stats calculations
  const totalViews = pageViews.length;
  const uniqueVisitors = new Set(sessions.map((s: any) => s.session_id)).size;
  const uniqueIPs = new Set(pageViews.map((v: any) => v.ip_address).filter(Boolean)).size;
  const avgDuration = pageViews.length > 0
    ? Math.round(pageViews.reduce((sum: number, v: any) => sum + (v.duration_seconds || 0), 0) / pageViews.length)
    : 0;

  // Device breakdown
  const deviceData = Object.entries(
    pageViews.reduce((acc: Record<string, number>, v: any) => {
      const d = v.device || "Unknown";
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Browser breakdown
  const browserData = Object.entries(
    pageViews.reduce((acc: Record<string, number>, v: any) => {
      const b = v.browser || "Unknown";
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // OS breakdown
  const osData = Object.entries(
    pageViews.reduce((acc: Record<string, number>, v: any) => {
      const o = v.os || "Unknown";
      acc[o] = (acc[o] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Country breakdown
  const countryData = Object.entries(
    pageViews.reduce((acc: Record<string, number>, v: any) => {
      const c = v.country || "Unknown";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as number) - (a.value as number)).slice(0, 10);

  // Top pages
  const topPages = Object.entries(
    pageViews.reduce((acc: Record<string, number>, v: any) => {
      const p = v.page_path || v.path || "/";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {})
  ).map(([page, views]) => ({ page, views })).sort((a, b) => (b.views as number) - (a.views as number)).slice(0, 10);

  // Daily views chart
  const dailyViews = Object.entries(
    pageViews.reduce((acc: Record<string, number>, v: any) => {
      const d = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {})
  ).map(([date, views]) => ({ date, views })).reverse();

  const deviceIcon = (d: string) => {
    if (d === "Mobile") return <Smartphone size={14} />;
    if (d === "Tablet") return <Tablet size={14} />;
    return <Laptop size={14} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Website Analytics</h2>
          <p className="text-sm text-muted-foreground">Real-time traffic & visitor insights</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}><RefreshCw size={16} /></Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Views", value: totalViews, icon: Eye, color: "text-accent" },
          { label: "Unique Visitors", value: uniqueVisitors, icon: Users, color: "text-[hsl(270,60%,55%)]" },
          { label: "Unique IPs", value: uniqueIPs, icon: Globe, color: "text-[hsl(200,80%,50%)]" },
          { label: "Avg Duration", value: `${avgDuration}s`, icon: Clock, color: "text-[hsl(40,90%,55%)]" },
          { label: "Online Now", value: onlineUsers.length, icon: Activity, color: "text-[hsl(142,70%,45%)]" },
        ].map((stat, i) => (
          <div key={i} className={cardClass}>
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} className={stat.color} />
              <span className="text-xs text-muted-foreground uppercase font-semibold">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Wifi size={18} className="text-[hsl(142,70%,45%)]" /> Currently Online ({onlineUsers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">IP Address</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden sm:table-cell">Location</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden md:table-cell">Device</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden md:table-cell">Browser</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Pages</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden sm:table-cell">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {onlineUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 font-mono text-xs">{u.ip_address || "—"}</td>
                    <td className="py-2 px-3 text-xs hidden sm:table-cell">
                      <div className="flex items-center gap-1"><MapPin size={12} />{u.city}, {u.country}</div>
                    </td>
                    <td className="py-2 px-3 text-xs hidden md:table-cell flex items-center gap-1">{deviceIcon(u.device)} {u.device}</td>
                    <td className="py-2 px-3 text-xs hidden md:table-cell">{u.browser} / {u.os}</td>
                    <td className="py-2 px-3 text-xs font-semibold">{u.pages_visited}</td>
                    <td className="py-2 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {new Date(u.last_seen_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Traffic Over Time */}
      <div className={cardClass}>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><BarChart3 size={18} /> Traffic Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyViews}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,20%,90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#00bac7" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Devices */}
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Monitor size={18} /> Devices</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Browsers */}
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Globe size={18} /> Browsers</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {browserData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* OS */}
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Laptop size={18} /> Operating Systems</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={osData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {osData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages & Countries */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><FileText size={18} /> Top Pages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPages} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="page" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="views" fill="#00bac7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><MapPin size={18} /> Top Countries</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={countryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0d1b2a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div className={cardClass}>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Users size={18} /> Recent Visitors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">IP</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden sm:table-cell">Location</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden md:table-cell">Device</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Page</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden lg:table-cell">Duration</th>
                <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {pageViews.slice(0, 50).map((v: any) => (
                <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2 px-3 font-mono text-xs">{v.ip_address || "—"}</td>
                  <td className="py-2 px-3 text-xs hidden sm:table-cell">{v.city}, {v.country}</td>
                  <td className="py-2 px-3 text-xs hidden md:table-cell">{v.device} · {v.browser}</td>
                  <td className="py-2 px-3 text-xs font-medium">{v.page_path}</td>
                  <td className="py-2 px-3 text-xs hidden lg:table-cell">{v.duration_seconds}s</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageViews.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No analytics data yet. Visitors will appear here once tracking starts.</p>}
        </div>
      </div>
    </div>
  );
};

// ===== ADMIN & USERS LOGS =====
const AdminLogs = () => {
  const [logTab, setLogTab] = useState("activity");

  const { data: userLogs = [], refetch: refetchLogs } = useQuery({
    queryKey: ["user-logs"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/logs");
      return response.data || [];
    },
  });

  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ["visitor-sessions"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/sessions");
      return response.data || [];
    },
  });

  const { data: attempts = [], refetch: refetchAttempts } = useQuery({
    queryKey: ["login-attempts"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/logs/attempts");
      return response.data || [];
    },
  });

  const handleRefresh = () => {
    refetchLogs();
    refetchSessions();
    refetchAttempts();
  };

  const calculateStayPeriod = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.max(0, Math.floor((e - s) / 1000));
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Admin & Users Logs</h2>
          <p className="text-sm text-muted-foreground">Comprehensive security, activity, and session tracking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={handleRefresh}><RefreshCw size={16} /></Button>
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto border-b border-border">
        <Button variant={logTab === "activity" ? "default" : "ghost"} size="sm" onClick={() => setLogTab("activity")}>Activity Logs</Button>
        <Button variant={logTab === "sessions" ? "default" : "ghost"} size="sm" onClick={() => setLogTab("sessions")}>Session Tracking</Button>
        <Button variant={logTab === "attempts" ? "default" : "ghost"} size="sm" onClick={() => setLogTab("attempts")}>Login / Signup Attempts</Button>
      </div>

      {logTab === "activity" && (
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><ClipboardCheck size={18} /> User & Admin Activities</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">User</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Role</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Action</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden md:table-cell">IP & Location</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden sm:table-cell">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {userLogs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-accent" />
                        <span className="text-xs font-medium">{log.user_email || "System"}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs uppercase font-semibold text-muted-foreground">{log.role || "N/A"}</td>
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded w-max">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-[200px]">{log.details}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-muted-foreground hidden md:table-cell">
                      <div className="flex flex-col">
                        <span className="font-mono">{log.ip_address || "—"}</span>
                        <span>{log.location || ""}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userLogs.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No activity logged yet.</p>}
          </div>
        </div>
      )}

      {logTab === "sessions" && (
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Clock size={18} /> Session Tracking & Duration</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Status</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">User / IP</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden md:table-cell">Device & Location</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3 hidden sm:table-cell">Time of End</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Stay Period</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s: any) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3">
                      {s.is_online ? (
                        <span className="text-xs font-bold text-[hsl(142,70%,45%)] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[hsl(142,70%,45%)] animate-pulse" /> Online</span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> Offline</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{s.user_email || "Guest User"}</span>
                        <span className="font-mono text-muted-foreground">{s.ip_address || "—"}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>{s.device} ({s.browser})</span>
                        <span className="text-muted-foreground">{s.city ? (s.city + ', ' + s.country) : "Unknown Location"}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {s.is_online ? "—" : new Date(s.last_seen_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-xs font-semibold">
                      {calculateStayPeriod(s.started_at, s.last_seen_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No sessions tracked yet.</p>}
          </div>
        </div>
      )}

      {logTab === "attempts" && (
        <div className={cardClass}>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Shield size={18} /> Rate Limits & Attempts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Status</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Email</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">IP Address</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Action</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-2 px-3">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att: any) => (
                  <tr key={att.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3 text-xs">
                      {att.status === "success" ? (
                        <span className="text-[hsl(142,70%,45%)] font-bold">Success</span>
                      ) : (
                        <span className="text-destructive font-bold">Failed</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs font-medium">{att.email}</td>
                    <td className="py-2 px-3 text-xs font-mono text-muted-foreground">{att.ip_address || "—"}</td>
                    <td className="py-2 px-3 text-xs uppercase font-semibold text-muted-foreground">{att.action}</td>
                    <td className="py-2 px-3 text-xs text-muted-foreground">
                      {new Date(att.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attempts.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No login attempts tracked yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminAnalyticsTabs = ({ activeTab }: { activeTab: string }) => {
  switch (activeTab) {
    case "analytics": return <AdminAnalytics />;
    case "admin-logs": return <AdminLogs />;
    default: return null;
  }
};

export default AdminAnalyticsTabs;
