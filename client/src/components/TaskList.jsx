import TaskItem from './TaskItem';

function TaskList({ tasks, loading, onStatusChange, onDelete, onUpdate, deleting, updating }) {
  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <span className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          </span>
          <div>Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="empty-state empty-state--centered">
        <div className="empty-state-content">
          <span className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
              <path d="m9 9 2 2 4-4" />
            </svg>
          </span>
          <div className="empty-state-message">No tasks yet — create your first one to get started.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onUpdate={onUpdate}
          deleting={deleting}
          updating={updating}
        />
      ))}
    </div>
  );
}

export default TaskList;
