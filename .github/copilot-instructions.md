# Copilot Instructions for Task Management

## Project Overview

This is a **Next.js 16 task board application** built with React 19, TypeScript, and Tailwind CSS. It displays tasks in a Kanban-style board with 6 status columns. The app uses mock data and client-side state management via Zustand.

**Tech Stack**: Next.js 16, React 19, Zustand, Radix UI, Tailwind CSS 4, TypeScript 5, ESLint 9

## Architecture

### Core Patterns

- **State Management**: Zustand store (`store/tasks-store.ts`) holds all task data. The store maintains both a flat task array and a denormalized `tasksByStatus` object for efficient column rendering.
- **Component Organization**:
  - `components/task/board/` - Kanban board components (TaskBoard → TaskColumn → TaskCard)
  - `components/task/header/` - Top controls (filters, sort, date picker, import/export)
  - `components/task/sidebar/` - Navigation sidebar
  - `components/ui/` - Radix UI wrapper components (Button, Avatar, Badge, Calendar, etc.)
- **Data Structure**: Tasks (`mock-data/tasks.ts`) have a 6-status workflow: Backlog → To-Do → In Progress → Technical Review → Paused → Completed
- **Styling**: CSS utility classes via Tailwind 4 with `cn()` utility (`lib/utils.ts`) that merges class names intelligently

### Data Flow

```
useTasksStore (Zustand)
  ↓
TaskBoard reads tasksByStatus
  ↓
TaskColumn (mapped per status) receives status + filtered tasks
  ↓
TaskCard renders individual task with metadata
```

Store methods: `addTask()`, `updateTask()`, `deleteTask()`, `updateTaskStatus()` - all automatically recompute `groupTasksByStatus()` to keep columns in sync.

## Key Files & Their Purpose

| File                                    | Purpose                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `store/tasks-store.ts`                  | Zustand store - single source of truth for task data                                      |
| `mock-data/tasks.ts`                    | Task interface definition and hardcoded task array                                        |
| `mock-data/statuses.tsx`                | 6 Status objects with custom SVG progress icons                                           |
| `components/task/board/task-board.tsx`  | Maps statuses array to TaskColumn components                                              |
| `components/task/board/task-column.tsx` | Column wrapper with header, add/menu buttons, scrollable task list                        |
| `components/task/board/task-card.tsx`   | Task display with priority icon, labels, metadata (date, comments, attachments, progress) |
| `app/page.tsx`                          | Root layout integrating Sidebar + Header + Board                                          |
| `lib/utils.ts`                          | `cn()` function for className merging                                                     |

## Common Tasks

### Adding a New Task Status

1. Add new status object to `statuses` array in `mock-data/statuses.tsx` (must define icon, color, id)
2. Create corresponding icon component (React FC returning SVG)
3. Add sample tasks with that status in `mock-data/tasks.ts`
4. No store changes needed - `tasksByStatus` is computed dynamically

### Modifying Task Fields

1. Update `Task` interface in `mock-data/tasks.ts`
2. Update mock task objects to include the field
3. Update `TaskCard` to render it (in `components/task/board/task-card.tsx`)
4. Ensure store's `groupTasksByStatus()` still works (typically no change needed)

### Adding Store Actions

Add new methods to Zustand store in `store/tasks-store.ts` following the pattern:

```typescript
newAction: (param) =>
	set((state) => ({
		tasks: updatedArray,
		tasksByStatus: groupTasksByStatus(updatedArray),
	}))
```

## UI Component Conventions

- **Radix UI Wrappers** in `components/ui/` are unstyled base components - styled variants defined inline with Tailwind
- **Badge colors**: Use `label.color` class (defined in mock-data, e.g., "text-yellow-500" mapped to label objects)
- **Icons**: Use `lucide-react` for UI icons; custom SVGs in status files for progress indicators
- **Responsive**: `hidden lg:flex` pattern for mobile/desktop toggle; `shrink-0` preserves component size

## Commands

```bash
pnpm dev        # Start Next.js dev server (port 3000)
pnpm build      # Next.js build
pnpm start      # Start production server
pnpm lint       # ESLint check
```

## Path Aliases

`@/` maps to workspace root (configured in `tsconfig.json`). Always use `@/` imports for clarity.

## Notes for AI Agents

- **Statuses are immutable**: Modify status list only in `mock-data/statuses.tsx` - referenced by `Task.status` object, not ID string
- **Data persistence**: Currently mock data only - no backend integration
- **Performance**: `tasksByStatus` object is recomputed on every store mutation; for large datasets (1000+ tasks), consider incremental updates
- **Styling philosophy**: Component-scoped Tailwind utilities; avoid creating new CSS files
- **Theme support**: `next-themes` configured in RootLayout for dark/light mode toggle
