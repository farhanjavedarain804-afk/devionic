import { useState, useRef } from "react";
import {
  FileText, Plus, Search, Filter, Trash2, Download, Eye, Pencil,
  Hash, Loader2, Save, FolderOpen, Layers, Clock, CheckCircle2,
  FileArchive, Image as ImageIcon, FileSpreadsheet, FileType2, Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { format, isValid } from "date-fns";

const safeDate = (date: any, formatStr: string) => {
  const d = new Date(date);
  if (!isValid(d)) return "N/A";
  return format(d, formatStr);
};

const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-xl hover:shadow-accent/5";

const TYPE_FILTERS = ["all", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "image", "other"];

const extGroup = (fileType: string, fileName: string): string => {
  const ext = (fileType || (fileName || "").split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["ppt", "pptx"].includes(ext)) return "slides";
  if (["zip", "rar", "7z"].includes(ext)) return "archive";
  return "other";
};

const TypeIcon = ({ group, className }: { group: string; className?: string }) => {
  switch (group) {
    case "image": return <ImageIcon className={className} />;
    case "pdf": return <FileText className={className} />;
    case "doc": return <FileType2 className={className} />;
    case "sheet": return <FileSpreadsheet className={className} />;
    case "slides": return <FileText className={className} />;
    case "archive": return <FileArchive className={className} />;
    default: return <FileText className={className} />;
  }
};

const formatBytes = (bytes: number | null | undefined): string => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const emptyForm = () => ({
  resource_code: "",
  title: "",
  description: "",
  file_url: "",
  file_name: "",
  file_type: "",
  file_size: 0,
  is_published: true,
  sort_order: 0,
});

const AdminResourceCenter = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<any>(emptyForm());
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const resp = await apiClient.get("/resources");
      return resp.data || [];
    },
  });

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "resources");
      const { data } = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data && data.url) {
        const ext = (data.extension || (file.name.split(".").pop() || "")).toLowerCase();
        setForm((prev: any) => ({
          ...prev,
          file_url: data.url,
          file_name: data.originalName || file.name,
          file_type: ext,
          file_size: data.size || file.size,
        }));
        toast({ title: "File Uploaded", description: file.name });
      }
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err?.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveResource = useMutation({
    mutationFn: async () => {
      const payload = {
        resource_code: form.resource_code,
        title: form.title,
        description: form.description,
        file_url: form.file_url,
        file_name: form.file_name,
        file_type: form.file_type,
        file_size: form.file_size,
        is_published: form.is_published,
        sort_order: form.sort_order,
      };
      if (editing) {
        await apiClient.put(`/resources/${editing.id}`, payload);
      } else {
        await apiClient.post("/resources", payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm());
      toast({ title: editing ? "Resource Updated" : "Resource Added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err?.response?.data?.message || err.message, variant: "destructive" }),
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resources/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      setDeleteTarget(null);
      toast({ title: "Resource Deleted" });
    },
    onError: (err: any) => toast({ title: "Delete Failed", description: err?.response?.data?.message || err.message, variant: "destructive" }),
  });

  const startEdit = (r: any) => {
    setEditing(r);
    setForm({
      resource_code: r.resource_code || "",
      title: r.title || "",
      description: r.description || "",
      file_url: r.file_url || "",
      file_name: r.file_name || "",
      file_type: r.file_type || "",
      file_size: r.file_size || 0,
      is_published: r.is_published === 1 || r.is_published === true,
      sort_order: r.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const filtered = resources.filter((r: any) => {
    const matchesSearch = (r.title || "").toLowerCase().includes(search.toLowerCase())
      || (r.resource_code || "").toLowerCase().includes(search.toLowerCase());
    const g = extGroup(r.file_type, r.file_name || "");
    const matchesType = filterType === "all" || (filterType === "image" ? g === "image" : (r.file_type || "").toLowerCase() === filterType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[hsl(207,74%,12%)] flex items-center gap-3">
            <Layers className="text-accent h-8 w-8" />
            Resource <span className="text-accent underline decoration-accent/20">Center</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Upload, organize, and publish downloadable resources for your website visitors.</p>
        </div>
        <Button variant="cyan" className="rounded-xl h-12 px-8 gap-2 shadow-lg shadow-accent/20" onClick={startAdd}>
          <Plus size={18} /> Add Resource
        </Button>
      </div>

      {/* Toolbar */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by title or resource ID..."
              className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:border-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-12 rounded-xl border-transparent bg-muted/50">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-muted-foreground" />
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPE_FILTERS.filter(t => t !== "all").map(t => (
                  <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-accent h-10 w-10 mb-4" />
            <p className="text-muted-foreground font-medium">Loading resources...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((r: any, i: number) => {
            const g = extGroup(r.file_type, r.file_name || "");
            const published = r.is_published === 1 || r.is_published === true;
            return (
              <div key={r.id} className={`${cardClass} flex flex-col group animate-in zoom-in duration-300`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-colors">
                    <TypeIcon group={g} className="text-accent h-6 w-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => startEdit(r)} title="Edit"><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => setDeleteTarget(r)} title="Delete"><Trash2 size={14} /></Button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-accent mb-1">
                    <Hash size={10} /> {r.resource_code || "—"}
                  </div>
                  <h3 className="text-lg font-bold text-[hsl(207,74%,12%)] leading-tight mb-2 truncate" title={r.title}>{r.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{r.description || "No description provided."}</p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} /> {safeDate(r.created_at, "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {published ? "Published" : "Draft"}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{(r.file_type || "file").toUpperCase()} · {formatBytes(r.file_size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-accent/20 text-accent hover:bg-accent hover:text-white" onClick={() => setViewing(r)} title="View Detail"><Eye size={16} /></Button>
                    {r.file_url && (
                      <Button variant="cyan" size="icon" className="h-9 w-9 rounded-xl shadow-lg shadow-accent/20" asChild>
                        <a href={r.file_url} target="_blank" rel="noreferrer" download title="Download"><Download size={16} /></a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FolderOpen size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Resources Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">Refine your search or add a new resource for your visitors.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-accent p-6 text-white h-32 flex flex-col justify-end">
            <DialogTitle className="text-2xl font-black">{editing ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            <p className="text-accent-foreground/70 text-sm font-medium">Fill in the resource details and attach a file.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resource ID</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input
                    placeholder="e.g. RES-001"
                    value={form.resource_code}
                    onChange={e => setForm({ ...form, resource_code: e.target.value })}
                    className="pl-9 h-12 rounded-xl border-muted focus:border-accent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.sort_order}
                  onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="h-12 rounded-xl border-muted focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="e.g. Company Profile Brochure"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="pl-10 h-12 rounded-xl border-muted focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                placeholder="Provide a short description of this resource..."
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="rounded-2xl border-muted focus:border-accent resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attachment</Label>
              <input type="file" hidden ref={fileRef} onChange={uploadFile} />
              <div
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  form.file_url ? "border-accent bg-accent/5" : "border-muted hover:border-accent hover:bg-muted/50"
                }`}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="animate-spin text-accent h-8 w-8 mb-2" />
                ) : form.file_url ? (
                  <>
                    <CheckCircle2 className="text-accent h-8 w-8 mb-2" />
                    <p className="text-xs font-bold text-accent">File Ready</p>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[300px]">{form.file_name || form.file_url.split("/").pop()}</p>
                  </>
                ) : (
                  <>
                    <Archive className="text-muted-foreground h-8 w-8 mb-2" />
                    <p className="text-xs font-medium text-muted-foreground text-center">
                      <span className="text-accent font-bold">Click to Upload</span> PDF, DOCX, ZIP, IMG, etc.<br />
                      Max size 25MB
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border p-4">
              <div>
                <p className="text-sm font-bold text-foreground">Published</p>
                <p className="text-xs text-muted-foreground">When published, this resource is visible on the public Resource Center page.</p>
              </div>
              <Switch checked={!!form.is_published} onCheckedChange={v => setForm({ ...form, is_published: v })} />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 gap-3">
            <Button variant="ghost" className="rounded-xl flex-1 h-12" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="cyan" className="rounded-xl flex-1 h-12 gap-2 shadow-lg shadow-accent/20 font-bold" disabled={saveResource.isPending || !form.title || !form.resource_code} onClick={() => saveResource.mutate()}>
              {saveResource.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {editing ? "Save Changes" : "Save Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-none glass-morphism">
          {viewing && (
            <>
              <div className="bg-[hsl(207,74%,12%)] p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-accent text-xs font-black tracking-widest uppercase mb-2">
                      <Hash size={12} /> {viewing.resource_code}
                    </div>
                    <h2 className="text-3xl font-black mb-1">{viewing.title}</h2>
                    <div className="flex items-center gap-4 text-white/60 text-sm mt-3">
                      <div className="flex items-center gap-1.5"><Clock size={14} /> {safeDate(viewing.created_at, "PPPP")}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                      <FileText size={14} /> Description
                    </h4>
                    <p className="text-foreground/80 leading-relaxed font-medium">
                      {viewing.description || "No description has been provided for this resource."}
                    </p>
                  </div>

                  {viewing.file_url && (
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/20 rounded-xl text-accent">
                          <TypeIcon group={extGroup(viewing.file_type, viewing.file_name || "")} className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{viewing.file_name || "Resource file"}</p>
                          <p className="text-xs text-muted-foreground">{(viewing.file_type || "file").toUpperCase()} · {formatBytes(viewing.file_size)}</p>
                        </div>
                      </div>
                      <Button variant="cyan" size="lg" className="rounded-xl gap-2 font-bold px-8" asChild>
                        <a href={viewing.file_url} target="_blank" rel="noreferrer">View / Download</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.title}</strong> ({deleteTarget?.resource_code}) and remove its attached file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteResource.mutate(deleteTarget.id)}
            >
              {deleteResource.isPending ? "Deleting..." : "Delete Resource"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminResourceCenter;
