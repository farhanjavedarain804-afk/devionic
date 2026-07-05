import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import devionicLogoWhite from "@/assets/devionic-logo-white.png";
import apiClient from "@/lib/apiClient";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  LayoutDashboard, FileText, Receipt, MessageSquare,
  Briefcase, LogOut, Star, AlertTriangle, Menu, ChevronLeft, ChevronRight,
  Bell, User, FolderKanban, ArrowLeftRight, Home, Clock, Lock, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import UserTransactions from "../components/user/UserTransactions";
import UserInvoices from "../components/user/UserInvoices";
import UserComplaints from "../components/user/UserComplaints";
import UserChat from "../components/user/UserChat";
import UserProjects from "../components/user/UserProjects";
import UserReviews from "../components/user/UserReviews";
import UserQuotations from "../components/user/UserQuotations";
import UserOverview from "../components/user/UserOverview";

const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "quotations", label: "Quotations", icon: FileText, path: "/dashboard/quotations" },
  { id: "invoices", label: "Invoices", icon: Receipt, path: "/dashboard/invoices" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/dashboard/projects" },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight, path: "/dashboard/transactions" },
  { id: "complaints", label: "Complaints", icon: AlertTriangle, path: "/dashboard/complaints" },
  { id: "chat", label: "Live Chat", icon: MessageSquare, path: "/dashboard/chat" },
  { id: "reviews", label: "Reviews", icon: Star, path: "/dashboard/reviews" },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [userName, setUserName] = useState("");
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isRejected, setIsRejected] = useState<boolean>(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = getCurrentUser();
      if (!user) { navigate("/login"); return; }
      
      if (user.role === "admin" || user.role === "superadmin" || user.is_admin === true) {
        navigate("/dms/admin/dashboard");
        return;
      }
      
      setUserName(user.full_name || user.email?.split("@")[0] || "User");
      
      // The user object from login already contains is_approved and is_rejected
      // But we should fetch fresh from server to be sure
      try {
        const response = await apiClient.get(`/users/${user.id}`);
        const profile = response.data;
        
        if (profile) {
          setIsApproved(profile.is_approved);
          setIsRejected(profile.is_rejected);
        } else {
          setIsApproved(false);
          setIsRejected(false);
        }
      } catch (e) {
        setIsApproved(false);
        setIsRejected(false);
      }
      
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    logout();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );

  if (isApproved === false) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(210,25%,96%)] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-border text-center space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isRejected ? 'bg-destructive/10' : 'bg-accent/10'}`}>
          {isRejected ? (
            <XCircle size={40} className="text-destructive animate-pulse" />
          ) : (
            <Clock size={40} className="text-accent animate-pulse" />
          )}
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground font-heading">
            {isRejected ? "Profile Rejected" : "Approval Pending"}
          </h2>
          <p className="text-muted-foreground">
            {isRejected ? (
              <>
                Hi <span className="text-accent font-semibold">{userName}</span>, unfortunately your profile has been rejected by the admin. 
                Please contact support for more information.
              </>
            ) : (
              <>
                Hi <span className="text-accent font-semibold">{userName}</span>, your profile is currently under approval by the admin. 
                Once approved, you will get full access to your dashboard.
              </>
            )}
          </p>
        </div>
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-4">
            If you have any questions, please contact our support team.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              <Home size={16} className="mr-2" /> Back to Website
            </Button>
            <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(210,25%,96%)] flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-40 transition-all duration-300 flex flex-col bg-[hsl(207,74%,12%)] text-[hsl(0,0%,100%)] ${
        sidebarOpen ? "w-64" : "w-20"
      } ${mobileSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-[hsl(207,50%,20%)]">
          {sidebarOpen && <img src={devionicLogoWhite} alt="Devionic" className="h-7 brightness-0 invert" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-[hsl(207,50%,20%)] transition-colors">
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          <button onClick={() => setMobileSidebar(false)} className="lg:hidden p-1.5">
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || (item.id === "overview" && location.pathname === "/dashboard");
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileSidebar(false)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                    : "text-[hsl(210,20%,70%)] hover:bg-[hsl(207,50%,18%)] hover:text-[hsl(0,0%,100%)]"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[hsl(207,50%,20%)] space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[hsl(210,20%,70%)] hover:bg-[hsl(207,50%,18%)] hover:text-[hsl(0,0%,100%)] transition-all">
            <Home size={20} className="shrink-0" />
            {sidebarOpen && <span>Back to Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[hsl(210,20%,70%)] hover:bg-[hsl(0,62%,40%)] hover:text-[hsl(0,0%,100%)] transition-all"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileSidebar(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-[hsl(0,0%,100%)] border-b border-border h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebar(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground font-heading">
                Welcome, <span className="text-accent capitalize">{userName}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your projects and requests here.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" title="Notifications">
              <Bell size={20} className="text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Profile">
              <User size={20} className="text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<UserOverview />} />
            <Route path="quotations" element={<UserQuotations />} />
            <Route path="invoices" element={<UserInvoices />} />
            <Route path="projects" element={<UserProjects />} />
            <Route path="transactions" element={<UserTransactions />} />
            <Route path="complaints" element={<UserComplaints />} />
            <Route path="chat" element={<UserChat />} />
            <Route path="reviews" element={<UserReviews />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
