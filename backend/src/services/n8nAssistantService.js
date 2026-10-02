const DEFAULT_TIMEOUT_MS = 60000;

export async function callN8nAssistant({
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
}) {
  const webhookUrl =
    process.env.N8N_ASSISTANT_WEBHOOK;

  if (!webhookUrl) {
    throw new Error(
      "N8N_ASSISTANT_WEBHOOK is not configured"
    );
  }

  if (!sessionId) {
    throw new Error(
      "sessionId is required"
    );
  }

  if (!email) {
    throw new Error(
      "email is required"
    );
  }

  const hasText =
    typeof message === "string" &&
    message.trim().length > 0;

  const hasAudio =
    typeof audioBase64 === "string" &&
    audioBase64.length > 100;

  if (!hasText && !hasAudio) {
    throw new Error(
      "Either message or audioBase64 is required"
    );
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      DEFAULT_TIMEOUT_MS
    );

  const payload = {
    message:
      hasText
        ? message.trim()
        : "",

    sessionId,

    email,

    action:
      action || "",

    selectedDoctor:
      selectedDoctor || null,

    selectedDate:
      selectedDate || "",

    displayDate:
      displayDate || "",

    dayName:
      dayName || "",

    selectedTime:
      selectedTime || "",

    appointmentId:
      appointmentId || "",

    cancellationReason:
      cancellationReason || "",

    newAppointmentDate:
      newAppointmentDate || "",

    newAppointmentTime:
      newAppointmentTime || "",

    audioBase64:
      hasAudio
        ? audioBase64
        : "",

    mimeType:
      hasAudio
        ? mimeType ||
          "audio/webm"
        : "",

    requestVoiceReply:
      Boolean(
        requestVoiceReply
      ),
  };

  try {
    console.log(
      "[n8nAssistantService] request",
      {
        webhookUrl,
        sessionId,
        email,
        action:
          payload.action,
        appointmentId:
          payload.appointmentId,
        hasText,
        hasAudio,
        mimeType:
          payload.mimeType,
        requestVoiceReply:
          payload.requestVoiceReply,
      }
    );

    const response =
      await fetch(
        webhookUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload
            ),

          signal:
            controller.signal,
        }
      );

    const raw =
      await response.text();

    let result;

    try {
      result =
        raw
          ? JSON.parse(raw)
          : {};
    } catch {
      result = {
        reply: raw,
      };
    }

    if (!response.ok) {
      console.error(
        "[n8nAssistantService] n8n error",
        response.status,
        result
      );

      throw new Error(
        result?.message ||
          result?.error ||
          `n8n returned HTTP ${response.status}`
      );
    }

    return result;
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      throw new Error(
        "n8n assistant request timed out"
      );
    }

    throw error;
  } finally {
    clearTimeout(
      timeout
    );
  }
}
