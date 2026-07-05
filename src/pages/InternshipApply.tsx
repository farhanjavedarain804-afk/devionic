import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import PhoneInput from "@/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, CheckCircle2, Copy } from "lucide-react";

const InternshipApply = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ application_number: string; } | null>(null);

  const { data: internship, isLoading } = useQuery({
    queryKey: ["internship", id],
    queryFn: async () => {
      if (!id || id === "general") return null;
      const response = await apiClient.get(`/public/internships/${id}`);
      return response.data;
    },
    enabled: !!id && id !== "general",
  });

  const [form, setForm] = useState({
    full_name: "", father_husband_name: "", cnic: "",
    age: "", date_of_birth: "", city: "", tehsil: "", district: "",
    province: "", nationality: "Pakistani", postal_address: "", permanent_address: "",
    email: "", phone1: "", phone2: "", whatsapp: "",
    emergency_contact_number: "", emergency_contact_whatsapp: "",
    emergency_contact_name: "", emergency_contact_relation: "",
    education: "", work_experience: "",
  });

  const [files, setFiles] = useState<Record<string, File | null>>({
    cnic_doc: null, resume_cv: null, experience_letter: null,
    educational_docs: null, other_docs: null, passport_photo: null,
  });

  const set = (key: string, val: string) => {
    const updated = { ...form, [key]: val };
    
    // Auto-calculate age from DOB
    if (key === "date_of_birth") {
      if (!val) {
        updated.age = "";
      } else {
        const dob = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        // Adjust age if birthday hasn't occurred yet this year
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        updated.age = age >= 0 ? age.toString() : "";
      }
    }
    
    setForm(updated);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields = [
      !form.full_name.trim(),
      !form.father_husband_name.trim(),
      !form.cnic.trim(),
      !form.date_of_birth.trim(),
      !form.city.trim(),
      !form.tehsil.trim(),
      !form.district.trim(),
      !form.province.trim(),
      !form.nationality.trim(),
      !form.postal_address.trim(),
      !form.permanent_address.trim(),
      !form.email.trim(),
      !form.phone1.trim(),
      !form.phone2.trim(),
      !form.whatsapp.trim(),
      !form.emergency_contact_name.trim(),
      !form.emergency_contact_relation.trim(),
      !form.emergency_contact_number.trim(),
      !form.emergency_contact_whatsapp.trim(),
      !form.education.trim(),
      !form.work_experience.trim(),
      !files.cnic_doc,
      !files.resume_cv,
      !files.experience_letter,
      !files.educational_docs,
      !files.other_docs,
      !files.passport_photo,
    ].some(Boolean);

    if (missingFields) {
      toast({ title: "Please fill all required fields and upload all documents", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const docUrls: Record<string, string> = {};
      const uploadPromises = Object.entries(files)
        .map(async ([key, file]) => {
          docUrls[key] = await uploadFile(file as File);
        });
      await Promise.all(uploadPromises);

      const payload = {
        ...form,
        ...docUrls,
        age: form.age ? parseInt(form.age) : null,
        date_of_birth: form.date_of_birth || null,
        internship_id: id === "general" ? null : (id || null),
        internship_title: internship?.title || "General Internship Application",
      };

      const response = await apiClient.post("/public/internships/apply", payload);
      setSubmitted({ application_number: response.data.application_number });
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (err as { message?: string }).message
        : "Failed to submit application";
      toast({ title: message || "Failed to submit application", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  if (isLoading) return (
    <Layout><div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={40} /></div></Layout>
  );

  // Success popup
  if (submitted) return (
    <Layout>
      <PageHero title="Application" highlight="Submitted" subtitle="Your internship application has been received successfully!" />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-card rounded-2xl border border-border p-8 text-center space-y-6">
            <CheckCircle2 size={64} className="mx-auto text-[hsl(142,70%,45%)]" />
            <h2 className="text-2xl font-bold text-card-foreground">Internship Application Submitted Successfully!</h2>
            <p className="text-muted-foreground">Your application has been received. You can track your application status using:</p>

            <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Application Number</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-accent font-mono">{submitted.application_number}</span>
                  <button onClick={() => copyToClipboard(submitted.application_number)} className="p-1.5 hover:bg-muted rounded-lg"><Copy size={16} className="text-muted-foreground" /></button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">CNIC</p>
                <span className="text-lg font-semibold text-card-foreground font-mono">{form.cnic}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Save your Application Number and CNIC to check your status from the home page verification section.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/verify" className="flex-1"><Button variant="cyan" className="w-full">Check Status</Button></Link>
              <Link to="/careers" className="flex-1"><Button variant="outline" className="w-full">Back to Careers</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );

  const fileField = (key: string, label: string, accept: string) => (
    <div>
      <label className="text-sm font-medium text-card-foreground mb-1 block">{label} *</label>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer flex-1 flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
          <Upload size={16} className="text-accent shrink-0" />
          <span className="truncate text-muted-foreground">{files[key]?.name || "Choose file..."}</span>
          <input type="file" accept={accept} className="hidden" onChange={e => {
            if (e.target.files?.[0]) setFiles(p => ({ ...p, [key]: e.target.files![0] }));
          }} />
        </label>
        {files[key] && (
          <button type="button" onClick={() => setFiles(p => ({ ...p, [key]: null }))} className="p-2 hover:bg-muted rounded-lg">
            <X size={16} className="text-destructive" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <PageHero title="Apply for" highlight={internship?.title || "Internship"} subtitle={internship ? `${internship.department} · ${internship.location}` : "Submit your internship application"} />

      <section className="py-20 bg-background">
        <div className="mx-auto px-4 lg:px-8 w-[90%] max-w-7xl">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 space-y-8">

            {/* Application Info Header */}
            <div className="flex flex-wrap gap-4 items-center bg-secondary/50 rounded-xl p-4">
              <div>
                <p className="text-xs text-muted-foreground">Internship Position</p>
                <p className="font-bold text-card-foreground">{internship?.title || "General Internship Application"}</p>
              </div>
              {internship && (
                <div>
                  <p className="text-xs text-muted-foreground">Internship ID</p>
                  <p className="font-mono text-sm text-accent font-semibold">{("id_code" in internship && internship.id_code) || id}</p>
                </div>
              )}
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Application Number</p>
                <p className="text-sm text-muted-foreground italic">Generated on submission</p>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4 pb-2 border-b border-border">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Full Name *</label><Input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Your full name" maxLength={100} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Father / Husband Name *</label><Input value={form.father_husband_name} onChange={e => set("father_husband_name", e.target.value)} placeholder="Father / Husband name" maxLength={100} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">CNIC *</label><Input value={form.cnic} onChange={e => set("cnic", e.target.value)} placeholder="XXXXX-XXXXXXX-X" maxLength={15} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Date of Birth *</label><Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Age (auto-calculated) *</label><Input type="number" value={form.age} readOnly placeholder="Auto-calculated from DOB" className="bg-muted cursor-not-allowed" required /></div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4 pb-2 border-b border-border">Address Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">City *</label><Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" maxLength={50} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Tehsil *</label><Input value={form.tehsil} onChange={e => set("tehsil", e.target.value)} placeholder="Tehsil" maxLength={50} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">District *</label><Input value={form.district} onChange={e => set("district", e.target.value)} placeholder="District" maxLength={50} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Province *</label><Input value={form.province} onChange={e => set("province", e.target.value)} placeholder="Province" maxLength={50} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Nationality *</label><Input value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="Nationality" maxLength={50} required /></div>
              </div>
              <div className="grid sm:grid-cols-1 gap-4 mt-4">
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Complete Postal Address *</label><Input value={form.postal_address} onChange={e => set("postal_address", e.target.value)} placeholder="Complete postal address" maxLength={300} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Permanent Address *</label><Input value={form.permanent_address} onChange={e => set("permanent_address", e.target.value)} placeholder="Permanent address" maxLength={300} required /></div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4 pb-2 border-b border-border">Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Email Address *</label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" maxLength={255} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Phone Number 1 *</label><PhoneInput value={form.phone1} onChange={v => set("phone1", v)} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Phone Number 2 *</label><PhoneInput value={form.phone2} onChange={v => set("phone2", v)} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">WhatsApp Number *</label><PhoneInput value={form.whatsapp} onChange={v => set("whatsapp", v)} required /></div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4 pb-2 border-b border-border">Emergency Contact</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Contact Name *</label><Input value={form.emergency_contact_name} onChange={e => set("emergency_contact_name", e.target.value)} placeholder="Emergency contact name" maxLength={100} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Relation *</label><Input value={form.emergency_contact_relation} onChange={e => set("emergency_contact_relation", e.target.value)} placeholder="e.g. Father, Brother" maxLength={50} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Contact Number *</label><PhoneInput value={form.emergency_contact_number} onChange={v => set("emergency_contact_number", v)} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">WhatsApp Number *</label><PhoneInput value={form.emergency_contact_whatsapp} onChange={v => set("emergency_contact_whatsapp", v)} required /></div>
              </div>
            </div>

            {/* Education & Experience */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4 pb-2 border-b border-border">Education & Experience</h3>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Education *</label><Textarea value={form.education} onChange={e => set("education", e.target.value)} placeholder="List your educational qualifications..." rows={4} maxLength={3000} required /></div>
                <div><label className="text-sm font-medium text-card-foreground mb-1 block">Work Experience *</label><Textarea value={form.work_experience} onChange={e => set("work_experience", e.target.value)} placeholder="List your work experience..." rows={4} maxLength={3000} required /></div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-bold text-card-foreground mb-4 pb-2 border-b border-border">Documents</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {fileField("cnic_doc", "CNIC (Front & Back) - PDF", ".pdf")}
                {fileField("resume_cv", "Resume & CV - PDF", ".pdf")}
                {fileField("experience_letter", "Experience Letter - PDF", ".pdf")}
                {fileField("educational_docs", "Educational Documents - PDF", ".pdf")}
                {fileField("other_docs", "Other Documents - PDF", ".pdf")}
                {fileField("passport_photo", "Passport Size Photo (White BG)", ".jpg,.jpeg,.png")}
              </div>
            </div>

            <Button variant="cyan" size="xl" type="submit" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting Application...</> : "Submit Application"}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default InternshipApply;
