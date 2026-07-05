import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient, { getDeviceId } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Shield, Lock } from "lucide-react";
import logoFull from "@/assets/devionic-logo-full.png";
import { getCurrentUser } from "@/lib/auth";
import { getAuthStorageKeys } from "@/lib/authScope";
import OTPVerification from "@/components/auth/OTPVerification";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      navigate("/dms/admin/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password, deviceId: getDeviceId() });

      // Trusted device — 2FA skipped, token returned directly
      if (res.data.token && res.data.twoFA_skipped) {
        const role = res.data.user.role;
        if (role !== "admin" && role !== "superadmin") {
          toast({ title: "Access Denied", description: "You do not have administrative privileges.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { token: tokenKey, user: userKey } = getAuthStorageKeys();
        localStorage.setItem(tokenKey, res.data.token);
        localStorage.setItem(userKey, JSON.stringify(res.data.user));
        localStorage.setItem("authScope", "admin");
        toast({ title: "Authorization Granted", description: "Trusted device recognised — 2FA skipped." });
        setTimeout(() => navigate("/dms/admin/dashboard"), 500);
        return;
      }

      if (res.data.message === "OTP_REQUIRED") {
        setShowOTP(true);
        setDebugOtp(res.data.debug_otp || null);
        toast({ title: "2-Factor Authentication", description: "A secure OTP has been dispatched to your registered email." });
        return;
      }

      const role = res.data.user.role;
      if (role !== "admin" && role !== "superadmin") {
        toast({ title: "Access Denied", description: "You do not have administrative privileges.", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { token: tokenKey, user: userKey } = getAuthStorageKeys();
      localStorage.setItem(tokenKey, res.data.token);
      localStorage.setItem(userKey, JSON.stringify(res.data.user));
      localStorage.setItem("authScope", "admin");
      toast({ title: "Authorization Granted", description: "Welcome to the Digital Management System." });
      setTimeout(() => navigate("/dms/admin/dashboard"), 500);
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.response?.data?.message || "Invalid administrative credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string, rememberDevice: boolean) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/verify-login", {
        email, otp,
        deviceId: getDeviceId(),
        rememberDevice,
      });
      const role = res.data.user.role;
      if (role !== "admin" && role !== "superadmin") {
        toast({ title: "Access Denied", description: "You do not have administrative privileges.", variant: "destructive" });
        setShowOTP(false);
        setLoading(false);
        return;
      }
      const { token: tokenKey, user: userKey } = getAuthStorageKeys();
      localStorage.setItem(tokenKey, res.data.token);
      localStorage.setItem(userKey, JSON.stringify(res.data.user));
      localStorage.setItem("authScope", "admin");
      toast({ title: "Verification Successful", description: rememberDevice ? "DMS Access Granted. This device is now trusted." : "DMS Access Granted." });
      setTimeout(() => navigate("/dms/admin/dashboard"), 500);
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.response?.data?.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans overflow-hidden bg-white">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 lg:p-24 flex flex-col relative min-h-screen bg-white">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60"></div>

          <div className="relative z-10 w-full flex-1 flex flex-col">
            <div className="mb-8 flex justify-between items-center">
            <Link to="/">
              <img src={logoFull} alt="Devionic" className="h-8 object-contain" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D6C4] bg-[#00D6C4]/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Shield size={12} /> DMS Portal
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            {showOTP ? (
              <OTPVerification
                email={email}
                type="login"
                debugOtp={debugOtp}
                isLoading={loading}
                onVerify={handleVerifyOTP}
                onCancel={() => { setShowOTP(false); setLoading(false); }}
                showRememberDevice={true}
              />
            ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl font-bold text-center text-[#0F2642] mb-2 font-heading">DMS Authorization</h2>
              <div className="w-12 h-1 bg-[#00D6C4] mx-auto rounded-full mb-8"></div>

              <p className="text-center text-sm text-gray-400 mb-6">Enter your administrative credentials</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="Admin Email Address" 
                    className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="border-gray-300 data-[state=checked]:bg-[#00D6C4] data-[state=checked]:border-[#00D6C4]" />
                    <label htmlFor="remember" className="text-sm font-medium leading-none text-gray-600 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm font-medium text-gray-600 hover:text-[#00D6C4] transition-colors">
                    Security Policy
                  </a>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="w-48 rounded-full h-12 text-base font-semibold bg-[#00D6C4] hover:bg-[#00b5a6] text-white shadow-lg shadow-[#00D6C4]/30 transition-all"
                    disabled={loading || !email || !password}
                  >
                    {loading ? "Authenticating..." : "Authorize Access"}
                  </Button>
                </div>
              </form>
            </motion.div>
            )}
          </div>

          <div className="mt-auto pt-8 flex justify-center gap-6 text-[10px] uppercase tracking-wider text-gray-400">
            <span>Restricted Access</span>
            <span>•</span>
            <span>Digital Management System</span>
          </div>
          </div>
        </div>

        {/* Right Side: Greeting Panel */}
        <div className="hidden md:flex w-1/2 bg-[#0F2642] p-12 text-white flex-col justify-center items-center relative overflow-hidden min-h-screen">
          {/* Animated background effects */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute -top-20 -left-20 w-96 h-96 bg-[#00D6C4]/10 rounded-full blur-3xl"></motion.div>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }} className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-3xl"></motion.div>
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} className="absolute top-1/4 right-1/4 w-0 h-0 border-l-[30px] border-l-transparent border-t-[40px] border-t-white/5 border-r-[30px] border-r-transparent"></motion.div>
          <motion.div animate={{ y: [0, 30, 0], rotate: [0, -45, 0] }} transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 left-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-b-[30px] border-b-[#00D6C4]/10 border-r-[20px] border-r-transparent"></motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center z-10 w-full max-w-sm relative"
          >
            <Shield size={64} className="mx-auto mb-6 text-white/90" />
            <h2 className="text-3xl font-bold font-heading mb-4 text-white">Devionic - DMS</h2>
            <div className="w-12 h-1 bg-white/50 mx-auto rounded-full mb-6"></div>
            <p className="text-white/90 text-sm mb-10 leading-relaxed font-light">
              Secure gateway to the Digital Management System. All activities are logged and monitored.
            </p>
            <Button 
              asChild
              variant="outline" 
              className="w-48 rounded-full h-12 text-base font-semibold border-2 border-[#00D6C4]/50 text-white hover:bg-[#00D6C4] hover:border-[#00D6C4] hover:text-[#0F2642] bg-transparent transition-all"
            >
              <a href="/">Back to Website</a>
            </Button>
          </motion.div>
        </div>

      </div>
  );
};

export default AdminLogin;
