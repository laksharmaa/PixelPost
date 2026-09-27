const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid or missing token' });
  }

  const statusCode = error.status || error.statusCode || 500;
  const message = statusCode < 500 ? 'Invalid request' : 'Internal server error';

  if (statusCode >= 500) {
    console.error('Unhandled request error:', error.name || 'Error');
  }

  return res.status(statusCode).json({ success: false, message });
};

export default errorHandler;