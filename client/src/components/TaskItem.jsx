import { useMemo, useState } from 'react';
import TaskForm from './TaskForm';
import ConfirmDialog from './ConfirmDialog';

function TaskItem({ task, onStatusChange, onDelete, onUpdate, deleting, updating }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.status === 'done') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }, [task.dueDate, task.status]);

  const handleStatusChange = (e) => {
    onStatusChange(task._id, e.target.value);
  };

  const handleEditSubmit = (payload) => {
    onUpdate(task._id, payload).then(() => setIsEditing(false));
  };

  if (isEditing) {
    return (
      <div className="card">
        <TaskForm task={task} onSubmit={handleEditSubmit} submitting={updating} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className={`card task-card ${isOverdue ? 'overdue' : ''}`} data-priority={task.priority}>
      <div className="task-card-top">
        <div className="task-summary">
          <h3>{task.title}</h3>
          <p className="task-description">{task.description || 'No description provided.'}</p>
        </div>

        <div className="task-card-tags">
          {isOverdue ? <span className="badge overdue-badge">Overdue</span> : null}
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
        </div>
      </div>

      <div className="task-card-bottom">
        <div className="task-details">
          <div className="task-detail-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}</span>
          </div>
          <div className="task-detail-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="task-actions">
          <select className="status-select" value={task.status} onChange={handleStatusChange} disabled={updating}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="task-action-buttons">
            <button
              type="button"
              className="icon-btn icon-btn--secondary"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              aria-label="Delete task"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete task?"
        message="This will permanently remove the task from your list."
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(task._id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default TaskItem;
