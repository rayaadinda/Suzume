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

---

## 📝 Implementation Guide: Notes & Documentation Feature

### Feature Overview

**Vision**: Create a Notion-style rich text editor for creating, organizing, and linking notes to tasks. This feature transforms the app into a comprehensive knowledge management system alongside task management.

**Core Features:**
- 📝 Rich text editor powered by Novel (built on Tiptap)
- 📂 Folders/notebooks for organization
- 🔗 Bidirectional linking between notes and tasks
- 🖼️ Image upload with Supabase Storage
- 📋 Note templates for common formats
- 🔍 Full-text search across notes
- 🌐 Real-time collaborative editing (WebSocket)
- 💾 Auto-save with debouncing
- 📱 Markdown export/import

**Tech Stack Rationale:**
- **Novel Editor**: Modern, extensible, Notion-like editing experience with slash commands
- **Tiptap**: Headless editor framework with powerful extensions ecosystem
- **Supabase Storage**: Integrated file storage for images/attachments
- **PostgreSQL Full-Text Search**: Fast, indexed search across note content
- **WebSocket**: Real-time collaborative editing (cursor positions, live updates)

### Database Schema

#### 1. Notes Table

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Tiptap JSON format
  plain_text TEXT,                              -- For full-text search
  folder_id UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  template_name TEXT,                           -- Template identifier
  cover_image TEXT,                             -- Supabase Storage URL
  icon_emoji TEXT,                              -- Optional note icon (emoji)
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_edited_by UUID REFERENCES users(id),

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(plain_text, ''))
  ) STORED
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
```

#### 2. Note Folders Table

```sql
CREATE TABLE note_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  color TEXT,                                   -- Folder color (#hex)
  icon_emoji TEXT,                              -- Folder icon (emoji)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_folders_user_id ON note_folders(user_id);
CREATE INDEX idx_folders_parent_id ON note_folders(parent_id);
```

#### 3. Note-Task Links Table (Many-to-Many)

```sql
CREATE TABLE note_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  UNIQUE(note_id, task_id)
);

CREATE INDEX idx_note_task_note ON note_task_links(note_id);
CREATE INDEX idx_note_task_task ON note_task_links(task_id);
```

#### 4. Note Templates Table

```sql
CREATE TABLE note_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Tiptap JSON format
  category TEXT,                                -- e.g., 'meeting', 'project', 'doc'
  icon_emoji TEXT,
  is_system BOOLEAN DEFAULT FALSE,             -- Built-in vs user-created
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_templates_user_id ON note_templates(user_id);
CREATE INDEX idx_templates_category ON note_templates(category);
```

#### Drizzle ORM Schema (frontend/db/schema.ts)

```typescript
import { pgTable, uuid, text, jsonb, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { users, tasks } from './schema'

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: jsonb('content').notNull().default({}),
  plainText: text('plain_text'),
  folderId: uuid('folder_id').references(() => noteFolders.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isTemplate: boolean('is_template').default(false),
  templateName: text('template_name'),
  coverImage: text('cover_image'),
  iconEmoji: text('icon_emoji'),
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastEditedBy: uuid('last_edited_by').references(() => users.id),
}, (table) => ({
  userIdx: index('idx_notes_user_id').on(table.userId),
  folderIdx: index('idx_notes_folder_id').on(table.folderId),
  updatedIdx: index('idx_notes_updated_at').on(table.updatedAt),
}))

export const noteFolders = pgTable('note_folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id').references((): any => noteFolders.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  color: text('color'),
  iconEmoji: text('icon_emoji'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('idx_folders_user_id').on(table.userId),
  parentIdx: index('idx_folders_parent_id').on(table.parentId),
}))

export const noteTaskLinks = pgTable('note_task_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id').references(() => notes.id, { onDelete: 'cascade' }).notNull(),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  noteIdx: index('idx_note_task_note').on(table.noteId),
  taskIdx: index('idx_note_task_task').on(table.taskId),
}))

export const noteTemplates = pgTable('note_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  content: jsonb('content').notNull().default({}),
  category: text('category'),
  iconEmoji: text('icon_emoji'),
  isSystem: boolean('is_system').default(false),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('idx_templates_user_id').on(table.userId),
  categoryIdx: index('idx_templates_category').on(table.category),
}))

