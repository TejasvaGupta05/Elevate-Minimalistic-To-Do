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
    <div className={`card task-card ${isOverdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <div>
          <h3>{task.title}</h3>
          {isOverdue ? <span className="badge overdue-badge">Overdue</span> : null}
        </div>
        <div className="task-meta">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
        </div>
      </div>

      <p className="task-description">{task.description || 'No description provided.'}</p>

      <div className="task-details">
        <div>
          <strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
        </div>
        <div>
          <strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="task-actions">
        <select value={task.status} onChange={handleStatusChange} disabled={updating}>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button className="secondary-btn" onClick={() => setIsEditing(true)}>
          Edit
        </button>
        <button className="danger-btn" onClick={() => setConfirmOpen(true)} disabled={deleting}>
          Delete
        </button>
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
