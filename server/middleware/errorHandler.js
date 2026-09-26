/**
 * Global error handler middleware.
 * Must be registered LAST in Express (after all routes).
 */
function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Log full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${req.method}] ${req.path} →`, err);
  } else {
    // In production, only log 5xx errors
    if (status >= 500) console.error(err);
  }

  res.status(status).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
