import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Download, Search, FileText, FileArchive, FileType2, FileSpreadsheet,
  Image as ImageIcon, FolderOpen, Loader2, BookOpen, FileCheck2, ShieldCheck, Globe
} from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import apiClient from "@/lib/apiClient";
import { format, isValid } from "date-fns";
import ContentContainer from "@/components/ContentContainer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const cards = [
  { icon: BookOpen, title: "Knowledge Hub", desc: "Brochures, guides, and company materials" },
  { icon: FileCheck2, title: "Always Updated", desc: "Fresh resources published regularly" },
  { icon: ShieldCheck, title: "Safe Downloads", desc: "Every file is scanned before publishing" },
  { icon: Globe, title: "Open Access", desc: "Free to browse and download for everyone" },
];

interface Resource {
  id: string;
  resource_code: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

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
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const safeDate = (date: string | Date | null | undefined) => {
  const d = new Date(date as string);
  if (!isValid(d)) return "";
  return format(d, "MMM d, yyyy");
};

const ResourceCenter = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["public-resources"],
    queryFn: async () => {
      const resp = await apiClient.get("/public/resources");
      return Array.isArray(resp.data) ? resp.data : [];
    },
  });

  // Build the list of available file types from the data for filter chips
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    resources.forEach(r => {
      const g = extGroup(r.file_type, r.file_name || "");
      if (g === "image") set.add("image");
      else if (r.file_type) set.add(r.file_type.toLowerCase());
    });
    return Array.from(set);
  }, [resources]);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      const matchesSearch = (r.title || "").toLowerCase().includes(search.toLowerCase())
        || (r.resource_code || "").toLowerCase().includes(search.toLowerCase())
        || (r.description || "").toLowerCase().includes(search.toLowerCase());
      const g = extGroup(r.file_type, r.file_name || "");
      const matchesType = filterType === "all"
        || (filterType === "image" ? g === "image" : (r.file_type || "").toLowerCase() === filterType);
      return matchesSearch && matchesType;
    });
  }, [resources, search, filterType]);

  const isPreviewable = (fileType: string, fileName: string) => {
    const g = extGroup(fileType, fileName);
    return g === "image" || (fileType || "").toLowerCase() === "pdf";
  };

  return (
    <Layout>
      <PageHero title="Resource" highlight="Center" subtitle="Browse and download our latest brochures, guides, and company materials." />

      <section className="py-12 bg-background">
        <ContentContainer variant="default">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="p-6 bg-card rounded-xl border border-border text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                  <item.icon size={22} className="text-accent" />
                </div>
                <h3 className="font-semibold text-card-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 bg-secondary/50">
        <ContentContainer variant="default">
          {/* Toolbar */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-10 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search resources by title, ID, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-12 rounded-xl bg-muted/50 border border-transparent focus:border-accent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 h-9 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${filterType === "all" ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
              >
                All
              </button>
              {availableTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 h-9 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${filterType === t ? "bg-accent text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-accent h-10 w-10 mb-4" />
              <p className="text-muted-foreground font-medium">Loading resources...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r, i) => {
                const g = extGroup(r.file_type, r.file_name || "");
                const previewable = isPreviewable(r.file_type, r.file_name || "");
                return (
                  <motion.div
                    key={r.id}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="bg-card rounded-2xl border border-border p-6 flex flex-col hover:shadow-xl hover:shadow-accent/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-accent/10 rounded-2xl">
                        <TypeIcon group={g} className="text-accent h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-accent/5 text-accent">
                        {(r.file_type || "file").toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-accent mb-1">
                      <span>{r.resource_code || "—"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-card-foreground leading-tight mb-2 line-clamp-2" title={r.title}>
                      {r.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-5 flex-1">
                      {r.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span>{formatBytes(r.file_size) || "—"}</span>
                      {r.created_at && <span>{safeDate(r.created_at)}</span>}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      {previewable && r.file_url && (
                        <a
                          href={r.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-accent/20 text-accent text-sm font-bold hover:bg-accent/5 transition-colors"
                        >
                          <FileText size={16} /> Preview
                        </a>
                      )}
                      {r.file_url && (
                        <a
                          href={r.file_url}
                          download
                          className={`inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 ${previewable ? "flex-1" : "w-full"}`}
                        >
                          <Download size={16} /> Download
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FolderOpen size={40} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {search || filterType !== "all" ? "No Matching Resources" : "No Resources Available"}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">
                {search || filterType !== "all"
                  ? "Try a different search term or filter."
                  : "Please check back soon — new resources are added regularly."}
              </p>
            </div>
          )}
        </ContentContainer>
      </section>
    </Layout>
  );
};

export default ResourceCenter;
