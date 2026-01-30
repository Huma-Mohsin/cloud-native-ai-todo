/**
 * AnalyticsSidebar Component - Metallic Chic Theme
 *
 * Beautiful sidebar with colorful charts and analytics:
 * - 8 quick stats cards with metallic styling
 * - Task status distribution (Donut chart)
 * - Priority breakdown (Bar chart)
 * - Weekly activity (Line chart)
 * - Productivity insights
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

  // Priority distribution data with metallic colors
  const priorityData = [
    { name: 'High', value: stats.high_priority, color: '#EF4444' }, // error red
    { name: 'Medium', value: stats.medium_priority, color: '#F59E0B' }, // warning amber
    { name: 'Low', value: stats.low_priority, color: '#A8A8A8' }, // metallic-sky-dark
  ];

  // Completion status data with metallic colors
  const statusData = [
    { name: 'Completed', value: stats.completed, color: '#10B981' }, // success green
    { name: 'Pending', value: stats.pending, color: '#F59E0B' }, // warning amber
    { name: 'Overdue', value: stats.overdue, color: '#EF4444' }, // error red
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

  // Stats cards data - Metallic Chic theme with colored borders
  const quickStats = [
    {
      label: 'Total',
      value: stats.total,
      icon: '📋',
      borderColor: 'border-metallic-blue',
      iconColor: 'text-metallic-blue',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: '⏳',
      borderColor: 'border-warning',
      iconColor: 'text-warning',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: '✅',
      borderColor: 'border-success',
      iconColor: 'text-success',
    },
    {
      label: 'Success Rate',
      value: `${stats.completion_rate}%`,
      icon: '📈',
      borderColor: 'border-info',
      iconColor: 'text-info',
    },
    {
      label: 'High',
      value: stats.high_priority,
      icon: '🔴',
      borderColor: 'border-error',
      iconColor: 'text-error',
    },
    {
      label: 'Medium',
      value: stats.medium_priority,
      icon: '🟡',
      borderColor: 'border-warning',
      iconColor: 'text-warning',
    },
    {
      label: 'Low',
      value: stats.low_priority,
      icon: '⚪',
      borderColor: 'border-metallic-sky',
      iconColor: 'text-metallic-navy',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: '⚠️',
      borderColor: 'border-error',
      iconColor: 'text-error',
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

      {/* Sidebar - Metallic Chic Theme */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto lg:min-h-screen w-96 xl:w-[450px]
          bg-gradient-to-b from-metallic-navy via-metallic-navy-dark to-metallic-navy
          border-r border-metallic-sky/30
          shadow-2xl z-50 overflow-y-auto scrollbar-thin
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header - Metallic Chic with Gold Accent */}
        <div className="flex-shrink-0 bg-gradient-to-r from-metallic-navy to-metallic-navy-dark border-b border-metallic-sky/30 p-5">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={onClose}
              className="lg:hidden text-metallic-navy hover:bg-white-light rounded-lg p-2 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2 flex-1 justify-center lg:justify-start">
              <div className="w-8 h-8 rounded-lg bg-metallic-blue flex items-center justify-center shadow-blue">
                <span className="text-lg">📊</span>
              </div>
              <h2 className="text-lg font-semibold text-metallic-navy">Analytics</h2>
            </div>
          </div>
          <p className="text-sm text-metallic-navy/70 font-medium text-center lg:text-left">Real-time insights</p>
        </div>

        {/* Content - Metallic Background */}
        <div className="p-5 space-y-5 pb-12 bg-white">
          {/* Quick Stats Cards - Metallic theme with colored borders */}
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className={`
                  bg-white border border-metallic-sky/30 border-l-4 ${stat.borderColor}
                  rounded-lg p-3
                  transition-all duration-200 hover:bg-white-light hover:border-metallic-sky/50
                  shadow-metallic hover:shadow-blue
                `}
              >
                <div className="text-center">
                  <span className={`text-xl block mb-1 ${stat.iconColor}`}>{stat.icon}</span>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-metallic-navy/60 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-metallic-navy">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Task Status Distribution - Donut Chart */}
          <div className="bg-white rounded-xl p-5 shadow-metallic border border-metallic-sky/30">
            <h3 className="text-sm font-semibold text-metallic-navy mb-4 flex items-center gap-2">
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
                    backgroundColor: '#36454F',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#C0C0C0',
                    fontWeight: '600',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: '#C0C0C0' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution - Bar Chart */}
          <div className="bg-white rounded-xl p-5 shadow-metallic border border-metallic-sky/30">
            <h3 className="text-sm font-semibold text-metallic-navy mb-4 flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>Priority Breakdown</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <XAxis
                  dataKey="name"
                  stroke="#C0C0C0"
                  style={{ fontSize: '13px', fontWeight: '500' }}
                />
                <YAxis
                  stroke="#C0C0C0"
                  style={{ fontSize: '13px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#36454F',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#C0C0C0',
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

          {/* Weekly Activity - Line Chart */}
          <div className="bg-white rounded-xl p-5 shadow-metallic border border-metallic-sky/30">
            <h3 className="text-sm font-semibold text-metallic-navy mb-4 flex items-center gap-2">
              <span className="text-lg">📈</span>
              <span>Weekly Activity</span>
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  stroke="#C0C0C0"
                  style={{ fontSize: '13px', fontWeight: '500' }}
                />
                <YAxis
                  stroke="#C0C0C0"
                  style={{ fontSize: '13px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#36454F',
                    border: '2px solid #D4AF37',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#C0C0C0',
                    fontWeight: '600',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', fontWeight: '500', color: '#C0C0C0' }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  dot={{ fill: '#D4AF37', r: 5 }}
                  name="Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Productivity Insights */}
          <div className="bg-white rounded-xl p-5 shadow-blue border-2 border-metallic-blue">
            <h3 className="text-sm font-semibold text-metallic-blue mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>Insights</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {stats.completion_rate >= 70 && (
                <li className="flex items-start gap-2 text-success">
                  <span className="text-base">✅</span>
                  <span>Great job! Completion rate is excellent.</span>
                </li>
              )}
              {stats.overdue > 0 && (
                <li className="flex items-start gap-2 text-warning">
                  <span className="text-base">⚠️</span>
                  <span>{stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} need attention.</span>
                </li>
              )}
              {stats.high_priority > 0 && (
                <li className="flex items-start gap-2 text-error">
                  <span className="text-base">🔴</span>
                  <span>Focus on {stats.high_priority} high-priority task{stats.high_priority > 1 ? 's' : ''}.</span>
                </li>
              )}
              {stats.pending === 0 && (
                <li className="flex items-start gap-2 text-metallic-blue">
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
