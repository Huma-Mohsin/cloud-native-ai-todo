/**
 * TaskDashboard Component - Metallic Chic Theme
 *
 * Main dashboard orchestrator that integrates:
 * - TaskList with animations (tasks created via AI chatbot)
 * - SearchBar with debouncing
 * - SmartFilters tabs
 * - SortDropdown
 * - FilterPanel
 * - Analytics section at bottom (conditional on task existence)
 * - WebSocket real-time sync
 */

'use client';

import { useState, useEffect } from 'react';
import { Task, SmartFilterType, SortOption, UpdateTaskRequest } from '@/lib/types';
import { TaskList } from './TaskList';
import { SearchBar } from './SearchBar';
import { SmartFilters } from './SmartFilters';
import { SortDropdown } from './SortDropdown';
import { FilterPanel } from './FilterPanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useTaskSync } from '@/hooks/useTaskSync';
import { Button } from './ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TaskDashboardProps {
  userId: string;
  token?: string;
  highlightTaskId?: number;
}

export function TaskDashboard({ userId, token, highlightTaskId }: TaskDashboardProps) {
  // Language context
  const { t } = useLanguage();

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [smartFilter, setSmartFilter] = useState<SmartFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [category, setCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch dashboard data
  const {
    tasks,
    stats,
    availableCategories,
    isLoading,
    error,
    refreshData,
    updateTasksFromWebSocket,
  } = useDashboardData({
    userId,
    token,
    searchQuery,
    smartFilter,
    sortBy,
    category,
    showCompleted,
  });

  // Task operations
  const {
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    error: operationError,
  } = useTaskOperations(userId, token);

  // WebSocket sync - pass current tasks so WebSocket can update them
  const { lastEventTaskId, lastEventType } = useTaskSync({
    userId,
    token,
    initialTasks: tasks,
    onTasksChange: (updatedTasks) => {
      updateTasksFromWebSocket(updatedTasks);
    },
  });

  // Map WebSocket event types to animation types
  const getAnimationType = (): 'created' | 'updated' | 'completed' | null => {
    if (!lastEventType) return null;

    switch (lastEventType) {
      case 'task_created':
        return 'created';
      case 'task_updated':
        return 'updated';
      case 'task_completed':
        return 'completed';
      case 'task_deleted':
        return null; // Task is deleted, won't be displayed
      default:
        return null;
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskId: number, data: UpdateTaskRequest) => {
    await updateTask(taskId, data);
    refreshData();
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
    refreshData();
  };

  // Handle task toggle
  const handleToggleTask = async (task: Task) => {
    await toggleTaskCompletion(task);
    refreshData();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSmartFilter('all');
    setSortBy('created_at');
    setCategory(null);
    setShowCompleted(false);
  };

  // Reset advanced filters
  const handleResetAdvancedFilters = () => {
    setCategory(null);
    setShowCompleted(false);
  };

  // Export tasks
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Due Date', 'Category', 'Tags', 'Created'];
    const rows = tasks.map((task) => [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.priority,
      task.completed ? 'Completed' : 'Pending',
      task.due_date || '',
      task.category || '',
      (task.tags || []).join('; '),
      new Date(task.created_at).toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasActiveFilters = searchQuery || smartFilter !== 'all' || category || showCompleted;

  // Filter tasks to show only highlighted task if highlightTaskId is provided
  const filteredTasks = highlightTaskId
    ? tasks.filter(task => task.id === highlightTaskId)
    : tasks;

  // Find the highlighted task for display
  const highlightedTask = highlightTaskId
    ? tasks.find(task => task.id === highlightTaskId)
    : null;

  // Function to clear highlight and show all tasks
  const handleClearHighlight = () => {
    // Navigate to dashboard without query parameter
    window.history.pushState({}, '', '/dashboard');
    // Force re-render by triggering a small state change
    window.location.reload();
  };

  return (
    <div className="flex h-full bg-transparent">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Highlight Banner - Show when viewing specific task */}
          {highlightTaskId && highlightedTask && (
            <div className="bg-primary-50 border-2 border-primary-500 rounded-2xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📌</span>
                  <div>
                    <p className="text-sm font-semibold text-primary-600">
                      {t('viewingTaskFromReminder')}
                    </p>
                    <p className="text-xs text-content-muted">
                      Task #{highlightedTask.id}: {highlightedTask.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearHighlight}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-semibold hover:shadow-primary-lg transition-all duration-200 hover:scale-105"
                >
                  {t('viewAllTasks')}
                </button>
              </div>
            </div>
          )}

          {/* Header with Export Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-1">
                TaskFlow Dashboard
              </h1>
              <p className="text-sm text-content-muted">
                Manage your tasks with real-time updates via AI chatbot
              </p>
            </div>

            {/* Export Buttons - Moved to header */}
            {tasks.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={handleExportJSON} variant="outline" className="text-sm">
                  📥 JSON
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="text-sm">
                  📥 CSV
                </Button>
              </div>
            )}
          </div>

          {/* Empty State - No Tasks */}
          {tasks.length === 0 && !isLoading && (
            <div className="text-center py-16 px-4">
              <div className="inline-block p-8 bg-white rounded-3xl shadow-lg border border-border">
                <div className="text-7xl mb-6">✨</div>
                <h2 className="text-2xl font-bold text-gradient mb-3">
                  Welcome to TaskFlow!
                </h2>
                <p className="text-content-muted mb-6 max-w-md mx-auto">
                  Start organizing your life with AI-powered task management.
                  Use the chatbot on the right to create your first task!
                </p>
                <div className="bg-surface-tertiary rounded-xl p-4 max-w-sm mx-auto border border-border">
                  <p className="text-sm font-semibold text-primary-500 mb-3">💬 Try saying:</p>
                  <div className="space-y-2 text-left text-sm text-content-secondary">
                    <p className="flex items-center gap-2">
                      <span className="text-primary-500">→</span>
                      "Add a task to buy groceries"
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary-500">→</span>
                      "Create a task for tomorrow's meeting"
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary-500">→</span>
                      "Remind me about task 1 in 30 minutes"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Cards - Professional Overview */}
          {tasks.length > 0 && (() => {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(tsk => tsk.completed).length;
            const pendingTasks = tasks.filter(tsk => !tsk.completed).length;
            const dueTodayTasks = tasks.filter(tsk => {
              if (!tsk.due_date || tsk.completed) return false;
              const today = new Date();
              const dueDate = new Date(tsk.due_date);
              return dueDate.toDateString() === today.toDateString();
            }).length;
            const overdueTasks = tasks.filter(tsk => {
              if (!tsk.due_date || tsk.completed) return false;
              return new Date(tsk.due_date) < new Date();
            }).length;
            const highPriorityTasks = tasks.filter(tsk => tsk.priority === 'high' && !tsk.completed).length;
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Total Tasks */}
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 shadow-lg shadow-primary-500/20 border border-primary-400/30 hover:scale-105 transition-transform">
                  <div className="text-white text-2xl sm:text-3xl font-bold">{totalTasks}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 font-medium">📋 {t('totalTasks')}</div>
                </div>

                {/* Completed */}
                <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-4 shadow-lg shadow-success-500/20 border border-success-400/30 hover:scale-105 transition-transform">
                  <div className="text-white text-2xl sm:text-3xl font-bold">{completedTasks}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 font-medium">✅ {t('completed')}</div>
                </div>

                {/* Pending */}
                <div className="bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl p-4 shadow-lg shadow-warning-500/20 border border-warning-400/30 hover:scale-105 transition-transform">
                  <div className="text-white text-2xl sm:text-3xl font-bold">{pendingTasks}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 font-medium">⏳ {t('pending')}</div>
                </div>

                {/* Due Today */}
                <div className="bg-gradient-to-br from-info-500 to-info-600 rounded-xl p-4 shadow-lg shadow-info-500/20 border border-info-400/30 hover:scale-105 transition-transform">
                  <div className="text-white text-2xl sm:text-3xl font-bold">{dueTodayTasks}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 font-medium">📅 {t('dueToday')}</div>
                </div>

                {/* Overdue */}
                <div className="bg-gradient-to-br from-error-500 to-error-600 rounded-xl p-4 shadow-lg shadow-error-500/20 border border-error-400/30 hover:scale-105 transition-transform">
                  <div className="text-white text-2xl sm:text-3xl font-bold">{overdueTasks}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 font-medium">⚠️ {t('overdue')}</div>
                </div>

                {/* High Priority */}
                <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl p-4 shadow-lg shadow-accent-500/20 border border-accent-400/30 hover:scale-105 transition-transform">
                  <div className="text-white text-2xl sm:text-3xl font-bold">{highPriorityTasks}</div>
                  <div className="text-white/90 text-xs sm:text-sm mt-1 font-medium">🔥 {t('highPriority')}</div>
                </div>
              </div>
            );
          })()}

          {/* Completion Progress Bar & Motivational Insights */}
          {tasks.length > 0 && (() => {
            const completedTasks = tasks.filter(task => task.completed).length;
            const totalTasks = tasks.length;
            const pendingTasks = tasks.filter(task => !task.completed).length;
            const completionRate = Math.round((completedTasks / totalTasks) * 100);
            const dueTodayCount = tasks.filter(task => {
              if (!task.due_date || task.completed) return false;
              return new Date(task.due_date).toDateString() === new Date().toDateString();
            }).length;
            const overdueCount = tasks.filter(task => {
              if (!task.due_date || task.completed) return false;
              return new Date(task.due_date) < new Date();
            }).length;

            // Generate motivational message
            let motivationalMessage = "";
            let messageColor = "text-primary-500";
            let messageIcon = "💡";

            if (completionRate === 100) {
              motivationalMessage = t('perfectAllCompleted');
              messageColor = "text-success-500";
              messageIcon = "🏆";
            } else if (completionRate >= 80) {
              motivationalMessage = t('amazingProgress');
              messageColor = "text-success-500";
              messageIcon = "🌟";
            } else if (completionRate >= 50) {
              motivationalMessage = t('greatWork');
              messageColor = "text-primary-500";
              messageIcon = "💪";
            } else if (overdueCount > 0) {
              motivationalMessage = `${overdueCount} ${t('tasksOverdueCatchUp')}`;
              messageColor = "text-error-500";
              messageIcon = "⚠️";
            } else if (dueTodayCount > 0) {
              motivationalMessage = `${dueTodayCount} ${t('tasksDueTodayYouCanDoIt')}`;
              messageColor = "text-warning-500";
              messageIcon = "📅";
            } else if (pendingTasks > 0) {
              motivationalMessage = `${pendingTasks} ${t('tasksWaitingLetsStart')}`;
              messageColor = "text-primary-500";
              messageIcon = "🚀";
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Progress Bar */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-content">{t('overallProgress')}</h3>
                    <span className="text-lg font-bold text-primary-500">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-surface-tertiary rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-500 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-content-muted mt-2">
                    {completedTasks} {t('of')} {totalTasks} {t('tasksCompleted')}
                  </p>
                </div>

                {/* Motivational Insight */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-border">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{messageIcon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-content mb-1">{t('dailyInsight')}</h3>
                      <p className={`text-sm font-medium ${messageColor}`}>
                        {motivationalMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Today's Focus Section */}
          {tasks.length > 0 && (() => {
            const today = new Date();
            const dueTodayTasks = tasks.filter(tsk => {
              if (!tsk.due_date || tsk.completed) return false;
              const dueDate = new Date(tsk.due_date);
              return dueDate.toDateString() === today.toDateString();
            });

            const overdueTasks = tasks.filter(tsk => {
              if (!tsk.due_date || tsk.completed) return false;
              return new Date(tsk.due_date) < today;
            });

            const highPriorityTasks = tasks.filter(tsk => tsk.priority === 'high' && !tsk.completed).slice(0, 3);

            const hasFocusTasks = dueTodayTasks.length > 0 || overdueTasks.length > 0 || highPriorityTasks.length > 0;

            if (!hasFocusTasks) return null;

            return (
              <div className="bg-white rounded-xl p-5 shadow-md border border-border">
                <h3 className="text-lg font-bold text-gradient mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  <span>{t('todaysFocus')}</span>
                </h3>

                <div className="space-y-3">
                  {/* Overdue Tasks */}
                  {overdueTasks.length > 0 && (
                    <div className="bg-error-50 border-l-4 border-error-500 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-error-500 mb-2">⚠️ {t('overdue')} ({overdueTasks.length})</h4>
                      <div className="space-y-1">
                        {overdueTasks.slice(0, 3).map(task => (
                          <div key={task.id} className="text-sm text-content-secondary flex items-center gap-2">
                            <span className="font-mono text-xs text-error-500">#{task.id}</span>
                            <span className="truncate">{task.title}</span>
                          </div>
                        ))}
                        {overdueTasks.length > 3 && (
                          <p className="text-xs text-error-500/70 mt-1">+{overdueTasks.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Due Today */}
                  {dueTodayTasks.length > 0 && (
                    <div className="bg-warning-50 border-l-4 border-warning-500 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-warning-600 mb-2">📅 {t('dueToday')} ({dueTodayTasks.length})</h4>
                      <div className="space-y-1">
                        {dueTodayTasks.slice(0, 3).map(task => (
                          <div key={task.id} className="text-sm text-content-secondary flex items-center gap-2">
                            <span className="font-mono text-xs text-warning-600">#{task.id}</span>
                            <span className="truncate">{task.title}</span>
                          </div>
                        ))}
                        {dueTodayTasks.length > 3 && (
                          <p className="text-xs text-warning-600/70 mt-1">+{dueTodayTasks.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* High Priority */}
                  {highPriorityTasks.length > 0 && (
                    <div className="bg-accent-50 border-l-4 border-accent-500 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-accent-500 mb-2">🔥 {t('highPriority')}</h4>
                      <div className="space-y-1">
                        {highPriorityTasks.map(task => (
                          <div key={task.id} className="text-sm text-content-secondary flex items-center gap-2">
                            <span className="font-mono text-xs text-accent-500">#{task.id}</span>
                            <span className="truncate">{task.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Section Divider */}
          {tasks.length > 0 && (
            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-bold text-content mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>All Tasks</span>
              </h2>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t('searchTasks')} />

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <SmartFilters activeFilter={smartFilter} onChange={setSmartFilter} />
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="outline"
                  className="text-sm"
                >
                  {showAdvancedFilters ? '🔽' : '▶️'} {t('filters')}
                </Button>
                {hasActiveFilters && (
                  <Button onClick={handleResetFilters} variant="ghost" className="text-sm">
                    🔄 {t('reset')}
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <FilterPanel
                category={category}
                showCompleted={showCompleted}
                onCategoryChange={setCategory}
                onShowCompletedChange={setShowCompleted}
                onReset={handleResetAdvancedFilters}
                availableCategories={availableCategories}
              />
            )}
          </div>

          {/* Error Display */}
          {(error || operationError) && (
            <div className="bg-error-50 border border-error-500/50 rounded-xl p-4">
              <p className="text-sm font-medium text-error-500 flex items-center gap-2" role="alert">
                <span className="text-lg">⚠️</span>
                {error || operationError}
              </p>
            </div>
          )}

          {/* Task List */}
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            isLoading={isLoading}
            availableCategories={availableCategories}
            lastEventTaskId={lastEventTaskId}
            lastEventType={getAnimationType()}
          />

          {/* Analytics Section - Show only if tasks exist */}
          {tasks.length > 0 && stats && (() => {
            // Priority distribution data
            const priorityData = [
              { name: 'High', value: stats.high_priority, color: '#EF4444' },
              { name: 'Medium', value: stats.medium_priority || 0, color: '#F59E0B' },
              { name: 'Low', value: stats.low_priority || 0, color: '#A8A8A8' },
            ];

            // Status distribution data
            const statusData = [
              { name: 'Completed', value: stats.completed, color: '#10B981' },
              { name: 'Pending', value: stats.pending, color: '#F59E0B' },
              { name: 'Overdue', value: stats.overdue, color: '#EF4444' },
            ];

            return (
              <div className="mt-8 space-y-6">
                <div className="border-t border-border pt-8">
                  <h2 className="text-xl font-bold text-content mb-6 flex items-center gap-2">
                    <span>📊</span>
                    <span>{t('detailedAnalytics')}</span>
                  </h2>

                  {/* Charts Row */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Task Status Distribution - Donut Chart */}
                    <div className="bg-white rounded-xl p-5 shadow-md border border-border">
                      <h3 className="text-sm font-semibold text-content mb-4 flex items-center gap-2">
                        <span className="text-lg">🍩</span>
                        <span>{t('taskStatusDistribution')}</span>
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
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Priority Breakdown - Bar Chart */}
                    <div className="bg-white rounded-xl p-5 shadow-md border border-border">
                      <h3 className="text-sm font-semibold text-content mb-4 flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span>{t('priorityBreakdown')}</span>
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={priorityData}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {priorityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
