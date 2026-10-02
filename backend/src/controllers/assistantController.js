import {
  callN8nAssistant,
} from "../services/n8nAssistantService.js";

export async function chatWithAssistant(req, res) {
  try {
    const {
      message,
      sessionId,
      email,
      action,
      selectedDoctor,
      selectedDate,
      selectedTime,
      audioBase64,
      mimeType,
      requestVoiceReply,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        error: "email is required",
      });
    }

    if (!message && !audioBase64) {
      return res.status(400).json({
        error: "message or audioBase64 is required",
      });
    }

    const result = await callN8nAssistant({
      message,
      sessionId,
      email,
      action,
      selectedDoctor,
      selectedDate,
      selectedTime,
      audioBase64,
      mimeType,
      requestVoiceReply,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Assistant controller error:", error);

    return res.status(502).json({
      error: "ASSISTANT_WORKFLOW_ERROR",
      reply:
        "The medical assistant is temporarily unavailable.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}

export async function assistantHealth(req, res) {
  return res.json({
    status: "ok",
    n8nConfigured: Boolean(
      process.env.N8N_ASSISTANT_WEBHOOK
    ),
  });
}