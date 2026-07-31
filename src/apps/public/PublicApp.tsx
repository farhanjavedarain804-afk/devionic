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

import PortalLayout from "@/pages/portal/portal";
import PortalLogin from "@/pages/portal/portal.login";
import PortalDashboard from "@/pages/portal/portal.index";
import PortalProjects from "@/pages/portal/portal.projects";
import PortalTickets from "@/pages/portal/portal.tickets";
import PortalInvoices from "@/pages/portal/portal.invoices";
import PortalQuotations from "@/pages/portal/portal.quotations";
import PortalServices from "@/pages/portal/portal.services";
import PortalMessages from "@/pages/portal/portal.messages";
import PortalNotifications from "@/pages/portal/portal.notifications";
import PortalProfile from "@/pages/portal/portal.profile";
import PortalMeetings from "@/pages/portal/portal.meetings";
import PortalPayments from "@/pages/portal/portal.payments";
import PortalTasks from "@/pages/portal/portal.tasks";
import PortalHosting from "@/pages/portal/portal.hosting";
import PortalDocuments from "@/pages/portal/portal.documents";
import PortalChangeRequests from "@/pages/portal/portal.change-requests";
import PortalApprovals from "@/pages/portal/portal.approvals";
import PortalKnowledge from "@/pages/portal/portal.knowledge";

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

        {/* Client Portal Routes */}
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalDashboard />} />
          <Route path="projects" element={<PortalProjects />} />
          <Route path="tickets" element={<PortalTickets />} />
          <Route path="invoices" element={<PortalInvoices />} />
          <Route path="quotations" element={<PortalQuotations />} />
          <Route path="services" element={<PortalServices />} />
          <Route path="messages" element={<PortalMessages />} />
          <Route path="notifications" element={<PortalNotifications />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="meetings" element={<PortalMeetings />} />
          <Route path="payments" element={<PortalPayments />} />
          <Route path="tasks" element={<PortalTasks />} />
          <Route path="hosting" element={<PortalHosting />} />
          <Route path="documents" element={<PortalDocuments />} />
          <Route path="change-requests" element={<PortalChangeRequests />} />
          <Route path="approvals" element={<PortalApprovals />} />
          <Route path="knowledge" element={<PortalKnowledge />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MaintenanceGuard>
  );
};

export default PublicApp;
