export const validMobile = (value) =>
  /^[6-9]\d{9}$/.test(value.replace(/\s/g, ""));
export const validPin = (value) => /^\d{4}$/.test(value);
