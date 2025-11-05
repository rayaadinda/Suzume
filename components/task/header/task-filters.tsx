"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  Check,
  Layers,
  Stars,
  InfoIcon,
  Hexagon,
  Minus,
  Users,
  User,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTasksStore } from "@/store/tasks-store";
import { getCurrentUserData } from "@/app/actions/users";

const priorities = [
  { id: "all", name: "All priorities", icon: Layers },
  { id: "urgent", name: "Urgent", icon: Stars, color: "text-pink-500" },
  { id: "high", name: "High", icon: InfoIcon, color: "text-red-500" },
  { id: "medium", name: "Medium", icon: Hexagon, color: "text-cyan-500" },
  { id: "low", name: "Low", icon: Minus, color: "text-gray-400" },
];

const assignees = [
  { id: "all", name: "All assignees", icon: Users },
  { id: "me", name: "Assigned to me", icon: User },
  { id: "unassigned", name: "Unassigned", icon: UserX },
];

export function TaskFilters() {
  const [open, setOpen] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const { filters, setFilters } = useTasksStore();
  const selectedPriority = filters.priority || "all";
  const selectedAssignee = filters.assigneeId || "all";

  // Load current user on mount
  React.useEffect(() => {
    getCurrentUserData()
      .then((user) => setCurrentUserId(user.id))
      .catch((error) => console.error("Error fetching current user:", error));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="sm:gap-2">
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              Priority
            </h4>
            <div className="space-y-1">
              {priorities.map((priority) => {
                const Icon = priority.icon;
                return (
                  <Button
                    key={priority.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between h-9 px-3"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        priority: priority.id === "all" ? undefined : priority.id,
                      });
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`size-4 ${priority.color || "text-muted-foreground"}`}
                      />
                      <span className="text-sm">{priority.name}</span>
                    </div>
                    {selectedPriority === priority.id && (
                      <Check className="size-4 text-primary" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Assignee
            </h4>
            <div className="space-y-1">
              {assignees.map((assignee) => {
                const Icon = assignee.icon;
                return (
                  <Button
                    key={assignee.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between h-9 px-3"
                    onClick={() => {
                      let assigneeId: string | undefined;
                      if (assignee.id === "all") {
                        assigneeId = undefined;
                      } else if (assignee.id === "me") {
                        assigneeId = currentUserId || undefined;
                      } else {
                        assigneeId = assignee.id; // "unassigned"
                      }
                      setFilters({
                        ...filters,
                        assigneeId,
                      });
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="text-sm">{assignee.name}</span>
                    </div>
                    {selectedAssignee === assignee.id && (
                      <Check className="size-4 text-primary" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          <Button
            variant="outline"
            size="sm"
            className="w-full h-9"
            onClick={() => {
              setFilters({
                ...filters,
                priority: undefined,
                assigneeId: undefined,
              });
            }}
          >
            Clear all filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

