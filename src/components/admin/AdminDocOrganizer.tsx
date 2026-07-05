import { useState, useRef } from "react";
import { 
  FileText, Plus, Search, Filter, History, Trash2, 
  Download, Eye, Pencil, FolderPlus, MoreVertical,
  Calendar, Hash, Loader2, Save, X,
  FolderOpen, Layers, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
const glassClass = "bg-[hsl(0,0%,100%)]/80 backdrop-blur-xl border border-border/50";

const AdminDocOrganizer = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addingDoc, setAddingDoc] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    serial_number: "",
    title: "",
    description: "",
    category_id: "",
    file_url: ""
  });
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["doc-categories"],
    queryFn: async () => {
      const resp = await apiClient.get("/document_categories");
      return resp.data || [];
    }
  });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const resp = await apiClient.get("/documents");
      return resp.data || [];
    }
  });

  // Mutations
  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      await apiClient.post("/document_categories", { name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc-categories"] });
      setAddingCat(false);
      toast({ title: "Category Created", description: "New document category has been added." });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" })
  });

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");
      const { data } = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (data && data.url) {
        setForm(prev => ({ ...prev, file_url: data.url }));
        toast({ title: "File Uploaded", description: file.name });
      }
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveDoc = useMutation({
    mutationFn: async () => {
      if (editingDoc) {
        await apiClient.put(`/documents/${editingDoc.id}`, form);
      } else {
        await apiClient.post("/documents", form);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-documents"] });
      setAddingDoc(false);
      setEditingDoc(null);
      setForm({ serial_number: "", title: "", description: "", category_id: "", file_url: "" });
      toast({ title: editingDoc ? "Document Updated" : "Document Added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const deleteDoc = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-documents"] });
      toast({ title: "Document Deleted" });
    }
  });

  const startEdit = (doc: any) => {
    setEditingDoc(doc);
    setForm({
      serial_number: doc.serial_number,
      title: doc.title,
      description: doc.description || "",
      category_id: doc.category_id || "",
      file_url: doc.file_url || ""
    });
    setAddingDoc(true);
  };

  const filtered = documents.filter((d: any) => {
    const matchesSearch = (d.title || "").toLowerCase().includes(search.toLowerCase()) || (d.serial_number || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "all" || d.category_id === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[hsl(207,74%,12%)] flex items-center gap-3">
            <Layers className="text-accent h-8 w-8" />
            Documents <span className="text-accent underline decoration-accent/20">Organizer</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage, categorize and archive business documents systematically.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-[hsl(207,50%,85%)] hover:bg-muted" onClick={() => setAddingCat(true)}>
            <FolderPlus size={18} /> New Category
          </Button>
          <Button variant="cyan" className="rounded-xl h-12 px-8 gap-2 shadow-lg shadow-accent/20" onClick={() => { setEditingDoc(null); setForm({ serial_number: `DOC-${Date.now().toString().slice(-6)}`, title: "", description: "", category_id: "", file_url: "" }); setAddingDoc(true); }}>
            <Plus size={18} /> Add Document
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search by title or serial number..." 
              className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:border-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="h-12 rounded-xl border-transparent bg-muted/50">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-muted-foreground" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-accent h-10 w-10 mb-4" />
            <p className="text-muted-foreground font-medium">Synchronizing Document Engine...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((doc: any, i: number) => (
            <div 
              key={doc.id} 
              className={`${cardClass} flex flex-col group animate-in zoom-in duration-300`} 
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-accent/5 rounded-2xl group-hover:bg-accent/10 transition-colors">
                  <FileText className="text-accent h-6 w-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => startEdit(doc)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive" onClick={() => deleteDoc.mutate(doc.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-accent mb-1">
                  <Hash size={10} /> {doc.serial_number}
                </div>
                <h3 className="text-lg font-bold text-[hsl(207,74%,12%)] leading-tight mb-2 truncate" title={doc.title}>
                  {doc.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                  {doc.description || "No description provided."}
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} /> {safeDate(doc.created_at, "MMM d, yyyy HH:mm")}
                  </div>
                  {doc.category_name && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                      <FolderOpen size={12} /> {doc.category_name}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-accent/20 text-accent hover:bg-accent hover:text-white" onClick={() => setViewingDoc(doc)} title="View Detail">
                    <Eye size={16} />
                  </Button>
                  {doc.file_url && (
                    <Button variant="cyan" size="icon" className="h-9 w-9 rounded-xl shadow-lg shadow-accent/20" asChild>
                      <a href={doc.file_url} target="_blank" rel="noreferrer" download title="Download">
                        <Download size={16} />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FolderOpen size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Documents Found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">Refine your search parameters or start by adding a new document.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={addingDoc} onOpenChange={setAddingDoc}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-accent p-6 text-white h-32 flex flex-col justify-end">
            <DialogTitle className="text-2xl font-black">{editingDoc ? "Edit Document" : "Add New Document"}</DialogTitle>
            <p className="text-accent-foreground/70 text-sm font-medium">Fill in the document metadata securely.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Serial Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input 
                    value={form.serial_number} 
                    onChange={e => setForm({ ...form, serial_number: e.target.value })} 
                    className="pl-9 h-12 rounded-xl border-muted focus:border-accent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                  <SelectTrigger className="h-12 rounded-xl border-muted">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document Title</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  placeholder="e.g. Annual Audit Report 2025" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                  className="pl-10 h-12 rounded-xl border-muted focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description / Notes</label>
              <Textarea 
                placeholder="Provide a brief summary of the document content..." 
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="rounded-2xl border-muted focus:border-accent resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document File</label>
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
                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[300px]">{form.file_url.split('/').pop()}</p>
                  </>
                ) : (
                  <>
                    <Download className="text-muted-foreground h-8 w-8 mb-2" />
                    <p className="text-xs font-medium text-muted-foreground text-center">
                      <span className="text-accent font-bold">Click to Upload</span> PDF, DOC, IMG<br/>
                      Max size 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 gap-3">
            <Button variant="ghost" className="rounded-xl flex-1 h-12" onClick={() => setAddingDoc(false)}>Cancel</Button>
            <Button variant="cyan" className="rounded-xl flex-1 h-12 gap-2 shadow-lg shadow-accent/20 font-bold" disabled={saveDoc.isPending || !form.title || !form.serial_number} onClick={() => saveDoc.mutate()}>
              {saveDoc.isPending ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {editingDoc ? "Save Changes" : "Save Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={addingCat} onOpenChange={setAddingCat}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogTitle className="text-xl font-bold mb-4">New Category</DialogTitle>
          <div className="space-y-4">
            <Input 
              placeholder="e.g. Legal, Finance, HR..." 
              id="cat-name"
              className="h-12 rounded-xl"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  createCategory.mutate(input.value);
                }
              }}
            />
            <Button className="w-full h-12 rounded-xl gap-2 font-bold" onClick={() => {
              const input = document.getElementById("cat-name") as HTMLInputElement;
              createCategory.mutate(input.value);
            }}>
              <Plus size={18} /> Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border-none glass-morphism">
          {viewingDoc && (
            <>
              <div className="bg-[hsl(207,74%,12%)] p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-accent text-xs font-black tracking-widest uppercase mb-2">
                       <Hash size={12} /> {viewingDoc.serial_number}
                    </div>
                    <h2 className="text-3xl font-black mb-1">{viewingDoc.title}</h2>
                    <div className="flex items-center gap-4 text-white/60 text-sm mt-3">
                      <div className="flex items-center gap-1.5"><Calendar size={14} /> {safeDate(viewingDoc.created_at, "PPPP")}</div>
                      {viewingDoc.category_name && <div className="flex items-center gap-1.5"><FolderOpen size={14} /> {viewingDoc.category_name}</div>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/50 hover:text-white" onClick={() => setViewingDoc(null)}><X /></Button>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                       <FileText size={14} /> Description
                    </h4>
                    <p className="text-foreground/80 leading-relaxed font-medium">
                      {viewingDoc.description || "Detailed analysis of this document has not been provided."}
                    </p>
                  </div>
                  
                  {viewingDoc.file_url && (
                    <div className="p-6 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/20 rounded-xl text-accent">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Reference File</p>
                          <p className="text-xs text-muted-foreground">Access the source document</p>
                        </div>
                      </div>
                      <Button variant="cyan" size="lg" className="rounded-xl gap-2 font-bold px-8" asChild>
                        <a href={viewingDoc.file_url} target="_blank" rel="noreferrer">View / Download</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 pt-0 flex justify-between items-center text-xs text-muted-foreground font-medium italic border-t border-border pt-6 mt-2 mx-8 mb-6">
                <span>System ID: {viewingDoc.id}</span>
                <span>Last Modified: {safeDate(viewingDoc.updated_at || viewingDoc.created_at, "HH:mm:ss")}</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocOrganizer;
