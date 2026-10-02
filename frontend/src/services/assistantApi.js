const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function sendAssistantMessage({
  message,
  sessionId,
  email,

  action = "",
  selectedDoctor = null,
  selectedDate = "",
  selectedTime = "",

  audioBase64,
  mimeType,
  requestVoiceReply = false,
}) {
  const response = await fetch(
    `${API_URL}/api/assistant/chat`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
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
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Assistant API error:",
      data
    );

    throw new Error(
      data.reply ||
        data.error ||
        "Assistant request failed"
    );
  }

  return data;
}