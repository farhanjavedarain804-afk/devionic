import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";

export const logAdminAction = async (action: string, details?: string) => {
  try {
    const user = getCurrentUser();
    if (!user) return;
    
    await apiClient.post("/dms/admin/logs", {
      user_id: user.id,
      user_email: user.email || "unknown",
      action,
      details: details || null,
    });
  } catch { /* silent */ }
};
