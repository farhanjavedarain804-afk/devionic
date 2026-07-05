import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, User as UserIcon, Phone, Building, Lock } from "lucide-react";
import logoFull from "@/assets/devionic-logo-full.png";
import { getCurrentUser } from "@/lib/auth";
import GoogleButton from "@/components/auth/GoogleButton";

const UserSignUp = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    company_name: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === "user") {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Google Sign-Up — account is auto-provisioned on the backend; just route in.
  const handleGoogleSuccess = () => {
    setTimeout(() => navigate("/dashboard"), 400);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post("/auth/register", formData);
      toast({ title: "Registration Successful", description: "Your account has been created. Please log in." });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans overflow-hidden bg-white">
        
        {/* Left Side: Greeting Panel (Reverse of Login) */}
        <div className="hidden md:flex w-1/2 bg-[#0F2642] p-12 text-white flex-col justify-center items-center relative overflow-hidden min-h-screen">
          {/* Animated background effects */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#00D6C4]/10 rounded-full blur-3xl"></motion.div>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }} className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-3xl"></motion.div>
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} className="absolute bottom-1/4 right-1/4 w-0 h-0 border-l-[30px] border-l-transparent border-t-[40px] border-t-white/5 border-r-[30px] border-r-transparent"></motion.div>
          <motion.div animate={{ y: [0, 30, 0], rotate: [0, -45, 0] }} transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 1 }} className="absolute top-1/4 left-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-b-[30px] border-b-[#00D6C4]/10 border-r-[20px] border-r-transparent"></motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center z-10 w-full max-w-sm relative"
          >
            <h2 className="text-4xl font-bold font-heading mb-4 text-white">Welcome Back!</h2>
            <div className="w-12 h-1 bg-white/50 mx-auto rounded-full mb-6"></div>
            <p className="text-white/90 text-lg mb-10 leading-relaxed font-light">
              To keep connected with us please login with your personal info.
            </p>
            <Button 
              asChild
              variant="outline" 
              className="w-48 rounded-full h-12 text-base font-semibold border-2 border-[#00D6C4]/50 text-white hover:bg-[#00D6C4] hover:border-[#00D6C4] hover:text-[#0F2642] bg-transparent transition-all"
            >
              <a href="/login">Sign In</a>
            </Button>
          </motion.div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 lg:p-24 flex flex-col relative min-h-screen bg-white">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60"></div>
          
          <div className="relative z-10 w-full flex-1 flex flex-col">
            <div className="mb-4 flex justify-end">
            <Link to="/">
              <img src={logoFull} alt="Devionic" className="h-8 object-contain" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-4xl font-bold text-center text-[#00D6C4] mb-2 font-heading">Create Account</h2>
              <div className="w-12 h-1 bg-[#00D6C4] mx-auto rounded-full mb-6"></div>

              <div className="mb-4">
                <GoogleButton text="signup_with" onSuccess={handleGoogleSuccess} />
              </div>

              <p className="text-center text-sm text-gray-400 mb-6">or use your email for registration</p>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                  </div>
                  <Input 
                    placeholder="Full Name" 
                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Phone" 
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building size={18} className="text-gray-400" />
                    </div>
                    <Input 
                      placeholder="Company" 
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <Input 
                      type="password" 
                      placeholder="Confirm Password" 
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus-visible:ring-[#00D6C4]/20 focus-visible:border-[#00D6C4] rounded-lg"
                      value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    required
                  />
                </div>

                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="w-48 rounded-full h-12 text-base font-semibold bg-[#00D6C4] hover:bg-[#00b5a6] text-white shadow-lg shadow-[#00D6C4]/30 transition-all"
                    disabled={loading || !formData.email || !formData.password || !formData.full_name}
                  >
                    {loading ? "Creating..." : "Sign Up"}
                  </Button>
                </div>
              </form>
              <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                By continuing to sign up, you agree with our{" "}
                <Link to="/terms" className="text-gray-500 hover:text-[#00D6C4] underline underline-offset-2 transition-colors">Terms & Conditions</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-gray-500 hover:text-[#00D6C4] underline underline-offset-2 transition-colors">Privacy Policy</Link>.
              </p>
            </motion.div>
          </div>

          <div className="mt-auto pt-6 flex justify-center gap-6 text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-[#00D6C4] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#00D6C4] transition-colors">Terms & Conditions</Link>
          </div>
          </div>
        </div>

      </div>
  );
};

export default UserSignUp;
