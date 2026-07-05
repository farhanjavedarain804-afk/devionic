import { useState } from "react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, Search, X, Loader2, Users, Clock, CheckCircle2, XCircle, Star, Briefcase, Trash2, Edit2, Save, FileText } from "lucide-react";
import StatsCard from "./StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { generateDocNumber, addPdfHeader, addPdfFooter, addBorderToAllPages, addPageBorder, addApplicationFooter, addApplicationHeader, formatDateSafe } from "@/lib/pdf-utils";


const cardClass = "bg-[hsl(0,0%,100%)] rounded-2xl p-6 border border-border";
const statusColors: Record<string, string> = {
  pending: "bg-[hsl(40,90%,55%)]/10 text-[hsl(40,90%,55%)]",
  under_review: "bg-accent/10 text-accent",
  shortlisted: "bg-[hsl(200,80%,50%)]/10 text-[hsl(200,80%,50%)]",
  interview: "bg-[hsl(270,60%,55%)]/10 text-[hsl(270,60%,55%)]",
  hired: "bg-[hsl(142,70%,45%)]/10 text-[hsl(142,70%,45%)]",
  rejected: "bg-destructive/10 text-destructive",
};

const statuses = ["pending", "under_review", "shortlisted", "interview", "hired", "rejected"];

