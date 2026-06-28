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
          <div>
            <strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
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
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 14.5v2.5h2.5L16.81 6.69l-2.5-2.5L3 14.5Zm13.71-8.29a1 1 0 0 0 0-1.42l-1.5-1.5a1 1 0 0 0-1.42 0l-1.5 1.5 2.5 2.5 1.42-1.58Z" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              aria-label="Delete task"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1h3v2H3V6h3Zm2 0h2v8H8V6Zm4 0h2v8h-2V6Zm-6 2h10v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z" />
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
