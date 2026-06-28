import { useEffect, useMemo, useState } from 'react';

const initialForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
};

function TaskForm({ task, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm(initialForm);
    }
  }, [task]);

  const validation = useMemo(() => {
    const nextErrors = {};
    const title = form.title.trim();

    if (!title) {
      nextErrors.title = 'Title is required.';
    } else if (title.length < 3 || title.length > 100) {
      nextErrors.title = 'Title must be between 3 and 100 characters.';
    }

    if (form.description && form.description.length > 500) {
      nextErrors.description = 'Description must be at most 500 characters.';
    }

    return nextErrors;
  }, [form]);

  const isValid = Object.keys(validation).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || undefined,
    };

    onSubmit(payload);
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
      </div>
      <div className="form-fields">
      <div className="field-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter task title"
        />
        {validation.title ? <p className="error-text">{validation.title}</p> : null}
      </div>

      <div className="field-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          placeholder="Add notes or details"
        />
        {validation.description ? <p className="error-text">{validation.description}</p> : null}
      </div>

      <div className="form-grid">
        <div className="field-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="dueDate">Due Date</label>
        <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-btn" disabled={!isValid || submitting}>
          {submitting ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
        </button>
        {task ? (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
      </div>
    </form>
  );
}

export default TaskForm;
