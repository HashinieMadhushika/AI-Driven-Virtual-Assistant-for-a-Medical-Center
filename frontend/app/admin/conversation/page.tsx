"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Headphones,
  Phone,
  Send,
  UserCheck,
  CheckCircle2,
  Mic,
  Square,
} from "lucide-react";

type HandoverStatus =
  | "Pending"
  | "Active"
  | "Resolved";

type HandoverRequest = {
  id: number;
  sessionId: string;
  firstName: string;
  email: string;
  reason: string | null;
  status: HandoverStatus;
  assignedAdminId: number | null;
  requestedAt: string;
  acceptedAt: string | null;
  resolvedAt: string | null;
  phone?: string;
};

type ChatMessage = {
  id: number;
  role:
    | "assistant"
    | "user"
    | "system"
    | "admin";
  content: string;
  createdAt: string;
};

const QUEUE_REFRESH_MS =
  5_000;

const MESSAGES_REFRESH_MS =
  2_500;

const authHeaders =
  (): Record<string, string> => {
    const token =
      localStorage.getItem(
        "token"
      );

    return token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {};
  };

export default function AdminActiveConversationPage() {
  const backendBaseUrl =
    process.env
      .NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000";

  const [
    requests,
    setRequests,
  ] =
    useState<
      HandoverRequest[]
    >([]);

  const [
    selectedRequestId,
    setSelectedRequestId,
  ] =
    useState<
      number | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    reply,
    setReply,
  ] =
    useState("");

  const [
    loadingQueue,
    setLoadingQueue,
  ] =
    useState(true);

  const [
    actionBusy,
    setActionBusy,
  ] =
    useState(false);

  const [
    isRecording,
    setIsRecording,
  ] =
    useState(false);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const mediaStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const audioChunksRef =
    useRef<Blob[]>(
      []
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const messagesBoxRef =
    useRef<HTMLDivElement>(
      null
    );

  const selectedRequest =
    requests.find(
      (
        request
      ) =>
        request.id ===
        selectedRequestId
    ) ?? null;

  const loadQueue =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `${backendBaseUrl}/api/chat/handover/requests`,
              {
                headers:
                  authHeaders(),
                cache:
                  "no-store",
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Failed to load human support queue"
            );
          }

          const data =
            (await response.json()) as {
              requests:
                HandoverRequest[];
            };

          setRequests(
            data.requests ??
              []
          );

          setSelectedRequestId(
            (
              current
            ) =>
              current &&
              data.requests.some(
                (
                  request
                ) =>
                  request.id ===
                  current
              )
                ? current
                : data
                    .requests[0]
                    ?.id ??
                  null
          );

          setError(
            null
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Failed to load human support queue"
          );
        } finally {
          setLoadingQueue(
            false
          );
        }
      },
      [
        backendBaseUrl,
      ]
    );

  const loadMessages =
    useCallback(
      async () => {
        if (
          !selectedRequest
        ) {
          setMessages(
            []
          );

          return;
        }

        try {
          const response =
            await fetch(
              `${backendBaseUrl}/api/chat/sessions/${selectedRequest.sessionId}`,
              {
                headers:
                  authHeaders(),
                cache:
                  "no-store",
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Failed to load conversation"
            );
          }

          const data =
            (await response.json()) as {
              messages:
                ChatMessage[];
            };

          setMessages(
            data.messages ??
              []
          );

          setError(
            null
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Failed to load conversation"
          );
        }
      },
      [
        backendBaseUrl,
        selectedRequest,
      ]
    );

  useEffect(
    () => {
      const start =
        window.setTimeout(
          () => {
            void loadQueue();
          },
          0
        );

      const timer =
        window.setInterval(
          () => {
            void loadQueue();
          },
          QUEUE_REFRESH_MS
        );

      return () => {
        window.clearTimeout(
          start
        );

        window.clearInterval(
          timer
        );
      };
    },
    [
      loadQueue,
    ]
  );

  useEffect(
    () => {
      if (
        !selectedRequest
      ) {
        return;
      }

      const start =
        window.setTimeout(
          () => {
            void loadMessages();
          },
          0
        );

      const timer =
        window.setInterval(
          () => {
            void loadMessages();
          },
          MESSAGES_REFRESH_MS
        );

      return () => {
        window.clearTimeout(
          start
        );

        window.clearInterval(
          timer
        );
      };
    },
    [
      loadMessages,
      selectedRequest,
    ]
  );

  useEffect(
    () => {
      const box =
        messagesBoxRef.current;

      if (box) {
        box.scrollTo({
          top:
            box.scrollHeight,
          behavior:
            "smooth",
        });
      }
    },
    [
      messages.length,
    ]
  );

  const acceptRequest =
    async () => {
      if (
        !selectedRequest
      ) {
        return;
      }

      setActionBusy(
        true
      );

      try {
        const response =
          await fetch(
            `${backendBaseUrl}/api/chat/handover/${selectedRequest.id}/accept`,
            {
              method:
                "POST",
              headers: {
                ...authHeaders(),
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          (await response.json()) as {
            error?: string;
          };

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ??
              "Could not accept conversation"
          );
        }

        await loadQueue();
        await loadMessages();
      } catch (
        acceptError
      ) {
        setError(
          acceptError instanceof
            Error
            ? acceptError.message
            : "Could not accept conversation"
        );
      } finally {
        setActionBusy(
          false
        );
      }
    };

  const sendReply =
    async () => {
      const content =
        reply.trim();

      if (
        !selectedRequest ||
        selectedRequest.status !==
          "Active" ||
        !content ||
        actionBusy
      ) {
        return;
      }

      setActionBusy(
        true
      );

      try {
        const response =
          await fetch(
            `${backendBaseUrl}/api/chat/handover/${selectedRequest.id}/reply`,
            {
              method:
                "POST",
              headers: {
                ...authHeaders(),
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  content,
                }),
            }
          );

        const data =
          (await response.json()) as {
            error?: string;
          };

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ??
              "Could not send reply"
          );
        }

        setReply(
          ""
        );

        await loadMessages();
      } catch (
        replyError
      ) {
        setError(
          replyError instanceof
            Error
            ? replyError.message
            : "Could not send reply"
        );
      } finally {
        setActionBusy(
          false
        );
      }
    };

  const stopMediaStream =
    () => {
      mediaStreamRef.current
        ?.getTracks()
        .forEach(
          (
            track
          ) =>
            track.stop()
        );

      mediaStreamRef.current =
        null;
    };

  const sendVoiceReply =
    async (
      audioBlob: Blob
    ) => {
      if (
        !selectedRequest ||
        selectedRequest.status !==
          "Active"
      ) {
        return;
      }

      setActionBusy(
        true
      );

      try {
        const form =
          new FormData();

        form.append(
          "audio",
          audioBlob,
          "admin-handover.webm"
        );

        const response =
          await fetch(
            `${backendBaseUrl}/api/chat/handover/${selectedRequest.id}/voice-reply`,
            {
              method:
                "POST",
              headers:
                authHeaders(),
              body:
                form,
            }
          );

        const data =
          (await response.json()) as {
            error?: string;
          };

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ??
              "Could not send voice reply"
          );
        }

        await loadMessages();
      } catch (
        voiceError
      ) {
        setError(
          voiceError instanceof
            Error
            ? voiceError.message
            : "Could not send voice reply"
        );
      } finally {
        setActionBusy(
          false
        );
      }
    };

  const startRecording =
    async () => {
      if (
        !selectedRequest ||
        selectedRequest.status !==
          "Active" ||
        actionBusy ||
        isRecording
      ) {
        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio:
              true,
          });

        mediaStreamRef.current =
          stream;

        audioChunksRef.current =
          [];

        const recorder =
          new MediaRecorder(
            stream
          );

        mediaRecorderRef.current =
          recorder;

        recorder.ondataavailable =
          (
            event
          ) => {
            if (
              event.data.size >
              0
            ) {
              audioChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onstop =
          () => {
            const blob =
              new Blob(
                audioChunksRef.current,
                {
                  type:
                    recorder.mimeType ||
                    "audio/webm",
                }
              );

            audioChunksRef.current =
              [];

            stopMediaStream();

            if (
              blob.size >
              500
            ) {
              void sendVoiceReply(
                blob
              );
            }
          };

        recorder.start();

        setIsRecording(
          true
        );
      } catch (
        recordError
      ) {
        stopMediaStream();

        setError(
          recordError instanceof
            Error
            ? recordError.message
            : "Microphone access failed"
        );
      }
    };

  const stopRecording =
    () => {
      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }

      mediaRecorderRef.current =
        null;

      setIsRecording(
        false
      );
    };

  const resolveRequest =
    async () => {
      if (
        !selectedRequest ||
        actionBusy
      ) {
        return;
      }

      setActionBusy(
        true
      );

      try {
        const response =
          await fetch(
            `${backendBaseUrl}/api/chat/handover/${selectedRequest.id}/resolve`,
            {
              method:
                "POST",
              headers: {
                ...authHeaders(),
                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          (await response.json()) as {
            error?: string;
          };

        if (
          !response.ok
        ) {
          throw new Error(
            data.error ??
              "Could not resolve conversation"
          );
        }

        setSelectedRequestId(
          null
        );

        setMessages(
          []
        );

        await loadQueue();
      } catch (
        resolveError
      ) {
        setError(
          resolveError instanceof
            Error
            ? resolveError.message
            : "Could not resolve conversation"
        );
      } finally {
        setActionBusy(
          false
        );
      }
    };

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <Headphones className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Human Support
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Accept patient handovers and continue the conversation as reception.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">
              Support Queue
            </div>

            {!loadingQueue ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {requests.length} open
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            {loadingQueue ? (
              <div className="text-sm text-slate-500">
                Loading requests…
              </div>
            ) : requests.length ===
              0 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No patients are waiting for human support.
              </div>
            ) : (
              requests.map(
                (
                  request
                ) => (
                  <button
                    key={
                      request.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedRequestId(
                        request.id
                      )
                    }
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      selectedRequestId ===
                      request.id
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-teal-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {
                            request.firstName
                          }
                        </div>

                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {
                            request.email
                          }
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          request.status ===
                          "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {
                          request.status
                        }
                      </span>
                    </div>

                    {request.reason ? (
                      <div className="mt-2 line-clamp-2 text-xs text-slate-600">
                        {
                          request.reason
                        }
                      </div>
                    ) : null}

                    <div className="mt-2 text-[10px] text-slate-400">
                      {new Date(
                        request.requestedAt
                      ).toLocaleString()}
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {!selectedRequest ? (
            <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
              Select a human support request.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="font-semibold text-slate-800">
                    {
                      selectedRequest.firstName
                    }
                  </div>

                  <div className="text-xs text-slate-500">
                    {
                      selectedRequest.email
                    }
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${selectedRequest.phone ?? "+94112345678"}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-100"
                  >
                    <Phone className="h-4 w-4" />
                    Medical Center Phone
                  </a>

                  {selectedRequest.status ===
                  "Pending" ? (
                    <button
                      type="button"
                      disabled={
                        actionBusy
                      }
                      onClick={() =>
                        void acceptRequest()
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      <UserCheck className="h-4 w-4" />
                      Accept Chat
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        actionBusy
                      }
                      onClick={() =>
                        void resolveRequest()
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              <div
                ref={
                  messagesBoxRef
                }
                className="mt-4 h-[52vh] space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-4"
              >
                {messages.length ===
                0 ? (
                  <div className="text-sm text-slate-500">
                    No messages yet.
                  </div>
                ) : (
                  messages.map(
                    (
                      message
                    ) => {
                      const isPatient =
                        message.role ===
                        "user";

                      const isAdmin =
                        message.role ===
                        "admin";

                      return (
                        <div
                          key={
                            message.id
                          }
                          className={`flex ${
                            isPatient
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                              isPatient
                                ? "border-slate-200 bg-white text-slate-700"
                                : isAdmin
                                  ? "border-teal-600 bg-teal-600 text-white"
                                  : "border-sky-200 bg-sky-50 text-sky-800"
                            }`}
                          >
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                              {isPatient
                                ? "Patient"
                                : isAdmin
                                  ? "Reception"
                                  : message.role ===
                                      "assistant"
                                    ? "AI Assistant"
                                    : "System"}
                            </div>

                            <div className="whitespace-pre-line">
                              {
                                message.content
                              }
                            </div>

                            <div className={`mt-2 text-[10px] ${
                              isAdmin
                                ? "text-teal-100"
                                : "text-slate-400"
                            }`}>
                              {new Date(
                                message.createdAt
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              <div className="mt-4">
                {selectedRequest.status ===
                "Active" ? (
                  <div className="flex gap-2">
                    <textarea
                      value={
                        reply
                      }
                      onChange={(
                        event
                      ) =>
                        setReply(
                          event.target.value
                        )
                      }
                      onKeyDown={(
                        event
                      ) => {
                        if (
                          event.key ===
                            "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          void sendReply();
                        }
                      }}
                      rows={
                        2
                      }
                      placeholder="Reply as Medicare reception…"
                      className="min-h-[48px] flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500"
                    />

                    <button
                      type="button"
                      disabled={
                        actionBusy
                      }
                      onClick={() =>
                        isRecording
                          ? stopRecording()
                          : void startRecording()
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                        isRecording
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-sky-600 hover:bg-sky-700"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}

                      {isRecording
                        ? "Stop"
                        : "Voice"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionBusy ||
                        !reply.trim()
                      }
                      onClick={() =>
                        void sendReply()
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Accept this request before replying to the patient.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
