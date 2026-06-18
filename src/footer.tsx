import { todoCollection } from "./lib/db";
import type { FilterName } from "./todo-app";
import { classNames, pluralize } from "./utils";

interface TodoFooterProps {
  completedCount: number;
  count: number;
  nowShowing: FilterName;
}

export function TodoFooter({
  count,
  completedCount,
  nowShowing,
}: TodoFooterProps) {
  const activeTodoWord = pluralize(count, "item");

  const clearCompleted = () => {
    const ids = todoCollection.toArray
      .filter((todo) => todo.completed)
      .map((todo) => todo.id);
    if (ids.length === 0) {
      return;
    }
    todoCollection.delete(ids);
  };

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{count}</strong> {activeTodoWord} left
      </span>
      <ul className="filters">
        <li>
          <a
            className={classNames({ selected: nowShowing === "all" })}
            href="#/"
          >
            All
          </a>
        </li>{" "}
        <li>
          <a
            className={classNames({ selected: nowShowing === "active" })}
            href="#/active"
          >
            Active
          </a>
        </li>{" "}
        <li>
          <a
            className={classNames({ selected: nowShowing === "completed" })}
            href="#/completed"
          >
            Completed
          </a>
        </li>
      </ul>
      {completedCount > 0 && (
        <button
          className="clear-completed"
          onClick={clearCompleted}
          type="button"
        >
          Clear completed
        </button>
      )}
    </footer>
  );
}
