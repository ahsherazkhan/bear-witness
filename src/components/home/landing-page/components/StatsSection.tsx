'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Target, Zap, Users, Shield, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

interface StatCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  subtitle: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const StatsSection = () => {
  const [activeTab, setActiveTab] = useState('accuracy');
  const [animationKey, setAnimationKey] = useState(0);

  // Sample data for accuracy over time
  const accuracyData = [
    { month: 'Jan', accuracy: 95.2, detections: 1200 },
    { month: 'Feb', accuracy: 96.8, detections: 1450 },
    { month: 'Mar', accuracy: 97.5, detections: 1680 },
    { month: 'Apr', accuracy: 98.2, detections: 1920 },
    { month: 'May', accuracy: 98.8, detections: 2150 },
    { month: 'Jun', accuracy: 99.1, detections: 2380 },
    { month: 'Jul', accuracy: 99.5, detections: 2640 },
  ];

  // Sample data for detection types
  const detectionData = [
    { type: 'GPT Models', count: 8420, percentage: 45 },
    { type: 'Claude/Anthropic', count: 5260, percentage: 28 },
    { type: 'Gemini/Bard', count: 3140, percentage: 17 },
    { type: 'Other AI', count: 1880, percentage: 10 },
  ];

  // Sample data for performance metrics
  const performanceData = [
    { name: 'Response Time', value: 2.3, unit: 'seconds', color: '#1E40AF' },
    { name: 'Uptime', value: 99.9, unit: '%', color: '#059669' },
    { name: 'Throughput', value: 1200, unit: 'req/min', color: '#DC2626' },
    { name: 'Error Rate', value: 0.05, unit: '%', color: '#7C3AED' },
  ];

  const pieColors = ['#1E40AF', '#059669', '#DC2626', '#F59E0B'];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const TabButton = ({ id, label, isActive, onClick }: TabButtonProps) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 text-black ${
        isActive ? 'bg-gray-160 shadow-lg border border-gray-300' : 'bg-white border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ icon: IconComponent, title, value, subtitle, trend, color = 'tertiary' }: StatCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-red-900`}>
          <IconComponent size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${trend.direction === 'up' ? 'text-black' : 'text-maroon-600'}`}>
            {trend.direction === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-sm font-medium">{trend.value}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-black mb-1">{value}</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'accuracy' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section id="stats" className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <BarChart3 size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Performance Analytics</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time insights into Bear Witness AI's detection accuracy, performance metrics, and comprehensive
            analytics dashboard.
          </p>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Target}
            title="Detection Accuracy"
            value="99.5%"
            subtitle="Current accuracy rate"
            trend={{ direction: 'up', value: '+2.1%' }}
            color="muted"
          />
          <StatCard
            icon={Zap}
            title="Response Time"
            value="2.3s"
            subtitle="Average analysis time"
            trend={{ direction: 'down', value: '-15%' }}
            color="muted"
          />
          <StatCard
            icon={Users}
            title="Active Users"
            value="15,247"
            subtitle="Monthly active users"
            trend={{ direction: 'up', value: '+12.5%' }}
            color="muted"
          />
          <StatCard
            icon={Shield}
            title="Content Analyzed"
            value="2.4M"
            subtitle="This month"
            trend={{ direction: 'up', value: '+28%' }}
            color="muted"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-100 p-2 rounded-lg">
            <TabButton
              id="accuracy"
              label="Accuracy Trends"
              isActive={activeTab === 'accuracy'}
              onClick={setActiveTab}
            />
            <TabButton
              id="detections"
              label="Detection Types"
              isActive={activeTab === 'detections'}
              onClick={setActiveTab}
            />
            <TabButton
              id="performance"
              label="Performance"
              isActive={activeTab === 'performance'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Chart Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          {activeTab === 'accuracy' && (
            <div>
              <h3 className="text-2xl font-bold text-black mb-6">Accuracy Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyData} key={animationKey}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis domain={[94, 100]} stroke="#666" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#1E40AF"
                      strokeWidth={3}
                      dot={{ fill: '#1E40AF', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#1E40AF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'detections' && (
            <div>
              <h3 className="text-2xl font-bold text-black mb-6">AI Model Detection Breakdown</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={detectionData}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ type, percentage }: any) => `${type}: ${percentage}%`}
                      >
                        {detectionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {detectionData.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pieColors[index] }} />
                        <span className="font-medium text-gray-900">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-black">{item.count.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 className="text-2xl font-bold text-black mb-6">System Performance Metrics</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {/* <div className="text-center mt-12">
          <Button variant="default" size="lg" className="bg-black text-white hover:bg-gray-800">
            View Full Analytics Dashboard
          </Button>
        </div> */}
      </div>
    </section>
  );
};

export default StatsSection;
