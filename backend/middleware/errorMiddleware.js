export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

export function errorHandler(error, req, res, next) {
  console.error(error)
  if (error.name === 'ValidationError') {
    res.status(400).json({ success: false, message: Object.values(error.errors)[0].message })
    return
  }
  if (error.code === 11000) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    return
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
  })
}
