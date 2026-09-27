export const fail = (message, statusCode = 400) => {
  throw Object.assign(new Error(message), { statusCode });
};
export const text = (value, name, max = 200) => {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    fail(name + " is required (maximum " + max + " characters)");
  return value.trim();
};
export const number = (value, name, { min = 0, integer = false } = {}) => {
  if (
    !["number", "string"].includes(typeof value) ||
    (typeof value === "string" && !value.trim())
  )
    fail("Invalid " + name);
  if (value === null || value === "" || value === undefined)
    fail(name + " is required");
  const n = Number(value);
  if (
    !Number.isFinite(n) ||
    Math.abs(n) > 1e12 ||
    n < min ||
    (integer && !Number.isInteger(n))
  )
    fail("Invalid " + name);
  return n;
};
export const recordId = (value) => {
  if (typeof value !== "string" || !/^[a-f0-9]{24}$/i.test(value))
    fail("Invalid record ID");
  return value;
};
export const money = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const pick = (data, keys) =>
  Object.fromEntries(
    keys.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]),
  );
export const escapeRegex = (s) =>
  String(s)
    .split("")
    .map((c) =>
      c.charCodeAt(0) === 92 || "^$.*+?()[]{}|".includes(c) ? "\\" + c : c,
    )
    .join("");
