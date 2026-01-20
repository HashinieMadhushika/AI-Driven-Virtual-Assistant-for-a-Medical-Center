import express from "express";
import {
  createDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/", createDoctor);
router.get("/", getDoctors);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;
