import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, Calendar, Users, Clock } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/Loading';
import { useScrollToTop, useDebounce } from '../hooks/useCustom';
import { getReports } from '../services/api';

/**
 * History Page - List of all previous reports with search and filter
 */
function HistoryPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter and sort
  useEffect(() => {
    let filtered = reports;

    // Search
    if (debouncedSearchTerm) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    setFilteredReports(filtered);
  }, [reports, debouncedSearchTerm, sortBy]);

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-slate-900">Report History</h1>
        <p className="text-lg text-slate-600">
          {reports.length === 0 ? 'No reports yet' : `${reports.length} report${reports.length !== 1 ? 's' : ''} generated`}
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none transition-smooth"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none transition-smooth"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </Card>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading reports..." />
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm ? 'No reports found' : 'No reports yet'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Generate your first report by uploading a YouTube video'}
          </p>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            Generate Report
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              interactive={true}
              className="hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">
                    {report.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{report.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{report.participants} participants</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/report/${report.id}`)}
                    className="gap-2 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this report?')) {
                        window.showToast?.('Report deleted', 'success');
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {reports.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Participants</p>
              <p className="text-2xl font-bold text-blue-600">
                {reports.reduce((acc, r) => acc + r.participants, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  reports.reduce(
                    (acc, r) => acc + parseInt(r.duration.split(' ')[0]),
                    0
                  ) / reports.length
                )}{' '}
                min
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Last Report</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Date(reports[0]?.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default HistoryPage;
