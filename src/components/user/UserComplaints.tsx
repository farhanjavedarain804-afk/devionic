import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";

const parseAttachments = (atts: any) => {
  if (typeof atts === 'string') {
    try {
      return JSON.parse(atts);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(atts) ? atts : [];
};
import { Search, Plus, Send, Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const UserComplaints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["user-complaints"],
    queryFn: async () => {
      const response = await apiClient.get("/complaints");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const user = getCurrentUser();
      const response = await apiClient.post("/complaints", {
        ...newData,
        email: user?.email,
        name: user?.full_name || "User",
        status: "pending",
        tracking_id: `CMP-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-complaints"] });
      setIsAdding(false);
      setForm({ subject: "", description: "" });
      toast({ title: "Complaint registered successfully!" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to register complaint", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const filteredComplaints = complaints.filter(c =>
    (c.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.tracking_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(v) => !v && setSelectedComplaint(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-wider font-bold">Tracking ID</p>
                  <p className="font-mono font-bold text-accent">{selectedComplaint.tracking_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 uppercase tracking-wider font-bold">Status</p>
                  <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold uppercase w-fit ${
                    selectedComplaint.status === "resolved" ? "bg-green-500/10 text-green-500" :
                    selectedComplaint.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1 uppercase tracking-wider font-bold">Subject</p>
                  <p className="font-medium text-base">{selectedComplaint.subject}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-bold">Description</p>
                <p className="text-sm border-l-2 border-accent/20 pl-3 italic whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.resolved_notes && (
                <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl">
                  <p className="text-xs text-green-600 mb-2 uppercase tracking-wider font-bold flex items-center gap-2">
                    <CheckCircle2 size={14} /> Resolution Note
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedComplaint.resolved_notes}</p>
                  {selectedComplaint.resolved_attachments && (
                    <div className="mt-4 pt-4 border-t border-green-500/10">
                      <p className="text-[10px] text-muted-foreground mb-2 font-bold uppercase">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {parseAttachments(selectedComplaint.resolved_attachments).map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline flex items-center gap-1 bg-accent/5 px-2 py-1 rounded">
                            Attachment {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Complaints</h2>
          <p className="text-muted-foreground text-sm">Register and track your complaints</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button variant="cyan"><Plus size={18} className="mr-2" /> Register Complaint</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register a Complaint</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Subject</label>
                  <Input
                    placeholder="Brief subject of your complaint"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Provide details about the issue..."
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <Button variant="cyan" type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} className="mr-2" /> Submit Complaint</>}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading complaints...</TableCell></TableRow>
            ) : filteredComplaints.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No complaints found.</TableCell></TableRow>
            ) : filteredComplaints.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-mono text-xs">{c.tracking_id}</TableCell>
                <TableCell className="font-medium">{c.subject}</TableCell>
                <TableCell>
                  <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                    c.status === "resolved" ? "bg-green-500/10 text-green-500" :
                    c.status === "pending" ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {c.status === "resolved" ? <CheckCircle2 size={12} /> :
                     c.status === "pending" ? <Clock size={12} /> : <AlertTriangle size={12} />}
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(c)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserComplaints;
