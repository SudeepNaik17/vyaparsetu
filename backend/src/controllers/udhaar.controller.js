import * as udhaar from "../services/udhaar.service.js";

export const listUdhaar = async (req, res) => {
  res.json({
    success: true,
    udhaar: await udhaar.listUdhaar(req.user, req.query),
  });
};

export const createUdhaar = async (req, res) => {
  res.status(201).json({
    success: true,
    udhaar: await udhaar.createUdhaar(req.user, req.body),
  });
};

export const getUdhaar = async (req, res) => {
  res.json({
    success: true,
    udhaar: await udhaar.getUdhaar(req.user, req.params.id),
  });
};

export const payUdhaar = async (req, res) => {
  res.json({
    success: true,
    udhaar: await udhaar.payUdhaar(req.user, req.params.id, req.body),
  });
};
