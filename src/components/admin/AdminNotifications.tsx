import apiClient from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";

const typeIcons: Record<string, any> = {
  info: { icon: Info, color: "text-[hsl(207,70%,50%)]", bg: "bg-[hsl(207,70%,50%)]/10" },
  warning: { icon: AlertTriangle, color: "text-[hsl(40,90%,55%)]", bg: "bg-[hsl(40,90%,55%)]/10" },
  success: { icon: CheckCircle2, color: "text-[hsl(142,70%,45%)]", bg: "bg-[hsl(142,70%,45%)]/10" },
};

const AdminNotifications = () => {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const response = await apiClient.get("/dms/admin/notifications");
      return response.data || [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/notifications/${id}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await apiClient.post("/dms/admin/notifications/mark-all-read");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/notifications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            <Check size={14} /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">System notifications will appear here</p>
          </div>
        ) : (
          notifications.map((n: any) => {
            const t = typeIcons[n.type] || typeIcons.info;
            const Icon = t.icon;
            return (
              <div key={n.id} className={`${cardClass} flex items-start gap-4 ${!n.is_read ? "border-accent/30 bg-accent/5" : ""}`}>
                <div className={`h-10 w-10 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={t.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm font-semibold text-foreground ${!n.is_read ? "font-bold" : ""}`}>{n.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                    {!n.is_read && <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1.5" />}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {!n.is_read && (
                      <button className="text-[10px] text-accent hover:underline" onClick={() => markRead.mutate(n.id)}>Mark read</button>
                    )}
                    <button className="text-[10px] text-destructive hover:underline" onClick={() => remove.mutate(n.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
