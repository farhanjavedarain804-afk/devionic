import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";
import { Star, Send, Loader2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const UserReviews = () => {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myReviews = [], isLoading } = useQuery({
    queryKey: ["user-my-reviews"],
    queryFn: async () => {
      const response = await apiClient.get("/testimonials");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const user = getCurrentUser();
      const response = await apiClient.post("/testimonials", {
        ...newData,
        email: user?.email,
        name: user?.full_name || "User",
        display_id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        is_approved: false,
        is_active: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-my-reviews"] });
      setMessage("");
      setRating(5);
      setIsAdding(false);
      toast({ title: "Review submitted! It will be visible after admin approval." });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to submit review", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    mutation.mutate({ rating, message });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reviews & Testimonials</h2>
          <p className="text-muted-foreground text-sm">Share your experience working with Devionic</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button variant="cyan" className="shadow-lg shadow-accent/20">
              <Star size={18} className="mr-2" /> Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Leave a Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`transition-all hover:scale-110 ${rating >= s ? "text-accent" : "text-muted-foreground/30"}`}
                  >
                    <Star size={32} fill={rating >= s ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Experience</label>
                <Textarea
                  placeholder="Tell us what you think... How was our service?"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>
              <Button variant="cyan" type="submit" className="w-full h-11" disabled={mutation.isPending || !message.trim()}>
                {mutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Send size={18} className="mr-2" /> Post Review
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Quote size={18} className="text-accent" /> Your Past Reviews
        </h3>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : myReviews.length === 0 ? (
          <div className="bg-card/50 rounded-2xl p-12 border border-dashed border-border text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Quote size={32} className="text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm">You haven't posted any reviews yet.</p>
            <Button variant="link" onClick={() => setIsAdding(true)} className="text-accent mt-2">
              Post your first review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myReviews.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl border border-border p-5 relative overflow-hidden group hover:border-accent/30 transition-all">
                {!r.is_approved && (
                  <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider border-l border-b border-yellow-500/10">
                    Pending Approval
                  </div>
                )}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < (r.rating || 5) ? "text-accent fill-accent" : "text-muted-foreground/20"}
                    />
                  ))}
                </div>
                <div className="relative">
                  <Quote size={14} className="absolute -left-1 -top-1 opacity-10 text-accent" />
                  <p className="text-sm text-foreground italic mb-4 line-clamp-4 pl-4 font-medium leading-relaxed">
                    {r.message}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{r.display_id}</span>
                  <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(r.created_at), "PPP")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;
