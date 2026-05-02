import { describe, it, expect } from 'vitest'
import { filterTasks, sortTasks } from '@/utils/taskHelpers'
import { Task } from '@/app/components\TaskManager/types'

const mockTasks: Task[] = [
  { id: 1, content: 'Work task', status: 'todo', category: 'Work', priority: 1, created_at: '2026-05-01T10:00:00Z', due_date: '2026-05-10' },
  { id: 2, content: 'Personal task', status: 'done', category: 'Personal', priority: 3, created_at: '2026-05-02T10:00:00Z', due_date: '2026-05-05' },
  { id: 3, content: 'Buy milk', status: 'todo', category: 'Shopping', priority: 5, created_at: '2026-04-30T10:00:00Z', description: 'Need whole milk' },
];

describe('Task Helpers', () => {
  describe('filterTasks', () => {
    it('should filter by status', () => {
      const result = filterTasks(mockTasks, 'done', 'all', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should filter by category', () => {
      const result = filterTasks(mockTasks, 'all', 'Shopping', '');
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Buy milk');
    });

    it('should search in content', () => {
      const result = filterTasks(mockTasks, 'all', 'all', 'milk');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it('should search in description', () => {
      const result = filterTasks(mockTasks, 'all', 'all', 'whole');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it('should search case-insensitively', () => {
      const result = filterTasks(mockTasks, 'all', 'all', 'WORK');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('sortTasks', () => {
    it('should sort by newest first', () => {
      const result = sortTasks(mockTasks, 'newest');
      expect(result[0].id).toBe(2); // May 2nd
      expect(result[1].id).toBe(1); // May 1st
      expect(result[2].id).toBe(3); // April 30th
    });

    it('should sort by priority (high to low)', () => {
      const result = sortTasks(mockTasks, 'priority-desc');
      expect(result[0].priority).toBe(1);
      expect(result[1].priority).toBe(3);
      expect(result[2].priority).toBe(5);
    });

    it('should sort by due date', () => {
      const result = sortTasks(mockTasks, 'due-date');
      expect(result[0].id).toBe(2); // May 5th
      expect(result[1].id).toBe(1); // May 10th
      expect(result[2].id).toBe(3); // No due date (last)
    });
  });
});
