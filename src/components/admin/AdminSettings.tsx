import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Settings, Shield, AlertTriangle, Construction, Building2, 
  Phone, Mail, MapPin, Banknote, Save, Loader2, Plus, 
  Trash2, Globe, Laptop, Bell, Database, Lock, 
  Image as ImageIcon, Share2, Facebook, Twitter, Instagram, Linkedin,
  ChevronRight, Sparkles, Wand2, Monitor, Inbox
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const cardClass = "bg-[hsl(0,0%,100%)] rounded-3xl p-8 border border-border shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-accent/5";
const glassClass = "bg-[hsl(0,0%,100%)]/70 backdrop-blur-xl border border-border/50 rounded-3xl p-8";

interface BankAccount {
  id: string;
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  branch_code: string;
  is_default: boolean;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pendingValue, setPendingValue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    company_name: "DEVIONIC (PRIVATE) LIMITED",
    company_tagline: "Inspiring Innovation Digitally",
    company_address: "Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450",
    company_phone: "+92-317-7121841",
    company_email: "info@devionic.com",
    company_website: "www.devionic.com",
    company_whatsapp: "+923177121841",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    primary_color: "hsl(174, 100%, 40%)",
    logo_url: "",
    favicon_url: "",
    enable_2fa: "true",
    smtp_host: "smtp.gmail.com",
    smtp_port: "465",
    smtp_user: "",
    smtp_pass: "",
    smtp_secure: "true",
    smtp_from_name: "Devionic Support",
    email_welcome: "true",
    email_quote_req: "true",
    email_invoice: "true",
    email_quotation: "true",
    email_booking: "true",
    email_complaint: "true",
    admin_notification_email: "",
    rate_limit_attempts: "5",
    rate_limit_window: "15",
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const response = await apiClient.get("/site_settings");
      return response.data || [];
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const getValue = (key: string, defaultValue: string) => {
        const setting = settings.find((s: any) => s.key === key);
        return setting?.value || defaultValue;
      };

      setForm({
        company_name: getValue("company_name", "DEVIONIC (PRIVATE) LIMITED"),
        company_tagline: getValue("company_tagline", "Inspiring Innovation Digitally"),
        company_address: getValue("company_address", "Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450"),
        company_phone: getValue("company_phone", "+92-317-7121841"),
        company_email: getValue("company_email", "info@devionic.com"),
        company_website: getValue("company_website", "www.devionic.com"),
        company_whatsapp: getValue("company_whatsapp", "+923177121841"),
        facebook_url: getValue("facebook_url", ""),
        twitter_url: getValue("twitter_url", ""),
        instagram_url: getValue("instagram_url", ""),
        linkedin_url: getValue("linkedin_url", ""),
        primary_color: getValue("primary_color", "hsl(174, 100%, 40%)"),
        logo_url: getValue("logo_url", ""),
        favicon_url: getValue("favicon_url", ""),
        enable_2fa: getValue("enable_2fa", "true"),
        smtp_host: getValue("smtp_host", "smtp.gmail.com"),
        smtp_port: getValue("smtp_port", "465"),
        smtp_user: getValue("smtp_user", ""),
        smtp_pass: getValue("smtp_pass", ""),
        smtp_secure: getValue("smtp_secure", "true"),
        smtp_from_name: getValue("smtp_from_name", "Devionic Support"),
        email_welcome: getValue("email_welcome", "true"),
        email_quote_req: getValue("email_quote_req", "true"),
        email_invoice: getValue("email_invoice", "true"),
        email_quotation: getValue("email_quotation", "true"),
        email_booking: getValue("email_booking", "true"),
        email_complaint: getValue("email_complaint", "true"),
        admin_notification_email: getValue("admin_notification_email", ""),
        rate_limit_attempts: getValue("rate_limit_attempts", "5"),
        rate_limit_window: getValue("rate_limit_window", "15"),
      });

