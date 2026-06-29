import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        // Convert string dates back to Date objects
        const todosWithDates = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        setTodos(todosWithDates);
      } catch (e) {
        console.error('Failed to parse todos from localStorage', e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date()
    };
    setTodos([newTodoItem, ...todos]);
    setNewTodo('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    setTodos(todos.map(todo =>
      todo.id === editingId ? { ...todo, text: editText.trim() } : todo
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div className="app">
      <header className="header">
        <h1>✨ React TodoList</h1>
        <p>Organize your tasks with style & persistence</p>
      </header>

      <main className="main">
        <div className="input-section">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="todo-input"
          />
          <button onClick={addTodo} className="add-btn">
            ➕ Add
          </button>
        </div>

        <div className="filters">
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'active' : ''}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'active' : ''}
          >
            Completed
          </button>
        </div>

        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <p>{filter === 'all' ? 'No tasks yet!' : filter === 'active' ? 'All tasks completed!' : 'No completed tasks yet!'}</p>
              <p>✨ Add your first task above</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
                style={{ animation: 'fadeIn 0.3s ease-out' }}
              >
                {editingId === todo.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="save-btn">✓ Save</button>
                      <button onClick={cancelEdit} className="cancel-btn">✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="todo-checkbox"
                      />
                      <span className="todo-text">{todo.text}</span>
                      <span className="todo-date">
                        {todo.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="todo-actions">
                      <button 
                        onClick={() => startEditing(todo)}
                        className="edit-btn"
                        aria-label="Edit todo"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="delete-btn"
                        aria-label="Delete todo"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="stats">
          <span>{activeCount} {activeCount === 1 ? 'task' : 'tasks'} left</span>
          <span>{completedCount} {completedCount === 1 ? 'completed' : 'completed'}</span>
        </div>
      </main>

      <footer className="footer">
        <p>✅ Data persists in localStorage • 🌈 Gradient UI • 🎯 Smooth animations</p>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #4b6584, #6a5acd);
          color: #fff;
          font-family: 'Segoe UI', system-ui, sans-serif;
          padding: 2rem;
          margin: 0;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .main {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-section {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .todo-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }

        .todo-input:focus {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }

        .todo-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .add-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #ff6b6b, #ff8e53);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        }

        .filters {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .filters button {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filters button.active {
          background: rgba(255, 255, 255, 0.25);
          font-weight: bold;
        }

        .filters button:hover:not(.active) {
          background: rgba(255, 255, 255, 0.15);
        }

        .todo-list {
          margin-bottom: 1.5rem;
        }

        .todo-item {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          animation: fadeIn 0.3s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .todo-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(5px);
        }

        .todo-item.completed {
          opacity: 0.7;
        }

        .todo-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .todo-checkbox {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
        }

        .todo-text {
          flex: 1;
          font-size: 1.1rem;
        }

        .todo-item.completed .todo-text {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .todo-date {
          font-size: 0.75rem;
          opacity: 0.7;
          white-space: nowrap;
        }

        .todo-actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .delete-btn {
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .edit-btn:hover, .delete-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
        }

        .edit-input {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-size: 1rem;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-btn, .cancel-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .save-btn {
          background: linear-gradient(45deg, #4CAF50, #2E7D32);
          color: white;
        }

        .cancel-btn {
          background: linear-gradient(45deg, #f44336, #d32f2f);
          color: white;
        }

        .stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .empty-state p {
          margin: 0.5rem 0;
        }

        .footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .app {
            padding: 1rem;
          }
          .main {
            padding: 1.5rem;
          }
          .input-section {
            flex-direction: column;
          }
          .todo-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;