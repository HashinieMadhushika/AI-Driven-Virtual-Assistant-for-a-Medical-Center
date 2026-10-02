export function getAssistantSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  let sessionId =
    sessionStorage.getItem(
      "medicare_assistant_session_id"
    );

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    sessionStorage.setItem(
      "medicare_assistant_session_id",
      sessionId
    );
  }

  return sessionId;
}

export function clearAssistantSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(
    "medicare_assistant_session_id"
  );
}