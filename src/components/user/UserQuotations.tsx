import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";
import { FileDown, Search, Plus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const UserQuotations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ 
    subject: "", 
    company_name: "",
    country: "",
    budget: "",
    timeline: "",
    description: "" 
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["user-quote-requests"],
    queryFn: async () => {
      const response = await apiClient.get("/quote_requests");
      return response.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await apiClient.post("/quote_requests", {
        display_id: `QUO-${Date.now().toString().slice(-6)}`,
        full_name: getCurrentUser()?.full_name || "User",
        name: getCurrentUser()?.full_name || "User", // Supporting both field variants
        email: getCurrentUser()?.email,
        service: newData.subject,
        company_name: newData.company_name,
        country: newData.country,
        budget: newData.budget,
        timeline: newData.timeline,
        description: newData.description,
        status: "pending",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-quotations"] });
      setIsAdding(false);
      setForm({ 
        subject: "", 
        company_name: "",
        country: "",
        budget: "",
        timeline: "",
        description: "" 
      });
      toast({ title: "Quotation request sent successfully!" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to send request", variant: "destructive" });
    },
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const filteredQuotations = quotations.filter(q =>
    (q.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    q.display_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quotations</h2>
          <p className="text-muted-foreground text-sm">Request and view your project quotations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button variant="cyan"><Plus size={18} className="mr-2" /> Request Quote</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request a New Quotation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApply} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">Service / Subject</label>
                    <Input
                      placeholder="e.g. Website Redesign"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Company (Optional)</label>
                    <Input
                      placeholder="Your Company"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Country</label>
                    <Input
                      placeholder="Your Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Budget</label>
                    <Input
                      placeholder="Est. Budget"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Timeline</label>
                    <Input
                      placeholder="Est. Timeline"
                      value={form.timeline}
                      onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Tell us about your project requirements..."
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <Button variant="cyan" type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} className="mr-2" /> Send Request</>}
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
              <TableHead>ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Loading quotations...</TableCell></TableRow>
            ) : filteredQuotations.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No quotations requested yet.</TableCell></TableRow>
            ) : filteredQuotations.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{format(new Date(q.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-mono text-xs">{q.display_id}</TableCell>
                <TableCell className="font-medium">
                  <div>
                    <p>{q.service || "No Subject"}</p>
                    {q.company_name && <p className="text-[10px] text-muted-foreground">{q.company_name}</p>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    q.status === "resolved" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {q.status}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" disabled={q.status !== "resolved"}>
                    <FileDown size={16} className="mr-2" /> Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserQuotations;
