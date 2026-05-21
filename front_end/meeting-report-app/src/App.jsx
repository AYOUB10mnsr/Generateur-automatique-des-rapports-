import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./layouts/Layout";  // ← Ton Layout avec Navbar + Footer
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProcessingPage from "./pages/ProcessingPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import ReportsHistoryPage from "./pages/ReportsHistoryPage";
import SpeakerManagementPage from "./pages/SpeakerManagementPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import AiSearchPage from "./pages/AiSearchPage";

export default function App() {
  const location = useLocation();
  
  return (
    <Layout>  {/* ← Wrapper unique pour TOUTES les pages */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/reports/:id" element={<ReportDetailsPage />} />
          <Route path="/history" element={<ReportsHistoryPage />} />
          <Route path="/speakers" element={<SpeakerManagementPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ai-search" element={<AiSearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
