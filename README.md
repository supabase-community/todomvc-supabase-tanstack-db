# TodoMVC - Supabase + TanStack DB

The classic [TodoMVC](https://github.com/tastejs/todomvc) app, rebuilt as a real-time, multi-device demo on top of [Supabase](https://supabase.com/) and [TanStack DB](https://tanstack.com/db).

Open it in two tabs and edit your todos in either one - changes sync live, with no manual cache invalidation and no WebSocket code in the app.

## Why this exists

[TodoMVC](https://github.com/tastejs/todomvc) is the canonical "hello world" for comparing frontend approaches: the same todo app, implemented many different ways, so you can evaluate each on equal footing. This version swaps the usual local-only state for a backend-agnostic sync engine talking to Postgres.

The result is the familiar TodoMVC UI where every write is **optimistic** (it applies instantly, then commits or rolls back) and every change made anywhere shows up **everywhere**, automatically.

## How it works

The app is powered by the [`@supabase-labs/tanstack-db`](https://github.com/supabase/tanstack-db) collection adapter, which wires three things together:

- **[TanStack DB](https://tanstack.com/db) collections** - typed sets of synced data you run live queries against. Components re-render automatically when the underlying data changes, using differential dataflow for fast joins, filters, and aggregates.
- **Optimistic mutations** - `insert`, `update`, and `delete` are methods on the collection. They apply instantly in the UI and roll back automatically if the server rejects them.
- **Supabase Realtime** - when another client changes a row, every client with a live query on that collection sees the update without any subscription code.

Your Supabase database stays the source of truth. Postgres, RLS, and Auth are unchanged - this is purely a frontend data layer that plugs into what you already have.

```ts
// src/lib/db.ts - one collection per Postgres table
export const todoCollection = createCollection(
  supabaseCollectionOptions({
    tableName: "todos",
    schema: todoSchema,
    keys: ["id"],
    supabase,
    realtime: true,
  })
);
```

```tsx
// src/app.tsx - query with useLiveQuery, mutate directly on the collection
const { data: todos } = useLiveQuery((q) =>
  q.from({ todo: todoCollection }).orderBy(({ todo }) => todo.title, "asc")
);

todoCollection.insert({ id: crypto.randomUUID(), title, completed: false });
```

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [TanStack DB](https://tanstack.com/db) (`@tanstack/react-db`)
- [Supabase](https://supabase.com/) (`@supabase/supabase-js`) with the [`@supabase-labs/tanstack-db`](https://github.com/supabase/tanstack-db) adapter
- [Zod](https://zod.dev/) for schema definition
- [Ultracite](https://www.ultracite.ai/) / [Biome](https://biomejs.dev/) for linting and formatting

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database

Apply the migration to a Supabase project. It creates the `todos` table, enables Realtime on it, and adds a permissive RLS policy for the demo.

```bash
# local Supabase stack
supabase start
supabase db reset

# or push to a linked project
supabase db push
```

The schema lives in [`supabase/migrations`](supabase/migrations):

```sql
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  completed boolean default false
);
alter publication supabase_realtime add table public.todos;
```

### 3. Configure environment variables

Copy your project URL and publishable (anon) key into `.env`:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 4. Run the app

```bash
pnpm dev
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build |
| `pnpm check` | Lint with Ultracite |
| `pnpm fix` | Auto-fix formatting and lint issues |

## Learn more

- [TanStack DB documentation](https://tanstack.com/db)
- [Supabase + TanStack DB adapter](https://github.com/supabase/tanstack-db)
- [Supabase documentation](https://supabase.com/docs)
- [TodoMVC](https://github.com/tastejs/todomvc)

> **Note:** The `@supabase-labs/tanstack-db` adapter is experimental. The Realtime integration is still being stabilized and may consume more Realtime messages than expected - test on a free-plan org or with a spend cap, and set `realtime: false` on a collection to opt out.
