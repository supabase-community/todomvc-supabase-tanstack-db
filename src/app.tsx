import "./app.css";
import { useLiveQuery } from "@tanstack/react-db";
import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import { TodoFooter } from "./footer";
import { todoCollection } from "./lib/db";
import { TodoItem } from "./todo-item";

const FilterName = ["all", "active", "completed"] as const;

export type FilterName = (typeof FilterName)[number];

const ROUTES: Record<string, FilterName> = {
  "#/": "all",
  "#/active": "active",
  "#/completed": "completed",
};

export function App() {
  const { data: todos } = useLiveQuery((q) =>
    q.from({ todo: todoCollection }).orderBy(({ todo }) => todo.title, "asc")
  );
  const [nowShowing, setNowShowing] = useState<FilterName>("all");
  const [editing, setEditing] = useState<string | null>(null);

  // Mutations are optimistic methods on the collection; they apply instantly in
  // the UI and sync to Postgres in the background. Per-item mutations live in
  // TodoItem and TodoFooter — only the ones App invokes directly stay here.
  const addTodo = (title: string) => {
    todoCollection.insert({ id: crypto.randomUUID(), title, completed: false });
  };

  const toggleAll = (completed: boolean) => {
    const ids = todoCollection.toArray.map((todo) => todo.id);
    if (ids.length === 0) {
      return;
    }
    todoCollection.update(ids, (drafts) => {
      for (const draft of drafts) {
        draft.completed = completed;
      }
    });
  };

  // Keep the active filter in sync with the URL hash (replaces the old
  // `director` router dependency).
  useEffect(() => {
    const applyRoute = () =>
      setNowShowing(ROUTES[window.location.hash] ?? "all");
    applyRoute();
    window.addEventListener("hashchange", applyRoute);
    return () => window.removeEventListener("hashchange", applyRoute);
  }, []);

  const handleNewTodoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    const input = event.currentTarget;
    const val = input.value.trim();
    if (val) {
      addTodo(val);
      input.value = "";
    }
  };

  const shownTodos = todos.filter((todo) => {
    switch (nowShowing) {
      case "active":
        return !todo.completed;
      case "completed":
        return todo.completed;
      default:
        return true;
    }
  });

  const activeTodoCount = todos.reduce(
    (accum, todo) => (todo.completed ? accum : accum + 1),
    0
  );
  const completedCount = todos.length - activeTodoCount;

  return (
    <>
      <h1 className="title">todos</h1>
      <header className="info">
        <p>
          The classic TodoMVC, now built with{" "}
          <a href="https://supabase.com/" rel="noopener" target="_blank">
            Supabase
          </a>{" "}
          and{" "}
          <a href="https://tanstack.com/db" rel="noopener" target="_blank">
            TanStack DB
          </a>
          .
        </p>
        <p>
          View{" "}
          <a
            href="https://github.com/supabase-community/todomvc-supabase-tanstack-db"
            rel="noopener"
            target="_blank"
          >
            this demo's source
          </a>
          , or explore the{" "}
          <a
            href="https://github.com/supabase/tanstack-db"
            rel="noopener"
            target="_blank"
          >
            Supabase+TanStack DB library
          </a>{" "}
          that powers it.
        </p>

        <p>
          Open this page in a second tab and edit your todos in either — changes
          sync live.
        </p>
      </header>
      <section className="todoapp">
        <header className="header">
          <input
            autoFocus
            className="new-todo"
            onKeyDown={handleNewTodoKeyDown}
            placeholder="What needs to be done?"
          />
        </header>
        {todos.length > 0 && (
          <section className="main">
            <input
              checked={activeTodoCount === 0}
              className="toggle-all"
              id="toggle-all"
              onChange={(event) => toggleAll(event.target.checked)}
              type="checkbox"
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <ul className="todo-list">
              {shownTodos.map((todo) => (
                <TodoItem
                  editing={editing === todo.id}
                  key={todo.id}
                  onCancel={() => setEditing(null)}
                  onEdit={() => setEditing(todo.id)}
                  onSave={() => setEditing(null)}
                  todo={todo}
                />
              ))}
            </ul>
          </section>
        )}
        {(activeTodoCount > 0 || completedCount > 0) && (
          <TodoFooter
            completedCount={completedCount}
            count={activeTodoCount}
            nowShowing={nowShowing}
          />
        )}
      </section>
    </>
  );
}
