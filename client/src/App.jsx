import { useEffect, useMemo, useRef, useState } from 'react';
import { authApi, setAuthToken } from './api/taskApi';
import { createTask, deleteTask, getTasks, updateTask } from './api/taskApi';
import AuthPage from './components/AuthPage';
import FilterBar from './components/FilterBar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const decodeGooglePayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

// Polls until window.google.accounts.id is available (handles async/defer race)
const waitForGoogle = (timeout = 10000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.google?.accounts?.id) return resolve(window.google.accounts.id);
      if (Date.now() - start > timeout) return reject(new Error('Google SDK timed out'));
      setTimeout(check, 100);
    };
    check();
  });

function App() {
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('taskTrackerUser')) || null;
    } catch {
      return null;
    }
  };

  const getStoredToken = () => localStorage.getItem('taskTrackerToken') || '';

  const cachedTasks = () => {
    try {
      return JSON.parse(localStorage.getItem('taskTrackerTasks')) || [];
    } catch {
      return [];
    }
  };

  const [tasks, setTasks] = useState(cachedTasks());
  const [loading, setLoading] = useState(cachedTasks().length === 0);
  const [user, setUser] = useState(getStoredUser());
  const [authReady, setAuthReady] = useState(Boolean(getStoredToken()));
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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

  const persistAuth = (token, nextUser) => {
    if (token) {
      localStorage.setItem('taskTrackerToken', token);
    } else {
      localStorage.removeItem('taskTrackerToken');
    }

    if (nextUser) {
      localStorage.setItem('taskTrackerUser', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('taskTrackerUser');
    }
  };

  const handleAuth = async (mode, values) => {
    const payload = mode === 'login'
      ? { email: values.email, password: values.password }
      : { name: values.name, email: values.email, password: values.password };

    const response = await authApi[mode](payload);
    const token = response?.data?.token;
    const nextUser = response?.data?.user;

    if (!token || !nextUser) {
      throw new Error('Authentication failed');
    }

    setAuthToken(token);
    persistAuth(token, nextUser);
    setUser(nextUser);
    setAuthReady(true);
    setMessage(`${mode === 'login' ? 'Logged in' : 'Account created'} successfully`);
    fetchTasks(filters, false);
  };

  const googleBtnRef = useRef(null);

  const handleLogout = () => {
    setAuthToken('');
    persistAuth('', null);
    setUser(null);
    setAuthReady(false);
    setTasks([]);
    setMessage('You have been logged out');
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
    if (!authReady) return;
    fetchTasks(filters, tasks.length === 0);
  }, [authReady]);

  useEffect(() => {
    if (!googleClientId) return;

    const onCredential = async (response) => {
      const payload = decodeGooglePayload(response.credential);
      try {
        const result = await authApi.google({
          idToken: response.credential,
          name: payload?.name || '',
          email: payload?.email || '',
          picture: payload?.picture || '',
        });
        const token = result?.data?.token;
        const nextUser = result?.data?.user;
        if (!token || !nextUser) throw new Error('Google authentication failed');
        setAuthToken(token);
        persistAuth(token, nextUser);
        setUser(nextUser);
        setAuthReady(true);
        setMessage('Signed in with Google');
        fetchTasks(filters, false);
      } catch (error) {
        setMessage(error?.response?.data?.message || error?.message || 'Google sign-in failed');
      }
    };

    // Wait for GSI SDK, initialize, then render a real (hidden) sign-in button
    waitForGoogle()
      .then((gid) => {
        gid.initialize({
          client_id: googleClientId,
          callback: onCredential,
          ux_mode: 'popup',
        });
        if (googleBtnRef.current) {
          gid.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: 280,
          });
        }
      })
      .catch(() => {
        // SDK failed to load — handleGoogleSignIn click will show the error
      });
  }, [googleClientId]);

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

  const completionPercent = summary.total ? Math.round((summary.done / summary.total) * 100) : 0;

  const toastClassName = message
    ? message.toLowerCase().includes('failed') || message.toLowerCase().includes('error')
      ? 'toast toast--error'
      : 'toast toast--success'
    : '';

  if (!authReady || !user) {
    return <AuthPage onAuthSuccess={handleAuth} googleBtnRef={googleBtnRef} />;
  }

  return (
    <div className="app-shell">
      <nav className="user-nav">
        <div className="user-nav-info">
          <div className="user-avatar" aria-hidden="true">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-nav-text">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <button type="button" className="secondary-btn" onClick={handleLogout}>Logout</button>
      </nav>

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
          <div className="stat-card stat-card--progress">
            <div className="progress-head">
              <span className="progress-label">Completed</span>
              <span className="progress-value">{completionPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
            </div>
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
        <div className="toast-container" aria-live="polite">
          <div className={toastClassName}>{message}</div>
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
