import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { type Todo, todoCollection } from "./lib/db";
import { classNames } from "./utils";

interface TodoItemProps {
  editing: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  todo: Todo;
}

export function TodoItem({
  todo,
  editing,
  onEdit,
  onSave,
  onCancel,
}: TodoItemProps) {
  const [editText, setEditText] = useState(todo.title);
  const editFieldRef = useRef<HTMLInputElement>(null);

  const toggle = () => {
    todoCollection.update(todo.id, (draft) => {
      draft.completed = !draft.completed;
    });
  };

  const destroy = () => {
    todoCollection.delete(todo.id);
  };

  const save = (title: string) => {
    todoCollection.update(todo.id, (draft) => {
      draft.title = title;
    });
  };

  // Focus and place the caret at the end when this item enters edit mode.
  useEffect(() => {
    if (!editing) {
      return;
    }
    const node = editFieldRef.current;
    if (node) {
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }, [editing]);

  const handleSubmit = () => {
    const val = editText.trim();
    if (val) {
      save(val);
      setEditText(val);
      onSave();
    } else {
      destroy();
    }
  };

  const handleEdit = () => {
    onEdit();
    setEditText(todo.title);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setEditText(todo.title);
      onCancel();
    } else if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <li className={classNames({ completed: todo.completed, editing })}>
      <div className="view">
        <input
          checked={todo.completed}
          className="toggle"
          id={`todo-${todo.id}`}
          onChange={toggle}
          type="checkbox"
        />
        {/** biome-ignore lint/a11y/noNoninteractiveElementInteractions: <explanation> */}
        <label htmlFor={`todo-${todo.id}`} onDoubleClick={handleEdit}>
          {todo.title}
        </label>
        <button className="destroy" onClick={destroy} type="button" />
      </div>
      <input
        className="edit"
        onBlur={handleSubmit}
        onChange={(event) => setEditText(event.target.value)}
        onKeyDown={handleKeyDown}
        ref={editFieldRef}
        value={editText}
      />
    </li>
  );
}
