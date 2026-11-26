export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export interface Task { id: string; title: string; description: string; subject: string; dueDate: string; priority: TaskPriority; status: TaskStatus; createdAt: string; updatedAt: string; }
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

