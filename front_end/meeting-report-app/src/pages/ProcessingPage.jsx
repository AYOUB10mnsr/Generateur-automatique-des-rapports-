import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, FileText, Zap } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/Loading';
import { useScrollToTop } from '../hooks/useCustom';
import { getProcessingProgress, getReport } from '../services/api';

/**
 * Processing Page - Shows real-time progress with step indicators
 */
function ProcessingPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const steps = [
    { title: 'Downloading', icon: <Download className="w-6 h-6" /> },
    { title: 'Transcribing', icon: <FileText className="w-6 h-6" /> },
    { title: 'Generating', icon: <Zap className="w-6 h-6" /> },
  ];

  useEffect(() => {
    if (!reportId) {
      navigate('/upload');
      return;
    }

    // Simulate progress updates
    const interval = setInterval(async () => {
      try {
        const data = await getProcessingProgress(reportId);
        setProgress(data.progress);
        setCurrentStep(data.currentStep);

        if (data.progress >= 100) {
          setProgress(100);
          setIsComplete(true);
          clearInterval(interval);
          // Auto-redirect after 2 seconds
          setTimeout(() => {
            setIsRedirecting(true);
            navigate(`/report/${reportId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reportId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 animate-pulse">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Processing Video</h1>
          <p className="text-lg text-slate-600">
            {isComplete ? 'Almost ready! Redirecting to your report...' : 'Your report is being generated...'}
          </p>
        </div>

        {/* Main Progress Card */}
        <Card glass={false} interactive={false}>
          <div className="space-y-8">
            {/* Progress Bar */}
            <div>
              <ProgressBar current={progress} total={100} showPercentage={true} />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                let stepStatus = 'pending';
                if (index < currentStep) stepStatus = 'completed';
                else if (index === currentStep && progress < 100) stepStatus = 'current';

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      stepStatus === 'completed'
                        ? 'bg-green-50 border border-green-200'
                        : stepStatus === 'current'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                        stepStatus === 'completed'
                          ? 'bg-green-500 text-white'
                          : stepStatus === 'current'
                            ? 'bg-blue-500 text-white animate-pulse'
                            : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {stepStatus === 'completed' ? '✓' : step.icon}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold transition-all ${
                          stepStatus === 'pending' ? 'text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {stepStatus === 'completed'
                          ? 'Completed'
                          : stepStatus === 'current'
                            ? 'In progress...'
                            : 'Waiting...'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Message */}
            <div className="text-center space-y-3 pt-4 border-t border-slate-200">
              {isComplete ? (
                <>
                  <div className="inline-block p-3 rounded-full bg-green-100">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-600">Report Ready!</h3>
                  <p className="text-slate-600">
                    {isRedirecting ? 'Redirecting to your report...' : 'Preparing your report for display...'}
                  </p>
                </>
              ) : (
                <>
                  <LoadingSpinner size="md" text={`${progress}% Complete`} />
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-2">Progress</p>
            <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-2">Step</p>
            <p className="text-2xl font-bold text-blue-600">{currentStep + 1}/3</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-600 mb-2">Status</p>
            <p className="text-sm font-bold text-blue-600">{steps[currentStep]?.title || 'Done'}</p>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-slate-900 mb-2">💡 What happens next:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>✓ Your video will be analyzed for key discussions</li>
            <li>✓ Action items and decisions will be extracted</li>
            <li>✓ A comprehensive report will be generated</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default ProcessingPage;
