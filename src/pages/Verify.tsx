import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Search, Briefcase } from "lucide-react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";

const statusColors: Record<string, string> = {
  pending: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
  under_review: "bg-accent/10 text-accent",
  shortlisted: "bg-[hsl(200,80%,50%)]/10 text-[hsl(200,80%,50%)]",
  interview: "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]",
  hired: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
  rejected: "bg-destructive/10 text-destructive",
};

const Verify = () => {
  const [searchParams] = useSearchParams();
  const verificationId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);
  const [type, setType] = useState<"invoice" | "quotation" | "employee" | null>(null);

  // Application status check
  const [appTab, setAppTab] = useState(false);
  const [appCnic, setAppCnic] = useState("");
  const [appNumber, setAppNumber] = useState("");
  const [appLoading, setAppLoading] = useState(false);
  const [appResult, setAppResult] = useState<any>(null);
  const [appError, setAppError] = useState("");

  useEffect(() => {
    const verifyDoc = async () => {
      if (!verificationId) { setLoading(false); return; }
      try {
        const response = await apiClient.get(`/verify/${verificationId}`);
        setDoc(response.data);
        setType(response.data.type);
      } catch (err) {
        setDoc(null);
      }
      setLoading(false);
    };
    verifyDoc();
  }, [verificationId]);

  const checkApplication = async () => {
    const cnic = appCnic.trim();
    const appNum = appNumber.trim().toUpperCase();
    if (!cnic && !appNum) { setAppError("Please enter CNIC or Application Number"); return; }
    setAppLoading(true); setAppError(""); setAppResult(null);
    
    try {
      const response = await apiClient.get("/applications/status", {
        params: { cnic, appNum }
      });
      setAppResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAppError("No application found. Please check your details and try again.");
      } else {
        setAppError("An error occurred. Please try again.");
      }
    }
    setAppLoading(false);
  };

  return (
    <Layout>
      <PageHero title="Document" highlight="Verification" subtitle="Verify documents and check application status." />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Tab buttons */}
          {!verificationId && (
            <div className="flex gap-2 mb-8">
              <Button variant={!appTab ? "cyan" : "outline"} onClick={() => setAppTab(false)} className="flex-1">
                <Search size={16} /> Document Verification
              </Button>
              <Button variant={appTab ? "cyan" : "outline"} onClick={() => setAppTab(true)} className="flex-1">
                <Briefcase size={16} /> Application Status
              </Button>
            </div>
          )}

          {/* Application Status Check */}
          {appTab && !verificationId && (
            <div className="bg-card rounded-xl p-8 border border-border space-y-4">
              <h2 className="text-xl font-bold text-card-foreground mb-2">Check Application Status</h2>
              <p className="text-sm text-muted-foreground mb-4">Enter your CNIC or Application Number (or both) to check status.</p>
              <Input placeholder="CNIC (e.g. XXXXX-XXXXXXX-X)" value={appCnic} onChange={e => setAppCnic(e.target.value)} maxLength={15} />
              <Input placeholder="Application Number (e.g. APP-0001)" value={appNumber} onChange={e => setAppNumber(e.target.value)} maxLength={20} />
              <Button variant="cyan" className="w-full" onClick={checkApplication} disabled={appLoading}>
                {appLoading ? <><Loader2 size={16} className="animate-spin" /> Checking...</> : "Check Status"}
              </Button>

              {appError && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{appError}</div>
              )}

              {appResult && (
                <div className="bg-secondary/50 rounded-xl p-6 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-card-foreground">Application Found</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusColors[appResult.status] || "bg-muted text-muted-foreground"}`}>
                      {appResult.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-sm space-y-1.5">
                    <p><span className="text-muted-foreground">Application #:</span> <span className="font-semibold text-card-foreground">{appResult.application_number}</span></p>
                    <p><span className="text-muted-foreground">Name:</span> <span className="text-card-foreground">{appResult.full_name}</span></p>
                    <p><span className="text-muted-foreground">Position:</span> <span className="text-card-foreground">{appResult.job_title}</span></p>
                    <p><span className="text-muted-foreground">Applied:</span> <span className="text-card-foreground">{new Date(appResult.created_at).toLocaleDateString()}</span></p>
                    {appResult.status === "hired" && appResult.employee_id && (
                      <p><span className="text-muted-foreground">Employee ID:</span> <span className="font-bold text-accent">{appResult.employee_id}</span></p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document Verification */}
          {(!appTab || verificationId) && (
            <>
              {loading ? (
                <div className="text-center py-16"><Loader2 className="animate-spin mx-auto text-accent" size={40} /></div>
              ) : doc && type ? (
                <div className="bg-card rounded-xl p-8 border border-border text-center">
                  <CheckCircle2 size={48} className="mx-auto text-[hsl(142,70%,45%)] mb-4" />
                  <h2 className="text-xl font-bold text-card-foreground mb-2">
                    {type === "employee" ? "Employee Verified ✓" : "Document Verified ✓"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {type === "employee"
                      ? "This is a verified employee of Devionic (Private) Limited."
                      : "This is a genuine document issued by Devionic (Private) Limited."}
                  </p>
                  <div className="text-left space-y-2 text-sm">
                    {type === "employee" ? (
                      <>
                        <p><span className="text-muted-foreground">Name:</span> <span className="font-semibold text-card-foreground">{doc.full_name}</span></p>
                        <p><span className="text-muted-foreground">Position:</span> <span className="text-card-foreground">{doc.job_title}</span></p>
                        <p><span className="text-muted-foreground">Employee ID:</span> <span className="font-bold text-accent">{doc.employee_id}</span></p>
                        <p><span className="text-muted-foreground">Status:</span> <span className="text-[hsl(142,70%,45%)] font-bold">Active Employee</span></p>
                      </>
                    ) : (
                      <>
                        <p><span className="text-muted-foreground">Type:</span> <span className="font-semibold text-card-foreground capitalize">{type}</span></p>
                        <p><span className="text-muted-foreground">Number:</span> <span className="font-semibold text-card-foreground">{type === "invoice" ? doc.invoice_number : doc.quotation_number}</span></p>
                        <p><span className="text-muted-foreground">Client:</span> <span className="text-card-foreground">{doc.client_name}</span></p>
                        <p><span className="text-muted-foreground">Total:</span> <span className="font-bold text-card-foreground">{Number(doc.total).toLocaleString()} {doc.currency}</span></p>
                        <p><span className="text-muted-foreground">Status:</span> <span className="text-card-foreground capitalize">{doc.status}</span></p>
                        <p><span className="text-muted-foreground">Date:</span> <span className="text-card-foreground">{new Date(doc.created_at).toLocaleDateString()}</span></p>
                      </>
                    )}
                  </div>
                </div>
              ) : !verificationId ? (
                <div className="bg-card rounded-xl p-8 border border-border text-center">
                  <Search size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold text-card-foreground mb-2">Enter Verification ID</h2>
                  <p className="text-muted-foreground mb-4">Use the verification link or QR code on your document to verify its authenticity.</p>
                </div>
              ) : (
                <div className="bg-card rounded-xl p-8 border border-border text-center">
                  <XCircle size={48} className="mx-auto text-destructive mb-4" />
                  <h2 className="text-xl font-bold text-card-foreground mb-2">Verification Failed</h2>
                  <p className="text-muted-foreground">No document found with this verification ID. Please check and try again.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Verify;
