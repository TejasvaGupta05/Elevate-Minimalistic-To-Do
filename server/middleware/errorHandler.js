module.exports = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const status = err.status || 500;
  const message = err.message || 'Server Error';
  res.status(status).json({ message });
};