// Relations
export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
  folder: one(noteFolders, { fields: [notes.folderId], references: [noteFolders.id] }),
  lastEditor: one(users, { fields: [notes.lastEditedBy], references: [users.id] }),
  taskLinks: many(noteTaskLinks),
}))

export const noteFoldersRelations = relations(noteFolders, ({ one, many }) => ({
  user: one(users, { fields: [noteFolders.userId], references: [users.id] }),
  parent: one(noteFolders, { fields: [noteFolders.parentId], references: [noteFolders.id], relationName: 'folder_parent' }),
  children: many(noteFolders, { relationName: 'folder_parent' }),
  notes: many(notes),
}))

export const noteTaskLinksRelations = relations(noteTaskLinks, ({ one }) => ({
  note: one(notes, { fields: [noteTaskLinks.noteId], references: [notes.id] }),
  task: one(tasks, { fields: [noteTaskLinks.taskId], references: [tasks.id] }),
}))

export const noteTemplatesRelations = relations(noteTemplates, ({ one }) => ({
  user: one(users, { fields: [noteTemplates.userId], references: [users.id] }),
}))

// Types
export type Note = typeof notes.$inferSelect
export type NoteInsert = typeof notes.$inferInsert
export type NoteFolder = typeof noteFolders.$inferSelect
export type NoteTemplate = typeof noteTemplates.$inferSelect
export type NoteTaskLink = typeof noteTaskLinks.$inferSelect

export type NoteWithRelations = Note & {
  user: typeof users.$inferSelect
  folder?: NoteFolder
  lastEditor?: typeof users.$inferSelect
  taskLinks: (NoteTaskLink & { task: typeof tasks.$inferSelect })[]
}
```

### Dependencies to Install

**Frontend packages:**

```bash
cd frontend

pnpm add novel@0.5.1
pnpm add tiptap@2.x
pnpm add @tiptap/extension-link@2.x
pnpm add @tiptap/extension-task-list@2.x
pnpm add @tiptap/extension-task-item@2.x
pnpm add @tiptap/extension-image@2.x
pnpm add @tiptap/extension-placeholder@2.x
pnpm add @supabase/storage-js@2.x
pnpm add react-dropzone@14.x
pnpm add use-debounce@10.x
```

**Supabase Storage Setup:**

```typescript
// lib/storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const notesStorage = supabase.storage.from('notes')
```

**Environment Variables:**

```env
# Add to frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### File Structure

**Complete list of files to create:**

```
frontend/
├── app/(dashboard)/
│   └── notes/
│       ├── page.tsx                      # Main notes page (split view)
│       ├── [id]/
│       │   └── page.tsx                  # Full-page note editor
│       └── layout.tsx                    # Notes-specific layout
│
├── components/notes/
│   ├── note-editor.tsx                   # Novel editor wrapper
│   ├── note-editor-menu.tsx              # Editor toolbar (formatting)
│   ├── note-list.tsx                     # Notes sidebar list
│   ├── note-card.tsx                     # Individual note preview
│   ├── note-header.tsx                   # Title, emoji, cover image
│   ├── folder-tree.tsx                   # Folder navigation tree
│   ├── folder-dialog.tsx                 # Create/edit folder
│   ├── template-selector.tsx             # Template picker dialog
│   ├── note-search.tsx                   # Full-text search input
│   ├── task-link-selector.tsx            # Link task to note dialog
│   ├── image-upload.tsx                  # Drag-drop image upload
│   └── note-empty-state.tsx              # Empty states
│
├── app/actions/
│   ├── notes.ts                          # Note CRUD actions
│   ├── note-folders.ts                   # Folder CRUD actions
│   ├── note-templates.ts                 # Template actions
│   └── note-search.ts                    # Full-text search action
│
├── store/
│   └── notes-store.ts                    # Zustand store for notes
│
├── lib/
│   ├── storage.ts                        # Supabase Storage client
│   ├── note-parser.ts                    # Parse [[task:id]] links
│   └── tiptap-extensions.ts              # Custom Tiptap extensions
│
└── hooks/
    ├── use-note-autosave.ts              # Auto-save hook with debounce
    └── use-note-search.ts                # Search hook
```

### Implementation Steps

**Step-by-Step Implementation Guide:**

#### Step 1: Database Schema Setup

```bash
cd frontend

pnpm db:generate
pnpm db:push
```

Add seed data for default templates:

