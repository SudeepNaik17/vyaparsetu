import mongoose from "mongoose";
import multer from "multer";
import { getShopOwnerId } from "../middlewares/auth.middleware.js";
import { text, fail } from "../utils/validation.js";
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: String,
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    attachment: {
      name: String,
      mime: String,
      bytes: { type: Buffer, select: false },
    },
  },
  { timestamps: true },
);
const Ticket =
  mongoose.models.SupportTicket || mongoose.model("SupportTicket", schema);
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (
      !/^(image\/(png|jpeg|webp)|audio\/(webm|ogg|mpeg|mp4|wav))$/.test(
        file.mimetype,
      )
    )
      return cb(
        Object.assign(new Error("Use PNG, JPEG, WebP, or audio files"), {
          statusCode: 415,
        }),
      );
    cb(null, true);
  },
}).single("attachment");
export const listTickets = async (req, res) =>
  res.json({
    success: true,
    tickets: await Ticket.find({ userId: getShopOwnerId(req.user) }).sort({
      createdAt: -1,
    }),
  });
export const createTicket = async (req, res) => {
  const data = {
    userId: getShopOwnerId(req.user),
    subject: text(req.body.subject, "Subject", 200),
    message: text(req.body.message, "Message", 5000),
    category: String(req.body.category || "general").slice(0, 40),
  };
  if (req.file)
    data.attachment = {
      name: req.file.originalname,
      mime: req.file.mimetype,
      bytes: req.file.buffer,
    };
  const ticket = await Ticket.create(data);
  res.status(201).json({
    success: true,
    ticket: {
      _id: ticket._id,
      subject: ticket.subject,
      status: ticket.status,
    },
  });
};
export const updateTicket = async (req, res) => {
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id, userId: getShopOwnerId(req.user) },
    { $set: { status: req.body.status } },
    { new: true, runValidators: true },
  );
  if (!ticket) fail("Ticket not found", 404);
  res.json({ success: true, ticket });
};
export const attachment = async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    userId: getShopOwnerId(req.user),
  }).select("+attachment.bytes");
  if (!ticket?.attachment?.bytes) fail("Attachment not found", 404);
  res.set("Content-Type", ticket.attachment.mime);
  res.set(
    "Content-Disposition",
    "attachment; filename*=UTF-8''" +
      encodeURIComponent(ticket.attachment.name),
  );
  res.set("X-Content-Type-Options", "nosniff");
  res.send(ticket.attachment.bytes);
};
