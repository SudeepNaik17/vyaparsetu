const buckets = new Map();
const timer = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.end < now) buckets.delete(k);
}, 60000);
timer.unref();
export const rateLimit = (limit, windowMs) => (req, res, next) => {
  const key = req.baseUrl + ":" + (req.user?._id || req.ip);
  let bucket = buckets.get(key);
  if (!bucket || bucket.end < Date.now()) {
    bucket = { count: 0, end: Date.now() + windowMs };
    buckets.set(key, bucket);
  }
  if (++bucket.count > limit) {
    res.set("Retry-After", String(Math.ceil((bucket.end - Date.now()) / 1000)));
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again later.",
    });
  }
  next();
};
