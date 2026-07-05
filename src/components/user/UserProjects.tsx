import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { FolderKanban, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const UserProjects = () => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["user-projects"],
    queryFn: async () => {
      const response = await apiClient.get("/projects");
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "text-green-500 bg-green-500/10";
      case "in progress": return "text-blue-500 bg-blue-500/10";
      case "on hold": return "text-yellow-500 bg-yellow-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return <CheckCircle2 size={16} />;
      case "in progress": return <Clock size={16} />;
      case "on hold": return <AlertCircle size={16} />;
      default: return null;
    }
  };

  if (isLoading) return <div className="text-center py-20"><Loader2 size={40} className="animate-spin mx-auto text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Projects</h2>
        <p className="text-muted-foreground text-sm">Track the status of your active and past projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full bg-card rounded-xl p-20 border border-dashed border-border text-center">
            <FolderKanban size={48} className="mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="font-bold text-lg">No projects found</h3>
            <p className="text-muted-foreground text-sm">When you start a project with us, it will appear here.</p>
          </div>
        ) : projects.map((project) => (
          <div key={project.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {project.status}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(project.created_at), "MMM d, yyyy")}</span>
            </div>
            <h3 className="font-bold text-lg mb-2">{project.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-6">{project.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>Start Date</span>
                <span>{format(new Date(project.start_date), "MMM d, yyyy")}</span>
              </div>
              <Progress value={50} className="h-1.5 bg-muted" />
            </div>

            <div className="mt-6 pt-6 border-t border-border flex justify-between items-center text-xs">
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-bold text-foreground">${project.budget || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">End Date</p>
                <p className="font-bold text-foreground">{project.end_date ? format(new Date(project.end_date), "MMM d, yyyy") : "N/A"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProjects;