```typescript
// db/seed.ts - Add to existing seed script
const defaultTemplates = [
  {
    name: 'Blank Note',
    description: 'Start from scratch',
    content: {},
    category: 'general',
    iconEmoji: '📄',
    isSystem: true,
  },
  {
    name: 'Meeting Notes',
    description: 'Structure for meeting notes',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Meeting Notes' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📅 Details' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Date: ' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Attendees: ' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📋 Agenda' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '✅ Action Items' }] },
        { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false } }] },
      ],
    },
    category: 'meeting',
    iconEmoji: '📝',
    isSystem: true,
  },
  {
    name: 'Project Documentation',
    description: 'Document project details',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Project Name' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🎯 Overview' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Brief project description...' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '🎨 Goals' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📊 Resources' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '📅 Timeline' }] },
      ],
    },
    category: 'project',
    iconEmoji: '📦',
    isSystem: true,
  },
]

await db.insert(noteTemplates).values(defaultTemplates)
```

#### Step 2: Install Dependencies

```bash
pnpm add novel @tiptap/extension-link @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-image @tiptap/extension-placeholder @supabase/storage-js react-dropzone use-debounce
```

#### Step 3: Create Server Actions

**app/actions/notes.ts:**

```typescript
"use server"

import { db } from "@/db"
import { notes, noteFolders, noteTaskLinks, type Note, type NoteWithRelations } from "@/db/schema"
import { getCurrentUser } from "./users"
import { eq, and, desc, ilike, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { broadcastUpdate } from "@/lib/websocket-client"

export async function getNotes(folderId?: string): Promise<NoteWithRelations[]> {
  const user = await getCurrentUser()

  const query = db.query.notes.findMany({
    where: and(
      eq(notes.userId, user.id),
      eq(notes.isArchived, false),
      folderId ? eq(notes.folderId, folderId) : undefined
    ),
    with: {
      user: true,
      folder: true,
      lastEditor: true,
      taskLinks: {
        with: {
          task: true,
        },
      },
    },
    orderBy: [desc(notes.isPinned), desc(notes.updatedAt)],
  })

  return query
}

export async function getNote(id: string): Promise<NoteWithRelations | null> {
  const user = await getCurrentUser()

  const note = await db.query.notes.findFirst({
    where: and(eq(notes.id, id), eq(notes.userId, user.id)),
    with: {
      user: true,
      folder: true,
      lastEditor: true,
      taskLinks: {
        with: {
          task: true,
        },
      },
    },
  })

  return note || null
}

export async function createNote(data: {
  title: string
  content?: any
  folderId?: string
  templateId?: string
}): Promise<Note> {
  const user = await getCurrentUser()

  try {
    const [note] = await db
      .insert(notes)
      .values({
        title: data.title,
        content: data.content || {},
        folderId: data.folderId,
        userId: user.id,
        lastEditedBy: user.id,
      })
      .returning()

    await broadcastUpdate("note_created", { id: note.id, userId: user.id })
    revalidatePath("/notes")
    return note
  } catch (error) {
    throw new Error("Failed to create note")
  }
}

export async function updateNote(
  id: string,
  updates: {
    title?: string
    content?: any
    plainText?: string
    folderId?: string
    iconEmoji?: string
    coverImage?: string
    isPinned?: boolean
  }
): Promise<Note> {
  const user = await getCurrentUser()

  try {
    const [updated] = await db
      .update(notes)
      .set({
        ...updates,
        updatedAt: new Date(),
        lastEditedBy: user.id,
      })
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
      .returning()

    await broadcastUpdate("note_updated", { id, userId: user.id })
    revalidatePath("/notes")
    return updated
  } catch (error) {
    throw new Error("Failed to update note")
  }
}

export async function deleteNote(id: string): Promise<void> {
  const user = await getCurrentUser()

  try {
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))

    await broadcastUpdate("note_deleted", { id, userId: user.id })
    revalidatePath("/notes")
  } catch (error) {
    throw new Error("Failed to delete note")
  }
}

export async function searchNotes(query: string): Promise<NoteWithRelations[]> {
  const user = await getCurrentUser()

  const results = await db.query.notes.findMany({
    where: and(
      eq(notes.userId, user.id),
      eq(notes.isArchived, false),
      sql`search_vector @@ plainto_tsquery('english', ${query})`
    ),
    with: {
      user: true,
      folder: true,
      taskLinks: {
        with: {
          task: true,
        },
      },
    },
    orderBy: [desc(notes.updatedAt)],
  })

  return results
}

export async function linkNoteToTask(noteId: string, taskId: string): Promise<void> {
  const user = await getCurrentUser()

  try {
    await db.insert(noteTaskLinks).values({
      noteId,
      taskId,
    })

    await broadcastUpdate("note_task_linked", { noteId, taskId, userId: user.id })
    revalidatePath("/notes")
  } catch (error) {
    throw new Error("Failed to link note to task")
  }
}

export async function unlinkNoteFromTask(noteId: string, taskId: string): Promise<void> {
  const user = await getCurrentUser()

  try {
    await db
      .delete(noteTaskLinks)
      .where(and(eq(noteTaskLinks.noteId, noteId), eq(noteTaskLinks.taskId, taskId)))

    await broadcastUpdate("note_task_unlinked", { noteId, taskId, userId: user.id })
    revalidatePath("/notes")
  } catch (error) {
    throw new Error("Failed to unlink note from task")
  }
}
```

