# CLAUDE.md



This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


# RULE!! IMPORTAND

DONT EVER ADD COMMENTS LINE THIS IN THE FINAL OUTPUT OF GENERATION!!
## 🎉 Recent Updates

**User Profile Integration with TanStack Query** - January 2025

- ✅ **TanStack Query Setup** - Integrated React Query for server state management
  - QueryProvider wrapper in root layout
  - Custom `useUser()` hook for fetching user data
  - API endpoint `/api/user/[id]` for user profile retrieval
  - Loading states and error handling
- ✅ **NavUser Component** - Dynamic user profile in sidebar
  - Fetches authenticated user data from database
  - Shows avatar with fallback to initials
  - Loading skeleton while fetching
  - Functional logout with proper session cleanup
- ✅ **Settings Page Enhancement** - User profile management
  - Displays current user data (name, email, avatar)
  - Loading states for better UX
  - Form fields pre-populated with user data
  - Avatar display with initials fallback

**Sprint 2 Completed** - November 5, 2025

Phase 2 (Views & Navigation) features - ALL COMPLETED:

- ✅ **Multiple View Modes** - Kanban/List/Calendar views with toggle switcher
  - ViewModeSwitcher component with localStorage persistence
  - ListView with sortable table (title, status, priority, date)
  - CalendarView with date-based task organization
  - Conditional rendering in TaskBoard
- ✅ **Dashboard/Analytics** - Comprehensive productivity metrics
  - Analytics calculation functions (lib/analytics.ts)
  - Task completion trends (7-day area chart)
  - Priority & status distribution charts (pie & bar)
  - Productivity metrics cards (total, completed, weekly progress, overdue)
  - Top contributors/assignees tracking
- ✅ **Advanced Search & Filters** - Full-text search with saved presets
  - Advanced filter dialog with multiple criteria
  - Multi-select component for labels with color indicators
  - Date range picker (from/to dates)
  - Filter presets (save/load/delete) stored in localStorage
  - Active filter count badge
  - Enhanced server actions to support label and date filtering
- ✅ **Date Picker Enhancement** - Real date selection with shadcn Calendar
  - Replaced text input with Popover + Calendar component
  - Proper date formatting (display vs storage)
  - Applied to both task-dialog and task-details-dialog

**Task Dialog Revamp** - January 2025

- ✨ Revamped task creation/editing dialog with modern field components
- ✅ Uses shadcn field.tsx component system for better UX
- ✅ Organized into logical sections: Task Details & Assignment
- ✅ Enhanced with helpful descriptions and better spacing
- ✅ Improved error display with FieldError component
- ✅ Horizontal button layout using Field orientation

**Sprint 1 Completed** - November 5, 2025

- ✅ Command Palette (Cmd+K) with global search and quick actions
- ✅ Empty States for better UX feedback
- ✅ Context Menus on task cards (right-click actions)
- ✅ Enhanced Notifications with Sonner toasts
- ✅ Keyboard Shortcuts foundation

