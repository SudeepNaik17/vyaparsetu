export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" });
export const errorHandler = (err, req, res, next) => {
  if (err.code === 11000)
    return res.status(409).json({
      success: false,
      message: "This mobile number or email is already registered",
    });
  if (err.name === "ValidationError" || err.name === "CastError")
    return res.status(400).json({
      success: false,
      message:
        err.name === "CastError"
          ? "Invalid record ID"
          : Object.values(err.errors)
              .map((e) => e.message)
              .join("; "),
    });
  if (err.code === "LIMIT_FILE_SIZE")
    return res
      .status(413)
      .json({ success: false, message: "File exceeds the upload limit" });
  const status = err.statusCode || 500;
  if (status >= 500)
    console.error("Request failed:", err.name, err.code || status, err.message);
  res.status(status).json({
    success: false,
    message:
      err.name === "MongooseServerSelectionError" ||
      err.name === "MongoServerSelectionError"
        ? "Database connection failed. Check your MongoDB connection or IP whitelist."
        : status === 500
          ? "Unable to complete the operation. Please try again."
          : err.message,
  });
};