**app/actions/note-folders.ts:**

```typescript
"use server"

import { db } from "@/db"
import { noteFolders, type NoteFolder } from "@/db/schema"
import { getCurrentUser } from "./users"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getFolders(): Promise<NoteFolder[]> {
  const user = await getCurrentUser()

  return db.query.noteFolders.findMany({
    where: eq(noteFolders.userId, user.id),
    orderBy: [noteFolders.displayOrder],
  })
}

export async function createFolder(data: {
  name: string
  parentId?: string
  color?: string
  iconEmoji?: string
}): Promise<NoteFolder> {
  const user = await getCurrentUser()

  const [folder] = await db
    .insert(noteFolders)
    .values({
      ...data,
      userId: user.id,
    })
    .returning()

  revalidatePath("/notes")
  return folder
}

export async function updateFolder(
  id: string,
  updates: {
    name?: string
    color?: string
    iconEmoji?: string
  }
): Promise<NoteFolder> {
  const user = await getCurrentUser()

  const [updated] = await db
    .update(noteFolders)
    .set(updates)
    .where(and(eq(noteFolders.id, id), eq(noteFolders.userId, user.id)))
    .returning()

  revalidatePath("/notes")
  return updated
}

export async function deleteFolder(id: string): Promise<void> {
  const user = await getCurrentUser()

  await db
    .delete(noteFolders)
    .where(and(eq(noteFolders.id, id), eq(noteFolders.userId, user.id)))

  revalidatePath("/notes")
}
```

#### Step 4: Build Zustand Store

**store/notes-store.ts:**

```typescript
import { create } from 'zustand'
import type { NoteWithRelations, NoteFolder } from '@/db/schema'
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
} from '@/app/actions/notes'
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/app/actions/note-folders'

interface NotesState {
  notes: NoteWithRelations[]
  currentNote: NoteWithRelations | null
  folders: NoteFolder[]
  selectedFolderId: string | null
  searchQuery: string
  loading: boolean
  error: string | null

  fetchNotes: (folderId?: string) => Promise<void>
  fetchNote: (id: string) => Promise<void>
  createNoteAction: (data: { title: string; content?: any; folderId?: string }) => Promise<void>
  updateNoteAction: (id: string, updates: any) => Promise<void>
  deleteNoteAction: (id: string) => Promise<void>
  searchNotesAction: (query: string) => Promise<void>

  fetchFolders: () => Promise<void>
  createFolderAction: (data: { name: string; parentId?: string; color?: string }) => Promise<void>
  updateFolderAction: (id: string, updates: any) => Promise<void>
  deleteFolderAction: (id: string) => Promise<void>

  setSelectedFolder: (folderId: string | null) => void
  setCurrentNote: (note: NoteWithRelations | null) => void
  setSearchQuery: (query: string) => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  folders: [],
  selectedFolderId: null,
  searchQuery: '',
  loading: false,
  error: null,

  fetchNotes: async (folderId) => {
    set({ loading: true, error: null })
    try {
      const notes = await getNotes(folderId)
      set({ notes, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchNote: async (id) => {
    set({ loading: true, error: null })
    try {
      const note = await getNote(id)
      set({ currentNote: note, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  createNoteAction: async (data) => {
    set({ loading: true, error: null })
    try {
      await createNote(data)
      await get().fetchNotes(get().selectedFolderId || undefined)
      set({ loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
      throw error
    }
  },

  updateNoteAction: async (id, updates) => {
    try {
      await updateNote(id, updates)
      if (get().currentNote?.id === id) {
        await get().fetchNote(id)
      }
      await get().fetchNotes(get().selectedFolderId || undefined)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteNoteAction: async (id) => {
    try {
      await deleteNote(id)
      await get().fetchNotes(get().selectedFolderId || undefined)
      if (get().currentNote?.id === id) {
        set({ currentNote: null })
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  searchNotesAction: async (query) => {
    set({ loading: true, error: null, searchQuery: query })
    try {
      const notes = await searchNotes(query)
      set({ notes, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchFolders: async () => {
    try {
      const folders = await getFolders()
      set({ folders })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  createFolderAction: async (data) => {
    try {
      await createFolder(data)
      await get().fetchFolders()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateFolderAction: async (id, updates) => {
    try {
      await updateFolder(id, updates)
      await get().fetchFolders()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteFolderAction: async (id) => {
    try {
      await deleteFolder(id)
      await get().fetchFolders()
      if (get().selectedFolderId === id) {
        set({ selectedFolderId: null })
        await get().fetchNotes()
      }
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  setSelectedFolder: (folderId) => {
    set({ selectedFolderId: folderId })
    get().fetchNotes(folderId || undefined)
  },

  setCurrentNote: (note) => set({ currentNote: note }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
```

