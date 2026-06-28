import TaskItem from './TaskItem';

function TaskList({ tasks, loading, onStatusChange, onDelete, onUpdate, deleting, updating }) {
  if (loading) {
    return <div className="empty-state">Loading tasks...</div>;
  }

  if (!tasks.length) {
    return <div className="empty-state">No tasks yet — create your first one above</div>;
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
