import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link, Routes, Route } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  LayoutDashboard, Settings, Users, FileText, Receipt, MessageSquare,
  Briefcase, Shield, UserCheck, Clock, DollarSign, LogOut,
  Star, AlertTriangle, ChevronLeft, ChevronRight, Menu, Wallet,
  BarChart3, ScrollText, ArrowLeftRight, Bell, User, CalendarDays, FolderKanban,
  Calendar, PhoneCall, ClipboardCheck, Network, Layers, Search, Building2, GitBranch, ShieldCheck, BookOpen, GraduationCap
} from "lucide-react";
import logoFull from "@/assets/devionic-logo-full.png";
import { Button } from "@/components/ui/button";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminContentTabs from "@/components/admin/AdminContentTabs";
import AdminInquiriesTabs from "@/components/admin/AdminInquiriesTabs";
import AdminBillingTabs from "@/components/admin/AdminBillingTabs";
import AdminHRTabs from "@/components/admin/AdminHRTabs";
import AdminFinancials from "@/components/admin/AdminFinancials";
import AdminTransactions from "@/components/admin/AdminTransactions";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminAnalyticsTabs from "@/components/admin/AdminAnalyticsTabs";
import AdminAttendanceReport from "@/components/admin/AdminAttendanceReport";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProfile from "@/components/admin/AdminProfile";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminDocOrganizer from "@/components/admin/AdminDocOrganizer";
import AdminResourceCenter from "@/components/admin/AdminResourceCenter";
import AdminVerificationTracking from "@/components/admin/AdminVerificationTracking";
import AdminDepartments from "@/components/admin/AdminDepartments";
import AdminBranches from "@/components/admin/AdminBranches";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminFeedbackCalls from "@/components/admin/AdminFeedbackCalls";
import AdminAudit from "@/components/admin/AdminAudit";
import AdminTeamUsers from "@/components/admin/AdminTeamUsers";
import AdminInternshipApplications from "@/components/admin/AdminInternshipApplications";
import { useQuery } from "@tanstack/react-query";

const BASE = "/dms/admin/dashboard";

