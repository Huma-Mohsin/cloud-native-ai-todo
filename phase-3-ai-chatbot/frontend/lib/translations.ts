/**
 * Translations for English and Urdu
 *
 * Bonus Feature: Multi-language Support (+100 points)
 */

export type Language = 'en' | 'ur';

export interface Translations {
  // Chat Interface
  chatPlaceholder: string;
  sendButton: string;
  clearChat: string;
  newConversation: string;
  voiceInput: string;
  recording: string;
  stopRecording: string;

  // Task Actions
  addTask: string;
  deleteTask: string;
  updateTask: string;
  viewTasks: string;
  markComplete: string;
  markIncomplete: string;

  // Task Status
  completed: string;
  pending: string;
  overdue: string;
  dueToday: string;
  upcoming: string;
  allTasks: string;

  // Dashboard
  taskflow: string;
  dashboard: string;
  totalTasks: string;
  highPriority: string;
  search: string;
  filter: string;
  sort: string;
  export: string;

  // Messages
  welcomeMessage: string;
  noTasks: string;
  taskAdded: string;
  taskDeleted: string;
  taskUpdated: string;
  taskCompleted: string;
  error: string;
  success: string;

  // Common
  yes: string;
  no: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  view: string;
  close: string;

  // Time
  today: string;
  tomorrow: string;
  yesterday: string;
  thisWeek: string;
  nextWeek: string;

  // Priority
  high: string;
  medium: string;
  low: string;

  // Notifications
  reminderTitle: string;
  snooze: string;
  dismiss: string;
  viewTask: string;

  // Dashboard Specific
  viewingTaskFromReminder: string;
  viewAllTasks: string;
  completedTasks: string;
  activeTasks: string;
  overdueCount: string;
  dueTodayCount: string;
  thisWeekCount: string;
  todaysFocus: string;
  quickStats: string;
  progressOverview: string;
  tasksComplete: string;
  keepGoing: string;
  almostThere: string;
  excellent: string;
  category: string;
  all: string;
  none: string;
  showCompleted: string;
  hideCompleted: string;
  sortBy: string;
  date: string;
  priority: string;
  title: string;
  noTasksFound: string;
  tryAdjustingFilters: string;

  // Additional Dashboard
  searchTasks: string;
  dateCreated: string;
  filters: string;
  detailedAnalytics: string;
  taskStatusDistribution: string;
  priorityBreakdown: string;
  created: string;
  updated: string;
  of: string;
  dueDate: string;
  customOrder: string;
  reset: string;

  // Badges & TaskItem
  advancedFilters: string;
  allCategories: string;
  showCompletedTasks: string;
  more: string;

  // Quick Actions Form
  customizeTask: string;
  saveChanges: string;
  saving: string;
  skip: string;
  customDate: string;
  selectCategory: string;
  tagInputPlaceholder: string;
  failedToSave: string;

  // Analytics Sidebar
  analytics: string;
  realTimeInsights: string;
  successRate: string;
  weeklyActivity: string;
  insights: string;
  taskStatus: string;
  total: string;

  // Chat Header
  subtitle: string;
  logout: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Chat Interface
    chatPlaceholder: 'Type your message...',
    sendButton: 'Send',
    clearChat: 'Clear Chat',
    newConversation: 'New Conversation',
    voiceInput: 'Voice Input',
    recording: 'Recording...',
    stopRecording: 'Stop Recording',

    // Task Actions
    addTask: 'Add Task',
    deleteTask: 'Delete Task',
    updateTask: 'Update Task',
    viewTasks: 'View Tasks',
    markComplete: 'Mark Complete',
    markIncomplete: 'Mark Incomplete',

    // Task Status
    completed: 'Completed',
    pending: 'Pending',
    overdue: 'Overdue',
    dueToday: 'Due Today',
    upcoming: 'Upcoming',
    allTasks: 'All Tasks',

    // Dashboard
    taskflow: 'TaskFlow',
    dashboard: 'Dashboard',
    totalTasks: 'Total Tasks',
    highPriority: 'High Priority',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',

    // Messages
    welcomeMessage: 'Welcome to TaskFlow! Start managing your tasks with AI.',
    noTasks: 'No tasks yet. Create your first task!',
    taskAdded: 'Task added successfully',
    taskDeleted: 'Task deleted successfully',
    taskUpdated: 'Task updated successfully',
    taskCompleted: 'Task marked as complete',
    error: 'Error',
    success: 'Success',

    // Common
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',

    // Time
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',

