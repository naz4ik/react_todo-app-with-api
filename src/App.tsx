/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodos,
  deleteTodos,
  getTodos,
  updateTodos,
  USER_ID,
} from './api/todos';
import { Header } from './components/header';
import { TodoList } from './components/todoList';
import { Footer } from './components/footer';
import { Error } from './components/Error';
import { Todo } from './types/Todo';
import { Filter } from './types/Filter';

export const App: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newTodo, setNewTodo] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newFilter, setNewFilter] = useState<Filter>(Filter.All);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const todosLeft = todos.filter(todo => !todo.completed).length;
  const [isLoading, setIsLoading] = useState(false);
  const [todoClear, setTodoClear] = useState<boolean>(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const isTodoClear = todos.some(todo => todo.completed);
  const [areActiveTodos, setAreActiveTodos] = useState<boolean>(false);
  const [updateAlltodos, setUptadeAllTodos] = useState<boolean>(false);
  const [loaderUptadeTodo, setLoaderUpdateTodo] = useState<number | null>(null);
  const [deletingTodoIds, setDeletingTodoIds] = useState<number[]>([]);

  useEffect(() => {
    setAreActiveTodos(todos.some(todo => todo.completed));
  }, [todos]);

  const loadTodos = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const todosData = await getTodos();
      const completedTodos = todosData.filter(todo => todo.completed);

      setTodos(todosData);
      setTodoClear(completedTodos.length > 0);
    } catch (error) {
      setErrorMessage('Unable to load todos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    setTodoClear(isTodoClear);
  }, [isTodoClear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrorMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  const deleteTodo = (todoId: number) => {
    setDeletingTodoId(todoId);
    deleteTodos(todoId)
      .then(() => {
        setIsLoading(true);
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        setIsLoading(false);
        setDeletingTodoId(null);
      });
  };

  const clearCompletedTodos = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setDeletingTodoIds(completedTodos.map(todo => todo.id));

    try {
      const failedTodos: Todo[] = [];

      for (const todo of completedTodos) {
        try {
          await deleteTodos(todo.id);
        } catch (error) {
          setErrorMessage('Unable to delete a todo');
          failedTodos.push(todo);
        }
      }

      setTodos(currentTodos =>
        currentTodos.filter(
          todo => !todo.completed || failedTodos.includes(todo),
        ),
      );

      if (failedTodos.length > 0) {
        setTodos(prevTodos => [...prevTodos, ...failedTodos]);
      }

      setTodoClear(false);
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setIsInputDisabled(false);
      setDeletingTodoIds([]);
    }
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo.trim()) {
      setErrorMessage('Title should not be empty');

      return;
    }

    setIsLoading(true);
    setIsInputDisabled(true);

    const tempNewTodo = {
      id: 0,
      userId: USER_ID,
      title: newTodo.trim(),
      completed: false,
    };

    setTempTodo(tempNewTodo);

    try {
      const addedTodo = await addTodos(tempNewTodo);

      setTodos(prevTodos => [...prevTodos, addedTodo]);
      setNewTodo('');
    } catch (error) {
      setErrorMessage('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setIsLoading(false);
      setIsInputDisabled(false);
    }
  };

  const updateTodo = async (updatedTodo: Todo) => {
    const existingTodo = todos.find(todo => todo.id === updatedTodo.id);

    if (!existingTodo || existingTodo.title === updatedTodo.title.trim()) {
      setEditingTodoId(null);

      return;
    }

    setLoaderUpdateTodo(updatedTodo.id);
    setIsLoading(true);
    setIsInputDisabled(true);

    try {
      const newUpdatedTodo = await updateTodos(updatedTodo);

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === updatedTodo.id ? newUpdatedTodo : todo,
        ),
      );
    } catch (error) {
      setErrorMessage('Unable to update a todo');
    } finally {
      setIsLoading(false);
      setIsInputDisabled(false);
      setLoaderUpdateTodo(null);
    }
  };

  const onToggleAll = async () => {
    setTodos(prevTodos => {
      const areAllCompleted = !prevTodos.every(todo => todo.completed);

      return prevTodos.map(todo => ({
        ...todo,
        completed: !areAllCompleted,
      }));
    });
    setUptadeAllTodos(true);
    try {
      await Promise.all(
        todos.map(todo =>
          updateTodo({ ...todo, completed: !todos.every(t => t.completed) }),
        ),
      );
    } catch (error) {
      setErrorMessage('Unable to update all todos');
    } finally {
      setUptadeAllTodos(false);
    }
  };

  const filteredTodos = todos.filter(todo => {
    switch (newFilter) {
      case Filter.Active:
        return !todo.completed;
      case Filter.Completed:
        return todo.completed;
      default:
        return true;
    }
  });

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <Header
        isInputDisabled={isInputDisabled}
        areActiveTodos={areActiveTodos}
        handleSubmit={onAdd}
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        todos={todos}
        onToggleAll={onToggleAll}
      />

      {todos.length > 0 && (
        <TodoList
          filteredTodos={filteredTodos}
          editingTodoId={editingTodoId}
          updateAlltodos={updateAlltodos}
          setEditingTodoId={setEditingTodoId}
          isLoading={isLoading}
          deleteTodo={deleteTodo}
          tempTodo={tempTodo}
          deletingTodoId={deletingTodoId}
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          updateTodo={updateTodo}
          loaderUptadeTodo={loaderUptadeTodo}
          deletingTodoIds={deletingTodoIds}
        />
      )}

      {todos.length > 0 && (
        <Footer
          todoClear={todoClear}
          newFilter={newFilter}
          setNewFilter={setNewFilter}
          todosLeft={todosLeft}
          clearCompletedTodos={clearCompletedTodos}
        />
      )}
      <Error errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
    </div>
  );
};