const ALL_SIDEBAR_GROUPS = [
  {
    label: "Main",
    items: [
      { id: "overview",    label: "Dashboard",      icon: LayoutDashboard, path: `${BASE}` },
      { id: "users",       label: "Client Users",   icon: Users,           path: `${BASE}/users` },
      { id: "team-users",  label: "Team Users",     icon: ShieldCheck,     path: `${BASE}/team-users` },
      { id: "branches",    label: "Branches",        icon: Network,         path: `${BASE}/branches` },
      { id: "departments", label: "Departments",     icon: Layers,          path: `${BASE}/departments` },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "services",      label: "Services",      icon: Settings,   path: `${BASE}/services` },
      { id: "jobs",          label: "Jobs",          icon: Briefcase,  path: `${BASE}/jobs` },
      { id: "internships",   label: "Internships",   icon: GraduationCap, path: `${BASE}/internships` },
      { id: "applications",  label: "Applications",  icon: Users,      path: `${BASE}/applications` },
      { id: "testimonials",  label: "Testimonials",  icon: Star,       path: `${BASE}/testimonials` },
      { id: "resource-center", label: "Resource Center", icon: BookOpen, path: `${BASE}/resource-center` },
    ],
  },
  {
    label: "Inquiries",
    items: [
      { id: "general-inquiries", label: "General Inquiries", icon: MessageSquare,  path: `${BASE}/general-inquiries` },
      { id: "quote-requests",    label: "Quote Requests",    icon: FileText,        path: `${BASE}/quote-requests` },
      { id: "complaints",        label: "Complaints",        icon: AlertTriangle,   path: `${BASE}/complaints` },
      { id: "tickets",           label: "Tickets",           icon: Shield,          path: `${BASE}/tickets` },
      { id: "internship-applications", label: "Intern Applications", icon: GraduationCap, path: `${BASE}/internship-applications` },
    ],
  },
  {
    label: "Billing",
    items: [
      { id: "customers",   label: "Customers",   icon: Users,         path: `${BASE}/customers` },
      { id: "invoices",    label: "Invoices",    icon: FileText,      path: `${BASE}/invoices` },
      { id: "quotations",  label: "Quotations",  icon: Receipt,       path: `${BASE}/quotations` },
      { id: "bookings",    label: "Bookings",    icon: Calendar,      path: `${BASE}/bookings` },
      { id: "projects",    label: "Projects",    icon: FolderKanban,  path: `${BASE}/projects` },
    ],
  },
  {
    label: "HR",
    items: [
      { id: "staff",             label: "Staff",             icon: UserCheck,    path: `${BASE}/staff` },
      { id: "attendance",        label: "Attendance",        icon: Clock,        path: `${BASE}/attendance` },
      { id: "attendance-report", label: "Attendance Report", icon: CalendarDays, path: `${BASE}/attendance-report` },
      { id: "payroll",           label: "Payroll",           icon: DollarSign,   path: `${BASE}/payroll` },
    ],
  },
  {
    label: "Finance",
    items: [
      { id: "transactions", label: "Transactions", icon: ArrowLeftRight, path: `${BASE}/transactions` },
      { id: "financials",   label: "Financials",   icon: Wallet,         path: `${BASE}/financials` },
    ],
  },
  {
    label: "System",
    items: [
      { id: "feedback-calls",        label: "Feedback Calls",         icon: PhoneCall,     path: `${BASE}/feedback-calls` },
      { id: "audit",                 label: "Audit",                  icon: ClipboardCheck, path: `${BASE}/audit` },
      { id: "verification-tracking", label: "Verification & Tracking", icon: Shield,        path: `${BASE}/verification-tracking` },
      { id: "analytics",             label: "Analytics",              icon: BarChart3,     path: `${BASE}/analytics` },
      { id: "admin-logs",            label: "Admin & Users Logs",     icon: ScrollText,    path: `${BASE}/admin-logs` },
      { id: "notifications",         label: "Notifications",          icon: Bell,          path: `${BASE}/notifications` },
      { id: "documents-organizer",   label: "Documents Organizer",    icon: Layers,        path: `${BASE}/documents-organizer` },
      { id: "settings",              label: "Settings",               icon: Settings,      path: `${BASE}/settings` },
      { id: "profile",               label: "Profile",                icon: User,          path: `${BASE}/profile` },
    ],
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [userName, setUserName] = useState("");
  const [userDeptName, setUserDeptName] = useState("");
  const [userBranchName, setUserBranchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowedModules, setAllowedModules] = useState<string[] | null>(null); // null = superadmin (all)

  const { data: notifications = 0 } = useQuery({
    queryKey: ["admin-notifications-count"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/dms/admin/notifications/unread-count");
        const count = typeof response.data?.count === "number"
          ? response.data.count
          : Array.isArray(response.data)
            ? response.data.length
            : 0;
        return count;
      } catch (err) {
        return 0;
      }
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const user = getCurrentUser();
        const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.is_admin === true;

        if (!user || !isAdmin) {
          navigate("/");
          return;
        }

        const name = user.full_name || user.account_email || user.email || "Administrator";
        try { setUserName(name.toString().split(" ")[0]); } catch (e) { setUserName("Administrator"); }

        // Determine which modules this user can access
        if (user.role === "superadmin") {
          setAllowedModules(null); // all
          setUserDeptName("");
          setUserBranchName(user.branch_name || "");
        } else if (user.custom_permissions && Array.isArray(user.custom_permissions) && user.custom_permissions.length > 0) {
          setAllowedModules(user.custom_permissions);
          setUserDeptName(user.department_name || user.department_code || "");
          setUserBranchName(user.branch_name || "");
        } else if (user.department_modules && Array.isArray(user.department_modules) && user.department_modules.length > 0) {
          setAllowedModules(user.department_modules);
          setUserDeptName(user.department_name || user.department_code || "");
          setUserBranchName(user.branch_name || "");
        } else {
          // Admin with no department = full access
          setAllowedModules(null);
          setUserDeptName(user.department_name || "");
          setUserBranchName(user.branch_name || "");
        }
      } catch (err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/dms/admin");
  };

  // Filter sidebar groups based on allowed modules
  const sidebarGroups = ALL_SIDEBAR_GROUPS
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        allowedModules === null || allowedModules.includes(item.id)
      ),
    }))
    .filter(group => group.items.length > 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Initializing DMS Node...</p>
      </div>
    </div>
  );

  const unreadCount = Number(notifications || 0);

  const isActive = (itemPath: string, itemId: string) => {
    if (itemId === "overview") return location.pathname === BASE || location.pathname === `${BASE}/`;
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className="min-h-screen bg-[hsl(210,25%,96%)] flex">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-40 transition-all duration-300 flex flex-col bg-[hsl(207,74%,12%)] text-white ${
        sidebarOpen ? "w-64" : "w-20"
      } ${mobileSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

        {/* Sidebar header — Devionic logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <img src={logoFull} alt="Devionic" className="h-7 object-contain brightness-0 invert" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#00D6C4]/20 border border-[#00D6C4]/40 flex items-center justify-center mx-auto">
              <span className="text-[#00D6C4] text-[10px] font-black">D</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button onClick={() => setMobileSidebar(false)} className="lg:hidden p-1.5">
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Dept & Branch badge — only shown when dept or branch is set */}
        {sidebarOpen && (userDeptName || userBranchName) && (
          <div className="px-4 py-2.5 border-b border-white/5 space-y-1.5">
            {userDeptName && (
              <div className="flex items-center gap-1.5">
                <Building2 size={10} className="text-[#00D6C4]/60 shrink-0" />
                <p className="text-[10px] font-semibold text-[#00D6C4]/80 truncate">{userDeptName}</p>
              </div>
            )}
            {userBranchName && (
              <div className="flex items-center gap-1.5">
                <GitBranch size={10} className="text-white/40 shrink-0" />
                <p className="text-[10px] text-white/40 truncate">{userBranchName}</p>
              </div>
            )}
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold px-3 pt-4 pb-1">{group.label}</p>
              )}
              {!sidebarOpen && <div className="border-t border-white/10 my-2" />}
              {group.items.map((item) => {
                const active = isActive(item.path, item.id);
                return (
                  <Link
                    key={item.id} to={item.path}
                    onClick={() => setMobileSidebar(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      active
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "text-white/50 hover:bg-white/8 hover:text-white"
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {item.icon && <item.icon size={17} className="shrink-0" />}
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {item.id === "notifications" && unreadCount > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 h-5 min-w-5 px-1 flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileSidebar(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
          {/* Row 1: Main header */}
          <div className="flex items-center justify-between px-4 lg:px-6 h-14 gap-3">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebar(!mobileSidebar)} className="lg:hidden text-[hsl(207,74%,12%)]">
                <Menu size={24} />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold font-heading text-[hsl(207,74%,12%)] hidden sm:block leading-none">
                  DIGITAL MANAGEMENT SYSTEM <span className="text-[#00D6C4]">- DMS</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#00D6C4] bg-[#00D6C4]/10 px-2 py-0.5 rounded-full">
                    {userBranchName ? `${userBranchName} Portal` : "Head Office Portal"}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    • {userDeptName ? `${userDeptName} Department` : "Global Administration"}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Unified Search / Verification / Tracking bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full group">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00D6C4] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(`${BASE}/verification-tracking?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery("");
                    }
                  }}
                  placeholder="Search, Verify or Track anything..."
                  className="w-full h-9 pl-9 pr-28 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#00D6C4] focus:bg-white focus:ring-2 focus:ring-[#00D6C4]/10 transition-all"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <Link
                    to={`${BASE}/verification-tracking`}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#00D6C4]/10 text-[#00D6C4] hover:bg-[#00D6C4] hover:text-white transition-all border border-[#00D6C4]/20"
                    title="Verification & Tracking"
                  >
                    Verify
                  </Link>
                  <Link
                    to={`${BASE}/verification-tracking`}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#0F2642]/8 text-[#0F2642]/60 hover:bg-[#0F2642] hover:text-white transition-all border border-[#0F2642]/10"
                    title="Track Status"
                  >
                    Track
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Link to={`${BASE}/notifications`} className="relative p-2 rounded-lg hover:bg-muted transition-colors" title="Notifications">
                <Bell size={18} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-destructive text-white text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to={`${BASE}/profile`} className="p-2 rounded-lg hover:bg-muted transition-colors" title={`Welcome, ${userName}`}>
                <User size={18} className="text-muted-foreground" />
              </Link>
              <Link to={`${BASE}/settings`} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Settings">
                <Settings size={18} className="text-muted-foreground" />
              </Link>
              <div className="hidden sm:flex ml-1 items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                <div className="w-6 h-6 rounded-full bg-[#0F2642] flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-black">{userName?.[0]?.toUpperCase() || "A"}</span>
                </div>
                <span className="text-xs font-semibold text-[#0F2642] capitalize">{userName}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <ErrorBoundary>
            <Routes>
              <Route index element={<AdminOverview onNavigate={(tab) => navigate(`${BASE}/${tab}`)} />} />
              <Route path="users"          element={<AdminUsers />} />
              <Route path="team-users"     element={<AdminTeamUsers />} />
              <Route path="branches"       element={<AdminBranches />} />
              <Route path="departments"    element={<AdminDepartments />} />
              {/* Content */}
              <Route path="services"     element={<AdminContentTabs activeTab="services" />} />
      <Route path="jobs"         element={<AdminContentTabs activeTab="jobs" />} />
      <Route path="internships"  element={<AdminContentTabs activeTab="internships" />} />
      <Route path="applications" element={<AdminApplications />} />
              <Route path="testimonials" element={<AdminContentTabs activeTab="testimonials" />} />
      <Route path="resource-center" element={<AdminResourceCenter />} />
              {/* Inquiries */}
              <Route path="general-inquiries" element={<AdminInquiriesTabs activeTab="general-inquiries" />} />
              <Route path="quote-requests"    element={<AdminInquiriesTabs activeTab="quote-requests" />} />
              <Route path="complaints"        element={<AdminInquiriesTabs activeTab="complaints" />} />
              <Route path="tickets"           element={<AdminInquiriesTabs activeTab="tickets" />} />
      <Route path="internship-applications" element={<AdminInternshipApplications />} />
              {/* Billing */}
              <Route path="customers"  element={<AdminBillingTabs activeTab="customers" />} />
              <Route path="invoices"   element={<AdminBillingTabs activeTab="invoices" />} />
              <Route path="quotations" element={<AdminBillingTabs activeTab="quotations" />} />
              <Route path="bookings"   element={<AdminBookings />} />
              <Route path="projects"   element={<AdminProjects />} />
              {/* HR */}
              <Route path="staff"             element={<AdminHRTabs activeTab="staff" />} />
              <Route path="attendance"        element={<AdminHRTabs activeTab="attendance" />} />
              <Route path="attendance-report" element={<AdminAttendanceReport />} />
              <Route path="payroll"           element={<AdminHRTabs activeTab="payroll" />} />
              {/* Finance */}
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="financials"   element={<AdminFinancials />} />
              {/* System */}
              <Route path="feedback-calls"        element={<AdminFeedbackCalls />} />
              <Route path="audit"                 element={<AdminAudit />} />
              <Route path="verification-tracking" element={<AdminVerificationTracking />} />
              <Route path="analytics"             element={<AdminAnalyticsTabs activeTab="analytics" />} />
              <Route path="admin-logs"            element={<AdminAnalyticsTabs activeTab="admin-logs" />} />
              <Route path="notifications"         element={<AdminNotifications />} />
              <Route path="documents-organizer"   element={<AdminDocOrganizer />} />
              <Route path="settings"              element={<AdminSettings />} />
              <Route path="profile"               element={<AdminProfile />} />
              {/* Fallback */}
              <Route path="*" element={<AdminOverview onNavigate={(tab) => navigate(`${BASE}/${tab}`)} />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
