import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, Search, Loader2, Users, Clock, CheckCircle2, XCircle, Star, GraduationCap, Trash2 } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const statusColors: Record<string, string> = {
  pending: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
  under_review: "bg-accent/10 text-accent",
  shortlisted: "bg-[hsl(200,80%,50%)]/10 text-[hsl(200,80%,50%)]",
  interview: "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]",
  hired: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
  rejected: "bg-destructive/10 text-destructive",
};

const statuses = ["pending", "under_review", "shortlisted", "interview", "hired", "rejected"];

const AdminInternshipApplications = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-internship-applications"],
    queryFn: async () => {
      const response = await apiClient.get("/internship_applications");
      const result = response.data;
      if (Array.isArray(result)) return result;
      if (result && Array.isArray(result.data)) return result.data;
      return [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const update: any = { status };
      if (note) update.note = note;
      await apiClient.patch(`/internship_applications/${id}`, update);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-internship-applications"] });
      setStatusNote("");
      toast({ title: "Status updated" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/internship_applications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-internship-applications"] });
      toast({ title: "Application deleted successfully" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const filtered = applications.filter((a: any) => {
    const matchSearch = !search || (a.full_name || "").toLowerCase().includes(search.toLowerCase()) || (a.application_number || "").toLowerCase().includes(search.toLowerCase()) || (a.cnic || "").includes(search);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingApps = applications.filter((a: any) => a.status === "pending").length;
  const shortlistedApps = applications.filter((a: any) => a.status === "shortlisted").length;
  const hiredApps = applications.filter((a: any) => a.status === "hired").length;
  const rejectedApps = applications.filter((a: any) => a.status === "rejected").length;

  const viewingApp = applications.find((a: any) => a.id === viewingId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading flex items-center gap-2">
            <GraduationCap className="text-accent" size={26} /> Internship Applications
          </h2>
          <p className="text-sm text-muted-foreground">{applications.length} applications received</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={applications.length} icon={Users} />
        <StatsCard title="Pending" value={pendingApps} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="Shortlisted" value={shortlistedApps} icon={Star} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Hired" value={hiredApps} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Rejected" value={rejectedApps} icon={XCircle} color="bg-destructive/10" iconColor="text-destructive" />
      </div>

      <div className={`${cardClass} flex flex-col sm:flex-row gap-3`}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, CNIC, or application #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-accent" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} text-center py-8`}><p className="text-muted-foreground">No internship applications found.</p></div>
      ) : (
        <div className={cardClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Applicant</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Position</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">CNIC</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Date</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Status</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app: any) => (
                  <tr key={app.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground text-sm">{app.full_name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{app.application_number}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{app.internship_title}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell font-mono">{app.cnic}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[app.status] || "bg-muted text-muted-foreground"}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setViewingId(app.id)}>
                          <Eye size={14} /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete Application"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
                              deleteApplication.mutate(app.id);
                            }
                          }}
                          disabled={deleteApplication.isPending}
                        >
                          {deleteApplication.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!viewingApp} onOpenChange={v => { if (!v) setViewingId(null); }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingApp?.full_name} - Internship Application</DialogTitle>
          </DialogHeader>
          {viewingApp && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{viewingApp.application_number} · {viewingApp.internship_title} · Applied {new Date(viewingApp.created_at).toLocaleDateString()}</p>

              {/* Status Update */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-4 rounded-xl border border-border bg-muted/20">
                <Select
                  value={viewingApp.status}
                  onValueChange={(newStatus) => {
                    updateStatus.mutate({ id: viewingApp.id, status: newStatus, note: statusNote || undefined });
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Update status" /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Optional status note..."
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  rows={1}
                  className="flex-1 resize-none"
                />
                <Button
                  variant="cyan"
                  onClick={() => updateStatus.mutate({ id: viewingApp.id, status: viewingApp.status, note: statusNote || undefined })}
                  disabled={updateStatus.isPending || !statusNote}
                >
                  {updateStatus.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Note
                </Button>
              </div>

              {/* Personal Info */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Full Name:</span> <span className="font-medium text-foreground">{viewingApp.full_name}</span></div>
                  <div><span className="text-muted-foreground">Father/Husband:</span> <span className="font-medium text-foreground">{viewingApp.father_husband_name || "—"}</span></div>
                  <div><span className="text-muted-foreground">CNIC:</span> <span className="font-medium text-foreground font-mono">{viewingApp.cnic}</span></div>
                  <div><span className="text-muted-foreground">Date of Birth:</span> <span className="font-medium text-foreground">{viewingApp.date_of_birth ? new Date(viewingApp.date_of_birth).toLocaleDateString() : "—"}</span></div>
                  <div><span className="text-muted-foreground">Age:</span> <span className="font-medium text-foreground">{viewingApp.age || "—"}</span></div>
                  <div><span className="text-muted-foreground">Nationality:</span> <span className="font-medium text-foreground">{viewingApp.nationality || "—"}</span></div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground">{viewingApp.email}</span></div>
                  <div><span className="text-muted-foreground">Phone 1:</span> <span className="font-medium text-foreground">{viewingApp.phone1 || "—"}</span></div>
                  <div><span className="text-muted-foreground">Phone 2:</span> <span className="font-medium text-foreground">{viewingApp.phone2 || "—"}</span></div>
                  <div><span className="text-muted-foreground">WhatsApp:</span> <span className="font-medium text-foreground">{viewingApp.whatsapp || "—"}</span></div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Address
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">City:</span> <span className="font-medium text-foreground">{viewingApp.city || "—"}</span></div>
                  <div><span className="text-muted-foreground">Tehsil:</span> <span className="font-medium text-foreground">{viewingApp.tehsil || "—"}</span></div>
                  <div><span className="text-muted-foreground">District:</span> <span className="font-medium text-foreground">{viewingApp.district || "—"}</span></div>
                  <div><span className="text-muted-foreground">Province:</span> <span className="font-medium text-foreground">{viewingApp.province || "—"}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Postal Address:</span> <span className="font-medium text-foreground">{viewingApp.postal_address || "—"}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Permanent Address:</span> <span className="font-medium text-foreground">{viewingApp.permanent_address || "—"}</span></div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{viewingApp.emergency_contact_name || "—"}</span></div>
                  <div><span className="text-muted-foreground">Relation:</span> <span className="font-medium text-foreground">{viewingApp.emergency_contact_relation || "—"}</span></div>
                  <div><span className="text-muted-foreground">Number:</span> <span className="font-medium text-foreground">{viewingApp.emergency_contact_number || "—"}</span></div>
                  <div><span className="text-muted-foreground">WhatsApp:</span> <span className="font-medium text-foreground">{viewingApp.emergency_contact_whatsapp || "—"}</span></div>
                </div>
              </div>

              {/* Education & Experience */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Education & Experience
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Education:</span> <p className="text-foreground mt-1">{viewingApp.education || "—"}</p></div>
                  <div><span className="text-muted-foreground">Work Experience:</span> <p className="text-foreground mt-1">{viewingApp.work_experience || "—"}</p></div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Documents
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "CNIC", url: viewingApp.cnic_doc },
                    { label: "Resume/CV", url: viewingApp.resume_cv },
                    { label: "Experience Letter", url: viewingApp.experience_letter },
                    { label: "Educational Docs", url: viewingApp.educational_docs },
                    { label: "Other Docs", url: viewingApp.other_docs },
                    { label: "Passport Photo", url: viewingApp.passport_photo },
                  ].map(doc => (
                    <div key={doc.label}>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                          <Download size={12} /> {doc.label}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{doc.label} —</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInternshipApplications;
