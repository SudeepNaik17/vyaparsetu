import multer from "multer";
import * as ai from "../services/ai.service.js";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
});
export const uploadAudio = upload.single("audio");
export const chat = async (req, res) =>
  res.json({
    success: true,
    ...(await ai.chat(req.user, req.body.message, req.body.language)),
  });
export const confirm = async (req, res) =>
  res.json({ success: true, ...(await ai.confirm(req.user, req.params.id)) });
export const transcribe = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "Audio file required" });
  res.json({
    success: true,
    text: await ai.transcribe(req.file, req.body.language),
  });
};
