import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "@/lib/apiClient";

const SESSION_KEY = "dev_visitor_session";

const getSessionId = (): string => {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `vs_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const lastPath = useRef("");
  const pageStart = useRef(Date.now());

  useEffect(() => {
    const sessionId = getSessionId();

    const trackPageView = async (path: string, duration: number) => {
      try {
        await apiClient.post("/analytics/track", {
          session_id: sessionId,
          page_path: path,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          duration_seconds: Math.round(duration / 1000),
          action: "pageview",
        });
      } catch { /* silent */ }
    };

    // Track previous page duration on navigation
    if (lastPath.current && lastPath.current !== location.pathname) {
      const duration = Date.now() - pageStart.current;
      trackPageView(lastPath.current, duration);
    }

    lastPath.current = location.pathname;
    pageStart.current = Date.now();

    // Track current page on first load
    let referrerMatch = false;
    try {
      if (document.referrer) {
        referrerMatch = new URL(document.referrer).pathname === location.pathname;
      }
    } catch (e) {
      // ignore invalid referrer URLs
    }

    if (!document.referrer || !referrerMatch) {
      trackPageView(location.pathname, 0);
    }
  }, [location.pathname]);

  // Heartbeat every 30s
  useEffect(() => {
    const sessionId = getSessionId();
    const heartbeat = setInterval(async () => {
      try {
        await apiClient.post("/analytics/track", {
          session_id: sessionId,
          action: "heartbeat",
          user_agent: navigator.userAgent
        });
      } catch { /* silent */ }
    }, 30000);

    // Mark offline on leave
    const handleLeave = () => {
      const url = `${apiClient.defaults.baseURL}/analytics/track`;
      const dataString = JSON.stringify({ session_id: sessionId, action: "leave", user_agent: navigator.userAgent });
      if (navigator.sendBeacon) {
        const blob = new Blob([dataString], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, { method: 'POST', body: dataString, keepalive: true, headers: { 'Content-Type': 'application/json' } });
      }
    };

    window.addEventListener("beforeunload", handleLeave);
    return () => {
      clearInterval(heartbeat);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);
};
