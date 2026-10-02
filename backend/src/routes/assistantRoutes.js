import express from "express";

import {
  assistantHealth,
  chatWithAssistant,
} from "../controllers/assistantController.js";

const router =
  express.Router();

router.get(
  "/health",
  assistantHealth
);

router.post(
  "/chat",
  chatWithAssistant
);

export default router;