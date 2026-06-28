import { useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, getTasks, updateTask } from './api/taskApi';
import FilterBar from './components/FilterBar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  const cachedTasks = () => {
    try {
      return JSON.parse(localStorage.getItem('taskTrackerTasks')) || [];
    } catch {
      return [];
    }
  };

  const [tasks, setTasks] = useState(cachedTasks());
  const [loading, setLoading] = useState(cachedTasks().length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: 'createdAt',
    order: 'desc',
    search: '',
  });

  const saveTasksToCache = (data) => {
    try {
      localStorage.setItem('taskTrackerTasks', JSON.stringify(data));
    } catch {
      // Ignore localStorage failures for unsupported browsers or private mode
    }
  };

  const fetchTasks = async (params = filters, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const { data } = await getTasks(params);
      setTasks(data);
      saveTasksToCache(data);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to load tasks');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTasks(filters, tasks.length === 0);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleFiltersChange = (next) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    fetchTasks(merged);
  };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await createTask(payload);
      setMessage('Task created successfully');
      setShowCreateForm(false);
      fetchTasks(filters, false);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    setUpdating(true);
    try {
      await updateTask(id, payload);
      setMessage('Task updated successfully');
      fetchTasks(filters, false);
      return true;
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to update task');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteTask(id);
      setMessage('Task deleted successfully');
      fetchTasks(filters, false);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    const task = tasks.find((item) => item._id === id);
    if (!task) return;
    await handleUpdate(id, { ...task, status });
  };

  const summary = useMemo(() => {
    const done = tasks.filter((task) => task.status === 'done').length;
    return { total: tasks.length, done };
  }, [tasks]);

  const bannerClassName = message
    ? message.toLowerCase().includes('failed') || message.toLowerCase().includes('error')
      ? 'banner error'
      : 'banner success'
    : '';

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Elevate</p>
          <h1>Task Tracker</h1>
          <p className="hero-copy">Create, sort, filter, and manage tasks from one simple dashboard.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>{summary.total}</span>
            <small>Total Tasks</small>
          </div>
          <div className="stat-card">
            <span>{summary.done}</span>
            <small>Completed</small>
          </div>
        </div>
      </header>

      <div className="hero-actions">
        <FilterBar filters={filters} onChange={handleFiltersChange} />
        <button
          type="button"
          className="primary-btn create-task-btn"
          onClick={() => setShowCreateForm((prev) => !prev)}
        >
          {showCreateForm ? 'Close' : '+ New Task'}
        </button>
      </div>

      {showCreateForm ? (
        <div className="create-task-panel">
          <TaskForm onSubmit={handleCreate} submitting={submitting} />
        </div>
      ) : null}

      {message ? (
        <div className="banner-shell">
          <div className={bannerClassName}>{message}</div>
        </div>
      ) : null}

      <main className="content-grid">
        <section className="right-column full-width">
          <TaskList
            tasks={tasks}
            loading={loading}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            deleting={deleting}
            updating={updating}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
