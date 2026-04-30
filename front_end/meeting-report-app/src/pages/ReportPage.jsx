import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, Trash2, ArrowLeft, Users, CheckSquare, ListTodo, Lightbulb } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import CopyButton from '../components/CopyButton';
import { LoadingSpinner, Skeleton } from '../components/Loading';
import Accordion from '../components/Accordion';
import { useScrollToTop } from '../hooks/useCustom';
import { getReport, exportReportAsPDF, deleteReport } from '../services/api';

/**
 * Report Page - Display comprehensive report with decisions, tasks, etc.
 */
function ReportPage() {
  useScrollToTop();
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getReport(id);
        setReport(data);
      } catch (err) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleExportPDF = async () => {
    try {
      const result = await exportReportAsPDF(id);
      // Simulate PDF download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      link.click();
      window.showToast?.('Report exported as PDF', 'success');
    } catch (err) {
      window.showToast?.('Failed to export PDF', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await deleteReport(id);
      window.showToast?.('Report deleted', 'success');
      navigate('/history');
    } catch (err) {
      window.showToast?.('Failed to delete report', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-12 space-y-6">
        <Skeleton height="h-10" width="w-1/2" />
        <Skeleton height="h-32" width="w-full" />
        <Skeleton height="h-32" width="w-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Report</h2>
          <p className="text-slate-600 mb-6">{error || 'Report not found'}</p>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            Back to Upload
          </Button>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[priority] || colors.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-slate-100 text-slate-700 border-slate-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-8 py-8">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-smooth"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{report.title}</h1>
            <p className="text-slate-600 text-sm">
              {new Date(report.timestamp).toLocaleDateString()} at{' '}
              {new Date(report.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="secondary" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Summary</h2>
          <p className="text-slate-700 leading-relaxed">{report.summary.keyTakeaway}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-sm text-slate-600">Duration</p>
              <p className="text-lg font-semibold text-slate-900">{report.summary.duration}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Topic</p>
              <p className="text-lg font-semibold text-slate-900">{report.summary.mainTopic}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Participants</p>
              <p className="text-lg font-semibold text-slate-900">{report.participants.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Participants */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-slate-900">Participants</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {report.participants.map((participant, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <p className="text-sm font-medium text-slate-900">{participant}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Decisions */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-green-500" />
            <h2 className="text-2xl font-bold text-slate-900">Decisions</h2>
          </div>

          <div className="space-y-3">
            {report.decisions.map((decision) => (
              <div key={decision.id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-soft-lg transition-smooth">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{decision.title}</h4>
                    <p className="text-sm text-slate-600">Owner: {decision.owner}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(decision.priority)}`}>
                      {decision.priority.charAt(0).toUpperCase() + decision.priority.slice(1)} Priority
                    </span>
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      Due: {new Date(decision.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tasks */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5 text-cyan-500" />
            <h2 className="text-2xl font-bold text-slate-900">Action Items</h2>
          </div>

          <div className="space-y-3">
            {report.tasks.map((task) => (
              <div key={task.id} className="border border-slate-200 rounded-2xl p-4 hover:shadow-soft-lg transition-smooth">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" />
                      {task.title}
                    </h4>
                    <p className="text-sm text-slate-600">Assigned: {task.assigned}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Takeaways */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-slate-900">Key Takeaways</h2>
          </div>

          <ul className="space-y-2">
            {report.actionItems.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">→</span>
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Full Transcript */}
      <Card>
        <Accordion
          items={[
            {
              title: 'Full Transcript',
              content: (
                <div className="space-y-3">
                  <p className="text-slate-700 whitespace-pre-wrap">{report.transcript}</p>
                  <CopyButton text={report.transcript} label="Copy Transcript" />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default ReportPage;
