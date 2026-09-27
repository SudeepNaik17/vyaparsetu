import mongoose from "mongoose";
export async function transaction(fn, existing) {
  if (existing) return fn(existing);
  return mongoose.connection.transaction(fn);
}
