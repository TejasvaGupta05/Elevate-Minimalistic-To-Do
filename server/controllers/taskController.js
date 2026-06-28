const Task = require('../models/Task');

const ALLOWED_STATUS = ['todo', 'in-progress', 'done'];
const ALLOWED_PRIORITY = ['low', 'medium', 'high'];

function validatePayload(payload) {
  const errors = [];
  const { title, description, status, priority, dueDate } = payload || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('`title` is required');
  } else if (title.trim().length < 3 || title.trim().length > 100) {
    errors.push('`title` must be between 3 and 100 characters');
  }

  if (description && description.length > 500) {
    errors.push('`description` must be at most 500 characters');
  }

  if (status && !ALLOWED_STATUS.includes(status)) {
    errors.push('`status` must be one of: ' + ALLOWED_STATUS.join(', '));
  }

  if (priority && !ALLOWED_PRIORITY.includes(priority)) {
    errors.push('`priority` must be one of: ' + ALLOWED_PRIORITY.join(', '));
  }

  if (dueDate) {
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) {
      errors.push('`dueDate` must be a valid date');
    }
  }

  return errors;
}

exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, sortBy = 'createdAt', order = 'desc', search } = req.query;

    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const allowedSort = ['createdAt', 'dueDate', 'priority'];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortField] = sortOrder;

    const tasks = await Task.find(filter).sort(sortObj).exec();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, user: req.user.id }).exec();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join('; ') });

    const task = new Task({ ...req.body, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join('; ') });

    const task = await Task.findOne({ _id: id, user: req.user.id }).exec();
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = req.body.title !== undefined ? req.body.title : task.title;
    task.description = req.body.description !== undefined ? req.body.description : task.description;
    task.status = req.body.status !== undefined ? req.body.status : task.status;
    task.priority = req.body.priority !== undefined ? req.body.priority : task.priority;
    task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id }).exec();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
