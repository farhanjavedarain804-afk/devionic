import { useQuery } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import apiClient from "@/lib/apiClient";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Disclaimer from "@/pages/Disclaimer";
import ResourceCenter from "@/pages/ResourceCenter";
import Careers from "@/pages/Careers";
import JobDetail from "@/pages/JobDetail";
import JobApply from "@/pages/JobApply";
import InternshipApply from "@/pages/InternshipApply";
import Complaint from "@/pages/Complaint";
import Verify from "@/pages/Verify";
import Verification from "@/pages/Verification";
import HowItWorks from "@/pages/HowItWorks";
import NotFound from "@/pages/NotFound";
import MaintenancePage from "@/components/MaintenancePage";

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/dms/admin");

  const { data: maintenanceMode } = useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/site_settings/maintenance_mode");
        return response.data?.value === "true";
      } catch (error) {
        console.error("Failed to fetch maintenance mode", error);
        return false;
      }
    },
    refetchInterval: 30000,
  });

  if (maintenanceMode && !isAdminRoute) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

const PublicApp = () => {
  useVisitorTracking();

  return (
    <MaintenanceGuard>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/resource-center" element={<ResourceCenter />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/apply/:id" element={<JobApply />} />
        <Route path="/careers/internship-apply/:id" element={<InternshipApply />} />
        <Route path="/careers/:id" element={<JobDetail />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MaintenanceGuard>
  );
};

export default PublicApp;
