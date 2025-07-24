// 404 Not Found Middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} tidak ditemukan`);
  res.status(404);
  next(error);
};