All features tested and working. See [Project Vision & Feature Roadmap](#project-vision--feature-roadmap) section below for details.

---

## Project Overview

A **self-hosted task management application** with a Kanban-style interface for managing tasks across 6 status columns. Built with Next.js 16, React 19, TypeScript, Go backend, BetterAuth authentication, Drizzle ORM with Supabase PostgreSQL, and real-time WebSocket updates.

**Frontend Stack**: Next.js 16, React 19, Zustand, TanStack Query, BetterAuth, Drizzle ORM, Radix UI, Tailwind CSS 4, TypeScript 5
**Backend Stack**: Go 1.21+, Gin web framework, Gorilla WebSocket, JWT authentication
**Database**: Supabase PostgreSQL with Drizzle ORM

## Commands

### Frontend (from `frontend/` directory)

```bash
cd frontend

# Development
pnpm dev               # Start Next.js dev server (port 3000)
pnpm build             # Production build
pnpm start             # Start production server
pnpm lint              # Run ESLint

# Database
pnpm db:generate       # Generate Drizzle migration from schema changes
pnpm db:push           # Push schema changes to database (development)
pnpm db:migrate        # Run pending migrations (production)
pnpm db:seed           # Seed database with initial data
pnpm db:studio         # Open Drizzle Studio (database GUI)
```

### Backend (from `backend/` directory)

```bash
cd backend

# Development
go run cmd/server/main.go    # Start Go WebSocket server (port 8080)
go build -o bin/server cmd/server/main.go  # Build binary
./bin/server                  # Run built binary

# Dependencies
go mod tidy                   # Install/update dependencies
```

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js App (http://localhost:3000)                 │  │
│  │  • BetterAuth (email/password auth)                  │  │
│  │  • Protected routes via middleware                   │  │
│  │  • TanStack Query (server state management)          │  │
│  │  • Zustand store (client state)                      │  │
│  │  • Server Actions (Drizzle ORM)                      │  │
│  │  • WebSocket client (real-time)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│          │                                   │               │
│          │ HTTPS                             │ WSS           │
│          ↓                                   ↓               │
└─────────────────────────────────────────────────────────────┘
         │                                     │
    PostgreSQL                          Go Backend
    (Supabase)                    (http://localhost:8080)
         │                                     │
    ┌────────────┐                    ┌──────────────────┐
    │  Database  │                    │  WebSocket Hub   │
    │  • users   │                    │  • Broadcasting  │
    │  • tasks   │                    │  • JWT Auth      │
    │  • labels  │                    │  • CORS          │
    │  • sessions│                    └──────────────────┘
    └────────────┘
```

### Route Structure (Next.js App Router)

```
app/
├── layout.tsx                    # Root layout (QueryProvider, Theme provider, Toaster)
├── page.tsx                      # Root page (redirects to /tasks)
├── (dashboard)/                  # Route group with shared layout
│   ├── layout.tsx               # Sidebar + Header layout for all dashboard pages
│   ├── tasks/
│   │   └── page.tsx            # Task board page (kanban view)
│   ├── dashboard/
│   │   └── page.tsx            # Analytics dashboard
│   └── settings/
│       └── page.tsx            # User settings & profile
├── login/
│   └── page.tsx                # Login page
├── signup/
│   └── page.tsx                # Signup page
└── api/
    ├── auth/
    │   └── [...all]/
    │       └── route.ts        # BetterAuth API routes
    └── user/
        └── [id]/
            └── route.ts        # User profile API endpoint
```

**Key Points:**

- Root `/` redirects to `/tasks`
- `(dashboard)` is a route group that wraps `/tasks`, `/dashboard`, and `/settings` with the same layout
- Layout includes: Sidebar, Header, WebSocket provider, Command palette
- All dashboard routes share the same navigation and real-time updates
- TanStack Query manages server state (user profiles, etc.)
- Zustand manages client state (tasks, filters, UI state)

### Data Flow

**Authentication Flow:**

1. User signs up/logs in → BetterAuth → Database
2. JWT token stored in HTTP-only cookie
3. Middleware validates session on all protected routes
4. JWT token used for WebSocket authentication

**Task CRUD Operations:**

1. User action (create/update/delete task)
2. Frontend calls Server Action (app/actions/tasks.ts)
3. Server Action: Drizzle ORM → Database
4. Server Action: HTTP POST → Go Backend /api/broadcast
5. Go Backend: Broadcasts via WebSocket to all connected clients
6. All clients receive update → Zustand store refreshes → UI updates

**Real-time Updates:**

- WebSocket connection established on app load (authenticated)
- Server Actions trigger broadcasts after database mutations
- All connected clients receive updates instantly
- Zustand store automatically refetches tasks

### State Management Pattern

The application uses **Zustand with Server Actions**:

```typescript
// store/tasks-store.ts
{
  tasks: TaskWithRelations[],           // Array of tasks from database
  tasksByStatus: Record<string, Task[]>, // Denormalized by statusId
  loading: boolean,                      // Loading state
  error: string | null,                  // Error state
  filters: { ... },                      // Active filters

  // Actions
  fetchTasks: () => Promise<void>,       // Fetch from server
  addTask: (data) => Promise<void>,      // Create task
  updateTaskAction: (...) => Promise<void>, // Update task
  deleteTaskAction: (id) => Promise<void>,  // Delete task
  updateTaskStatusAction: (...) => Promise<void>, // Move task
  setFilters: (filters) => void,         // Update filters
}
```

**Critical**: All store mutations call Server Actions, which update the database and broadcast WebSocket messages. The store's `setTasks()` method is used by WebSocket listener to update local state.

### Component Hierarchy

```
app/layout.tsx (Root - QueryProvider, Theme, Toaster)
│
├── app/page.tsx → redirects to /tasks
│
└── app/(dashboard)/layout.tsx (Shared layout for tasks & dashboard & settings)
    ├── WebSocketProvider (real-time connection manager)
    ├── SidebarProvider
    │   ├── TaskSidebar (with navigation, user profile, logout)
    │   │   └── NavUser (TanStack Query - user profile)
    │   └── SidebarInset
    │       ├── TaskHeader (filters, sort, command palette trigger)
    │       └── main
    │           ├── /tasks → TaskBoard
    │           │   └── TaskColumn (mapped per status)
    │           │       └── TaskCard (individual tasks)
    │           │
    │           ├── /dashboard → DashboardPage
    │           │   ├── Metrics Cards
    │           │   ├── Completion Trend Chart
    │           │   ├── Priority Distribution Chart
    │           │   ├── Status Distribution Chart
    │           │   └── Top Contributors List
    │           │
    │           └── /settings → SettingsPage
    │               ├── Profile Tab (TanStack Query - user data)
    │               ├── Notifications Tab
    │               ├── Security Tab
    │               ├── Appearance Tab
    │               └── Data Tab
    │
    └── CommandPalette (Cmd+K global search)
```

### Database Schema (Drizzle ORM)

**Tables:**

- `users` - User accounts (auth)
- `sessions` - Active sessions (auth)
- `accounts` - OAuth accounts (auth, future)
- `verifications` - Email verifications (auth)
- `tasks` - Task records
- `statuses` - Task statuses (6 hardcoded)
- `labels` - Task labels/categories
- `task_assignees` - Many-to-many: tasks ↔ users
- `task_labels` - Many-to-many: tasks ↔ labels

**Key Fields:**

- `tasks.statusId` → references `statuses.id` (text: "backlog", "to-do", etc.)
- Tasks have: title, description, priority, progress, dates, counts
- Status workflow order enforced by `displayOrder` field

### Server Actions (app/actions/)

**tasks.ts:**

- `getTasks(filters?)` - Fetch all tasks with relations, filtering, sorting
- `createTask(data)` - Create new task + broadcast update
- `updateTask(id, updates)` - Update task fields + broadcast update
- `deleteTask(id)` - Delete task + broadcast update
- `updateTaskStatus(id, statusId)` - Move task to different column + broadcast

**users.ts:**

- `getUsers()` - Get all users (for assignee dropdowns)
- `getCurrentUserData()` - Get logged-in user

**API Routes:**

- `GET /api/user/[id]` - Fetch user profile by ID (used by TanStack Query)

**labels.ts:**

- `getLabels()` - Get all labels

**statuses.ts:**

- `getStatuses()` - Get all statuses (ordered by displayOrder)

### Authentication (BetterAuth)

**Configuration** (`lib/auth.ts`):

- Email/password authentication
- PostgreSQL adapter via Drizzle
- 7-day session expiration
- Auto sign-in after registration
- JWT tokens for WebSocket auth

**Protected Routes** (`middleware.ts`):

- All routes except `/login` and `/signup` require authentication
- Redirects to login with `?from=` parameter
- Session validated via BetterAuth API

**Logout Flow:**

- NavUser dropdown logout → `signOut()` → redirect to `/login`

**User Profile Management:**

- TanStack Query hook: `useUser()` fetches authenticated user data
- API endpoint: `GET /api/user/[id]` returns user profile
- Used in: NavUser component (sidebar), Settings page
- Automatic session integration with BetterAuth

### WebSocket Integration

**Client** (`lib/websocket.ts`):

- Singleton WebSocket client
- Auto-reconnection with exponential backoff (max 5 attempts)
- Heartbeat ping/pong every 30 seconds
- JWT token authentication via query parameter

**Provider** (`components/websocket-provider.tsx`):

- Wraps app in page.tsx
- Establishes WebSocket connection on mount (if authenticated)
- Listens for messages: `task_created`, `task_updated`, `task_deleted`, `task_status_changed`
- Triggers `fetchTasks()` on any task change

**Backend** (`backend/internal/websocket/`):

- Hub manages all connected clients
- Broadcast endpoint: `POST /api/broadcast` (requires JWT)
- Server Actions call this after database mutations
- Message format: `{ type: string, payload: object }`

## Key Development Patterns

### Using TanStack Query for Server State

**Setup** (`components/query-provider.tsx`):

```typescript
export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute
						refetchOnWindowFocus: false,
					},
				},
			})
	)

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
```

**Custom Hook Pattern** (`hooks/use-user.ts`):

```typescript
export function useUser() {
	const { data: session, isPending: isSessionPending } = useSession()

	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["user", session?.user?.id],
		queryFn: async () => {
			if (!session?.user?.id) return null
			const response = await fetch(`/api/user/${session.user.id}`)
			if (!response.ok) throw new Error("Failed to fetch user")
			return response.json() as Promise<User>
		},
		enabled: !!session?.user?.id,
	})

	return {
		user: user || (session?.user as User | null),
		isLoading: isLoading || isSessionPending,
		error,
	}
}
```

**Usage in Components:**

```typescript
const { user, isLoading, error } = useUser()