    // Priority
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Notifications
    reminderTitle: 'TaskFlow Reminder',
    snooze: 'Snooze',
    dismiss: 'Dismiss',
    viewTask: 'View Task',

    // Dashboard Specific
    viewingTaskFromReminder: 'Viewing Task from Reminder',
    viewAllTasks: 'View All Tasks',
    completedTasks: 'Completed Tasks',
    activeTasks: 'Active Tasks',
    overdueCount: 'Overdue',
    dueTodayCount: 'Due Today',
    thisWeekCount: 'This Week',
    todaysFocus: 'Today\'s Focus',
    quickStats: 'Quick Stats',
    progressOverview: 'Progress Overview',
    tasksComplete: 'tasks complete',
    keepGoing: 'Keep going!',
    almostThere: 'Almost there!',
    excellent: 'Excellent work!',
    category: 'Category',
    all: 'All',
    none: 'None',
    showCompleted: 'Show Completed',
    hideCompleted: 'Hide Completed',
    sortBy: 'Sort By',
    date: 'Date',
    priority: 'Priority',
    title: 'Title',
    noTasksFound: 'No tasks found',
    tryAdjustingFilters: 'Try adjusting your filters or search query',

    // Additional Dashboard
    searchTasks: 'Search tasks...',
    dateCreated: 'Date Created',
    filters: 'Filters',
    detailedAnalytics: 'Detailed Analytics',
    taskStatusDistribution: 'Task Status Distribution',
    priorityBreakdown: 'Priority Breakdown',
    created: 'Created',
    updated: 'Updated',
    of: 'of',
    dueDate: 'Due Date',
    customOrder: 'Custom Order',
    reset: 'Reset',

    // Badges & TaskItem
    advancedFilters: 'Advanced Filters',
    allCategories: 'All categories',
    showCompletedTasks: 'Show completed tasks',
    more: 'more',

    // Quick Actions Form
    customizeTask: 'Customize your task:',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    skip: 'Skip',
    customDate: 'Custom Date',
    selectCategory: 'Select...',
    tagInputPlaceholder: 'Type and press Enter to add tags...',
    failedToSave: 'Failed to save task',

    // Analytics Sidebar
    analytics: 'Analytics',
    realTimeInsights: 'Real-time insights',
    successRate: 'Success Rate',
    weeklyActivity: 'Weekly Activity',
    insights: 'Insights',
    taskStatus: 'Task Status',
    total: 'Total',

