'use client';

import { LayoutGrid, List, Calendar } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTasksStore, type ViewMode } from '@/store/tasks-store';

export function ViewModeSwitcher() {
  const { viewMode, setViewMode } = useTasksStore();

  const handleValueChange = (value: string) => {
    if (value && (value === 'kanban' || value === 'list' || value === 'calendar')) {
      setViewMode(value as ViewMode);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={handleValueChange}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="kanban" aria-label="Kanban view">
        <LayoutGrid className="size-4" />
        <span className="hidden sm:inline ml-1.5">Kanban</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="size-4" />
        <span className="hidden sm:inline ml-1.5">List</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="calendar" aria-label="Calendar view">
        <Calendar className="size-4" />
        <span className="hidden sm:inline ml-1.5">Calendar</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