if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorMessage />
if (!user) return <NoUserState />

return <UserProfile user={user} />
```

### Adding New Server Action

1. Create function in `app/actions/*.ts`:

```typescript
"use server"

export async function myAction(data: Type): Promise<Result> {
	await getCurrentUser() // Ensure authenticated

	try {
		// Drizzle ORM query
		const result = await db.insert(table).values(data).returning()

		// Broadcast WebSocket update
		await broadcastTaskUpdate("event_type", { id: result.id })

		revalidatePath("/") // Revalidate cache
		return result
	} catch (error) {
		throw new Error("Operation failed")
	}
}
```

2. Add corresponding Zustand store action that calls the Server Action
3. Update UI components to call the store action

### Adding Database Table

1. Define schema in `frontend/db/schema.ts`:

```typescript
export const myTable = pgTable("my_table", {
	id: uuid("id").defaultRandom().primaryKey(),
	// ... columns
})
```

2. Generate migration: `pnpm db:generate`
3. Push to database: `pnpm db:push` (dev) or `pnpm db:migrate` (prod)
4. Add to seed script if needed: `frontend/db/seed.ts`

### Styling Conventions

- Use `cn()` utility (lib/utils.ts) for conditional className merging
- Radix UI components in `components/ui/` are pre-styled wrappers
- Path alias: `@/` maps to frontend root (tsconfig.json)
- Icons: `lucide-react` for UI, custom SVGs in statuses.tsx for progress indicators
- Dark mode: `next-themes` configured in app/layout.tsx

## Environment Variables

**Frontend (.env.local):**

```env
DATABASE_URL=                      # Supabase PostgreSQL connection string
BETTER_AUTH_SECRET=                # 32+ char random secret for JWT
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

**Backend (.env):**

```env
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=                        # MUST match BETTER_AUTH_SECRET
```

**Critical**: `JWT_SECRET` and `BETTER_AUTH_SECRET` **must be identical** for WebSocket authentication to work.

## Development Workflow

### Local Development

1. Start Supabase (or use hosted Supabase)
2. Run database migrations: `cd frontend && pnpm db:push`
3. Seed database: `pnpm db:seed`
4. Start Go backend: `cd backend && go run cmd/server/main.go`
5. Start Next.js: `cd frontend && pnpm dev`
6. Open http://localhost:3000
7. Sign up for an account

### Making Schema Changes

1. Edit `frontend/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Review migration SQL in `frontend/db/migrations/`
4. Push to database: `pnpm db:push`
5. Update seed script if needed
6. Update Server Actions to use new fields
7. Update TypeScript types

### Testing Real-time Updates

1. Open app in two browser windows/tabs
2. Sign in to both
3. Create/update/delete a task in one window
4. Observe instant update in the other window
5. Check browser console for WebSocket messages
6. Check Go backend logs for broadcast activity

## Production Deployment

### Security Checklist

- [ ] Generate strong secrets: `openssl rand -hex 32`
- [ ] Enable HTTPS for frontend
- [ ] Use WSS (WebSocket Secure) for WebSocket
- [ ] Restrict CORS to production domains only
- [ ] Use connection pooler for database
- [ ] Enable RLS (Row Level Security) in Supabase
- [ ] Set secure cookie settings in BetterAuth
- [ ] Rate limit authentication endpoints
- [ ] Monitor WebSocket connection count

### Environment Setup

1. Deploy PostgreSQL (Supabase recommended)
2. Run migrations: `pnpm db:migrate`
3. Set environment variables (secrets in secure vault)
4. Build Go backend: `go build -o server cmd/server/main.go`
5. Build Next.js: `pnpm build`
6. Deploy frontend (Vercel/Netlify)
7. Deploy Go backend (Docker/VPS/cloud)
8. Configure DNS and SSL certificates

## Troubleshooting

### WebSocket Connection Issues

- Check JWT_SECRET matches BETTER_AUTH_SECRET
- Verify WebSocket URL is correct (ws:// for dev, wss:// for prod)
- Check CORS origins include frontend URL
- Look for auth errors in Go backend logs
- Ensure user is logged in before WebSocket connects

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check Supabase project is active
- Use direct connection for migrations, pooler for app
- Check database logs in Supabase dashboard

### Authentication Issues

- Clear browser cookies and try again
- Check BETTER_AUTH_SECRET is set
- Verify session table has required columns (token, created_at, updated_at)
- Check middleware.ts is not blocking public routes

## Project Vision & Feature Roadmap

**Vision**: Evolve from a task manager into an **all-in-one personal productivity platform** that consolidates multiple tools (tasks, notes, habits, time tracking, goals) into a single self-hosted application.

### Feature Roadmap (Priority Order)

#### **Phase 1: Core Task Management Enhancements** 🎯 ✅ COMPLETED

1. **Command Palette (Cmd+K)** ✅ IMPLEMENTED - Quick actions, search, keyboard shortcuts

   - Component: `command` ✅ installed
   - File: `components/command-palette.tsx`
   - Quick task creation, global search, recent tasks
   - Keyboard shortcut: Cmd+K / Ctrl+K
   - Integration: Added to `app/page.tsx` and `task-header.tsx`

2. **Empty States** ✅ IMPLEMENTED - Better visual feedback for empty columns/filters

   - Component: `empty` ✅ installed
   - File: `components/task/board/task-empty-state.tsx`
   - Multiple variants: column, search, filter, initial
   - Icons and illustrations for better UX

3. **Context Menus** ✅ IMPLEMENTED - Right-click quick actions on tasks

   - Component: `context-menu` ✅ installed
   - File: `components/task/task-context-menu.tsx`
   - Actions: Duplicate, archive, move to status, copy link, delete
   - Integrated into `task-card.tsx`

4. **Enhanced Notifications** ✅ IMPLEMENTED - Better toast notifications

   - Component: `sonner` ✅ installed
   - File: `components/ui/sonner.tsx`
   - Success/error/info with action buttons (Undo, View)
   - Integrated into `app/layout.tsx`
   - Used throughout command palette and context menu

5. **Keyboard Shortcuts** ✅ IMPLEMENTED - Full keyboard navigation
   - Component: `kbd` (already existed)
   - Hook: `hooks/use-keyboard-shortcuts.ts`
   - Display shortcuts in tooltips and command palette
   - Main shortcut: Cmd+K for command palette

**Sprint 1 Status**: ✅ COMPLETED (November 5, 2025)

- All 5 features successfully implemented
- Components installed via shadcn/ui
- No blocking errors, only minor linting warnings
- Development server running successfully

**Files Added/Modified (Sprint 1):**

- ✅ `components/ui/command.tsx` - Command palette component
- ✅ `components/ui/empty.tsx` - Empty state component
- ✅ `components/ui/sonner.tsx` - Toast notifications
- ✅ `components/ui/context-menu.tsx` - Context menu component
- ✅ `components/command-palette.tsx` - Main command palette implementation
- ✅ `components/task/board/task-empty-state.tsx` - Task-specific empty states
- ✅ `components/task/task-context-menu.tsx` - Task context menu
- ✅ `hooks/use-keyboard-shortcuts.ts` - Keyboard shortcuts hook
- ✅ `app/layout.tsx` - Added Toaster component and QueryProvider
- ✅ `app/page.tsx` - Integrated command palette
- ✅ `components/task/header/task-header.tsx` - Added search button with Cmd+K hint
- ✅ `components/task/board/task-card.tsx` - Wrapped with context menu
- ✅ `components/query-provider.tsx` - TanStack Query provider
- ✅ `hooks/use-user.ts` - User profile hook with TanStack Query
- ✅ `app/api/user/[id]/route.ts` - User profile API endpoint
- ✅ `components/task/sidebar/nav-user.tsx` - Dynamic user profile component
- ✅ `app/(dashboard)/settings/page.tsx` - Settings page with user data

**Files Added/Modified (Sprint 2):**

- ✅ `components/task/header/advanced-filters.tsx` - Advanced filter dialog component
- ✅ `components/ui/multi-select.tsx` - Multi-select component for labels
- ✅ `components/ui/input-group.tsx` - Fixed import paths (from registry to components)
- ✅ `store/tasks-store.ts` - Added `labelIds`, `dateFrom`, `dateTo` to filters interface
- ✅ `app/actions/tasks.ts` - Enhanced `getTasks()` to support label and date filtering
- ✅ `components/task/header/task-header.tsx` - Integrated AdvancedFilters component

**Sprint 2 Status**: ✅ COMPLETED (November 5, 2025)

**Sprint 3 Completed** - January 2025

Phase 3 (Productivity Features) - ALL 5 FEATURES COMPLETED:

- ✅ **Quick Capture Inbox** - Rapid task capture with Cmd+Shift+N shortcut
  - Sheet/drawer component for minimal-friction task entry
  - Batch capture mode for adding multiple tasks quickly
  - Quick status and priority selection
  - Integrated into task header
- ✅ **Subtasks & Checklists** - Task breakdown with progress tracking
  - Database schema with subtasks table and cascade delete
  - Collapsible checklist UI with drag handles
  - Inline editing, completion toggle, progress bar
  - Integrated into task details dialog
  - Server actions for full CRUD operations
- ✅ **Time Tracking & Pomodoro Timer** - Focus timer with session tracking
  - 25/5/15 minute presets (focus/short break/long break)
  - Customizable durations
  - Session counter with auto-switching
  - Browser notifications on completion
  - Compact and standalone views
- ✅ **Daily Planning View** - Today's focus with time blocking
  - Dedicated planning page at `/planning`
  - Morning planning checklist (customizable, localStorage-based)
  - Daily goals section (auto-saves to localStorage)
  - Today's tasks summary (filtered by due date)
  - Time blocking schedule (6 AM - 10 PM hourly slots)
  - Drag-and-drop tasks into time slots (UI ready)
  - Time block fields added to tasks (timeBlockStart, timeBlockEnd)
- ✅ **Recurring Tasks & Templates** - Repeating tasks with full scheduling
  - Database schema: isRecurring, recurrencePattern, recurrenceInterval, recurrenceDays, recurrenceEndDate
  - Recurring section in task dialog with collapsible UI
  - Recurrence patterns: daily, weekly, monthly
  - Interval configuration (every X days/weeks/months)
  - Weekly day selection (Mon-Sun buttons)
  - Optional end date with date picker
  - Recurring badge on task cards (primary outline badge with Repeat icon)
  - Server actions updated to handle all recurring fields

**Sprint 3 Status**: ✅ COMPLETED (100% complete - 5/5 features)

**Files Added/Modified (Sprint 3 - Features 11 & 12):**

- ✅ `db/schema.ts` - Added recurring task fields and time blocking fields
- ✅ `db/migrations/0004_purple_marauders.sql` - Migration for new fields
- ✅ `db/apply-migration.ts` - Helper script for applying migrations
- ✅ `app/(dashboard)/planning/page.tsx` - Daily Planning page with time blocking
- ✅ `app/actions/tasks.ts` - Updated TaskWithRelations type and CRUD actions for recurring fields
- ✅ `components/ui/scroll-area.tsx` - Scroll area component for planning page
- ✅ `components/task/task-dialog.tsx` - Added recurring settings section with full UI
- ✅ `components/task/board/task-card.tsx` - Added recurring badge with Repeat icon
- ✅ `components/task/sidebar/task-sidebar.tsx` - Added Daily Planning navigation link

---

#### **Phase 2: Views & Navigation** 📊 ✅ COMPLETED

6. **Multiple View Modes** ✅ IMPLEMENTED - Kanban/List/Calendar views

   - Components: `toggle-group` ✅, `table` ✅, `calendar` ✅
   - File: `components/task/header/view-mode-switcher.tsx`
   - View switcher in header with localStorage persistence
   - ListView: `components/task/views/list-view.tsx` - Sortable table
   - CalendarView: `components/task/views/calendar-view.tsx` - Date-based view
   - Zustand store: Added viewMode state management

7. **Dashboard/Analytics** ✅ IMPLEMENTED - Task completion trends & productivity metrics

   - Components: `chart` ✅, `tabs` ✅
   - Route: `app/dashboard/page.tsx`
   - Analytics: `lib/analytics.ts` - Calculation functions
   - Features:
     - Task metrics cards (total, completed, weekly progress, overdue)
     - Completion trend chart (7-day area chart)
     - Priority distribution (pie chart)
     - Status distribution (bar chart)
     - Top contributors tracking
   - Navigation: Added dashboard link in sidebar

8. **Advanced Search & Filters** ✅ IMPLEMENTED - Full-text search with saved presets
   - Components: `input-group` ✅, custom `multi-select` ✅
   - File: `components/task/header/advanced-filters.tsx`
   - Multi-select component: `components/ui/multi-select.tsx`
   - Features:
     - Full-text search across task titles and descriptions
     - Priority filter dropdown
     - Multi-label selection with color indicators
     - Date range picker (from/to dates)
     - Filter presets (save/load/delete) stored in localStorage
     - Active filter count badge
     - Clear all filters button
   - Store integration: Updated Zustand store to support `labelIds`, `dateFrom`, `dateTo` filters
   - Server Actions: Enhanced `getTasks()` to filter by labels and date ranges
   - Integration: Added to task header alongside existing filters

#### **Phase 3: Productivity Features** ⚡ (3/5 COMPLETED)

9. **Time Tracking & Pomodoro** ✅ IMPLEMENTED - Focus timer with session tracking

   - Components: `progress` ✅, `sheet` ✅
   - File: `components/task/pomodoro-timer.tsx`
   - Features:
     - 25/5/15 minute presets (focus, short break, long break)
     - Customizable timer durations via settings
     - Session counter with automatic mode switching
     - Browser notifications on completion
     - Compact view (popover) and standalone view
     - Play/pause, reset controls with progress bar
   - Integration: Can be embedded in task cards or used standalone

10. **Quick Capture Inbox** ✅ IMPLEMENTED - Rapid task capture with keyboard shortcut

    - Component: `sheet` ✅
    - File: `components/task/quick-capture.tsx`
    - Features:
      - Keyboard shortcut: Cmd+Shift+N / Ctrl+Shift+N
      - Minimal friction form (title, status, priority)
      - Batch capture mode (stays open for multiple entries)
      - Success toasts with task confirmation
      - ESC to close, Enter to submit
    - Integration: Added to task header with prominent button

11. **Daily Planning View** ✅ IMPLEMENTED - Today's focus with time blocking

    - Components: `calendar` ✅, `progress` ✅, `scroll-area` ✅
    - File: `app/(dashboard)/planning/page.tsx`
    - Features:
      - Morning planning checklist with completion tracking
      - Daily goals section with auto-save
      - Today's tasks summary (filtered by due date)
      - Time blocking schedule (6 AM - 10 PM)
      - Drag-and-drop task scheduling (UI ready)
      - Time block fields in database schema
    - Navigation: Added "Daily Planning" link in sidebar

12. **Recurring Tasks & Templates** ✅ IMPLEMENTED - Repeating tasks with scheduling

    - Components: `calendar` ✅, `badge` ✅, `checkbox` ✅
    - Files: Updated task dialog, task card, server actions
    - Features:
      - Daily/weekly/monthly recurrence patterns
      - Interval configuration (every X periods)
      - Weekly day selection (multi-select buttons)
      - Optional end date with date picker
      - Recurring badge on task cards
      - Full database schema support
    - Integration: Collapsible section in task dialog

13. **Subtasks & Checklists** ✅ IMPLEMENTED - Task breakdown with collapsible UI
    - Components: `collapsible` ✅, `progress` ✅
    - Files:
      - `db/schema.ts` - Added subtasks table with relations
      - `app/actions/subtasks.ts` - Server actions (CRUD)
      - `components/task/subtask-list.tsx` - UI component
    - Features:
      - Collapsible checklist with progress tracking
      - Inline editing (click to edit subtask title)
      - Completion toggle with visual feedback
      - Delete with confirmation toast
      - Drag handles for reordering (visual only)
      - Progress bar showing % complete
      - Quick add input at bottom
    - Integration: Embedded in task details dialog

#### **Phase 4: Knowledge Management** 📝

14. **Notes & Documentation** - Rich text editor with markdown

    - Components: `textarea`, `tabs`
    - Link notes to tasks, wiki-style internal links

15. **File Attachments** - Upload files to tasks

    - Component: `item` (for file list)
    - Image previews, Supabase Storage integration

16. **Comments & Activity** - Task discussions
    - Components: `item`, `avatar`, `hover-card`
    - Activity feed, @mentions (future collaboration)

#### **Phase 5: Habits & Goals** 🎯

17. **Habit Tracker** - Daily habits with streaks

    - Components: `checkbox`, `chart` (heatmap)
    - Morning/evening routines, streak tracking

18. **Goals & OKRs** - Quarterly/yearly goals

    - Components: `progress`, `card`
    - Key results tracking, link tasks to goals

19. **Weekly Review** - Guided review process
    - Component: `field`, `textarea`
    - Wins/learnings capture, next week planning

#### **Phase 6: Advanced Features** 🔥

20. **Projects & Workspaces** - Multiple projects/areas

    - Components: `breadcrumb`, `tabs`
    - Project-specific views, archive completed

21. **Task Dependencies** - Block until dependencies complete

    - Component: Custom visualization
    - Dependency graph, critical path

22. **Calendar Integration** - Sync with Google Calendar

    - Component: `calendar`
    - See events alongside tasks, time blocking

23. **Focus Mode** - Distraction-free task view

    - Hide sidebar/notifications, current task timer

24. **Mobile Responsive** - PWA with touch-optimized UI

    - Component: `drawer` (mobile task details)
    - Touch drag-and-drop

25. **Data Export/Import** - Backup/restore functionality
    - Export CSV/JSON, import from Todoist/Trello

### shadcn/ui Component Library (60+ Components Available)

**IMPORTANT: Always use MCP shadcn server for UI components!**

#### Required MCP Tools

Use these MCP tools to discover and add components:

1. **Search for components:**

   ```typescript
   mcp__shadcn__search_items_in_registries({
   	registries: ["@shadcn"],
   	query: "command",
   })
   ```

2. **View component details & code:**

   ```typescript
   mcp__shadcn__view_items_in_registries({
   	items: ["@shadcn/command"],
   })
   ```

3. **Get usage examples:**

   ```typescript
   mcp__shadcn__get_item_examples_from_registries({
   	registries: ["@shadcn"],
   	query: "command-demo",
   })
   ```

4. **Get install command:**
   ```typescript
   mcp__shadcn__get_add_command_for_items({
   	items: ["@shadcn/command"],
   })
   ```

#### Available Component Categories

**Core UI (Already Using):**

- button, input, label, textarea, select, checkbox, radio-group, switch, badge, avatar, card, dialog, separator, slider

**New Components to Use:**

- `empty` - Empty states with icons/illustrations
- `field` - Modern form field wrapper
- `input-group` - Enhanced inputs with labels/icons/buttons
- `item` - Versatile list/card item component
- `spinner` - Loading indicators

**Navigation & Layout:**

- `command` - Command palette (Cmd+K)
- `breadcrumb` - Navigation breadcrumbs
- `menubar` - Application menu bar
- `navigation-menu` - Complex navigation
- `tabs` - Tab navigation
- `sheet` - Slide-out panels
- `drawer` - Mobile-friendly drawers

**Data Display:**

- `table` / `data-table-demo` - Tables with sorting/filtering
- `chart` - Recharts integration (area, bar, line, pie, radar)
- `progress` - Progress bars
- `skeleton` - Loading placeholders

**Interactive:**

- `context-menu` - Right-click menus
- `combobox` - Searchable select
- `hover-card` - Preview on hover
- `kbd` - Keyboard shortcut display
- `popover` - Floating panels
- `tooltip` - Contextual help

**Feedback:**

- `sonner` - Modern toast notifications
- `alert` / `alert-dialog` - Alerts & confirmations

**Utilities:**

- `collapsible` - Collapsible sections
- `resizable` - Resizable panels
- `scroll-area` - Custom scrollbars
- `toggle` / `toggle-group` - Toggle buttons
- `carousel` - Image/content carousels

#### Component Development Workflow

**Before building any new UI component:**

1. ✅ Search shadcn registry via MCP: `mcp__shadcn__search_items_in_registries`
2. ✅ Check for examples: `mcp__shadcn__get_item_examples_from_registries`
3. ✅ Install via MCP command: `mcp__shadcn__get_add_command_for_items`
4. ❌ Do NOT build custom components if shadcn equivalent exists

**Component priorities for upcoming features:**

- **Immediate**: `command`, `empty`, `sonner`, `kbd`, `context-menu`
- **High**: `data-table-demo`, `chart`, `combobox`, `drawer`
- **Medium**: `breadcrumb`, `resizable`, `toggle-group`, `collapsible`, `carousel`
- **Low**: `hover-card`, `menubar`, `navigation-menu`

## Notes

- **Status workflow**: 4 hardcoded statuses (Backlog → Todo → In Progress → Completed)
- **Performance**: `groupTasksByStatus()` recomputes on every mutation. For 1000+ tasks, optimize with incremental updates
- **WebSocket**: Clients auto-reconnect with exponential backoff (max 5 attempts)
- **Server Actions**: Always call `getCurrentUser()` to ensure authentication
- **Real-time**: All CRUD operations broadcast to all connected clients
- **UI Components**: Always check shadcn MCP registry before building custom components (60+ components available)
