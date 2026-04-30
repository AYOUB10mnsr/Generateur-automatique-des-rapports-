import React from 'react';
import { BarChart3, UploadCloud, Clock, Activity, Sparkles, CalendarDays } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useFetch, useScrollToTop } from '../hooks/useCustom';
import { getReports } from '../services/api';

function DashboardPage() {
  useScrollToTop();
  const { data: reports, loading } = useFetch(getReports, []);

  const totalReports = reports?.length ?? 0;
  const totalUploads = totalReports + 12;
  const averageDuration = reports
    ? `${Math.round(reports.reduce((sum, item) => sum + parseInt(item.duration, 10), 0) / Math.max(reports.length, 1))} min`
    : '--';

  const recentActivity = reports
    ? reports.slice(0, 4).map((report) => ({
        id: report.id,
        title: report.title,
        date: new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        participants: report.participants,
      }))
    : [];

  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full bg-blue-100/80 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-slate-800 dark:text-blue-300">
          <Sparkles className="w-4 h-4 mr-2" />
          Dashboard overview
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">MeetAI Dashboard</h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Monitor recent activity, track uploads, and review performance insights from your meeting reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-soft-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase opacity-80">Total reports</p>
              <p className="mt-3 text-4xl font-bold">{loading ? '...' : totalReports}</p>
            </div>
            <div className="rounded-3xl bg-white/15 p-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-soft-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase opacity-80">Total uploads</p>
              <p className="mt-3 text-4xl font-bold">{loading ? '...' : totalUploads}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-3">
              <UploadCloud className="w-6 h-6 text-cyan-200" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-soft-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase opacity-80">Avg meeting length</p>
              <p className="mt-3 text-4xl font-bold">{loading ? '...' : averageDuration}</p>
            </div>
            <div className="rounded-3xl bg-white/15 p-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Usage analytics</h2>
              <p className="text-slate-600 dark:text-slate-300">Static insights with trends and outcomes from recent reports.</p>
            </div>
            <Button variant="secondary" size="sm">View all reports</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Insight score', value: '92%', icon: <Activity className="w-5 h-5 text-sky-500" /> },
              { label: 'AI accuracy', value: '97%', icon: <Sparkles className="w-5 h-5 text-cyan-500" /> },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  {item.icon}
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <CalendarDays className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Recent activity</h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-slate-600 dark:text-slate-400">Loading recent updates...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">No recent reports yet.</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.participants} participants</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-[2rem] bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Need a quick summary?</h2>
            <p className="text-slate-600 dark:text-slate-300">Use MeetAI to generate transcript summaries, action items, and export-ready reports in a few clicks.</p>
          </div>
          <Button variant="primary">Start a new upload</Button>
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
