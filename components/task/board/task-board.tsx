'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useTasksStore } from '@/store/tasks-store';
import { statuses } from '@/mock-data/statuses';
import { TaskColumn } from './task-column';
import { TaskCard } from './task-card';
import { ListView } from '../views/list-view';
import { CalendarView } from '../views/calendar-view';
import type { TaskWithRelations } from '@/app/actions/tasks';

export function TaskBoard() {
   const { tasksByStatus, tasks, loading, fetchTasks, updateTaskStatusAction, viewMode } = useTasksStore();
   const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);

   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 8, // 8px of movement required before drag starts
       },
     })
   );

   useEffect(() => {
     fetchTasks();
   }, [fetchTasks]);

   const handleDragStart = (event: DragStartEvent) => {
     const { active } = event;
     const task = tasks.find((t) => t.id === active.id);
     if (task) {
       setActiveTask(task);
     }
   };

   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
     setActiveTask(null);

     if (!over) return;

     const taskId = active.id as string;
     const newStatusId = over.id as string;

     // Find the task and check if status changed
     const task = tasks.find((t) => t.id === taskId);
     if (task && task.statusId !== newStatusId) {
       updateTaskStatusAction(taskId, newStatusId);
     }
   };

   if (loading && Object.keys(tasksByStatus).length === 0 && tasks.length === 0) {
     return (
       <div className="flex h-full items-center justify-center">
         <p className="text-muted-foreground">Loading tasks...</p>
       </div>
     );
   }

   // Render different views based on viewMode
   if (viewMode === 'list') {
     return <ListView tasks={tasks} />;
   }

   if (viewMode === 'calendar') {
     return <CalendarView tasks={tasks} />;
   }

   // Default Kanban view
   return (
     <DndContext
       sensors={sensors}
       collisionDetection={closestCenter}
       onDragStart={handleDragStart}
       onDragEnd={handleDragEnd}
     >
       <div className="flex h-full gap-3 px-3 pt-4 pb-2 min-w-max overflow-hidden">
         {statuses.map((status) => (
           <TaskColumn
             key={status.id}
             status={status}
             tasks={tasksByStatus[status.id] || []}
           />
         ))}
       </div>

       <DragOverlay>
         {activeTask ? (
           <div className="opacity-80 rotate-3">
             <TaskCard task={activeTask} />
           </div>
         ) : null}
       </DragOverlay>
     </DndContext>
   );
}

