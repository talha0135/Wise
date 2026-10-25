import multer from "multer";

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    return res
      .status(tooBig ? 413 : 400)
      .json({ message: tooBig ? "File is too large." : `Upload error: ${err.message}` });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid data." });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "That value is already in use." });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res
    .status(status)
    .json({ message: status >= 500 ? "Something went wrong on the server." : err.message });
};
