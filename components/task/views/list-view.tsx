'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TaskContextMenu } from '../task-context-menu';
import { TaskDialog } from '../task-dialog';
import type { TaskWithRelations } from '@/app/actions/tasks';
import { statuses } from '@/mock-data/statuses';

interface ListViewProps {
  tasks: TaskWithRelations[];
}

type SortField = 'title' | 'status' | 'priority' | 'date';
type SortDirection = 'asc' | 'desc';

export function ListView({ tasks }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case 'title':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'status':
        const statusA = statuses.find(s => s.id === a.statusId);
        const statusB = statuses.find(s => s.id === b.statusId);
        compareValue = (statusA?.displayOrder || 0) - (statusB?.displayOrder || 0);
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        compareValue = priorityOrder[a.priority as keyof typeof priorityOrder] -
                      priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case 'date':
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        compareValue = dateA - dateB;
        break;
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const getStatusInfo = (statusId: string) => {
    return statuses.find(s => s.id === statusId);
  };

  return (
    <>
      <div className="w-full h-full overflow-auto px-6 py-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('title')}
                >
                  Task
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => handleSort('date')}
                >
                  Due Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">No tasks found</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedTasks.map((task) => {
                const status = getStatusInfo(task.statusId);
                return (
                  <TaskContextMenu key={task.id} task={task}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTask(task)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <span className="line-clamp-1">{task.title}</span>
                          {task.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {status && (
                          <Badge
                            variant="secondary"
                            className="gap-1.5"
                            style={{ backgroundColor: `${status.color}15` }}
                          >
                            <status.icon className="size-3" style={{ color: status.color }} />
                            {status.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <Avatar key={assignee.id} className="size-6 border-2 border-background">
                              <AvatarImage src={assignee.image || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {assignee.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="flex items-center justify-center size-6 rounded-full bg-muted border-2 border-background text-[10px] font-medium">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.date ? (
                          <span className="text-sm">
                            {format(new Date(task.date), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(task);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TaskContextMenu>
                );
              })
            )}
          </TableBody>
        </Table>
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
