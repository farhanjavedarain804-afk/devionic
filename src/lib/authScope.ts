export type AuthScope = "public" | "console";

export const getAuthScope = (): AuthScope => {
  if (typeof window === "undefined") return "public";
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  return hostname.startsWith("console.") || hostname.startsWith("admin.") || pathname.startsWith("/dms/admin") ? "console" : "public";
};

export const getAuthStorageKeys = () => {
  const scope = getAuthScope();
  return {
    token: scope === "console" ? "devionic_console_token" : "devionic_user_token",
    user: scope === "console" ? "devionic_console_user" : "devionic_public_user",
  };
};

export const getAuthRedirectPath = () => (getAuthScope() === "console" ? "/dms/admin" : "/login");
