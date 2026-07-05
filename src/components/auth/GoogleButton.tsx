import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { saveClientSession } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type GoogleUser = {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  is_approved?: number;
  is_rejected?: number;
};

export type GoogleButtonProps = {
  /** Label context passed to Google's button. */
  text?: "signin_with" | "signup_with" | "continue_with";
  /** Called after the backend returns a session — receives the user object. */
  onSuccess?: (user: GoogleUser) => void;
  /** Called when the backend verification fails or Google errors out. */
  onError?: (message: string) => void;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

/**
 * Renders the official "Sign in with Google" button via Google Identity Services.
 *
 * Flow: GIS button → Google returns an ID token → POST /auth/google verifies it
 * on the backend → session saved → onSuccess(user).
 *
 * If VITE_GOOGLE_CLIENT_ID is unset, a disabled placeholder button is shown so
 * the layout doesn't break during setup.
 */
const GoogleButton = ({ text = "signin_with", onSuccess, onError }: GoogleButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const [configured] = useState(Boolean(GOOGLE_CLIENT_ID));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCredential = async (response: GoogleCredentialResponse) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/google", { credential: response.credential });
      const { token, user } = res.data || {};
      if (!token || !user) {
        const msg = res.data?.message || "Google Sign-In failed.";
        toast({ title: "Google Sign-In Failed", description: msg, variant: "destructive" });
        onError?.(msg);
        return;
      }
      saveClientSession(token, user);
      toast({
        title: "Login Successful",
        description: `Welcome${user.full_name ? `, ${user.full_name.split(" ")[0]}` : " back"}!`,
      });
      onSuccess?.(user);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.friendlyMessage || "Google authentication failed.";
      toast({ title: "Google Sign-In Failed", description: msg, variant: "destructive" });
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!configured || initializedRef.current || !containerRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !containerRef.current || initializedRef.current) return;
      initializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID!,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text,
        shape: "pill",
        width: 320,
      });
    };

    // The GIS script loads async in <head>; if it's already present render now,
    // otherwise poll until it's ready (max ~10s).
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      const interval = window.setInterval(() => {
        if (window.google?.accounts?.id) {
          renderGoogleButton();
          window.clearInterval(interval);
        }
      }, 200);
      window.setTimeout(() => window.clearInterval(interval), 10_000);
    }

    return () => {
      // interval cleanup is handled by its own clears; ref guard prevents re-init
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, text]);

  // Loading overlay (covers the GIS iframe while the backend call is in-flight)
  if (configured && loading) {
    return (
      <div className="flex items-center justify-center gap-2 w-full h-12 rounded-full border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium">
        <Loader2 size={16} className="animate-spin" />
        Signing in with Google…
      </div>
    );
  }

  // Configured but GIS not yet rendered — reserve space to avoid layout shift
  if (configured) {
    return <div ref={containerRef} className="flex justify-center min-h-[44px]" data-testid="google-button-container" />;
  }

  // Not configured — show a disabled placeholder so the UI still looks complete
  return (
    <button
      type="button"
      disabled
      title="Google Sign-In is not configured. Set VITE_GOOGLE_CLIENT_ID to enable."
      className="flex items-center justify-center gap-3 w-full h-12 rounded-full border border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed"
    >
      <GoogleGIcon />
      <span>{text === "signup_with" ? "Sign up with Google" : "Sign in with Google"}</span>
    </button>
  );
};

/** Inline multi-color Google "G" mark (matches official brand colors). */
const GoogleGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

export default GoogleButton;
