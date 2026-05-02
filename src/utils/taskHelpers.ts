import { Task } from '@/app/components/TaskManager/types'

export function filterTasks(
  tasks: Task[], 
  filter: 'all' | 'todo' | 'done', 
  selectedCategory: string, 
  searchQuery: string
) {
  return tasks.filter(task => {
    // Filter by status
    if (filter !== 'all' && task.status !== filter) return false;
    
    // Filter by category
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesContent = task.content.toLowerCase().includes(query);
      const matchesCategory = task.category?.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query);
      if (!matchesContent && !matchesCategory && !matchesDescription) return false;
    }

    return true;
  });
}

export function sortTasks(
  tasks: Task[], 
  sortBy: 'newest' | 'oldest' | 'priority-desc' | 'priority-asc' | 'due-date'
) {
  return [...tasks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'priority-desc') return (a.priority || 6) - (b.priority || 6); // P1 first
    if (sortBy === 'priority-asc') return (b.priority || 0) - (a.priority || 0); // P5 first
    if (sortBy === 'due-date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  });
}
