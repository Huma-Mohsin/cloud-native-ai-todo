/**
 * Analytics Sidebar Component
 *
 * Beautiful sidebar with colorful charts and analytics:
 * - Task completion trends
 * - Priority distribution
 * - Category breakdown
 * - Weekly activity
 */

'use client';

import { useState, useEffect } from 'react';
import { TaskStats } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsSidebarProps {
  stats: TaskStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsSidebar({ stats, isOpen, onClose }: AnalyticsSidebarProps) {
  if (!stats) return null;

  // Priority distribution data
  const priorityData = [
    { name: 'High', value: stats.high_priority, color: '#ef4444' },
    { name: 'Medium', value: stats.medium_priority, color: '#f59e0b' },
    { name: 'Low', value: stats.low_priority, color: '#6b7280' },
  ];

  // Completion status data
  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Overdue', value: stats.overdue, color: '#ef4444' },
  ];

  // Mock weekly activity data (you can replace with real API data)
  const weeklyData = [
    { day: 'Mon', completed: 5, created: 7 },
    { day: 'Tue', completed: 8, created: 6 },
    { day: 'Wed', completed: 6, created: 9 },
    { day: 'Thu', completed: 10, created: 8 },
    { day: 'Fri', completed: 7, created: 5 },
    { day: 'Sat', completed: 4, created: 3 },
    { day: 'Sun', completed: 3, created: 4 },
  ];

  // Stats cards data - All 8 cards
  const quickStats = [
    {
      label: 'Total',
      value: stats.total,
      icon: '📋',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: '⏳',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: '✅',
      gradient: 'from-green-500 to-green-600',
    },
    {
      label: 'Success Rate',
      value: `${stats.completion_rate}%`,
      icon: '📈',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      label: 'High',
      value: stats.high_priority,
      icon: '🔴',
      gradient: 'from-red-400 to-pink-500',
    },
    {
      label: 'Medium',
      value: stats.medium_priority,
      icon: '🟡',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      label: 'Low',
      value: stats.low_priority,
      icon: '⚪',
      gradient: 'from-gray-400 to-gray-500',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: '⚠️',
      gradient: 'from-red-500 to-red-600',
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto lg:min-h-screen w-96 xl:w-[450px]
          bg-white/95 backdrop-blur-lg border-r-2 border-purple-200
          shadow-2xl z-50 overflow-y-auto scrollbar-thin
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header - Compact */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2 flex-1 justify-center lg:justify-start">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <h2 className="text-xl font-bold text-white">Analytics</h2>
            </div>
          </div>
          <p className="text-xs text-white/90 font-medium text-center lg:text-left">Real-time insights</p>
        </div>

        {/* Content - Proper Heights */}
        <div className="p-5 space-y-5 pb-12">
          {/* Quick Stats Cards - All 8 cards in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className={`
                  bg-gradient-to-r ${stat.gradient} text-white
                  rounded-xl p-3 shadow-md
                  transform transition-all duration-300 hover:scale-105
                `}
              >
                <div className="text-center">
                  <span className="text-2xl block mb-1">{stat.icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-90 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span>Task Status Distribution</span>
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                  labelLine={true}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', fontWeight: '500' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span>Priority Breakdown</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: '500' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '13px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span>Weekly Activity Trend</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: '500' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '13px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5 }}
                  name="Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Productivity Insights */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 shadow-lg border-2 border-amber-200">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span>Productivity Insights</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {stats.completion_rate >= 70 && (
                <li className="flex items-start gap-2 text-green-700">
                  <span className="text-base">✅</span>
                  <span>Great job! Completion rate is excellent.</span>
                </li>
              )}
              {stats.overdue > 0 && (
                <li className="flex items-start gap-2 text-orange-700">
                  <span className="text-base">⚠️</span>
                  <span>{stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} need attention.</span>
                </li>
              )}
              {stats.high_priority > 0 && (
                <li className="flex items-start gap-2 text-red-700">
                  <span className="text-base">🔴</span>
                  <span>Focus on {stats.high_priority} high-priority task{stats.high_priority > 1 ? 's' : ''}.</span>
                </li>
              )}
              {stats.pending === 0 && (
                <li className="flex items-start gap-2 text-blue-700">
                  <span className="text-base">🎉</span>
                  <span>All caught up! Time to add new goals.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
