import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays, isWithinInterval } from 'date-fns';
import type { TaskWithRelations } from '@/app/actions/tasks';
import { statuses } from '@/mock-data/statuses';

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  overdueTasks: number;
}

export interface PriorityDistribution {
  urgent: number;
  high: number;
  medium: number;
  low: number;
  'no-priority': number;
}

export interface StatusDistribution {
  statusId: string;
  statusName: string;
  count: number;
  color: string;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  created: number;
}

/**
 * Calculate overall task metrics
 */
export function calculateTaskMetrics(tasks: TaskWithRelations[]): TaskMetrics {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.statusId === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.statusId === 'in-progress').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate overdue tasks (tasks with due date in the past that are not completed)
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (!t.date || t.statusId === 'completed') return false;
    return new Date(t.date) < now;
  }).length;

  // Calculate average completion time (simplified - based on created to updated time for completed tasks)
  const completedTasksWithDates = tasks.filter(t =>
    t.statusId === 'completed' && t.createdAt && t.updatedAt
  );

  const averageCompletionTime = completedTasksWithDates.length > 0
    ? completedTasksWithDates.reduce((acc, task) => {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.updatedAt).getTime();
        const days = (completed - created) / (1000 * 60 * 60 * 24);
        return acc + days;
      }, 0) / completedTasksWithDates.length
    : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    completionRate: Math.round(completionRate * 10) / 10,
    averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
    overdueTasks,
  };
}

/**
 * Calculate priority distribution
 */
export function calculatePriorityDistribution(tasks: TaskWithRelations[]): PriorityDistribution {
  return tasks.reduce((acc, task) => {
    const priority = task.priority as keyof PriorityDistribution;
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    'no-priority': 0,
  } as PriorityDistribution);
}

/**
 * Calculate status distribution
 */
export function calculateStatusDistribution(tasks: TaskWithRelations[]): StatusDistribution[] {
  const distribution = tasks.reduce((acc, task) => {
    acc[task.statusId] = (acc[task.statusId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return statuses.map(status => ({
    statusId: status.id,
    statusName: status.name,
    count: distribution[status.id] || 0,
    color: status.color,
  }));
}

/**
 * Calculate completion trend over the last 7 days
 */
export function calculateCompletionTrend(tasks: TaskWithRelations[], days: number = 7): CompletionTrend[] {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  return dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Count tasks completed on this day
    const completed = tasks.filter(t => {
      if (t.statusId !== 'completed' || !t.updatedAt) return false;
      const updatedDate = new Date(t.updatedAt);
      return updatedDate >= dayStart && updatedDate <= dayEnd;
    }).length;

    // Count tasks created on this day
    const created = tasks.filter(t => {
      if (!t.createdAt) return false;
      const createdDate = new Date(t.createdAt);
      return createdDate >= dayStart && createdDate <= dayEnd;
    }).length;

    return {
      date: format(date, 'MMM dd'),
      completed,
      created,
    };
  });
}

/**
 * Calculate weekly progress
 */
export function calculateWeeklyProgress(tasks: TaskWithRelations[]): {
  thisWeek: number;
  lastWeek: number;
  percentageChange: number;
} {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subDays(thisWeekStart, 7);
  const lastWeekEnd = subDays(thisWeekEnd, 7);

  const thisWeekCompleted = tasks.filter(t => {
    if (t.statusId !== 'completed' || !t.updatedAt) return false;
    const updatedDate = new Date(t.updatedAt);
    return isWithinInterval(updatedDate, { start: thisWeekStart, end: thisWeekEnd });
  }).length;

  const lastWeekCompleted = tasks.filter(t => {
    if (t.statusId !== 'completed' || !t.updatedAt) return false;
    const updatedDate = new Date(t.updatedAt);
    return isWithinInterval(updatedDate, { start: lastWeekStart, end: lastWeekEnd });
  }).length;

  const percentageChange = lastWeekCompleted > 0
    ? ((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100
    : thisWeekCompleted > 0 ? 100 : 0;

  return {
    thisWeek: thisWeekCompleted,
    lastWeek: lastWeekCompleted,
    percentageChange: Math.round(percentageChange * 10) / 10,
  };
}

/**
 * Get top assignees by task count
 */
export function getTopAssignees(tasks: TaskWithRelations[], limit: number = 5): Array<{
  id: string;
  name: string;
  taskCount: number;
  completedCount: number;
}> {
  const assigneeMap = new Map<string, { name: string; taskCount: number; completedCount: number }>();

  tasks.forEach(task => {
    task.assignees.forEach(assignee => {
      const existing = assigneeMap.get(assignee.id);
      const isCompleted = task.statusId === 'completed';

      if (existing) {
        existing.taskCount++;
        if (isCompleted) existing.completedCount++;
      } else {
        assigneeMap.set(assignee.id, {
          name: assignee.name,
          taskCount: 1,
          completedCount: isCompleted ? 1 : 0,
        });
      }
    });
  });

  return Array.from(assigneeMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, limit);
}
