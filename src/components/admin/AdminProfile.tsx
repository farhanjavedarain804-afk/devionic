import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save, User, Mail, Shield, Key, Loader2, Camera, 
  UserCircle, BadgeCheck, Fingerprint, History, 
  Smartphone, Monitor, Globe, ChevronRight, Lock, Eye, EyeOff
} from "lucide-react";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-[40px] p-10 border border-border shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden relative";

const AdminProfile = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiClient.get("/auth/me");
        if (response.data) {
          setEmail(response.data.email || "");
          setUserName(response.data.full_name || response.data.email?.split("@")[0] || "Administrator");
          setUserId(response.data.id);
        }
      } catch (e) {
        console.error("Failed to load user profile", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePasswordChange = async () => {
    if (!newPassword) return toast({ title: "Validation Error", description: "Please enter a new password.", variant: "destructive" });
    if (newPassword.length < 6) return toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
    if (newPassword !== confirmPassword) return toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });

    setSaving(true);
    try {
      await apiClient.post("/auth/update-password", { password: newPassword });
      toast({ title: "Success", description: "Your administrative password has been updated across all nodes." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.response?.data?.message || "Internal system error occurred.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative">
             <div className="h-16 w-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
             <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent opacity-50" size={24} />
          </div>
          <p className="mt-6 text-muted-foreground font-bold tracking-widest uppercase text-[10px] animate-pulse">Authenticating Admin Session...</p>
        </div>
     );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="text-center md:text-left">
           <div className="flex items-center gap-2 justify-center md:justify-start text-accent text-xs font-black uppercase tracking-[0.3em] mb-2">
              <BadgeCheck size={14} /> Verified Admin
           </div>
           <h1 className="text-5xl font-black text-[hsl(207,74%,12%)] tracking-tighter">My <span className="text-accent underline decoration-accent/10 underline-offset-8">Account</span></h1>
           <p className="text-muted-foreground font-medium mt-3">Manage secure credentials and profile metadata for this admin node.</p>
        </div>
        <div className="flex -space-x-1">
           {[1, 2, 3].map(i => (
              <div key={i} className="h-12 w-12 rounded-2xl border-4 border-background bg-accent/10 flex items-center justify-center overflow-hidden">
                 <UserCircle className="text-accent/30" />
              </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="lg:col-span-1">
           <div className={cardClass}>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <User size={120} />
              </div>
              <div className="relative flex flex-col items-center text-center space-y-6">
                 <div className="relative group cursor-pointer">
                    <div className="h-32 w-32 rounded-[40px] bg-[hsl(207,74%,12%)] p-1 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-accent/40">
                       <div className="h-full w-full rounded-[38px] bg-accent/20 flex items-center justify-center overflow-hidden relative">
                         <User size={64} className="text-accent" />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                         </div>
                       </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-8 w-8 rounded-xl border-4 border-white flex items-center justify-center">
                       <div className="h-2 w-2 rounded-full bg-white animate-ping" />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground capitalize">{userName}</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-accent">System Administrator</p>
                 </div>

                 <div className="w-full space-y-4 pt-6 text-left border-t border-border">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                       <div className="flex items-center gap-3">
                          <Mail size={16} className="text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">E-Mail Address</span>
                       </div>
                       <span className="text-xs font-black font-mono">{email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                       <div className="flex items-center gap-3">
                          <Fingerprint size={16} className="text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">Admin Identity</span>
                       </div>
                       <span className="text-[10px] font-mono text-muted-foreground uppercase">{userId.slice(0, 12)}...</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="mt-8 p-8 rounded-[32px] bg-[hsl(207,74%,12%)] text-white/50 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white/90">
                 <History size={16} />
                 <span className="text-xs font-black uppercase tracking-widest">Recent Activity</span>
              </div>
              <div className="space-y-3">
                 {[
                   { icon: Monitor, text: "Dashboard sync", time: "2 min ago" },
                   { icon: Smartphone, text: "Mobile bypass sign-in", time: "1 hr ago" },
                   { icon: Globe, text: "Session from Layyah, PK", time: "4 hr ago" }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-medium border-b border-white/5 pb-2">
                       <div className="flex items-center gap-2">
                          <item.icon size={12} className="text-accent" />
                          <span>{item.text}</span>
                       </div>
                       <span className="text-white/30 italic">{item.time}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Security / Forms */}
        <div className="lg:col-span-2 space-y-10">
           <div className={cardClass}>
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Lock size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black">Security Credentials</h3>
                    <p className="text-sm text-muted-foreground">Rotate your access keys to maintain high audit score.</p>
                 </div>
              </div>

              <div className="max-w-lg space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Proposed New Password</label>
                    <div className="relative">
                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                       <Input 
                          type={showPass ? "text" : "password"} 
                          placeholder="••••••••••••" 
                          value={newPassword} 
                          onChange={e => setNewPassword(e.target.value)} 
                          className="pl-12 h-14 rounded-2xl border-border bg-muted/10 focus:bg-white text-lg transition-all"
                       />
                       <button 
                          onClick={() => setShowPass(!showPass)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                       >
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Identity Verification</label>
                    <div className="relative">
                       <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                       <Input 
                          type={showPass ? "text" : "password"} 
                          placeholder="••••••••••••" 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)} 
                          className="pl-12 h-14 rounded-2xl border-border bg-muted/10 focus:bg-white text-lg transition-all"
                       />
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <BadgeCheck className="text-emerald-500" size={20} />
                       <div className="space-y-0.5">
                          <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">End-to-End Encrypted</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Password hash will be salted and secure.</p>
                       </div>
                    </div>
                 </div>

                 <Button 
                    variant="cyan" 
                    size="lg" 
                    className="w-full h-14 rounded-3xl gap-3 shadow-2xl shadow-accent/20 font-black text-lg transition-all active:scale-95" 
                    onClick={handlePasswordChange} 
                    disabled={saving}
                 >
                    {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                    Update Security Access
                 </Button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[40px] bg-white border border-border group hover:border-accent/30 transition-all cursor-pointer">
                 <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                    <Smartphone size={20} />
                 </div>
                 <h4 className="font-bold mb-1 flex items-center justify-between">
                    Multi-Factor Auth <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                 </h4>
                 <p className="text-[10px] font-medium text-muted-foreground">Add an extra layer of security to your admin account.</p>
              </div>
              <div className="p-8 rounded-[40px] bg-white border border-border group hover:border-accent/30 transition-all cursor-pointer">
                 <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 mb-4 group-hover:scale-110 transition-transform">
                    <Shield size={20} />
                 </div>
                 <h4 className="font-bold mb-1 flex items-center justify-between">
                    Login Sessions <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                 </h4>
                 <p className="text-[10px] font-medium text-muted-foreground">Manage and revoke active sessions on other devices.</p>
              </div>
           </div>
        </div>
      </div>

       <div className="text-center py-6 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">
          Devionic Secure Node Dashboard v2.0
       </div>
    </div>
  );
};

export default AdminProfile;
