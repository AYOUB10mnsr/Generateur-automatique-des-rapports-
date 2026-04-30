import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">MeetAI</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              AI-powered meeting reports for teams who want faster insights, better decisions, and cleaner follow-up.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Product</h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Features</li>
              <li>Integrations</li>
              <li>Pricing</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Company</h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>About</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Follow</h5>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span>GitHub</span>
              <span>Twitter</span>
              <span>Email</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} MeetAI. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
