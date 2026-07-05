import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, X } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (notes: string, attachmentUrls: string[]) => void;
  isPending?: boolean;
  title?: string;
  statusLabel?: string;
}

const StatusUpdateDialog = ({ open, onClose, onSubmit, isPending, title = "Update Status", statusLabel }: StatusUpdateDialogProps) => {
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data && response.data.url) {
          urls.push(response.data.url);
        }
      }
      onSubmit(notes, urls);
      setNotes("");
      setFiles([]);
    } catch (err: any) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setNotes("");
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {statusLabel && (
            <div className="bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-xs text-muted-foreground">Changing status to:</p>
              <p className="text-sm font-bold text-foreground capitalize">{statusLabel}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Note <span className="text-xs text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              placeholder="Add a note about this status change..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Attachment <span className="text-xs text-muted-foreground">(Optional)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) setFiles(Array.from(e.target.files)); }}
            />
            <Button variant="outline" size="sm" className="gap-1" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Choose Files
            </Button>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{f.name}</span>
                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="cyan" onClick={handleSubmit} disabled={isPending || uploading}>
            <Save size={14} /> {uploading ? "Uploading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateDialog;
