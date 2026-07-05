import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import apiClient, { getDeviceId } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import logoFull from "@/assets/devionic-logo-full.png";
import { getCurrentUser, saveClientSession } from "@/lib/auth";
import OTPVerification from "@/components/auth/OTPVerification";
import GoogleButton from "@/components/auth/GoogleButton";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === "user") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password, deviceId: getDeviceId() });

      // Trusted device — 2FA skipped, token returned directly
      if (res.data.token && res.data.twoFA_skipped) {
        saveClientSession(res.data.token, res.data.user);
        toast({ title: "Login Successful", description: "Trusted device recognised — 2FA skipped." });
        setTimeout(() => navigate("/dashboard"), 500);
        return;
      }

      if (res.data.message === "OTP_REQUIRED") {
        setShowOTP(true);
        setDebugOtp(res.data.debug_otp || null);
        toast({ title: "2-Factor Authentication", description: "An OTP has been sent to your email." });
        return;
      }

      saveClientSession(res.data.token, res.data.user);
      toast({ title: "Login Successful", description: "Welcome back to Devionic!" });
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid credentials",
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
      saveClientSession(res.data.token, res.data.user);
      toast({ title: "Verification Successful", description: rememberDevice ? "Welcome back! This device is now trusted." : "Welcome back!" });
      setTimeout(() => navigate("/dashboard"), 500);
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

  // Google Sign-In success — session already saved by GoogleButton; just route.
  const handleGoogleSuccess = () => {
    setTimeout(() => navigate("/dashboard"), 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans overflow-hidden bg-white">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 lg:p-24 flex flex-col relative min-h-screen bg-white">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60"></div>
          
          <div className="relative z-10 w-full flex-1 flex flex-col">
            <div className="mb-8 flex items-center justify-between">
              <Link to="/">
                <img src={logoFull} alt="Devionic" className="h-8 object-contain" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#00D6C4] transition-colors group"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                Back to Website
              </Link>
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
              <h2 className="text-4xl font-bold text-center text-[#00D6C4] mb-2 font-heading">Sign in to Account</h2>
              <div className="w-12 h-1 bg-[#00D6C4] mx-auto rounded-full mb-8"></div>

              <div className="mb-6">
                <GoogleButton text="signin_with" onSuccess={handleGoogleSuccess} />
              </div>

              <p className="text-center text-sm text-gray-400 mb-6">or use your email account</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
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
                    Forgot Password?
                  </a>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="w-48 rounded-full h-12 text-base font-semibold bg-[#00D6C4] hover:bg-[#00b5a6] text-white shadow-lg shadow-[#00D6C4]/30 transition-all"
                    disabled={loading || !email || !password}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
              <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                By continuing to sign in, you agree with our{" "}
                <Link to="/terms" className="text-gray-500 hover:text-[#00D6C4] underline underline-offset-2 transition-colors">Terms & Conditions</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-gray-500 hover:text-[#00D6C4] underline underline-offset-2 transition-colors">Privacy Policy</Link>.
              </p>
            </motion.div>
            )}
          </div>

          <div className="mt-auto pt-8 flex justify-center gap-6 text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-[#00D6C4] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#00D6C4] transition-colors">Terms & Conditions</Link>
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
            <h2 className="text-4xl font-bold font-heading mb-4 text-white">Hello, Friend!</h2>
            <div className="w-12 h-1 bg-white/50 mx-auto rounded-full mb-6"></div>
            <p className="text-white/90 text-lg mb-10 leading-relaxed font-light">
              Fill up personal information and start journey with us.
            </p>
            <Button 
              asChild
              variant="outline" 
              className="w-48 rounded-full h-12 text-base font-semibold border-2 border-[#00D6C4]/50 text-white hover:bg-[#00D6C4] hover:border-[#00D6C4] hover:text-[#0F2642] bg-transparent transition-all"
            >
              <a href="/signup">Sign Up</a>
            </Button>
          </motion.div>
        </div>

      </div>
  );
};

export default UserLogin;