    // Chat Header
    subtitle: 'Your intelligent task assistant',
    logout: 'Logout',
  },

  ur: {
    // Chat Interface
    chatPlaceholder: 'اپنا پیغام لکھیں...',
    sendButton: 'بھیجیں',
    clearChat: 'چیٹ صاف کریں',
    newConversation: 'نئی گفتگو',
    voiceInput: 'آواز سے ان پٹ',
    recording: 'ریکارڈنگ جاری ہے...',
    stopRecording: 'ریکارڈنگ بند کریں',

    // Task Actions
    addTask: 'ٹاسک شامل کریں',
    deleteTask: 'ٹاسک حذف کریں',
    updateTask: 'ٹاسک اپ ڈیٹ کریں',
    viewTasks: 'ٹاسک دیکھیں',
    markComplete: 'مکمل کریں',
    markIncomplete: 'نامکمل کریں',

    // Task Status
    completed: 'مکمل',
    pending: 'زیر التواء',
    overdue: 'وقت گزر گیا',
    dueToday: 'آج مکمل کریں',
    upcoming: 'آنے والے',
    allTasks: 'تمام ٹاسک',

    // Dashboard
    taskflow: 'ٹاسک فلو',
    dashboard: 'ڈیش بورڈ',
    totalTasks: 'کل ٹاسک',
    highPriority: 'اہم ترین',
    search: 'تلاش',
    filter: 'فلٹر',
    sort: 'ترتیب',
    export: 'برآمد',

    // Messages
    welcomeMessage: 'ٹاسک فلو میں خوش آمدید! AI کے ساتھ اپنے کام منظم کریں۔',
    noTasks: 'ابھی تک کوئی ٹاسک نہیں۔ اپنا پہلا ٹاسک بنائیں!',
    taskAdded: 'ٹاسک کامیابی سے شامل ہو گیا',
    taskDeleted: 'ٹاسک کامیابی سے حذف ہو گیا',
    taskUpdated: 'ٹاسک کامیابی سے اپ ڈیٹ ہو گیا',
    taskCompleted: 'ٹاسک مکمل ہو گیا',
    error: 'خرابی',
    success: 'کامیابی',

    // Common
    yes: 'ہاں',
    no: 'نہیں',
    cancel: 'منسوخ',
    save: 'محفوظ',
    delete: 'حذف',
    edit: 'ترمیم',
    view: 'دیکھیں',
    close: 'بند',

    // Time
    today: 'آج',
    tomorrow: 'کل',
    yesterday: 'گزشتہ کل',
    thisWeek: 'اس ہفتے',
    nextWeek: 'اگلے ہفتے',

    // Priority
    high: 'زیادہ',
    medium: 'درمیانی',
    low: 'کم',

    // Notifications
    reminderTitle: 'ٹاسک فلو یاد دہانی',
    snooze: 'بعد میں یاد دلائیں',
    dismiss: 'بند کریں',
    viewTask: 'ٹاسک دیکھیں',

    // Dashboard Specific
    viewingTaskFromReminder: 'یاد دہانی سے ٹاسک دیکھ رہے ہیں',
    viewAllTasks: 'تمام ٹاسک دیکھیں',
    completedTasks: 'مکمل شدہ ٹاسک',
    activeTasks: 'فعال ٹاسک',
    overdueCount: 'وقت گزر گیا',
    dueTodayCount: 'آج مکمل کریں',
    thisWeekCount: 'اس ہفتے',
    todaysFocus: 'آج کی توجہ',
    quickStats: 'فوری اعداد و شمار',
    progressOverview: 'پیشرفت کا جائزہ',
    tasksComplete: 'ٹاسک مکمل',
    keepGoing: 'جاری رکھیں!',
    almostThere: 'تقریباً ہو گیا!',
    excellent: 'بہترین کام!',
    category: 'کیٹگری',
    all: 'تمام',
    none: 'کوئی نہیں',
    showCompleted: 'مکمل شدہ دکھائیں',
    hideCompleted: 'مکمل شدہ چھپائیں',
    sortBy: 'ترتیب',
    date: 'تاریخ',
    priority: 'ترجیح',
    title: 'عنوان',
    noTasksFound: 'کوئی ٹاسک نہیں ملا',
    tryAdjustingFilters: 'اپنے فلٹرز یا تلاش کو ایڈجسٹ کریں',

    // Additional Dashboard
    searchTasks: 'ٹاسک تلاش کریں...',
    dateCreated: 'تاریخ بنائی گئی',
    filters: 'فلٹرز',
    detailedAnalytics: 'تفصیلی تجزیات',
    taskStatusDistribution: 'ٹاسک کی حیثیت کی تقسیم',
    priorityBreakdown: 'ترجیح کی تفصیل',
    created: 'بنایا گیا',
    updated: 'اپ ڈیٹ کیا گیا',
    of: 'میں سے',
    dueDate: 'آخری تاریخ',
    customOrder: 'حسب ضرورت ترتیب',
    reset: 'ری سیٹ',

    // Badges & TaskItem
    advancedFilters: 'ترقی یافتہ فلٹرز',
    allCategories: 'تمام کیٹگریز',
    showCompletedTasks: 'مکمل ٹاسک دکھائیں',
    more: 'اور',

    // Quick Actions Form
    customizeTask: 'اپنا ٹاسک حسب ضرورت بنائیں:',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    saving: 'محفوظ ہو رہا ہے...',
    skip: 'چھوڑیں',
    customDate: 'خصوصی تاریخ',
    selectCategory: 'منتخب کریں...',
    tagInputPlaceholder: 'ٹیگز لکھیں اور Enter دبائیں...',
    failedToSave: 'ٹاسک محفوظ کرنے میں ناکامی',

    // Analytics Sidebar
    analytics: 'تجزیات',
    realTimeInsights: 'فوری حقیقی معلومات',
    successRate: 'کامیابی کی شرح',
    weeklyActivity: 'ہفتہ وار کارکردگی',
    insights: 'بصیرت',
    taskStatus: 'ٹاسک کی حیثیت',
    total: 'کل',

    // Chat Header
    subtitle: 'آپ کا ذہیں ٹاسک اسسٹنٹ',
    logout: 'لاگ آؤٹ',
  },
};

/**
 * Get translation for a key
 */
export function getTranslation(key: keyof Translations, language: Language): string {
  return translations[language][key];
}

/**
 * Hook for using translations
 */
export function useTranslations(language: Language) {
  const t = (key: keyof Translations): string => {
    return translations[language][key];
  };

  return { t, translations: translations[language] };
}
