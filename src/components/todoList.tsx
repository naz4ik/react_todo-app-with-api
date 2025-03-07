import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './todo';

interface TodoListProps {
  filteredTodos: Todo[];
  updateAlltodos: boolean;
  newTodo: string;
  setNewTodo: (newTodo: string) => void;
  isLoading: boolean;
  deleteTodo: (todoId: number) => void;
  tempTodo: Todo | null;
  deletingTodoId: number | null;
  editingTodoId: number | null;
  setEditingTodoId: (id: number | null) => void;
  updateTodo: (updatedTodo: Todo) => void;
  loaderUptadeTodo: number | null;
  deletingTodoIds: number[];
}

export const TodoList: React.FC<TodoListProps> = ({
  filteredTodos,
  deleteTodo,
  tempTodo,
  isLoading,
  deletingTodoId,
  editingTodoId,
  setEditingTodoId,
  updateTodo,
  updateAlltodos,
  loaderUptadeTodo,
  deletingTodoIds,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos.map(todo => (
        <TodoItem
          updateTodo={updateTodo}
          deletingTodoId={deletingTodoId}
          deleteTodo={deleteTodo}
          key={todo.id}
          todo={todo}
          updateAlltodos={updateAlltodos}
          isLoading={isLoading}
          setEditingTodoId={setEditingTodoId}
          editingTodoId={editingTodoId}
          loaderUptadeTodo={loaderUptadeTodo}
          deletingTodoIds={deletingTodoIds}
        />
      ))}
      {tempTodo && (
        <TodoItem
          updateAlltodos={updateAlltodos}
          updateTodo={updateTodo}
          deletingTodoId={deletingTodoId}
          key={tempTodo.id}
          todo={tempTodo}
          isLoading={isLoading}
          deleteTodo={() => {}}
          setEditingTodoId={setEditingTodoId}
          editingTodoId={editingTodoId}
          loaderUptadeTodo={loaderUptadeTodo}
          deletingTodoIds={deletingTodoIds}
        />
      )}
    </section>
  );
};
