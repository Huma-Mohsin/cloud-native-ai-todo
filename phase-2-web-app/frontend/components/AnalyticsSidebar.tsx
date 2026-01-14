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

  // Stats cards data - Light theme with emerald accents
  const quickStats = [
    {
      label: 'Total',
      value: stats.total,
      icon: '📋',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-400',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: '⏳',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-400',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: '✅',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
    },
    {
      label: 'Success Rate',
      value: `${stats.completion_rate}%`,
      icon: '📈',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-500',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-700',
    },
    {
      label: 'High',
      value: stats.high_priority,
      icon: '🔴',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      iconColor: 'text-red-600',
      textColor: 'text-red-700',
    },
    {
      label: 'Medium',
      value: stats.medium_priority,
      icon: '🟡',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-400',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-700',
    },
    {
      label: 'Low',
      value: stats.low_priority,
      icon: '⚪',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-400',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-700',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: '⚠️',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-400',
      iconColor: 'text-pink-600',
      textColor: 'text-pink-700',
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto lg:min-h-screen w-96 xl:w-[450px]
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700
          shadow-xl z-50 overflow-y-auto scrollbar-thin
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header - Dark theme with emerald */}
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-5">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onClose}
              className="lg:hidden text-gray-300 hover:bg-gray-700 rounded-lg p-2 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2 flex-1 justify-center lg:justify-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
                <span className="text-lg">📊</span>
              </div>
              <h2 className="text-lg font-semibold text-white">Analytics</h2>
            </div>
          </div>
          <p className="text-sm text-gray-400 font-medium text-center lg:text-left">Real-time insights</p>
        </div>

        {/* Content - Dark Background */}
        <div className="p-5 space-y-5 pb-12 bg-gray-800">
          {/* Quick Stats Cards - Clean & Minimal */}
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className={`
                  bg-white border border-gray-200 border-l-4 ${stat.borderColor}
                  rounded-lg p-3
                  transition-all duration-200 hover:shadow-md hover:scale-105
                  shadow-sm
                `}
              >
                <div className="text-center">
                  <span className={`text-xl block mb-1 ${stat.iconColor}`}>{stat.icon}</span>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${stat.iconColor} opacity-80 mb-1`}>
                    {stat.label}
                  </p>
                  <p className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Task Status Distribution */}
          <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Task Status</span>
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
                    backgroundColor: '#6b7280',
                    border: '2px solid #9ca3af',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '600',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: '#f3f4f6' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Priority Breakdown</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '13px', fontWeight: '500' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '13px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#6b7280',
                    border: '2px solid #9ca3af',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '600',
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
          <div className="bg-gray-900 rounded-xl p-5 shadow-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">📈</span>
              <span>Weekly Activity</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '13px', fontWeight: '500' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '13px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#6b7280',
                    border: '2px solid #9ca3af',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ffffff',
                    fontWeight: '600',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: '#f3f4f6' }} />
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
          <div className="bg-gray-900 rounded-xl p-5 shadow-lg border-2 border-emerald-600">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Insights</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {stats.completion_rate >= 70 && (
                <li className="flex items-start gap-2 text-green-400">
                  <span className="text-base">✅</span>
                  <span>Great job! Completion rate is excellent.</span>
                </li>
              )}
              {stats.overdue > 0 && (
                <li className="flex items-start gap-2 text-orange-400">
                  <span className="text-base">⚠️</span>
                  <span>{stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} need attention.</span>
                </li>
              )}
              {stats.high_priority > 0 && (
                <li className="flex items-start gap-2 text-red-400">
                  <span className="text-base">🔴</span>
                  <span>Focus on {stats.high_priority} high-priority task{stats.high_priority > 1 ? 's' : ''}.</span>
                </li>
              )}
              {stats.pending === 0 && (
                <li className="flex items-start gap-2 text-emerald-400">
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