      const bankAccountsStr = getValue("bank_accounts", "[]");
      try {
        const parsed = JSON.parse(bankAccountsStr);
        setBankAccounts(Array.isArray(parsed) ? parsed : []);
      } catch {
        setBankAccounts([]);
      }
    }
  }, [settings]);

  const maintenanceMode = settings.find((s: any) => s.key === "maintenance_mode")?.value === "true";

  const toggleMaintenance = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiClient.post("/site_settings/upsert", { key: "maintenance_mode", value: String(enabled) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setConfirmDialog(false);
      toast({ title: pendingValue ? "Maintenance mode enabled" : "Maintenance mode disabled" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(form).map(([key, value]) => 
        apiClient.post("/site_settings/upsert", { key, value: String(value).trim() })
      );
      await Promise.all(promises);
      await apiClient.post("/site_settings/upsert", { key: "bank_accounts", value: JSON.stringify(bankAccounts) });
      
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Configuration Updated", description: "All system settings have been synchronized successfully." });
    } catch (err: any) {
      toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "Business Profile", icon: Building2 },
    { id: "branding", label: "Visual Identity", icon: Sparkles },
    { id: "banking", label: "Financial Accounts", icon: Banknote },
    { id: "automation", label: "Automation & Email", icon: Bell },
    { id: "social", label: "Social Presence", icon: Share2 },
    { id: "system", label: "System Control", icon: Laptop },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-accent h-12 w-12 mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Initializing System Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[hsl(207,74%,12%)] tracking-tight">
            Environment <span className="text-accent">Settings</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-2">Scale and customize your enterprise operations from one central cockpit.</p>
        </div>
        <Button variant="cyan" size="lg" className="rounded-2xl h-14 px-10 gap-2 shadow-2xl shadow-accent/20 font-bold" onClick={saveSettings} disabled={isSaving}>
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Synchronize Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                activeTab === tab.id 
                ? "bg-accent text-white shadow-lg shadow-accent/20" 
                : "hover:bg-white text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={20} className={activeTab === tab.id ? "" : "group-hover:text-accent transition-colors"} />
                <span className="font-bold text-sm">{tab.label}</span>
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-all"} />
            </button>
          ))}
          
          <div className="mt-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 space-y-4">
             <div className="flex items-center gap-2 text-amber-600">
               <AlertTriangle size={18} />
               <span className="text-xs font-black uppercase tracking-wider">Critical Warning</span>
             </div>
             <p className="text-[11px] leading-relaxed text-amber-800 font-medium">Changes made here are global and will affect all public-facing services immediately. Proceed with caution.</p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === "general" && (
            <div className={`${cardClass} space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <Building2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">Business Profile</h3>
                    <p className="text-sm text-muted-foreground">Official identity and contact parameters.</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Corporate Name</Label>
                    <Input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="h-12 rounded-xl" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Brand Tagline</Label>
                    <Input value={form.company_tagline} onChange={e => setForm({...form, company_tagline: e.target.value})} className="h-12 rounded-xl" />
                 </div>
                 <div className="md:col-span-2 space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Headquarters Address</Label>
                    <Textarea value={form.company_address} onChange={e => setForm({...form, company_address: e.target.value})} className="rounded-xl min-h-[100px]" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Switchboard Phone</Label>
                    <Input value={form.company_phone} onChange={e => setForm({...form, company_phone: e.target.value})} className="h-12 rounded-xl font-mono" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Corporate Email</Label>
                    <Input value={form.company_email} onChange={e => setForm({...form, company_email: e.target.value})} className="h-12 rounded-xl font-mono" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Official Website</Label>
                    <Input value={form.company_website} onChange={e => setForm({...form, company_website: e.target.value})} className="h-12 rounded-xl font-mono" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Customer Support WhatsApp</Label>
                    <Input value={form.company_whatsapp} onChange={e => setForm({...form, company_whatsapp: e.target.value})} className="h-12 rounded-xl font-mono" />
                 </div>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className={`${cardClass} space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
                <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                    <Sparkles size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">Visual Identity</h3>
                    <p className="text-sm text-muted-foreground">Manage your brand's digital presence assets.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Primary Brand Color</Label>
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl shadow-inner border border-border" style={{ backgroundColor: form.primary_color }} />
                       <Input value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} className="h-14 rounded-xl flex-1 font-mono uppercase" />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Brand Logo URL</Label>
                        <div className="flex gap-2">
                            <Input placeholder="https://..." value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} className="h-12 rounded-xl" />
                            <Button variant="outline" className="h-12 rounded-xl"><ImageIcon size={18} /></Button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Site Favicon URL</Label>
                        <div className="flex gap-2">
                            <Input placeholder="https://..." value={form.favicon_url} onChange={e => setForm({...form, favicon_url: e.target.value})} className="h-12 rounded-xl" />
                            <Button variant="outline" className="h-12 rounded-xl"><Globe size={18} /></Button>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 p-8 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-muted/50">
                 <Wand2 className="text-accent h-10 w-10" />
                 <h4 className="text-lg font-bold">Dynamic Preview</h4>
                 <p className="text-xs text-muted-foreground font-medium max-w-sm">Brand customization will reflect across the customer portal, client dashboard, and invoice templates once synchronized.</p>
              </div>
            </div>
          )}

          {activeTab === "banking" && (
             <div className={`${cardClass} space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Financial Accounts</h3>
                            <p className="text-sm text-muted-foreground">Bank channels for receiving secure payments.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold gap-2" onClick={() => {
                        setBankAccounts([...bankAccounts, {
                            id: crypto.randomUUID(), bank_name: "", account_title: "",
                            account_number: "", iban: "", branch_code: "",
                            is_default: bankAccounts.length === 0
                        }]);
                    }}>
                        <Plus size={16} /> Add Channel
                    </Button>
                </div>

                <div className="space-y-4">
                    {bankAccounts.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-muted/20">
                            <Database size={40} className="text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground font-medium">No active payment channels configured.</p>
                        </div>
                    ) : (
                        bankAccounts.map((account, idx) => (
                            <div key={account.id} className={`p-6 rounded-3xl border transition-all ${account.is_default ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border bg-white hover:border-accent/40'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                                        {account.is_default && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-accent text-white rounded-full">Default Channel</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        {!account.is_default && <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold" onClick={() => {
                                            setBankAccounts(bankAccounts.map(a => ({...a, is_default: a.id === account.id})));
                                        }}>Set Default</Button>}
                                        <Button variant="ghost" size="sm" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setBankAccounts(bankAccounts.filter(a => a.id !== account.id))}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Bank Institution</Label>
                                        <Input placeholder="Standard Chartered" value={account.bank_name} onChange={e => setBankAccounts(bankAccounts.map(a => a.id === account.id ? {...a, bank_name: e.target.value} : a))} className="h-10 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Account Title</Label>
                                        <Input placeholder="Business Ventures Ltd" value={account.account_title} onChange={e => setBankAccounts(bankAccounts.map(a => a.id === account.id ? {...a, account_title: e.target.value} : a))} className="h-10 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Account Number</Label>
                                        <Input placeholder="000-111-222-333" value={account.account_number} onChange={e => setBankAccounts(bankAccounts.map(a => a.id === account.id ? {...a, account_number: e.target.value} : a))} className="h-10 rounded-lg font-mono" />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">International Bank Account Number (IBAN)</Label>
                                        <Input placeholder="PK00SCBLXXXXXXXX" value={account.iban} onChange={e => setBankAccounts(bankAccounts.map(a => a.id === account.id ? {...a, iban: e.target.value.toUpperCase()} : a))} className="h-10 rounded-lg font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Branch Sort Code</Label>
                                        <Input placeholder="0123" value={account.branch_code} onChange={e => setBankAccounts(bankAccounts.map(a => a.id === account.id ? {...a, branch_code: e.target.value} : a))} className="h-10 rounded-lg font-mono" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
             </div>
          )}

          {activeTab === "automation" && (
             <div className={`${cardClass} space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Automation & Security</h3>
                        <p className="text-sm text-muted-foreground">Configure SMTP nodes and global authentication protocols.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Lock className="text-indigo-600" size={18} />
                                    <h4 className="font-bold">Global 2FA</h4>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">OTP verification for all accounts.</p>
                            </div>
                            <Switch checked={form.enable_2fa === "true"} onCheckedChange={v => setForm({...form, enable_2fa: String(v)})} className="data-[state=checked]:bg-indigo-600" />
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-indigo-600">
                                <Shield size={18} />
                                Security Rate Limits
                            </h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-black text-muted-foreground">Max Failed Attempts</Label>
                                    <Input type="number" min="1" value={form.rate_limit_attempts} onChange={e => setForm({...form, rate_limit_attempts: e.target.value})} className="h-10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-black text-muted-foreground">Lockout Window (Minutes)</Label>
                                    <Input type="number" min="1" value={form.rate_limit_window} onChange={e => setForm({...form, rate_limit_window: e.target.value})} className="h-10 rounded-xl" />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic mt-2">Temporarily blocks IP and Email from login/signup after reaching the maximum failed attempts within the specified window.</p>
                            </div>
                        </div>

                        <div className="md:col-span-2 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-indigo-600">
                                <Inbox size={18} />
                                Dispatch Rules
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { key: 'email_welcome', label: 'Welcome Emails' },
                                    { key: 'email_quote_req', label: 'Quote Confirmation' },
                                    { key: 'email_invoice', label: 'Invoice Generation' },
                                    { key: 'email_quotation', label: 'Quotation Generation' },
                                    { key: 'email_booking', label: 'Booking Alerts' },
                                    { key: 'email_complaint', label: 'Complaint Status' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between group">
                                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-indigo-600 transition-colors">{item.label}</span>
                                        <Switch 
                                            size="sm"
                                            checked={(form as any)[item.key] === "true"} 
                                            onCheckedChange={v => setForm({...form, [item.key]: String(v)})} 
                                            className="data-[state=checked]:bg-indigo-600 scale-75 origin-right"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-indigo-100">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600/60 mb-6 flex items-center gap-2">
                            <Monitor size={14} /> SMTP Configuration Node
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">SMTP Host</Label>
                            <Input placeholder="smtp.gmail.com" value={form.smtp_host} onChange={e => setForm({...form, smtp_host: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">SMTP Port</Label>
                            <Input placeholder="465" value={form.smtp_port} onChange={e => setForm({...form, smtp_port: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">SMTP Username</Label>
                            <Input placeholder="user@example.com" value={form.smtp_user} onChange={e => setForm({...form, smtp_user: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">SMTP Password / App Key</Label>
                            <Input type="password" placeholder="••••••••••••" value={form.smtp_pass} onChange={e => setForm({...form, smtp_pass: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Sender Display Name</Label>
                            <Input placeholder="Devionic Admin" value={form.smtp_from_name} onChange={e => setForm({...form, smtp_from_name: e.target.value})} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Secure Connection (SSL)</Label>
                            <Select value={form.smtp_secure} onValueChange={v => setForm({...form, smtp_secure: v})}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Encrypted (SSL/TLS)</SelectItem>
                                    <SelectItem value="false">Unencrypted (Standard)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-3 pt-6 border-t border-indigo-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Bell className="text-indigo-600" size={16} />
                                <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Admin Notification Target</Label>
                            </div>
                            <Input 
                                placeholder="admin@devionic.com" 
                                value={form.admin_notification_email} 
                                onChange={e => setForm({...form, admin_notification_email: e.target.value})} 
                                className="h-14 rounded-2xl border-indigo-200 bg-indigo-50/30 focus:ring-accent" 
                            />
                            <p className="text-[10px] text-muted-foreground font-medium italic">All security alerts, login notifications, and form submissions will be dispatched to this address.</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "social" && (
             <div className={`${cardClass} space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Share2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Social Presence</h3>
                        <p className="text-sm text-muted-foreground">Connect and sync your corporate social media handles.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]"><Facebook size={12} /></div>
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Facebook Profile</Label>
                        </div>
                        <Input placeholder="facebook.com/yourbrand" value={form.facebook_url} onChange={e => setForm({...form, facebook_url: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2]"><Twitter size={12} /></div>
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">X / Twitter Handle</Label>
                        </div>
                        <Input placeholder="x.com/yourbrand" value={form.twitter_url} onChange={e => setForm({...form, twitter_url: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F]"><Instagram size={12} /></div>
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Instagram Feed</Label>
                        </div>
                        <Input placeholder="instagram.com/yourbrand" value={form.instagram_url} onChange={e => setForm({...form, instagram_url: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2]"><Linkedin size={12} /></div>
                            <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">LinkedIn Company Page</Label>
                        </div>
                        <Input placeholder="linkedin.com/company/yourbrand" value={form.linkedin_url} onChange={e => setForm({...form, linkedin_url: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                </div>
             </div>
          )}

          {activeTab === "system" && (
            <div className={`${cardClass} space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-12 w-12 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                    <Monitor size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">System Control</h3>
                    <p className="text-sm text-muted-foreground">High-level environment management.</p>
                 </div>
              </div>

              <div className="p-8 rounded-[40px] border-2 border-[hsl(40,90%,55%)]/20 bg-amber-50/50 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <Construction className="text-amber-600" size={20} />
                        <h4 className="text-lg font-black text-amber-800">Global Maintenance Mode</h4>
                     </div>
                     <p className="text-sm text-amber-700/70 font-medium">When enabled, only administrators can access the website. Visitors will be greeted by a "Service Under Maintenance" portal.</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={(v) => { setPendingValue(v); setConfirmDialog(true); }} className="data-[state=checked]:bg-amber-600" />
                </div>
                
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${maintenanceMode ? 'bg-amber-600/10 text-amber-600' : 'bg-emerald-600/10 text-emerald-600'}`}>
                   {maintenanceMode ? <AlertTriangle size={16} /> : <Shield size={16} />}
                   {maintenanceMode ? "SYSTEM IS CURRENTLY SEALED FOR MAINTENANCE" : "SYSTEM IS FULLY OPERATIONAL AND PUBLICLY ACCESSIBLE"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-3xl bg-muted/40 border border-border group hover:border-accent/40 transition-all">
                   <Bell className="text-muted-foreground mb-3 group-hover:text-accent" />
                   <h5 className="font-bold mb-1">Notifications</h5>
                   <p className="text-[10px] text-muted-foreground font-medium">Manage how the system alerts you about critical events.</p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/40 border border-border group hover:border-accent/40 transition-all">
                   <Lock className="text-muted-foreground mb-3 group-hover:text-accent" />
                   <h5 className="font-bold mb-1">Security Audit</h5>
                   <p className="text-[10px] text-muted-foreground font-medium">Configure firewall rules and administrative access logs.</p>
                </div>
                <div className="p-6 rounded-3xl bg-muted/40 border border-border group hover:border-accent/40 transition-all">
                   <Database className="text-muted-foreground mb-3 group-hover:text-accent" />
                   <h5 className="font-bold mb-1">System Backup</h5>
                   <p className="text-[10px] text-muted-foreground font-medium">Schedule automated database and asset backups to S3.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

       {/* Confirm Dialog */}
       <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="sm:max-w-md rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
          <div className={`p-8 ${pendingValue ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              {pendingValue ? <Construction size={28} /> : <Shield size={28} />}
              System Status Shift
            </DialogTitle>
          </div>
          <div className="p-8 space-y-4">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {pendingValue
                ? "Switching to maintenance mode will immediately block access for all visitors. This is typically used for system upgrades or critical emergency repairs."
                : "Terminating maintenance mode will restore global access. The website will become live in all regions immediately."}
            </p>
            <div className="bg-muted p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
               <AlertTriangle size={14} className="text-amber-600" />
               THIS ACTION IS LOGGED IN THE AUDIT TRAIL
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 gap-3">
             <Button variant="ghost" className="rounded-2xl h-12 flex-1" onClick={() => setConfirmDialog(false)}>Cancel Operation</Button>
             <Button
                variant={pendingValue ? "destructive" : "cyan"}
                className="rounded-2xl h-12 flex-1 font-black shadow-lg"
                onClick={() => toggleMaintenance.mutate(pendingValue)}
                disabled={toggleMaintenance.isPending}
              >
                {toggleMaintenance.isPending ? <Loader2 className="animate-spin" /> : (pendingValue ? "SEAL SYSTEM" : "GO LIVE")}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
