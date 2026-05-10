import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useReports } from "../hooks/useReports";
import { deleteReportById, downloadReportPdf } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import { Button, Card, Input, Page, Select } from "../components/common/ui";
import { downloadBlob, formatDate } from "../utils";

export default function ReportsHistoryPage() {
  const navigate = useNavigate();
  const { reports, setReports, loading } = useReports();
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("all");
  const [page, setPage] = useState(1);
  const q = useDebounce(search);

  const filtered = useMemo(() => reports.filter((r) => {
    const okSearch = !q || `${r.id} ${r.summary || ""}`.toLowerCase().includes(q.toLowerCase());
    const okLang = lang === "all" || (r.report_language || "en") === lang;
    return okSearch && okLang;
  }), [reports, q, lang]);

  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  const remove = async (id) => {
    await deleteReportById(id);
    setReports((p) => p.filter((r) => r.id !== id));
    toast.success("Report deleted");
  };

  return (
    <Page>
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <div className="relative"><Search size={14} className="absolute left-3 top-3.5 text-muted" /><Input className="pl-9" placeholder="Search reports" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <Select value={lang} onChange={(e) => setLang(e.target.value)}><option value="all">All languages</option><option value="fr">French</option><option value="en">English</option><option value="ar">Arabic</option></Select>
        </div>
      </Card>

      <Card>
        {loading ? "Loading..." : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted"><th>ID</th><th>Date</th><th>Language</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-app">
                    <td className="py-3">#{r.id}</td><td>{formatDate(r.created_at)}</td><td>{r.report_language || "en"}</td>
                    <td><div className="flex gap-2 py-2"><Button variant="ghost" onClick={() => navigate(`/reports/${r.id}`)}>Open</Button><Button variant="ghost" onClick={async () => downloadBlob(await downloadReportPdf(r.id), `report-${r.id}.pdf`)}><Download size={14} /></Button><Button variant="ghost" onClick={() => remove(r.id)}><Trash2 size={14} /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <p className="text-sm text-muted">{page}/{pages}</p>
          <Button variant="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </Card>
    </Page>
  );
}
