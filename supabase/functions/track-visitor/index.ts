import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, page_path, referrer, user_agent, duration_seconds, action } = await req.json();

    // Get IP from request headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("cf-connecting-ip") || 
               req.headers.get("x-real-ip") || 
               "unknown";

    // Parse user agent for device/browser/os
    const ua = user_agent || "";
    let device = "Desktop";
    if (/mobile|android|iphone|ipad|tablet/i.test(ua)) {
      device = /tablet|ipad/i.test(ua) ? "Tablet" : "Mobile";
    }

    let browser = "Unknown";
    if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/edg/i.test(ua)) browser = "Edge";
    else if (/chrome/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua)) browser = "Safari";
    else if (/opera|opr/i.test(ua)) browser = "Opera";

    let os = "Unknown";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad/i.test(ua)) os = "iOS";

    // Try to get geolocation from IP using free API
    let country = "Unknown";
    let city = "Unknown";
    try {
      if (ip !== "unknown" && ip !== "127.0.0.1") {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          country = geo.country || "Unknown";
          city = geo.city || "Unknown";
        }
      }
    } catch { /* skip geo errors */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "heartbeat") {
      // Update session last_seen
      await supabase.from("visitor_sessions").upsert({
        session_id,
        ip_address: ip,
        country, city, device, browser, os,
        last_seen_at: new Date().toISOString(),
        is_online: true,
      }, { onConflict: "session_id" });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "leave") {
      await supabase.from("visitor_sessions").update({
        is_online: false,
        last_seen_at: new Date().toISOString(),
      }).eq("session_id", session_id);

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Default: page view
    // Insert page view
    await supabase.from("page_views").insert({
      session_id,
      ip_address: ip,
      country, city, device, browser, os,
      page_path: page_path || "/",
      referrer: referrer || null,
      user_agent: ua,
      duration_seconds: duration_seconds || 0,
    });

    // Upsert session
    const { data: existing } = await supabase
      .from("visitor_sessions")
      .select("pages_visited")
      .eq("session_id", session_id)
      .single();

    if (existing) {
      await supabase.from("visitor_sessions").update({
        last_seen_at: new Date().toISOString(),
        is_online: true,
        pages_visited: (existing.pages_visited || 0) + 1,
        ip_address: ip,
        country, city, device, browser, os,
      }).eq("session_id", session_id);
    } else {
      await supabase.from("visitor_sessions").insert({
        session_id,
        ip_address: ip,
        country, city, device, browser, os,
        pages_visited: 1,
        is_online: true,
      });
    }

    return new Response(JSON.stringify({ ok: true, ip, country, city, device, browser, os }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
