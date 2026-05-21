import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastContainer } from '../components/Toast';
import { useLocalStorage } from '../hooks/useCustom';

function Layout({ children }) {
  const [theme, setTheme] = useLocalStorage('meetai-theme', 'cyber');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'cyber' ? 'light' : 'cyber'));
  };

  window.showToast = addToast;

  return (
    <div className="min-h-screen flex flex-col bg-app text-app relative">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 app-grid" />
      
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      {/* Main prend tout l'espace disponible pour pousser le footer en bas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      {/* Footer toujours en bas */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Layout;