import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { useReports } from "../hooks/useReports";
import { getAnalytics } from "../services/api";
import { Card, Page } from "../components/common/ui";
import { readDurationLabel } from "../utils";

export default function AnalyticsPage() {
  const { reports } = useReports();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
  }, []);

  const langData = useMemo(() => {
    const map = new Map();
    if (analytics?.languages) {
      Object.entries(analytics.languages).forEach(([name, value]) => map.set(name, value));
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }
    reports.forEach((r) => map.set(r.report_language || "en", (map.get(r.report_language || "en") || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [reports, analytics]);

  const speakerActivity = useMemo(() => {
    const map = new Map();
    if (analytics?.top_speakers?.length) {
      return analytics.top_speakers.map((s) => ({ name: s.name, turns: s.turns }));
    }
    reports.forEach((r) => (r.segments || []).forEach((s) => {
      const k = s.speaker_name || s.speaker || "Unknown";
      map.set(k, (map.get(k) || 0) + 1);
    }));
    return Array.from(map.entries()).slice(0, 8).map(([name, turns]) => ({ name, turns }));
  }, [reports, analytics]);

  const totalDuration = useMemo(() => reports.reduce((a, r) => a + Number(r.duration_seconds || 0), 0), [reports]);

  return (
    <Page>
      <section className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted">Total meetings</p><p className="text-3xl font-bold">{reports.length}</p></Card>
        <Card><p className="text-sm text-muted">Total audio duration</p><p className="text-3xl font-bold">{readDurationLabel(totalDuration)}</p></Card>
        <Card><p className="text-sm text-muted">Detected languages</p><p className="text-3xl font-bold">{langData.length}</p></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-display">Language Distribution</h3>
          <div className="h-72"><ResponsiveContainer><PieChart><Pie data={langData} dataKey="value" nameKey="name" outerRadius={90}>{langData.map((_, i) => <Cell key={i} fill={["#22c55e","#0ea5e9","#f97316","#a855f7"][i % 4]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3 className="mb-3 font-display">Speaker Activity</h3>
          <div className="h-72"><ResponsiveContainer><BarChart data={speakerActivity}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="turns" fill="#22c55e" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div>
        </Card>
      </section>
    </Page>
  );
}
