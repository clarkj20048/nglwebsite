function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.fromEntries(
        Object.entries(err.errors).map(([key, value]) => [key, value.message])
      ),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource identifier." });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Resource already exists." });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
    ...(err.details ? { errors: err.details } : {}),
  });
}

module.exports = {
  notFound,
  errorHandler,
};
