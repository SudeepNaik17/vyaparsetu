export const normalizeIntent = (text) => {
  return text.trim().replace(/\s+/g, " ").replace(/[₹]/g, " rupees ");
};

export const safeJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
