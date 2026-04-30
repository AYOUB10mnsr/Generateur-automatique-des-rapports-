import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import './App.css';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

function LoadingFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-6 py-10 text-slate-500 dark:text-slate-300">
      <p>Loading page...</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
