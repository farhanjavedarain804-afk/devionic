import { Routes, Route, Navigate } from "react-router-dom";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

const ConsoleApp = () => {
  useVisitorTracking();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dms/admin" replace />} />
      <Route path="/dms/admin" element={<AdminLogin />} />
      <Route path="/dms/admin/dashboard/*" element={<AdminDashboard />} />
      <Route path="/dms/admin/*" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/dms/admin" replace />} />
    </Routes>
  );
};

export default ConsoleApp;
