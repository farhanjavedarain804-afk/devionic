import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck, RefreshCcw, ArrowLeft } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  email: string;
  type: 'login' | 'signup';
  onVerify: (otp: string, rememberDevice: boolean) => void;
  onCancel: () => void;
  isLoading: boolean;
  debugOtp?: string | null;
  /** Show the "Remember this device" checkbox (login only) */
  showRememberDevice?: boolean;
}

const OTPVerification = ({ email, type, onVerify, onCancel, isLoading, debugOtp, showRememberDevice = false }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const { toast } = useToast();

  useEffect(() => {
    if (debugOtp) {
      setOtp(debugOtp);
    }
  }, [debugOtp]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.post("/auth/resend-otp", { email, type });
      toast({ title: "OTP Resent", description: "Please check your inbox." });
      setTimer(60);
    } catch (err: any) {
      toast({ title: "Failed to resend", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <ShieldCheck size={32} className="text-accent" />
        </div>
        <h2 className="text-2xl font-bold">Verify Identity</h2>
        <p className="text-muted-foreground text-sm mt-2">
          We've sent a 6-digit verification code to <br />
          <span className="text-foreground font-bold">{email}</span>
        </p>
        {debugOtp && (
          <p className="mt-3 text-xs text-amber-600 font-semibold">
            Email delivery is unavailable right now, so the code is prefilled for local access.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <Input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="h-16 text-center text-3xl font-black tracking-[10px] rounded-2xl border-2 border-accent/20 focus:border-accent"
          />
        </div>

        {/* Remember this device checkbox — shown only on login */}
        {showRememberDevice && (
          <div className="flex items-center gap-3 px-1 py-2 rounded-xl bg-accent/5 border border-accent/10">
            <Checkbox
              id="remember-device"
              checked={rememberDevice}
              onCheckedChange={(v) => setRememberDevice(Boolean(v))}
              className="border-accent/40 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <label htmlFor="remember-device" className="text-sm cursor-pointer select-none">
              <span className="font-semibold text-foreground">Remember this device</span>
              <span className="text-muted-foreground ml-1">for 30 days</span>
            </label>
          </div>
        )}

        <Button
          variant="cyan"
          size="lg"
          className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-accent/20"
          disabled={isLoading || otp.length !== 6}
          onClick={() => onVerify(otp, rememberDevice)}
        >
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
          Verify & Continue
        </Button>

        <div className="flex items-center justify-between px-1">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} className="mr-2" /> Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className="text-accent font-bold"
          >
            {resending ? <Loader2 className="animate-spin mr-2" size={12} /> : <RefreshCcw size={14} className="mr-2" />}
            {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
