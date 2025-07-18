'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Link,
  Search,
  MessageSquare,
  BarChart3,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Check,
  Globe,
} from 'lucide-react';

interface SamplePost {
  id: number;
  platform: string;
  content: string;
  isAI: boolean;
  confidence: number;
  indicators: string[];
}

interface AnalysisResult extends SamplePost {
  url: string;
  analysisTime: string;
}

const SolutionDemo = () => {
  const [demoUrl, setDemoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const samplePosts: SamplePost[] = [
    {
      id: 1,
      platform: 'Twitter',
      content:
        "Just discovered this amazing new coffee shop downtown! The barista's latte art is absolutely incredible and the atmosphere is so cozy. Perfect spot for remote work! ☕️ #CoffeeLovers",
      isAI: false,
      confidence: 98.2,
      indicators: ['Natural language flow', 'Personal experience markers', 'Authentic emotional expression'],
    },
    {
      id: 2,
      platform: 'Instagram',
      content:
        'Exploring the vibrant streets of downtown today! The architecture here is truly remarkable, with each building telling its own unique story. The blend of modern and historic elements creates such a captivating urban landscape.',
      isAI: true,
      confidence: 94.7,
      indicators: ['Generic descriptive language', 'Lack of personal details', 'AI writing patterns detected'],
    },
    {
      id: 3,
      platform: 'LinkedIn',
      content:
        "Thrilled to announce my promotion to Senior Marketing Manager! This journey has been incredible, and I'm grateful for my amazing team's support. Looking forward to new challenges ahead! 🚀",
      isAI: false,
      confidence: 96.8,
      indicators: ['Personal milestone sharing', 'Emotional authenticity', 'Professional context appropriate'],
    },
  ];

  const handleAnalyze = () => {
    if (!demoUrl.trim()) return;

    setIsAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      const randomResult = samplePosts[Math.floor(Math.random() * samplePosts.length)];
      setAnalysisResult({
        ...randomResult,
        url: demoUrl,
        analysisTime: (Math.random() * 2 + 1).toFixed(1),
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleSampleTest = (post: SamplePost) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        ...post,
        url: `https://${post.platform.toLowerCase()}.com/sample-post`,
        analysisTime: (Math.random() * 2 + 1).toFixed(1),
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <section id="demo-section" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            See Bear Witness AI in
            <span className="text-red-500"> Action</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience real-time AI content detection with our interactive demo. Paste any social media URL or test our
            sample posts to see instant results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Interactive Demo Input */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Link size={24} className="mr-3 text-red-500" />
              Test Any Social Media Post
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Social Media URL</label>
                <Input
                  type="url"
                  placeholder="https://twitter.com/user/status/123... or paste content directly"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports Twitter, Instagram, LinkedIn, Facebook, TikTok, and more
                </p>
              </div>

              <Button
                variant="default"
                onClick={handleAnalyze}
                disabled={!demoUrl.trim() || isAnalyzing}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                {isAnalyzing ? 'Analyzing Content...' : 'Analyze Content'}
              </Button>
            </div>

            {/* Sample Posts */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-black mb-4">Or try these sample posts:</h4>
              <div className="space-y-3">
                {samplePosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">{post.platform}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleSampleTest(post)} disabled={isAnalyzing}>
                        Test
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border">
            <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
              <BarChart3 size={24} className="mr-3 text-red-500" />
              Analysis Results
            </h3>

            {!analysisResult && !isAnalyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-600">Enter a URL or select a sample post to see instant AI detection results</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Loader2 size={32} className="text-red-500 animate-spin" />
                </div>
                <p className="text-gray-600 mb-2">Analyzing content...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-6">
                {/* Detection Result */}
                <div
                  className={`p-6 rounded-lg border-2 ${
                    analysisResult.isAI ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {analysisResult.isAI ? (
                        <AlertTriangle size={24} className="text-red-500" />
                      ) : (
                        <CheckCircle size={24} className="text-green-500" />
                      )}
                      <span className={`font-bold text-lg ${analysisResult.isAI ? 'text-red-700' : 'text-green-700'}`}>
                        {analysisResult.isAI ? 'AI-Generated Content' : 'Human-Created Content'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${analysisResult.isAI ? 'text-red-600' : 'text-green-600'}`}>
                        {analysisResult.confidence}%
                      </div>
                      <div className="text-sm text-gray-500">Confidence</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-2">Analysis completed in {analysisResult.analysisTime}s</div>
                </div>

                {/* Detection Indicators */}
                <div>
                  <h4 className="font-semibold text-black mb-3">Detection Indicators:</h4>
                  <div className="space-y-2">
                    {analysisResult.indicators.map((indicator, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm text-gray-600">{indicator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe size={16} className="text-gray-500" />
                    <span className="text-sm font-medium">Platform: {analysisResult.platform}</span>
                  </div>
                  <div className="text-xs text-gray-500 break-all">{analysisResult.url}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionDemo;
