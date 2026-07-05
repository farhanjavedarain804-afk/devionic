/// <reference types="vite/client" />

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken } from "./auth";
import { getAuthRedirectPath } from "./authScope";

// ─── Trusted Device ID ────────────────────────────────────────────────────────
// A stable UUID generated once per browser and stored in localStorage.
// Sent with every login request so the backend can skip 2FA on known devices.
const DEVICE_ID_KEY = "devionic_device_id";
export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const isLocalhost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

const resolveBaseURL = () => {
  // In browser on localhost: use relative /api so Vite's dev proxy handles routing.
  // The proxy forwards to https://api.devionic.com (see vite.config.ts).
  if (typeof window !== "undefined" && isLocalhost(window.location.hostname)) {
    return "/api";
  }

  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return "/api";
};

const primaryBaseURL = resolveBaseURL();
const browserFallbackBaseURL =
  typeof window !== "undefined" && isLocalhost(window.location.hostname)
    ? "/api"
    : typeof window !== "undefined"
      ? `${window.location.origin}/api`
      : "/api";
const fallbackBaseURL = primaryBaseURL === browserFallbackBaseURL ? undefined : browserFallbackBaseURL;

const apiClient = axios.create({
  baseURL: primaryBaseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

const fallbackClient = fallbackBaseURL
  ? axios.create({
    baseURL: fallbackBaseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {
      Accept: "application/json",
    },
  })
  : null;

const inflightGetRequests = new Map<string, Promise<any>>();

const buildRequestKey = (config: InternalAxiosRequestConfig) => {
  const baseURL = config.baseURL || primaryBaseURL;
  const method = (config.method || "get").toUpperCase();
  const params = config.params ? JSON.stringify(config.params) : "";
  try {
    const resolvedBase =
      baseURL.startsWith("/") && typeof window !== "undefined"
        ? `${window.location.origin}${baseURL}`
        : baseURL;
    const url = new URL(config.url || "", resolvedBase);
    return `${method}:${url.toString()}:${params}`;
  } catch {
    return `${method}:${baseURL}:${config.url || ""}:${params}`;
  }
};

type OfflineRecord = Record<string, any>;

const offlineStorageKey = "devionic_offline_api";
const offlineAuthKey = "devionic_offline_auth";

const isBrowser = typeof window !== "undefined";
const isLocalHost = false; // Intentionally disabled offline mode as per user request
const isAdminContext = () => isBrowser && window.location.pathname.startsWith("/dms/admin");

const readJson = <T,>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
};

const offlineState = () => {
  const seed = {
    complaints: [] as OfflineRecord[],
    inquiries: [] as OfflineRecord[],
    quote_requests: [] as OfflineRecord[],
    testimonials: [] as OfflineRecord[],
    jobs: [] as OfflineRecord[],
    applications: [] as OfflineRecord[],
    admin_notifications: [] as OfflineRecord[],
    admin_logs: [] as OfflineRecord[],
    users: [] as OfflineRecord[],
    site_settings: {
      maintenance_mode: "false",
    } as Record<string, string>,
  };

  const current = readJson<typeof seed>(offlineStorageKey, seed);
  return {
    ...seed,
    ...current,
    site_settings: { ...seed.site_settings, ...(current.site_settings || {}) },
  };
};

const persistOfflineState = (state: ReturnType<typeof offlineState>) => {
  writeJson(offlineStorageKey, state);
};

const offlineUserKey = () => {
  const token = getToken();
  if (!token || !isBrowser) return null;
  try {
    return JSON.parse(localStorage.getItem(offlineAuthKey) || "null");
  } catch {
    return null;
  }
};

const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

const makeResponse = (data: unknown, status = 200, config?: InternalAxiosRequestConfig) =>
  Promise.resolve({
    data,
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "ERROR",
    headers: {},
    config,
  });

const getPath = (config?: InternalAxiosRequestConfig) => {
  const baseURL = config?.baseURL || primaryBaseURL;
  const rawUrl = config?.url || "";
  try {
    return new URL(rawUrl, baseURL).pathname.replace(/\/+$/, "") || "/";
  } catch {
    return rawUrl.replace(/\/+$/, "") || "/";
  }
};

const asArrayResponse = (items: OfflineRecord[] = []) => items;

const findById = (items: OfflineRecord[], id: string) => items.find((item) => String(item.id || "").toUpperCase() === id.toUpperCase());

const upsertCollection = (collection: keyof ReturnType<typeof offlineState>, record: OfflineRecord) => {
  const state = offlineState();
  const list = state[collection] as OfflineRecord[];
  const id = String(record.id || nextId(collection.slice(0, 3))).toUpperCase();
  const merged = { ...record, id };
  const index = list.findIndex((entry) => String(entry.id || "").toUpperCase() === id);
  if (index >= 0) {
    list[index] = { ...list[index], ...merged };
  } else {
    list.unshift(merged);
  }
  state[collection] = list as never;
  persistOfflineState(state);
  return merged;
};

const offlineSearchRecord = (id: string) => {
  const state = offlineState();
  const prefixes: Array<[keyof ReturnType<typeof offlineState>, string[]]> = [
    ["complaints", ["CMP"]],
    ["inquiries", ["INQ"]],
    ["quote_requests", ["QUO", "VER"]],
    ["applications", ["APP", "EMP"]],
    ["jobs", ["JOB"]],
    ["users", ["USR"]],
    ["testimonials", ["TST"]],
  ];

  for (const [collection] of prefixes) {
    const list = state[collection] as OfflineRecord[];
    const found = findById(list, id);
    if (found) return { type: collection.replace(/_requests$/, ""), ...found };
  }

  return null;
};

const offlineFallback = async (config: InternalAxiosRequestConfig, originalError?: unknown) => {
  const path = getPath(config);
  const method = (config.method || "get").toLowerCase();
  const body = typeof config.data === "string" ? JSON.parse(config.data || "{}") : (config.data || {});
  const state = offlineState();

  if (path === "/auth/login" && method === "post") {
    const email = String(body.email || "").trim();
    const role = isAdminContext() ? "admin" : "user";
    const user = {
      id: email ? `offline-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "offline-user",
      email: email || "offline@devionic.local",
      role,
      full_name: role === "admin" ? "Offline Admin" : "Offline User",
      is_approved: 1,
      is_rejected: 0,
    };
    if (isBrowser) {
      localStorage.setItem(offlineAuthKey, JSON.stringify(user));
    }
    return makeResponse({ token: `offline-token-${user.id}`, user }, 200, config);
  }

  if (path === "/auth/verify-login" && method === "post") {
    const user = offlineUserKey() || {
      id: "offline-user",
      email: String(body.email || "offline@devionic.local"),
      role: isAdminContext() ? "admin" : "user",
      full_name: "Offline User",
      is_approved: 1,
      is_rejected: 0,
    };
    return makeResponse({ token: `offline-token-${user.id}`, user }, 200, config);
  }

  if (path === "/auth/signup-request" && method === "post") {
    return makeResponse({ message: "OTP_SENT", email: body.email, debug_otp: "123456", delivery: "debug" }, 200, config);
  }

  if (path === "/auth/resend-otp" && method === "post") {
    return makeResponse({ message: "OTP_RESENT", debug_otp: "123456", delivery: "debug" }, 200, config);
  }

  if (path === "/auth/signup" && method === "post") {
    return makeResponse({ message: "Account created successfully" }, 201, config);
  }

  if (path === "/auth/me" && method === "get") {
    const user = offlineUserKey();
    return makeResponse(user ? { ...user, profile: { full_name: user.full_name, company_name: "", contact_number: "", is_approved: 1, is_rejected: 0 } } : { message: "User not found" }, user ? 200 : 404, config);
  }

  if (path === "/auth/update-password" && method === "post") {
    return makeResponse({ message: "Password updated successfully" }, 200, config);
  }

  if (path === "/site_settings/maintenance_mode" && method === "get") {
    return makeResponse({ key: "maintenance_mode", value: state.site_settings.maintenance_mode }, 200, config);
  }

  if (path === "/public/services" && method === "get") return makeResponse(asArrayResponse(state.jobs), 200, config);
  if (path === "/public/jobs" && method === "get") return makeResponse(asArrayResponse(state.jobs), 200, config);
  if (path === "/public/testimonials" && method === "get") return makeResponse(asArrayResponse(state.testimonials), 200, config);

  if (path.startsWith("/public/jobs/") && method === "get") {
    const job = findById(state.jobs, path.split("/").pop() || "");
    return makeResponse(job || { message: "Job not found" }, job ? 200 : 404, config);
  }

  if (path === "/public/quotes" && method === "post") {
    const record = upsertCollection("quote_requests", {
      ...body,
      id: nextId("QUO"),
      display_id: nextId("QUO").slice(0, 11),
      status: "pending",
      created_at: new Date().toISOString(),
    }) as any;
    return makeResponse({ id: record.id, display_id: record.display_id, message: "Quote request submitted successfully" }, 201, config);
  }

  if (path === "/public/inquiries" && method === "post") {
    const record = upsertCollection("inquiries", {
      ...body,
      id: nextId("INQ"),
      display_id: nextId("INQ").slice(0, 11),
      status: "pending",
      created_at: new Date().toISOString(),
    }) as any;
    return makeResponse({ id: record.id, display_id: record.display_id, message: "Inquiry submitted" }, 201, config);
  }

  if (path === "/public/complaints" && method === "post") {
    const record = upsertCollection("complaints", {
      ...body,
      id: nextId("CMP"),
      tracking_id: nextId("CMP").slice(0, 11),
      status: "pending",
      created_at: new Date().toISOString(),
    }) as any;
    return makeResponse({ id: record.id, tracking_id: record.tracking_id, message: "Complaint submitted" }, 201, config);
  }

  if (path.startsWith("/public/complaints/track/") && method === "get") {
    const trackingId = path.split("/").pop() || "";
    const complaint = state.complaints.find((item) => String(item.tracking_id || "").toUpperCase() === trackingId.toUpperCase());
    return makeResponse(complaint || { message: "Complaint not found" }, complaint ? 200 : 404, config);
  }

  if (path === "/analytics/track" && method === "post") {
    return makeResponse({ message: "tracked" }, 200, config);
  }

  if (path === "/dms/admin/notifications/unread-count" && method === "get") {
    return makeResponse(asArrayResponse(state.admin_notifications.filter((item) => !item.is_read)), 200, config);
  }

  if (path === "/dms/admin/notifications" && method === "get") return makeResponse(asArrayResponse(state.admin_notifications), 200, config);
  if (path === "/dms/admin/logs" && method === "get") return makeResponse(asArrayResponse(state.admin_logs), 200, config);

  if (method === "get" && (/\/$/.test(path) || !path.includes("/"))) {
    return makeResponse([], 200, config);
  }

  if (method === "get") {
    const record = offlineSearchRecord(path.split("/").pop() || "");
    return makeResponse(record || [], record ? 200 : 404, config);
  }

  if (["post", "put", "patch"].includes(method)) {
    return makeResponse({ message: "Saved locally" }, 200, config);
  }

  if (method === "delete") {
    return makeResponse({ message: "Deleted locally" }, 200, config);
  }

  if (originalError) {
    throw originalError;
  }

  return makeResponse({ message: "Offline fallback unavailable" }, 503, config);
};

const attachAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }
  return config;
};

const clearAuthState = () => {
  if (typeof window === "undefined") return;
  const keys = [
    "devionic_console_token",
    "devionic_console_user",
    "devionic_user_token",
    "devionic_public_user",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
};

apiClient.interceptors.request.use(attachAuthHeader);
fallbackClient?.interceptors.request.use(attachAuthHeader);

const originalRequest = apiClient.request.bind(apiClient);
(apiClient as typeof apiClient & { request: typeof apiClient.request }).request = ((config: any) => {
  const method = String(config?.method || "get").toLowerCase();
  if (method !== "get") {
    return originalRequest(config);
  }

  const key = buildRequestKey(config);
  const cached = inflightGetRequests.get(key);
  if (cached) return cached;

  const requestPromise = originalRequest(config).finally(() => {
    inflightGetRequests.delete(key);
  });

  inflightGetRequests.set(key, requestPromise);
  return requestPromise;
}) as typeof apiClient.request;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as (InternalAxiosRequestConfig & { __retryWithFallback?: boolean }) | undefined;
    if (error.response?.status === 401) {
      clearAuthState();
      if (typeof window !== "undefined") {
        window.location.href = getAuthRedirectPath();
      }
    }
    const isNetworkError = !error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('timeout'));
    const shouldRetry =
      !!fallbackClient &&
      !!requestConfig &&
      !requestConfig.__retryWithFallback &&
      !error.response;

    if (!shouldRetry) {
      // Attach user-friendly message for network/timeout errors
      if (isNetworkError && error && typeof error === 'object') {
        (error as AxiosError & { friendlyMessage?: string }).friendlyMessage =
          'Cannot connect to the server. Please check your internet connection and try again.';
      }

      if (isLocalHost && requestConfig && (!error.response || (error.response.status >= 500 && error.response.status < 600))) {
        try {
          return await offlineFallback(requestConfig, error);
        } catch (offlineError) {
          return Promise.reject(offlineError);
        }
      }

      return Promise.reject(error);
    }

    requestConfig.__retryWithFallback = true;
    requestConfig.baseURL = fallbackBaseURL;

    try {
      return await fallbackClient!.request(requestConfig);
    } catch (fallbackError) {
      if (isLocalHost) {
        try {
          return await offlineFallback(requestConfig, fallbackError);
        } catch (offlineError) {
          return Promise.reject(offlineError);
        }
      }
      return Promise.reject(fallbackError);
    }
  }
);

export default apiClient;
