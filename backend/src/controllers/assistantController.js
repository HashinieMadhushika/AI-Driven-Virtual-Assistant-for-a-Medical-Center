import {
  callN8nAssistant,
} from "../services/n8nAssistantService.js";

export function assistantHealth(
  req,
  res
) {
  return res.json({
    ok: true,
    configured:
      Boolean(
        process.env
          .N8N_ASSISTANT_WEBHOOK
      ),
  });
}

export async function chatWithAssistant(
  req,
  res
) {
  try {
    const {
      message = "",
      sessionId,
      email,

      action = "",

      selectedDoctor = null,

      selectedDate = "",
      displayDate = "",
      dayName = "",
      selectedTime = "",

      appointmentId = "",
      cancellationReason = "",
      newAppointmentDate = "",
      newAppointmentTime = "",

      audioBase64 = "",
      mimeType = "",

      requestVoiceReply = false,
    } = req.body ?? {};

    if (!sessionId) {
      return res
        .status(400)
        .json({
          error:
            "sessionId is required",
        });
    }

    if (!email) {
      return res
        .status(400)
        .json({
          error:
            "email is required",
        });
    }

    const hasText =
      typeof message ===
        "string" &&
      message.trim().length >
        0;

    const hasAudio =
      typeof audioBase64 ===
        "string" &&
      audioBase64.length >
        100;

    if (!hasText && !hasAudio) {
      return res
        .status(400)
        .json({
          error:
            "message or audioBase64 is required",
        });
    }

    const result =
      await callN8nAssistant(
        {
          message,

          sessionId,

          email,

          action,

          selectedDoctor,

          selectedDate,
          displayDate,
          dayName,
          selectedTime,

          appointmentId,
          cancellationReason,
          newAppointmentDate,
          newAppointmentTime,

          audioBase64,
          mimeType,

          requestVoiceReply,
        }
      );

    return res.json(
      result
    );
  } catch (error) {
    console.error(
      "[assistantController]",
      error
    );

    return res
      .status(502)
      .json({
        error:
          "Assistant workflow failed",

        reply:
          error instanceof
          Error
            ? error.message
            : "Assistant workflow failed",
      });
  }
}
