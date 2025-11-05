'use client';

import { useState, useMemo, useCallback } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskDialog } from '../task-dialog';
import type { TaskWithRelations } from '@/app/actions/tasks';
import { statuses } from '@/mock-data/statuses';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: TaskWithRelations[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

  // Get tasks for a specific date
  const getTasksForDate = useCallback((date: Date) => {
    return tasks.filter((task) => {
      if (!task.date) return false;
      return isSameDay(new Date(task.date), date);
    });
  }, [tasks]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(
    () => getTasksForDate(selectedDate),
    [selectedDate, getTasksForDate]
  );

  // Get all dates with tasks in current month
  const datesWithTasks = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days.filter((day) => getTasksForDate(day).length > 0);
  }, [currentMonth, getTasksForDate]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const getStatusInfo = (statusId: string) => {
    return statuses.find((s) => s.id === statusId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <>
      <div className="flex h-full gap-6 px-6 py-4">
        {/* Calendar Section */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="flex-1">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  hasTask: datesWithTasks,
                }}
                modifiersClassNames={{
                  hasTask: 'bg-primary/10 font-bold',
                }}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/10 border-2 border-primary" />
              <span>Has tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Tasks for Selected Date */}
        <div className="w-96 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>

          <div className="flex-1 overflow-auto -mx-1">
            <div className="space-y-3 px-1">
              {selectedDateTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground text-center">
                      No tasks scheduled for this day
                    </p>
                  </CardContent>
                </Card>
              ) : (
                selectedDateTasks.map((task) => {
                  const status = getStatusInfo(task.statusId);
                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        'cursor-pointer transition-colors hover:border-primary/50',
                        getPriorityColor(task.priority)
                      )}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base line-clamp-2">
                            {task.title}
                          </CardTitle>
                          {status && (
                            <Badge
                              variant="secondary"
                              className="shrink-0"
                              style={{ backgroundColor: `${status.color}15` }}
                            >
                              <status.icon className="size-3" style={{ color: status.color }} />
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      {task.description && (
                        <CardContent className="pb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        </CardContent>
                      )}
                      <CardContent className="flex items-center justify-between pt-0">
                        <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        {task.assignees.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {task.assignees.length} {task.assignees.length === 1 ? 'assignee' : 'assignees'}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </>
  );
}
