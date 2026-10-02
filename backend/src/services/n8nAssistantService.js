const N8N_WEBHOOK = process.env.N8N_ASSISTANT_WEBHOOK;

export async function callN8nAssistant(payload) {
  if (!N8N_WEBHOOK) {
    throw new Error("N8N_ASSISTANT_WEBHOOK is not configured");
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 45000);

  try {
    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message: payload.message || "",
        sessionId: payload.sessionId,
        email: payload.email,

        action: payload.action || "",
        selectedDoctor: payload.selectedDoctor || null,
        selectedDate: payload.selectedDate || "",
        selectedTime: payload.selectedTime || "",

        audioBase64: payload.audioBase64 || undefined,
        mimeType: payload.mimeType || undefined,

        requestVoiceReply:
          payload.requestVoiceReply === true,
      }),

      signal: controller.signal,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `n8n returned ${response.status}: ${responseText}`
      );
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        reply: responseText,
      };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("n8n assistant request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}