#### Step 5: Build UI Components

**components/notes/note-editor.tsx:**

```typescript
"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { useDebouncedCallback } from "use-debounce"
import { NoteEditorMenu } from "./note-editor-menu"

interface NoteEditorProps {
  content: any
  onUpdate: (content: any, plainText: string) => void
  placeholder?: string
}

export function NoteEditor({ content, onUpdate, placeholder }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none px-8 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const text = editor.getText()
      debouncedUpdate(json, text)
    },
  })

  const debouncedUpdate = useDebouncedCallback((json: any, text: string) => {
    onUpdate(json, text)
  }, 1000)

  return (
    <div className="border rounded-lg">
      <NoteEditorMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

**components/notes/note-editor-menu.tsx:**

```typescript
"use client"

import { type Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react"

interface NoteEditorMenuProps {
  editor: Editor | null
}

export function NoteEditorMenu({ editor }: NoteEditorMenuProps) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-muted' : ''}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'bg-muted' : ''}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={editor.isActive('taskList') ? 'bg-muted' : ''}
      >
        <CheckSquare className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

**app/(dashboard)/notes/page.tsx:**

```typescript
"use client"

import { useEffect, useState } from "react"
import { useNotesStore } from "@/store/notes-store"
import { NoteEditor } from "@/components/notes/note-editor"
import { NoteList } from "@/components/notes/note-list"
import { FolderTree } from "@/components/notes/folder-tree"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function NotesPage() {
  const {
    notes,
    currentNote,
    folders,
    searchQuery,
    loading,
    fetchNotes,
    fetchFolders,
    createNoteAction,
    updateNoteAction,
    setCurrentNote,
    searchNotesAction,
  } = useNotesStore()

  const [noteTitle, setNoteTitle] = useState('')

  useEffect(() => {
    fetchNotes()
    fetchFolders()
  }, [])

  useEffect(() => {
    if (currentNote) {
      setNoteTitle(currentNote.title)
    }
  }, [currentNote])

  const handleCreateNote = async () => {
    await createNoteAction({ title: 'Untitled Note' })
  }

  const handleUpdateNote = async (content: any, plainText: string) => {
    if (!currentNote) return

    await updateNoteAction(currentNote.id, {
      content,
      plainText,
    })
  }

  const handleUpdateTitle = async (title: string) => {
    if (!currentNote) return

    await updateNoteAction(currentNote.id, { title })
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => searchNotesAction(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FolderTree folders={folders} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <NoteList
            notes={notes}
            currentNote={currentNote}
            onSelectNote={setCurrentNote}
            loading={loading}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={55}>
          {currentNote ? (
            <div className="flex flex-col h-full">
              <div className="border-b p-4">
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  onBlur={() => handleUpdateTitle(noteTitle)}
                  className="text-3xl font-bold border-none focus-visible:ring-0 px-0"
                  placeholder="Untitled"
                />
              </div>
              <div className="flex-1 overflow-auto">
                <NoteEditor
                  content={currentNote.content}
                  onUpdate={handleUpdateNote}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a note to start editing
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
```

#### Step 6: Add Navigation

**components/task/sidebar/task-sidebar.tsx:**

Add Notes link to sidebar navigation:

```typescript
// Add to navigation items
{
  title: "Notes",
  url: "/notes",
  icon: FileText,
  isActive: pathname === "/notes",
},
```

#### Step 7: Implement Auto-save

**hooks/use-note-autosave.ts:**

```typescript
import { useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function useNoteAutosave(
  noteId: string | null,
  onSave: (content: any, plainText: string) => Promise<void>
) {
  const isSavingRef = useRef(false)

  const debouncedSave = useDebouncedCallback(
    async (content: any, plainText: string) => {
      if (!noteId || isSavingRef.current) return

      isSavingRef.current = true
      try {
        await onSave(content, plainText)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        isSavingRef.current = false
      }
    },
    1000 // 1 second debounce
  )

  return debouncedSave
}
```

#### Step 8: Add WebSocket Real-time Sync

**components/websocket-provider.tsx** (update existing file):

```typescript
// Add note event listeners
useEffect(() => {
  if (!ws || !isAuthenticated) return

  ws.on('note_created', () => {
    useNotesStore.getState().fetchNotes()
  })

  ws.on('note_updated', () => {
    useNotesStore.getState().fetchNotes()
  })

  ws.on('note_deleted', () => {
    useNotesStore.getState().fetchNotes()
  })

  return () => {
    ws.off('note_created')
    ws.off('note_updated')
    ws.off('note_deleted')
  }
}, [ws, isAuthenticated])
```

#### Step 9: Implement Task Linking

**lib/note-parser.ts:**

```typescript
// Parse [[task:uuid]] syntax in notes
export function parseTaskLinks(text: string): string[] {
  const regex = /\[\[task:([a-f0-9-]{36})\]\]/gi
  const matches = [...text.matchAll(regex)]
  return matches.map(match => match[1])
}

export function renderTaskLink(taskId: string, taskTitle: string): string {
  return `[[task:${taskId}|${taskTitle}]]`
}

// Custom Tiptap extension for task mentions
import { Node, mergeAttributes } from '@tiptap/core'

export const TaskMention = Node.create({
  name: 'taskMention',

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-task-id'),
        renderHTML: attributes => {
          if (!attributes.id) return {}
          return { 'data-task-id': attributes.id }
        },
      },
      label: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-task-id]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'task-mention', class: 'task-mention' },
        HTMLAttributes
      ),
      `@${node.attrs.label}`,
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span')
      span.classList.add('task-mention', 'text-primary', 'font-medium', 'cursor-pointer')
      span.textContent = `@${node.attrs.label}`
      span.onclick = () => {
        // Navigate to task
        window.location.href = `/tasks?id=${node.attrs.id}`
      }
      return {
        dom: span,
      }
    }
  },
})
```

#### Step 10: Add Image Upload

**components/notes/image-upload.tsx:**

```typescript
"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { notesStorage } from "@/lib/storage"
import { toast } from "sonner"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await notesStorage.upload(fileName, file)

      if (error) throw error

      const { data: publicUrl } = notesStorage.getPublicUrl(fileName)
      onImageUploaded(publicUrl.publicUrl)

      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error(error)
    }
  }, [onImageUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      {isDragActive ? (
        <p className="text-sm text-muted-foreground">Drop the image here...</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Drag & drop an image here, or click to select
        </p>
      )}
    </div>
  )
}
```

**Update note-editor.tsx to support image upload:**

```typescript
// Add to NoteEditorMenu component
const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await notesStorage.upload(fileName, file)

    if (error) {
      toast.error('Failed to upload image')
      return
    }

    const { data: publicUrl } = notesStorage.getPublicUrl(fileName)
    editor?.chain().focus().setImage({ src: publicUrl.publicUrl }).run()
    toast.success('Image inserted')
  }
  input.click()
}

// Add button to menu
<Button
  variant="ghost"
  size="sm"
  onClick={handleImageUpload}
>
  <ImageIcon className="h-4 w-4" />
</Button>
```

#### Step 11: Create Templates System

**components/notes/template-selector.tsx:**

```typescript
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTemplates } from "@/app/actions/note-templates"
import type { NoteTemplate } from "@/db/schema"

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelectTemplate: (template: NoteTemplate) => void
}

export function TemplateSelector({ open, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<NoteTemplate[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) {
      getTemplates().then(setTemplates)
    }
  }, [open])

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                onSelectTemplate(template)
                onClose()
              }}
            >
              <div className="text-2xl mb-2">{template.iconEmoji}</div>
              <div className="font-semibold text-left">{template.name}</div>
              {template.description && (
                <div className="text-xs text-muted-foreground text-left mt-1">
                  {template.description}
                </div>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**app/actions/note-templates.ts:**

```typescript
"use server"

import { db } from "@/db"
import { noteTemplates, type NoteTemplate } from "@/db/schema"
import { getCurrentUser } from "./users"
import { eq, or } from "drizzle-orm"

export async function getTemplates(): Promise<NoteTemplate[]> {
  const user = await getCurrentUser()

  return db.query.noteTemplates.findMany({
    where: or(
      eq(noteTemplates.isSystem, true),
      eq(noteTemplates.userId, user.id)
    ),
    orderBy: [noteTemplates.category, noteTemplates.name],
  })
}

export async function createTemplate(data: {
  name: string
  description?: string
  content: any
  category?: string
  iconEmoji?: string
}): Promise<NoteTemplate> {
  const user = await getCurrentUser()

  const [template] = await db
    .insert(noteTemplates)
    .values({
      ...data,
      userId: user.id,
    })
    .returning()

  return template
}
```

#### Step 12: Add Folders/Notebooks

**components/notes/folder-tree.tsx:**

```typescript
"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Folder, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotesStore } from "@/store/notes-store"
import type { NoteFolder } from "@/db/schema"
import { FolderDialog } from "./folder-dialog"

export function FolderTree({ folders }: { folders: NoteFolder[] }) {
  const { selectedFolderId, setSelectedFolder } = useNotesStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showFolderDialog, setShowFolderDialog] = useState(false)

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolder = (folder: NoteFolder, level: number = 0) => {
    const children = folders.filter(f => f.parentId === folder.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted ${
            isSelected ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedFolder(folder.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.id)
              }}
              className="p-0.5 hover:bg-muted-foreground/10 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          <span className="text-lg">{folder.iconEmoji || '📁'}</span>
          <span className="text-sm flex-1">{folder.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const rootFolders = folders.filter(f => !f.parentId)

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Folders</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowFolderDialog(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={`px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted mb-2 ${
          !selectedFolderId ? 'bg-muted' : ''
        }`}
        onClick={() => setSelectedFolder(null)}
      >
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <span className="text-sm">All Notes</span>
        </div>
      </div>

      {rootFolders.map(folder => renderFolder(folder))}

      <FolderDialog
        open={showFolderDialog}
        onClose={() => setShowFolderDialog(false)}
      />
    </div>
  )
}
```

**components/notes/folder-dialog.tsx:**

```typescript
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotesStore } from "@/store/notes-store"
import { toast } from "sonner"

interface FolderDialogProps {
  open: boolean
  onClose: () => void
  folderId?: string
}

export function FolderDialog({ open, onClose, folderId }: FolderDialogProps) {
  const { createFolderAction, updateFolderAction } = useNotesStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📁')

  const handleSubmit = async () => {
    try {
      if (folderId) {
        await updateFolderAction(folderId, { name, iconEmoji: emoji })
        toast.success('Folder updated')
      } else {
        await createFolderAction({ name, iconEmoji: emoji })
        toast.success('Folder created')
      }
      setName('')
      setEmoji('📁')
      onClose()
    } catch (error) {
      toast.error('Failed to save folder')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{folderId ? 'Edit' : 'Create'} Folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Emoji</Label>
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📁"
              maxLength={2}
            />
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Folder name"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name}>
            {folderId ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Integration Points

#### 1. Sidebar Navigation

Add Notes link in `components/task/sidebar/task-sidebar.tsx`:

```typescript
import { FileText } from "lucide-react"

// Add to navItems array
{
  title: "Notes",
  url: "/notes",
  icon: FileText,
  isActive: pathname === "/notes",
},
```

#### 2. Task Dialog - Link Notes

Add "Linked Notes" section in `components/task/task-dialog.tsx`:

```typescript
import { TaskLinkSelector } from "@/components/notes/task-link-selector"

// Add section in dialog
<div className="space-y-2">
  <Label>Linked Notes</Label>
  <TaskLinkSelector taskId={task?.id} />
</div>
```

#### 3. Command Palette - Create Note

Add to `components/command-palette.tsx`:

```typescript
// Add to command items
{
  icon: FileText,
  label: 'Create Note',
  shortcut: ['n'],
  action: () => {
    router.push('/notes')
    useNotesStore.getState().createNoteAction({ title: 'Untitled Note' })
  },
},
```

#### 4. WebSocket Message Types

Update `backend/internal/websocket/hub.go` to handle note events:

```go
// Add message types
const (
  MessageTypeNoteCreated    = "note_created"
  MessageTypeNoteUpdated    = "note_updated"
  MessageTypeNoteDeleted    = "note_deleted"
  MessageTypeNoteTaskLinked = "note_task_linked"
)
```

#### 5. Route Structure Update

```
app/(dashboard)/
├── notes/
│   ├── page.tsx              # Main notes page (3-panel layout)
│   └── [id]/
│       └── page.tsx          # Full-screen note editor
```

### Future Enhancements Roadmap

#### Phase 1: Core Improvements
- **Slash Commands**: Type `/` to insert blocks (heading, list, table, etc.)
- **Markdown Import/Export**: Convert between Tiptap JSON and Markdown
- **Note History**: Version control with diff viewer
- **Duplicate Note**: Quick copy of existing notes

#### Phase 2: Collaboration
- **Real-time Collaborative Editing**: See other users' cursors and edits
- **Comments on Notes**: Thread discussions on specific blocks
- **Note Sharing**: Share notes with specific users or public links
- **Permissions**: View-only, edit, or admin access per note

#### Phase 3: Advanced Features
- **Note Embed in Tasks**: Preview note content in task details
- **Table of Contents**: Auto-generated TOC for long notes
- **Note Templates Gallery**: Community-submitted templates
- **AI Assistant**: Summarize notes, generate content, fix grammar

#### Phase 4: Power User Features
- **Backlinks**: See all notes that link to current note
- **Graph View**: Visualize connections between notes
- **Advanced Search**: Filter by tags, date, folder, linked tasks
- **Keyboard Navigation**: Vim mode, keyboard-only editing

#### Phase 5: Integrations
- **Import from Notion**: One-click import Notion pages
- **Export to PDF**: Professional PDF generation
- **Webhook Integration**: Trigger actions on note events
- **API Endpoints**: RESTful API for external integrations

---

## Implementation Checklist

Use this checklist when implementing the Notes & Documentation feature:

### Database & Backend
- [ ] Add Drizzle schema for notes, folders, templates, links
- [ ] Generate and apply database migration
- [ ] Add seed data for default templates
- [ ] Create server actions for notes CRUD
- [ ] Create server actions for folders CRUD
- [ ] Create server actions for templates
- [ ] Implement full-text search action
- [ ] Add WebSocket broadcast for note events

### State Management
- [ ] Create Zustand notes store
- [ ] Implement note CRUD actions in store
- [ ] Implement folder management in store
- [ ] Add search functionality to store
- [ ] Integrate with WebSocket provider

### UI Components
- [ ] Install Novel, Tiptap, and dependencies
- [ ] Create NoteEditor component
- [ ] Create NoteEditorMenu toolbar
- [ ] Create NoteList sidebar component
- [ ] Create FolderTree navigation
- [ ] Create TemplateSelector dialog
- [ ] Create ImageUpload component
- [ ] Create TaskLinkSelector component
- [ ] Create empty states for notes

### Pages & Routes
- [ ] Create `/notes` page with 3-panel layout
- [ ] Add Notes link to sidebar navigation
- [ ] Add "Create Note" to command palette
- [ ] Implement resizable panels
- [ ] Add note search in header

### Features
- [ ] Implement auto-save with debouncing
- [ ] Add image upload with Supabase Storage
- [ ] Implement task linking (bidirectional)
- [ ] Add folder organization
- [ ] Implement note templates
- [ ] Add full-text search
- [ ] Real-time collaborative updates

### Polish & Testing
- [ ] Test note creation/editing/deletion
- [ ] Test folder organization
- [ ] Test search functionality
- [ ] Test task linking
- [ ] Test image uploads
- [ ] Test real-time sync across clients
- [ ] Test auto-save behavior
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add keyboard shortcuts

---

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
