import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, BarChart3, Lock } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useScrollToTop } from '../hooks/useCustom';

/**
 * Home Page - Landing page with hero and features
 */
function HomePage() {
  useScrollToTop();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      title: 'Lightning Fast',
      description: 'Process videos in minutes with our optimized AI pipeline',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-cyan-500" />,
      title: 'Detailed Reports',
      description: 'Get comprehensive reports with decisions, tasks, and key insights',
    },
    {
      icon: <Lock className="w-8 h-8 text-indigo-500" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and never stored without permission',
    },
  ];

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="space-y-8">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
            <span className="text-sm font-semibold text-blue-700">by Yahya</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Transform YouTube Videos into Professional Reports
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Automatically extract key discussions, decisions, and action items from any YouTube video. Save hours of manual note-taking with AI-powered analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/upload')}
              className="gap-2"
            >
              <Play className="w-5 h-5" />
              Get Started
            </Button>
            <Button variant="secondary" size="lg">
              View Demo
            </Button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="relative mt-12">
          <div className="aspect-video rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border border-blue-200/50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-transparent" />
            <div className="relative z-10 text-center">
              <Play className="w-20 h-20 text-blue-500 mx-auto mb-4 opacity-50" />
              <p className="text-slate-600 font-medium">Demo video coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Powerful Features</h2>
          <p className="text-lg text-slate-600">Everything you need to maximize meeting insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} interactive={true}>
              <div className="flex flex-col items-start space-y-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
        </div>

        <div className="space-y-6">
          {[
            { number: 1, title: 'Paste YouTube URL', description: 'Share the link to the meeting video you want to analyze' },
            { number: 2, title: 'AI Analysis', description: 'Our system processes the video and transcribes the audio' },
            { number: 3, title: 'Get Report', description: 'Receive a detailed report with key insights and action items' },
          ].map((step) => (
            <div key={step.number} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg">
                {step.number}
              </div>
              <div className="flex-1 pt-2">
                <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 p-12 md:p-16 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to transform your meetings?</h2>
          <p className="text-lg opacity-90">Start analyzing your YouTube videos with AI-powered insights today.</p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/upload')}
          >
            Start Free
          </Button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
