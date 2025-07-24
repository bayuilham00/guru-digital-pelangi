// Error Handling Middleware
// Menangani semua error yang terjadi di aplikasi

/**
 * Global error handler middleware
 * Harus diletakkan di akhir setelah semua routes
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error untuk debugging
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Data sudah ada (duplicate entry)';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2025') {
    const message = 'Data tidak ditemukan';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'P2003') {
    const message = 'Tidak dapat menghapus data karena masih digunakan';
    error = { message, statusCode: 400 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token tidak valid';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token sudah expired';
    error = { message, statusCode: 401 };
  }

  // Cast errors (invalid ObjectId, etc)
  if (err.name === 'CastError') {
    const message = 'Resource tidak ditemukan';
    error = { message, statusCode: 404 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 * Untuk routes yang tidak ditemukan
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} tidak ditemukan`);
  res.status(404);
  next(error);
};
