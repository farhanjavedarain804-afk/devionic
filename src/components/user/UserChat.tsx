import { useState, useEffect, useRef } from "react";
import apiClient from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/auth";
import { Send, Image as ImageIcon, FileText, Loader2, User, UserCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

const UserChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await apiClient.get("/inquiries");
      const data = response.data;
      
      if (data) {
        // Map inquiries and their resolutions to a chat format
        const allMessages: any[] = [];
        data.forEach((item: any) => {
          // User's original message
          allMessages.push({
            id: item.id,
            message: item.message,
            sender: "user",
            created_at: item.created_at
          });
          
          // Admin's resolution note (as a reply)
          if (item.resolved_notes) {
            allMessages.push({
              id: `${item.id}-reply`,
              message: item.resolved_notes,
              sender: "admin",
              created_at: item.resolved_at || item.created_at
            });
          }
        });
        setMessages(allMessages);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const user = getCurrentUser();
      const response = await apiClient.post("/inquiries", {
        email: user?.email,
        name: user?.full_name || "User",
        message: newMessage,
        subject: "Chat Message",
        status: "pending",
        display_id: `INQ-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      
      setMessages(prev => [...prev, {
        id: response.data.id,
        message: newMessage,
        sender: "user",
        created_at: new Date().toISOString()
      }]);
      setNewMessage("");
    } catch (err: any) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <UserCheck size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm">Admin Support</h3>
          <p className="text-[10px] text-green-500 font-medium">Online</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <MessageSquare size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No messages yet. Start a conversation!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                msg.sender === "user" ? "bg-accent text-accent-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
              }`}>
                {msg.message}
                <p className={`text-[9px] mt-1 opacity-60 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-muted/30">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type your message..." 
            className="bg-background"
          />
          <Button type="submit" variant="cyan" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UserChat;
