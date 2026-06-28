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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" stroke="currentColor" />
                <path d="M14.06 6.94 17.5 10.38" stroke="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => setConfirmOpen(true)}
              disabled={deleting}
              aria-label="Delete task"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" stroke="currentColor" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" />
                <path d="M19 6 17.5 20a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6" stroke="currentColor" />
                <path d="M10 11v6" stroke="currentColor" />
                <path d="M14 11v6" stroke="currentColor" />
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
