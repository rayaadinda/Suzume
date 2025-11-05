import { create } from 'zustand';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  type TaskWithRelations
} from '@/app/actions/tasks';

// Helper function to group tasks by status ID
function groupTasksByStatus(tasks: TaskWithRelations[]): Record<string, TaskWithRelations[]> {
  return tasks.reduce<Record<string, TaskWithRelations[]>>((acc, task) => {
    const statusId = task.statusId;

    if (!acc[statusId]) {
      acc[statusId] = [];
    }

    acc[statusId].push(task);

    return acc;
  }, {});
}

interface TasksState {
  // State
  tasks: TaskWithRelations[];
  tasksByStatus: Record<string, TaskWithRelations[]>;
  loading: boolean;
  error: string | null;
  filters: {
    statusId?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    sortBy?: 'status' | 'priority' | 'date' | 'alphabetical';
  };

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (data: {
    title: string;
    description: string;
    statusId: string;
    priority: string;
    assigneeIds?: string[];
    labelIds?: string[];
    date?: string;
  }) => Promise<void>;
  updateTaskAction: (
    taskId: string,
    updates: Partial<{
      title: string;
      description: string;
      statusId: string;
      priority: string;
      date: string;
      progressCompleted: number;
      progressTotal: number;
      assigneeIds: string[];
      labelIds: string[];
    }>
  ) => Promise<void>;
  deleteTaskAction: (taskId: string) => Promise<void>;
  updateTaskStatusAction: (taskId: string, newStatusId: string) => Promise<void>;
  setFilters: (filters: TasksState['filters']) => void;
  setTasks: (tasks: TaskWithRelations[]) => void; // For WebSocket updates
}

export const useTasksStore = create<TasksState>((set, get) => ({
  // Initial state
  tasks: [],
  tasksByStatus: {},
  loading: false,
  error: null,
  filters: {},

  // Fetch all tasks from server
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const tasks = await getTasks(filters);
      set({
        tasks,
        tasksByStatus: groupTasksByStatus(tasks),
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        loading: false,
      });
    }
  },

  // Add a new task
  addTask: async (data) => {
    set({ loading: true, error: null });
    try {
      await createTask(data);
      // Refetch all tasks to ensure consistency
      await get().fetchTasks();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        loading: false,
      });
      throw error;
    }
  },

  // Update a task
  updateTaskAction: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      await updateTask(taskId, updates);
      // Refetch all tasks to ensure consistency
      await get().fetchTasks();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        loading: false,
      });
      throw error;
    }
  },

  // Delete a task
  deleteTaskAction: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await deleteTask(taskId);
      // Refetch all tasks to ensure consistency
      await get().fetchTasks();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
        loading: false,
      });
      throw error;
    }
  },

  // Update task status (for drag-and-drop)
  updateTaskStatusAction: async (taskId, newStatusId) => {
    // Optimistic update
    const currentTasks = get().tasks;
    const optimisticTasks = currentTasks.map((task) =>
      task.id === taskId ? { ...task, statusId: newStatusId } : task
    );
    set({
      tasks: optimisticTasks,
      tasksByStatus: groupTasksByStatus(optimisticTasks),
    });

    try {
      await updateTaskStatus(taskId, newStatusId);
      // Refetch to get the complete updated task
      await get().fetchTasks();
    } catch (error) {
      // Revert optimistic update on error
      set({
        tasks: currentTasks,
        tasksByStatus: groupTasksByStatus(currentTasks),
        error: error instanceof Error ? error.message : 'Failed to update task status',
      });
      throw error;
    }
  },

  // Set filters and refetch
  setFilters: async (filters) => {
    set({ filters });
    await get().fetchTasks();
  },

  // Set tasks directly (for WebSocket updates)
  setTasks: (tasks) => {
    set({
      tasks,
      tasksByStatus: groupTasksByStatus(tasks),
    });
  },
}));