const AdminApplications = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{ open: boolean; app: any; newStatus: string }>({ open: false, app: null, newStatus: "" });
  const [statusNote, setStatusNote] = useState("");
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");


  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const response = await apiClient.get("/applications");
      // Backend returns a paginated object: { data: [...], meta: {...} }
      // Extract the inner data array; fall back gracefully for non-paginated responses
      const result = response.data;
      if (Array.isArray(result)) return result;
      if (result && Array.isArray(result.data)) return result.data;
      return [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, employee_id, note }: { id: string; status: string; employee_id?: string; note?: string }) => {
      const update: any = { status };
      if (employee_id) update.employee_id = employee_id;
      if (note) update.note = note;
      await apiClient.patch(`/applications/${id}`, update);
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["admin-applications"] }); 
      qc.invalidateQueries({ queryKey: ["application-history"] });
      toast({ title: "Status updated" }); 
      setStatusModal({ open: false, app: null, newStatus: "" });
      setStatusNote("");
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const { data: history = [] } = useQuery({
    queryKey: ["application-history", viewingId],
    queryFn: async () => {
      if (!viewingId) return [];
      const response = await apiClient.get(`/application_status_history/${viewingId}`);
      return response.data || [];
    },
    enabled: !!viewingId,
  });

  const updateHistory = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiClient.patch(`/application_status_history/${id}`, { note });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["application-history"] });
      toast({ title: "History updated" });
      setEditingHistoryId(null);
    },
  });

  const deleteHistory = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/application_status_history/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["application-history"] });
      toast({ title: "History deleted" });
    },
  });


  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Application deleted successfully" });
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const formatDateToDMY = (dateStr: string) => formatDateSafe(dateStr, "dd-MM-yyyy");

  const handleStatusChange = (app: any, newStatus: string) => {
    setStatusModal({ open: true, app, newStatus });
  };

  const confirmStatusChange = () => {
    const { app, newStatus } = statusModal;
    if (!app) return;

    if (newStatus === "hired") {
      const empCount = applications.filter(a => a.status === "hired").length;
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear()}`;
      const employee_id = `DEV-${dateStr}-EMP-${String(empCount + 1).padStart(4, "0")}`;
      updateStatus.mutate({ id: app.id, status: newStatus, employee_id, note: statusNote });
    } else {
      updateStatus.mutate({ id: app.id, status: newStatus, note: statusNote });
    }
  };


  const generateWelcomeLetter = async (app: any) => {
    setGenerating(app.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const docNum = generateDocNumber(applications.filter(a => a.status === "hired").indexOf(app) + 1, "EMP");
      const verifyUrl = `${window.location.origin}/verify?id=${app.verification_id}`;

      let y = await addPdfHeader(doc, docNum, { title: "WELCOME LETTER", verifyUrl });
      y += 5;

      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const today = formatDateSafe(new Date(), "PPP");
      doc.text(`Date: ${today}`, margin, y);
      y += 8;
      doc.text(`Employee ID: ${app.employee_id || "N/A"}`, margin, y);
      y += 8;
      doc.text(`Application #: ${app.application_number}`, margin, y);
      y += 12;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Dear ${app.full_name},`, margin, y);
      y += 10;

      const welcomeText = `We are pleased to inform you that you have been selected for the position of ${app.job_title} at Devionic (Private) Limited. We welcome you to our team and look forward to your valuable contributions to the organization.\n\nYour details are as follows:\n\nEmployee ID: ${app.employee_id || "N/A"}\nPosition: ${app.job_title}\nCNIC: ${app.cnic}\n\nPlease report to our Head Office at Head Office-Devionic Multan Road Chowk Azam, Tehsil & District Layyah, Punjab, Pakistan Postal Code 31450 at the earliest convenience with all your original documents for verification.\n\nWe wish you a successful and fulfilling career with Devionic (Private) Limited.\n\nBest Regards,\nHuman Resources Department\nDevionic (Private) Limited\nDevionic Chowk, Azam, Layyah, Punjab, Pakistan\nPhone: +92-317-7121841 | Email: info@devionic.com`;

      const lines = doc.splitTextToSize(welcomeText, pageWidth - margin * 2);
      doc.setFontSize(11);
      doc.text(lines, margin, y);

      await addPdfFooter(doc, app.verification_id, verifyUrl);
      addBorderToAllPages(doc);
      doc.save(`Welcome_Letter_${app.full_name.replace(/\s+/g, "_")}.pdf`);
      toast({ title: "Welcome letter downloaded!" });
    } catch (err: any) {
      console.error("PDF Error:", err);
      toast({ title: "Failed to generate PDF", variant: "destructive" });
    }
    setGenerating(null);
  };

  const downloadFullPackage = async (app: any) => {
    setGenerating(app.id);
    try {
      const doc = await downloadApplication(app, true);
      if (!doc) return;

      const docs = [
        { label: "CNIC", url: app.cnic_doc },
        { label: "Resume/CV", url: app.resume_cv },
        { label: "Experience Letter", url: app.experience_letter },
        { label: "Educational Docs", url: app.educational_docs },
        { label: "Other Docs", url: app.other_docs },
        { label: "Passport Photo", url: app.passport_photo },
      ];

      for (const item of docs) {
        if (!item.url) continue;
        
        // Only attempt to add images
        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(item.url.split('?')[0]);
        if (!isImage) continue;

        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              try {
                doc.addPage();
                addPageBorder(doc);
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 15;
                
                doc.setFontSize(14);
                doc.setTextColor(13, 27, 42);
                doc.setFont("helvetica", "bold");
                doc.text(item.label.toUpperCase(), margin, 20);
                doc.setDrawColor(0, 186, 199);
                doc.line(margin, 22, pageWidth - margin, 22);

                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                const imgData = canvas.toDataURL("image/jpeg");
                
                const availableW = pageWidth - margin * 2;
                const availableH = pageHeight - 40;
                const imgRatio = img.height / img.width;
                
                let drawW = availableW;
                let drawH = availableW * imgRatio;
                
                if (drawH > availableH) {
                  drawH = availableH;
                  drawW = availableH / imgRatio;
                }
                
                doc.addImage(imgData, "JPEG", (pageWidth - drawW) / 2, 30, drawW, drawH);
                resolve();
              } catch (e) { reject(e); }
            };
            img.onerror = () => resolve(); // Skip if fails
            img.src = item.url;
          });
        } catch (e) {
          console.warn(`Failed to add ${item.label} to PDF:`, e);
        }
      }

      addBorderToAllPages(doc);
      doc.save(`Full_Package_${app.application_number}_${app.full_name.replace(/\s+/g, "_")}.pdf`);
      toast({ title: "Full package downloaded!" });
    } catch (err: any) {
      console.error("Package PDF Error:", err);
      toast({ title: "Failed to generate full package", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  const downloadApplication = async (app: any, isPackage = false) => {
    if (!isPackage) setGenerating(app.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const docNum = generateDocNumber(applications.indexOf(app) + 1, "JOB");
      const verifyUrl = `${window.location.origin}/verify?id=${app.verification_id}`;

      addPageBorder(doc);
      const SAFE_Y_START = 42;
      const SAFE_Y_END = 260;
      let y = await addApplicationHeader(doc, app.verification_id, verifyUrl, "APPLICATION FOR EMPLOYMENT", app.passport_photo);

      // --- Helper Functions ---
      const addSectionHeader = (title: string, currentY: number) => {
        if (currentY > SAFE_Y_END - 15) { 
          doc.addPage(); 
          addPageBorder(doc); 
          currentY = SAFE_Y_START; 
        }
        doc.setFillColor(13, 27, 42); 
        doc.rect(margin, currentY, contentWidth, 6, "F");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), margin + 3, currentY + 4.2);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        return currentY + 11;
      };

      const drawUnderlineField = (label: string, value: string, x: number, currentY: number, width: number) => {
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(label, x, currentY);
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const val = value || "—";
        doc.text(val, x, currentY + 4);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.05);
        doc.line(x, currentY + 5, x + width, currentY + 5);
        return 8.8; // Modern row height with professional gap
      };

      const drawCheckbox = (label: string, x: number, currentY: number, checked: boolean = false) => {
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.2);
        doc.rect(x, currentY, 3.2, 3.2);
        if (checked) {
          doc.setLineWidth(0.4);
          doc.line(x + 0.5, currentY + 1.5, x + 1.2, currentY + 2.5);
          doc.line(x + 1.2, currentY + 2.5, x + 2.7, currentY + 0.5);
        }
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text(label, x + 4.5, currentY + 2.6);
        return 5;
      };

      const drawCheckboxGroup = (label: string, options: string[], x: number, currentY: number) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(13, 27, 42);
        doc.text(label, x, currentY);
        doc.setFont("helvetica", "normal");
        
        let ox = x + 35;
        options.forEach(opt => {
          drawCheckbox(opt, ox, currentY - 2.6);
          ox += 28;
        });
        return 8;
      };

      // --- Form Main Heading ---
      y += 5;

      // Top Fields (Position, Salary, Date)
      drawUnderlineField("Position Applied For", app.job_title, margin, y, 75);
      drawUnderlineField("Desired Salary", "As per policy", margin + 80, y, 50);
      drawUnderlineField("Date Available", formatDateToDMY(app.created_at), margin + 135, y, 55);
      y += 8.8;

      // --- Personal Information ---
      y = addSectionHeader("Personal Information", y);
      drawUnderlineField("Full Name", app.full_name, margin, y, 90);
      drawUnderlineField("Father/Husband Name", app.father_husband_name || "", margin + 95, y, 95);
      y += 8.8;
      drawUnderlineField("CNIC / ID Number", app.cnic, margin, y, 60);
      drawUnderlineField("Date of Birth", formatDateToDMY(app.date_of_birth), margin + 65, y, 40);
      drawUnderlineField("Age", app.age?.toString() || "", margin + 110, y, 20);
      drawUnderlineField("Nationality", app.nationality || "Pakistani", margin + 135, y, 55);
      y += 8.8;
      drawUnderlineField("Email Address", app.email, margin, y, 90);
      drawUnderlineField("WhatsApp", app.whatsapp || "", margin + 95, y, 95);
      y += 8.8;
      drawUnderlineField("Phone 1", app.phone1 || "", margin, y, 60);
      drawUnderlineField("Phone 2", app.phone2 || "", margin + 65, y, 60);
      drawUnderlineField("Gender", app.gender || "—", margin + 130, y, 60);
      y += 12;

      // --- Address ---
      y = addSectionHeader("Address Detail", y);
      drawUnderlineField("Province", app.province || "", margin + 150, y, 40);
      y += 8.8;
      drawUnderlineField("City", app.city || "", margin, y, 45);
      drawUnderlineField("Tehsil", app.tehsil || "", margin + 50, y, 45);
      drawUnderlineField("District", app.district || "", margin + 100, y, 45);
      y += 8.8;
      drawUnderlineField("Postal Address", app.postal_address || "", margin, y, 190);
      y += 8.8;
      drawUnderlineField("Permanent Address", app.permanent_address || "", margin, y, 190);
      y += 12;

      // --- Emergency Contact ---
      y = addSectionHeader("Emergency Contact", y);
      drawUnderlineField("Contact Name", app.emergency_contact_name || "", margin, y, 60);
      drawUnderlineField("Relationship", app.emergency_contact_relation || "", margin + 65, y, 40);
      drawUnderlineField("Phone Number", app.emergency_contact_number || "", margin + 110, y, 40);
      drawUnderlineField("WhatsApp", app.emergency_contact_whatsapp || "", margin + 155, y, 35);
      y += 12;

      // --- Education & Experience ---
      y = addSectionHeader("Education & Qualifications", y);
      doc.setFontSize(8.5);
      const eduLines = doc.splitTextToSize(app.education || "No details provided.", contentWidth);
      doc.text(eduLines, margin, y);
      y += eduLines.length * 5.2 + 8;

      y = addSectionHeader("Professional Work Experience", y);
      const expLines = doc.splitTextToSize(app.work_experience || "No details provided.", contentWidth);
      doc.text(expLines, margin, y);
      y += expLines.length * 5.2 + 10;

      // --- Acknowledgement ---
      if (y > SAFE_Y_END - 25) { doc.addPage(); addPageBorder(doc); y = SAFE_Y_START; }
      y = addSectionHeader("Acknowledgement and Authorization", y);
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const disclaimer = "I certify that all answers and statements given herein are true and complete to the best of my knowledge. I understand that any false or misleading information given in my application or interview(s) may result in discharge. I authorize investigation of all statements contained in this application for employment as may be necessary in arriving at an employment decision.";
      const discLines = doc.splitTextToSize(disclaimer, contentWidth);
      doc.text(discLines, margin, y);
      y += discLines.length * 5 + 12;

      // --- Signature Area ---
      if (y > SAFE_Y_END - 15) { doc.addPage(); addPageBorder(doc); y = SAFE_Y_START; }
      doc.setDrawColor(0);
      doc.line(margin, y + 4, margin + 80, y + 4);
      doc.line(margin + 110, y + 4, margin + 190, y + 4);
      y += 12;
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text("Signature of Applicant", margin, y);
      doc.text("Date of Signing", margin + 110, y);
      y += 12;

      // --- Document Verification ---
      if (y > SAFE_Y_END - 5) { doc.addPage(); addPageBorder(doc); y = SAFE_Y_START; }
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`* This document is generated on ${new Date().toLocaleString()} for verification purposes.`, margin, y);

      // ==========================================
      // --- NEW PAGE: FOR OFFICE USE ONLY ---
      // ==========================================
      doc.addPage();
      addPageBorder(doc);
      const officeUsePageStart = doc.getNumberOfPages();
      y = SAFE_Y_START;

      y = addSectionHeader("General Application Info", y);
      drawUnderlineField("Application ID", app.application_number, margin, y, 60);
      drawUnderlineField("Position Applied For", app.job_title, margin + 65, y, 60);
      drawUnderlineField("Department", "Operations / IT", margin + 130, y, 60);
      y += 12;

      y = addSectionHeader("Interview Details", y);
      drawUnderlineField("Interview Date", "      /      / 202 ", margin, y, 45);
      drawUnderlineField("Interview Time", "      :      ", margin + 50, y, 35);
      drawUnderlineField("Interviewer Name(s)", "____________________________", margin + 90, y, 100);
      y += 10;
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text("Interview Mode:", margin, y + 2.6);
      drawCheckbox("In-person", margin + 35, y);
      drawCheckbox("Online (Zoom/Meet)", margin + 70, y);
      drawCheckbox("Phone Interview", margin + 115, y);
      y += 12;

      y = addSectionHeader("Candidate Evaluation Criteria", y);
      drawCheckboxGroup("1. Communication Skills", ["Excellent", "Good", "Average", "Poor"], margin, y); y += 8;
      drawCheckboxGroup("2. Technical Knowledge", ["Excellent", "Good", "Average", "Poor"], margin, y); y += 8;
      drawCheckboxGroup("3. Relevant Experience", ["Highly Relevant", "Relevant", "Limited", "None"], margin, y); y += 8;
      drawCheckboxGroup("4. Problem Solving", ["Excellent", "Good", "Average", "Poor"], margin, y); y += 8;
      drawCheckboxGroup("5. Confidence & Personality", ["Excellent", "Good", "Average", "Poor"], margin, y); y += 8;
      drawCheckboxGroup("6. Cultural Fit / Attitude", ["Excellent", "Good", "Average", "Poor"], margin, y); y += 8;
      y += 4;

      y = addSectionHeader("Overall Assessment", y);
      drawUnderlineField("Overall Marks / Rating", "__________ / 100", margin, y, 60);
      drawCheckbox("Excellent", margin + 70, y + 1);
      drawCheckbox("Good", margin + 100, y + 1);
      drawCheckbox("Average", margin + 130, y + 1);
      drawCheckbox("Poor", margin + 160, y + 1);
      y += 10;
      drawUnderlineField("Strengths:", "__________________________________________________________________________", margin, y, 190);
      y += 10;
      drawUnderlineField("Weaknesses:", "__________________________________________________________________________", margin, y, 190);
      y += 10;
      drawUnderlineField("Additional Remarks:", "__________________________________________________________________________", margin, y, 190);
      y += 12;

      y = addSectionHeader("Final Decision & Offer Details", y);
      drawCheckbox("SELECTED", margin, y);
      drawCheckbox("NOT SELECTED", margin + 50, y);
      drawCheckbox("HOLD / 2ND INTERVIEW", margin + 105, y);
      y += 10;
      drawUnderlineField("Proposed Salary", "Rs. ______________", margin, y, 60);
      drawUnderlineField("Joining Date", "      /      / 202 ", margin + 65, y, 60);
      drawUnderlineField("Probation Period", "__________ Months", margin + 130, y, 60);
      y += 14;

      // --- Final Approval Signatures ---
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 5, margin + 85, y + 5);
      doc.line(margin + 105, y + 5, margin + 190, y + 5);
      y += 10;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Hiring Manager Signature", margin, y);
      doc.text("HR Representative Signature", margin + 105, y);
      y += 8;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Name: __________________________", margin, y);
      doc.text("Name: __________________________", margin + 105, y);

      // Add footers for all pages and headers for overflow/new pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Header for all pages except Page 1 (handled explicitly at the start)
        if (i > 1) {
          const headerTitle = (i >= officeUsePageStart) ? "FOR INTERVIEW & OFFICE USE ONLY" : "APPLICATION FOR EMPLOYMENT";
          await addApplicationHeader(doc, app.verification_id, verifyUrl, headerTitle, app.passport_photo);
        }
        
        await addApplicationFooter(doc, app.verification_id, verifyUrl);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: "center" });
      }

      if (!isPackage) {
        doc.save(`Application_${app.application_number}_${app.full_name.replace(/\s+/g, "_")}.pdf`);
        toast({ title: "Application downloaded!" });
      }
      return doc;
    } catch (err: any) {
      console.error("PDF Error:", err);
      if (!isPackage) toast({ title: "Failed to generate PDF", variant: "destructive" });
      return null;
    } finally {
      if (!isPackage) setGenerating(null);
    }
  };


  const filtered = applications.filter(a => {
    const matchSearch = !search || (a.full_name || "").toLowerCase().includes(search.toLowerCase()) || (a.application_number || "").toLowerCase().includes(search.toLowerCase()) || (a.cnic || "").includes(search);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingApps = applications.filter(a => a.status === "pending").length;
  const shortlistedApps = applications.filter(a => a.status === "shortlisted").length;
  const hiredApps = applications.filter(a => a.status === "hired").length;
  const rejectedApps = applications.filter(a => a.status === "rejected").length;

  const viewingApp = filtered.find(a => a.id === viewingId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-heading">Job Applications</h2>
          <p className="text-sm text-muted-foreground">{applications.length} applications received</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total" value={applications.length} icon={Users} />
        <StatsCard title="Pending" value={pendingApps} icon={Clock} color="bg-[hsl(40,90%,55%)]/10" iconColor="text-[hsl(40,90%,55%)]" />
        <StatsCard title="Shortlisted" value={shortlistedApps} icon={Star} color="bg-[hsl(207,70%,50%)]/10" iconColor="text-[hsl(207,70%,50%)]" />
        <StatsCard title="Hired" value={hiredApps} icon={CheckCircle2} color="bg-[hsl(142,70%,45%)]/10" iconColor="text-[hsl(142,70%,45%)]" />
        <StatsCard title="Rejected" value={rejectedApps} icon={XCircle} color="bg-destructive/10" iconColor="text-destructive" />
      </div>

      <div className={`${cardClass} flex flex-col sm:flex-row gap-3`}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, CNIC, or application #..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-accent" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} text-center py-8`}><p className="text-muted-foreground">No applications found.</p></div>
      ) : (
        <div className={cardClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Applicant</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden md:table-cell">Position</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden sm:table-cell">CNIC</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4 hidden lg:table-cell">Date</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-left py-3 px-4">Status</th>
                  <th className="text-xs font-semibold text-muted-foreground uppercase text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground text-sm">{app.full_name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{app.application_number}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{app.job_title}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell font-mono">{app.cnic}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[app.status] || "bg-muted text-muted-foreground"}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setViewingId(app.id)}
                        >
                          <Eye size={14} /> View
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" title="Download Application Form" onClick={() => downloadApplication(app)} disabled={generating === app.id}>
                          <FileText size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="Download Full Package (All Docs)" onClick={() => downloadFullPackage(app)} disabled={generating === app.id}>
                          <Download size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
                          title="Delete Application" 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
                              deleteApplication.mutate(app.id);
                            }
                          }} 
                          disabled={deleteApplication.isPending}
                        >
                          {deleteApplication.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!viewingApp} onOpenChange={v => { if (!v) setViewingId(null); }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingApp?.full_name} - Application Details</DialogTitle>
          </DialogHeader>
          {viewingApp && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{viewingApp.application_number} · {viewingApp.job_title} · Applied {new Date(viewingApp.created_at).toLocaleDateString()}</p>

              {/* Personal Info */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Personal Information
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs block">Full Name</span><p className="text-foreground font-medium">{viewingApp.full_name}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Father/Husband</span><p className="text-foreground">{viewingApp.father_husband_name || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">CNIC</span><p className="text-foreground font-mono">{viewingApp.cnic}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Age</span><p className="text-foreground">{viewingApp.age || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Date of Birth</span><p className="text-foreground">{formatDateToDMY(viewingApp.date_of_birth)}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Nationality</span><p className="text-foreground">{viewingApp.nationality || "—"}</p></div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Contact Information
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs block">Email</span><p className="text-foreground">{viewingApp.email}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Phone 1</span><p className="text-foreground">{viewingApp.phone1 || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Phone 2</span><p className="text-foreground">{viewingApp.phone2 || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">WhatsApp</span><p className="text-foreground">{viewingApp.whatsapp || "—"}</p></div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Address
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs block">City</span><p className="text-foreground">{viewingApp.city || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Tehsil</span><p className="text-foreground">{viewingApp.tehsil || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">District</span><p className="text-foreground">{viewingApp.district || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Province</span><p className="text-foreground">{viewingApp.province || "—"}</p></div>
                  <div className="sm:col-span-2"><span className="text-muted-foreground text-xs block">Postal Address</span><p className="text-foreground">{viewingApp.postal_address || "—"}</p></div>
                  <div className="sm:col-span-2"><span className="text-muted-foreground text-xs block">Permanent Address</span><p className="text-foreground">{viewingApp.permanent_address || "—"}</p></div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Emergency Contact
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs block">Name</span><p className="text-foreground">{viewingApp.emergency_contact_name || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Relation</span><p className="text-foreground">{viewingApp.emergency_contact_relation || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">Number</span><p className="text-foreground">{viewingApp.emergency_contact_number || "—"}</p></div>
                  <div><span className="text-muted-foreground text-xs block">WhatsApp</span><p className="text-foreground">{viewingApp.emergency_contact_whatsapp || "—"}</p></div>
                </div>
              </div>

              {/* Education & Experience */}
              {(viewingApp.education || viewingApp.work_experience) && (
                <div>
                  <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-accent rounded-full" /> Education & Experience
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {viewingApp.education && <div><span className="text-muted-foreground text-xs block mb-1">Education</span><p className="text-foreground text-sm whitespace-pre-line bg-muted/30 p-3 rounded-lg">{viewingApp.education}</p></div>}
                    {viewingApp.work_experience && <div><span className="text-muted-foreground text-xs block mb-1">Work Experience</span><p className="text-foreground text-sm whitespace-pre-line bg-muted/30 p-3 rounded-lg">{viewingApp.work_experience}</p></div>}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h4 className="text-xs font-semibold text-accent uppercase mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Documents
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["CNIC", viewingApp.cnic_doc], ["Resume/CV", viewingApp.resume_cv],
                    ["Experience Letter", viewingApp.experience_letter], ["Educational Docs", viewingApp.educational_docs],
                    ["Other Docs", viewingApp.other_docs], ["Photo", viewingApp.passport_photo],
                  ].map(([label, url]) => url ? (
                    <a key={label as string} href={url as string} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="h-7 text-xs"><Download size={12} /> {label as string}</Button>
                    </a>
                  ) : (
                    <Button key={label as string} variant="ghost" size="sm" className="h-7 text-xs opacity-40 cursor-default" disabled>
                      {label as string}: Not uploaded
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="pt-4 border-t border-border">
                <div className="max-w-sm">
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Update Status (With Note)</label>
                  <Select value={viewingApp.status} onValueChange={v => handleStatusChange(viewingApp, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status History */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-accent uppercase mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-accent rounded-full" /> Status History
                </h4>
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No history recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((h: any) => (
                      <div key={h.id} className="relative pl-6 pb-4 border-l border-border last:border-0 last:pb-0">
                        <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-accent" />
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[h.status] || "bg-muted text-muted-foreground"}`}>
                            {h.status.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                        </div>
                        
                        {editingHistoryId === h.id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea value={editNote} onChange={e => setEditNote(e.target.value)} rows={2} className="text-xs" />
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-[10px]" onClick={() => updateHistory.mutate({ id: h.id, note: editNote })}>
                                <Save size={10} className="mr-1" /> Save
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setEditingHistoryId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start group">
                            <p className="text-sm text-foreground pr-8">{h.note || <span className="text-muted-foreground italic">No note added.</span>}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingHistoryId(h.id); setEditNote(h.note || ""); }}>
                                <Edit2 size={12} className="text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { if(confirm("Delete history entry?")) deleteHistory.mutate(h.id); }}>
                                <Trash2 size={12} className="text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hired Section */}
              {viewingApp.status === "hired" && (
                <div className="pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[hsl(142,70%,45%)]">✓ Employee Hired</p>
                      <p className="text-xs text-muted-foreground">Employee ID: {viewingApp.employee_id} · Verification: {viewingApp.verification_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="cyan" size="sm" onClick={() => generateWelcomeLetter(viewingApp)} disabled={generating === viewingApp.id}>
                        {generating === viewingApp.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Welcome Letter
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <QRCodeSVG value={`${window.location.origin}/verify?id=${viewingApp.verification_id}`} size={80} />
                    <div className="text-xs text-muted-foreground">
                      <p>Scan to verify employee</p>
                      <p className="font-mono text-accent">{viewingApp.verification_id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Modal */}
      <Dialog open={statusModal.open} onOpenChange={v => setStatusModal(prev => ({ ...prev, open: v }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">New Status:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[statusModal.newStatus]}`}>
                {statusModal.newStatus.replace("_", " ")}
              </span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Note (Optional)</label>
              <Textarea 
                placeholder="Add a note about this status change..." 
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusModal({ open: false, app: null, newStatus: "" })}>Cancel</Button>
            <Button onClick={confirmStatusChange} disabled={updateStatus.isPending}>
              {updateStatus.isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Confirm Status Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;
