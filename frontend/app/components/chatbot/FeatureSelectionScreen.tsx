"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Stethoscope,
  FileText,
  Pill,
  Mic,
  Volume2,
  Play,
} from "lucide-react";

import FeatureCard from "./FeatureCard";
import ChatInput from "./ChatInput";

import DoctorCards, {
  type Doctor,
} from "./DoctorCards";

import AppointmentStepPicker from "./AppointmentStepPicker";

import AppointmentConfirmationCard from "./AppointmentConfirmationCard";

import BookingConfirmationMessage from "./BookingConfirmationMessage";

import SymptomAnalysisCard, {
  type SymptomCardData,
} from "./SymptomAnalysisCard";

import DocumentResultCard, {
  type DocumentResultData,
} from "./DocumentResultCard";

import type {
  PreviousChat,
} from "./UserInfoScreen";

type BookingStep =
  | "date"
  | "time"
  | "patient"
  | "none";

type BookingAction =
  | "start_booking"
  | "check_time_slots"
  | "select_time_slot"
  | "cancel_appointment"
  | "reschedule_appointment";

type DocumentType =
  | "MEDICAL_REPORT"
  | "PRESCRIPTION";

type TimeSlot =
  | string
  | {
      label: string;
      booked?: boolean;
    };

type ChatMessage = {
  role:
    | "ai"
    | "user";

  text: string;

  inputMode?: "text" | "voice";

  voiceAudioBase64?: string;

  voiceMimeType?: string;

  imageName?: string;

  doctors?: Doctor[];

  bookingStep?: BookingStep;

  timeSlots?: TimeSlot[];

  appointmentPreview?: {
    doctor: Doctor;
    date: string;
    time: string;
  };

  bookingConfirmed?: boolean;

  appointmentId?:
    | string
    | number;

  appointmentOperation?:
    | "cancelled"
    | "rescheduled"
    | "none";

  intent?: string;

  rescheduleMode?: boolean;

  bookingPrompt?:
    | "pending"
    | "accepted"
    | "declined";

  historySaved?: boolean;

  symptomCard?: SymptomCardData;

  documentResult?: DocumentResultData;

  documentChoice?:
    | "pending"
    | DocumentType;
};

type ChatApiResponse = {
  error?: string;

  reply?: string;

  transcript?: string;

  intent?: string;

  doctors?: Doctor[];

  cards?: Doctor[];

  bookingStep?: BookingStep;

  timeSlots?: TimeSlot[];

  calendar?: Array<{
    date: string;
    displayDate?: string;
    dayName?: string;
    available?: boolean;
    timeSlots?: string[];
  }> | null;

  selectedDoctor?: Doctor | null;

  selectedDate?: string;

  bookingConfirmed?: boolean;

  appointmentId?:
    | string
    | number;

  appointmentOperation?:
    | "cancelled"
    | "rescheduled"
    | "none";

  rescheduleMode?: boolean;

  historySaved?: boolean;

  symptomCard?: SymptomCardData;

  documentResult?: DocumentResultData;

  voiceMode?: boolean;

  audioBase64?: string;

  mimeType?: string;
};

function VoicePlayback({
  audioBase64,
  mimeType = "audio/mpeg",
}: {
  audioBase64: string;
  mimeType?: string;
}) {
  const play = async () => {
    const audio =
      new Audio(
        `data:${mimeType};base64,${audioBase64}`
      );

    try {
      await audio.play();
    } catch (error) {
      console.warn(
        "[VoicePlayback] playback failed",
        error
      );
    }
  };

  return (
    <button
      type="button"
      onClick={() => void play()}
      className="mt-2 flex items-center gap-3 rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs text-teal-800 transition hover:bg-teal-50"
      aria-label="Replay assistant voice"
      title="Replay voice"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100">
        <Play className="h-3.5 w-3.5 fill-current" />
      </div>

      <div className="flex items-end gap-[2px]" aria-hidden="true">
        <span className="h-2 w-[3px] rounded-full bg-teal-400" />
        <span className="h-4 w-[3px] rounded-full bg-teal-500" />
        <span className="h-3 w-[3px] rounded-full bg-teal-400" />
        <span className="h-5 w-[3px] rounded-full bg-teal-600" />
        <span className="h-3 w-[3px] rounded-full bg-teal-400" />
        <span className="h-4 w-[3px] rounded-full bg-teal-500" />
        <span className="h-2 w-[3px] rounded-full bg-teal-400" />
      </div>

      <Volume2 className="h-4 w-4" />

      <span>
        Replay voice
      </span>
    </button>
  );
}

interface Props {
  visitor: {
    firstName: string;
    email: string;
  };

  previousChat:
    PreviousChat | null;
}

export default function FeatureSelectionScreen({
  visitor,
  previousChat,
}: Props) {
  /*
   * IMPORTANT:
   * Text and voice both use this SAME sessionId.
   */
  const [sessionId] =
    useState(
      () =>
        previousChat?.sessionId ??
        crypto.randomUUID()
    );

  const [
    isSending,
    setIsSending,
  ] =
    useState(false);

  const [
    selectedDoctor,
    setSelectedDoctor,
  ] =
    useState<
      Doctor | null
    >(null);

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState("");

  const [
    selectedDocumentType,
    setSelectedDocumentType,
  ] =
    useState<
      DocumentType | null
    >(null);

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >(() => {
      if (
        previousChat
          ?.messages
          .length
      ) {
        return previousChat.messages.map(
          (
            message
          ) => ({
            role:
              message.role ===
              "assistant"
                ? ("ai" as const)
                : ("user" as const),

            text:
              message.content,
          })
        );
      }

      return [
        {
          role:
            "ai" as const,

          text:
            "Hi! You can ask me anything, or choose one option above.",
        },
      ];
    });

  /*
   * Convert recorded browser Blob to raw base64.
   */
  const blobToBase64 = (
    blob: Blob
  ): Promise<string> => {
    return new Promise(
      (
        resolve,
        reject
      ) => {
        const reader =
          new FileReader();

        reader.onerror =
          () => {
            reject(
              new Error(
                "Unable to read voice recording"
              )
            );
          };

        reader.onloadend =
          () => {
            const result =
              reader.result;

            if (
              typeof result !==
              "string"
            ) {
              reject(
                new Error(
                  "Invalid voice recording"
                )
              );

              return;
            }

            const base64 =
              result.includes(
                ","
              )
                ? result.split(
                    ","
                  )[1]
                : result;

            if (!base64) {
              reject(
                new Error(
                  "Voice recording was empty"
                )
              );

              return;
            }

            resolve(
              base64
            );
          };

        reader.readAsDataURL(
          blob
        );
      }
    );
  };

  /*
   * Play ElevenLabs TTS response returned from n8n.
   */
  const playAssistantAudio =
    async (
      audioBase64: string,
      mimeType =
        "audio/mpeg"
    ) => {
      if (
        !audioBase64
      ) {
        return;
      }

      const audio =
        new Audio(
          `data:${mimeType};base64,${audioBase64}`
        );

      try {
        await audio.play();
      } catch (
        error
      ) {
        console.warn(
          "[FeatureSelectionScreen] browser blocked audio playback",
          error
        );
      }
    };

  /*
   * Existing TEXT / IMAGE / BOOKING flow.
   */
  const handleSend =
    async (
      text: string,
      image?: File,
      booking?: {
        action:
          BookingAction;

        doctor:
          Doctor;

        date?:
          string;

        time?:
          string;
      },

      messageHistory:
        ChatMessage[] =
        messages
    ) => {
      const t =
        text.trim();

      if (
        (!t &&
          !image) ||
        isSending
      ) {
        return;
      }

      const messageText =
        t ||
        "Please analyze the attached image.";

      const nextMessages:
        ChatMessage[] =
        [
          ...messageHistory,

          {
            role:
              "user",

            text:
              messageText,

            inputMode:
              "text",

            imageName:
              image?.name,
          },
        ];

      setMessages(
        nextMessages
      );

      setIsSending(
        true
      );

      try {
        const formData =
          new FormData();

        formData.set(
          "sessionId",
          sessionId
        );

        formData.set(
          "firstName",
          visitor.firstName
        );

        formData.set(
          "email",
          visitor.email
        );

        if (booking) {
          formData.set(
            "bookingAction",
            booking.action
          );

          formData.set(
            "selectedDoctor",
            JSON.stringify(
              booking.doctor
            )
          );

          if (
            booking.date
          ) {
            formData.set(
              "appointmentDate",
              booking.date
            );

            formData.set(
              "displayDate",
              new Date(
                `${booking.date}T12:00:00`
              ).toLocaleDateString()
            );

            formData.set(
              "dayName",
              new Date(
                `${booking.date}T12:00:00`
              )
                .toLocaleDateString(
                  "en-US",
                  {
                    weekday:
                      "long",
                  }
                )
                .toLowerCase()
            );
          }

          if (
            booking.time
          ) {
            formData.set(
              "appointmentTime",
              booking.time
            );
          }
        }

        if (image) {
          formData.set(
            "documentType",
            selectedDocumentType ??
              "PRESCRIPTION"
          );
        }

        formData.set(
          "messages",
          JSON.stringify(
            nextMessages.map(
              (
                message
              ) => ({
                role:
                  message.role ===
                  "ai"
                    ? "assistant"
                    : "user",

                content:
                  message.text,
              })
            )
          )
        );

        if (image) {
          formData.set(
            "image",
            image,
            image.name
          );
        }

        const response =
          await fetch(
            "/api/chat",
            {
              method:
                "POST",

              body:
                formData,
            }
          );

        const data =
          (await response.json()) as ChatApiResponse;

        if (
          !response.ok ||
          !data.reply
        ) {
          throw new Error(
            data.error ??
              data.reply ??
              "Chat request failed"
          );
        }

        const startsDoctorBooking =
          booking?.action ===
          "start_booking";

        const returnedDoctors =
          data.doctors ??
          data.cards;

        if (data.selectedDoctor) {
          setSelectedDoctor(
            data.selectedDoctor
          );
        }

        if (data.selectedDate) {
          setSelectedDate(
            data.selectedDate
          );
        }

        setMessages(
          (
            prev
          ) => [
            ...prev,

            {
              role:
                "ai",

              text:
                data.reply!,

              inputMode:
                "text",

              intent:
                data.intent,

              rescheduleMode:
                data.rescheduleMode,

              doctors:
                returnedDoctors,

              bookingStep:
                startsDoctorBooking &&
                (!data.bookingStep ||
                  data.bookingStep ===
                    "none")
                  ? "date"
                  : data.bookingStep,

              timeSlots:
                data.timeSlots,

              bookingConfirmed:
                data.bookingConfirmed,

              appointmentId:
                data.appointmentId,

              appointmentOperation:
                data.appointmentOperation,

              historySaved:
                data.historySaved,

              symptomCard:
                data.symptomCard,

              documentResult:
                data.documentResult,
            },
          ]
        );

        if (
          data.bookingConfirmed ||
          data.appointmentOperation === "cancelled" ||
          data.appointmentOperation === "rescheduled"
        ) {
          setSelectedDoctor(
            null
          );

          setSelectedDate(
            ""
          );
        }
      } catch (
        error
      ) {
        console.error(
          "[FeatureSelectionScreen] text request failed",
          error
        );

        setMessages(
          (
            prev
          ) => [
            ...prev,

            {
              role:
                "ai",

              text:
                error instanceof
                Error
                  ? error.message
                  : "I could not connect right now. Please try again.",
            },
          ]
        );
      } finally {
        setIsSending(
          false
        );
      }
    };

  /*
   * VOICE FLOW
   *
   * ChatInput
   * → MediaRecorder Blob
   * → base64
   * → /api/chat
   * → backend
   * → n8n
   * → ElevenLabs STT
   * → same intent/booking logic
   * → ElevenLabs TTS
   * → audioBase64
   */
  const handleVoiceSend =
    async (
      audioBlob: Blob
    ) => {
      if (
        isSending
      ) {
        return;
      }

      setIsSending(
        true
      );

      try {
        const audioBase64 =
          await blobToBase64(
            audioBlob
          );

        console.log(
          "[FeatureSelectionScreen] voice request",
          {
            sessionId,

            email:
              visitor.email,

            mimeType:
              audioBlob.type,

            audioBytes:
              audioBlob.size,

            base64Length:
              audioBase64.length,
          }
        );

        const response =
          await fetch(
            "/api/chat",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    sessionId,

                    firstName:
                      visitor.firstName,

                    email:
                      visitor.email,

                    audioBase64,

                    mimeType:
                      audioBlob.type ||
                      "audio/webm",

                    requestVoiceReply:
                      true,
                  }
                ),
            }
          );

        const data =
          (await response.json()) as ChatApiResponse;

        console.log(
          "[FeatureSelectionScreen] voice response",
          {
            status:
              response.status,

            transcript:
              data.transcript,

            intent:
              data.intent,

            voiceMode:
              data.voiceMode,

            hasAudio:
              Boolean(
                data.audioBase64
              ),

            bookingStep:
              data.bookingStep,

            bookingConfirmed:
              data.bookingConfirmed,
          }
        );

        if (
          !response.ok
        ) {
          throw new Error(
            data.reply ||
              data.error ||
              "Voice request failed"
          );
        }

        /*
         * Show STT transcript in user bubble.
         */
        const transcript =
          String(
            data.transcript ||
              ""
          ).trim();

        setMessages(
          (
            current
          ) => [
            ...current,

            {
              role:
                "user",

              text:
                transcript ||
                "Voice message",

              inputMode:
                "voice",
            },
          ]
        );

        const returnedDoctors =
          data.doctors ??
          data.cards;

        /*
         * When booking state was changed by voice,
         * mirror it in the frontend so the calendar
         * and time-slot buttons work exactly like text.
         */
        if (data.selectedDoctor) {
          setSelectedDoctor(
            data.selectedDoctor
          );
        }

        if (data.selectedDate) {
          setSelectedDate(
            data.selectedDate
          );
        }

        /*
         * Render AI response using same card/booking structure.
         */
        setMessages(
          (
            current
          ) => [
            ...current,

            {
              role:
                "ai",

              text:
                data.reply ||
                "I could not create a response.",

              inputMode:
                "voice",

              intent:
                data.intent,

              rescheduleMode:
                data.rescheduleMode,

              voiceAudioBase64:
                data.audioBase64 ||
                undefined,

              voiceMimeType:
                data.mimeType ||
                "audio/mpeg",

              doctors:
                returnedDoctors,

              bookingStep:
                data.bookingStep,

              timeSlots:
                data.timeSlots,

              bookingConfirmed:
                data.bookingConfirmed,

              appointmentId:
                data.appointmentId,

              appointmentOperation:
                data.appointmentOperation,

              historySaved:
                data.historySaved,

              symptomCard:
                data.symptomCard,

              documentResult:
                data.documentResult,
            },
          ]
        );

        /*
         * Play spoken TTS response.
         */
        if (
          data.audioBase64
        ) {
          await playAssistantAudio(
            data.audioBase64,

            data.mimeType ||
              "audio/mpeg"
          );
        } else {
          console.warn(
            "[FeatureSelectionScreen] voice response contained no audioBase64"
          );
        }

        if (
          data.bookingConfirmed ||
          data.appointmentOperation === "cancelled" ||
          data.appointmentOperation === "rescheduled"
        ) {
          setSelectedDoctor(
            null
          );

          setSelectedDate(
            ""
          );
        }
      } catch (
        error
      ) {
        console.error(
          "[FeatureSelectionScreen] voice request failed",
          error
        );

        setMessages(
          (
            current
          ) => [
            ...current,

            {
              role:
                "ai",

              text:
                error instanceof
                Error
                  ? error.message
                  : "I could not process your voice message.",
            },
          ]
        );
      } finally {
        setIsSending(
          false
        );
      }
    };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Title */}
      <h2 className="mb-4 text-center text-xl font-bold text-teal-700">
        How can I help you?
      </h2>

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FeatureCard
          title="Book Appointment"
          description="Schedule visit with specialist"
          icon={
            <CalendarCheck className="h-5 w-5" />
          }
          onClick={() =>
            setMessages(
              (
                current
              ) => [
                ...current,

                {
                  role:
                    "ai",

                  text:
                    "Do you want to book an appointment?",

                  bookingPrompt:
                    "pending",
                },
              ]
            )
          }
        />

        <FeatureCard
          title="Find Doctor"
          description="Search by specialization"
          icon={
            <Stethoscope className="h-5 w-5" />
          }
          onClick={() =>
            void handleSend(
              "Who are the available doctors?"
            )
          }
        />

        <FeatureCard
          title="Check Report"
          description="Access medical reports"
          icon={
            <FileText className="h-5 w-5" />
          }
          onClick={() =>
            setMessages(
              (
                current
              ) => [
                ...current,

                {
                  role:
                    "ai",

                  text:
                    "What type of document would you like to check?",

                  documentChoice:
                    "pending",
                },
              ]
            )
          }
        />
      </div>

      {/* Chat terminal area */}
      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-inner">
        {messages.map(
          (
            m,
            i
          ) => (
            <div
              key={i}
              className={
                m.role ===
                "user"
                  ? "ml-auto flex max-w-[80%] justify-end"
                  : "max-w-full"
              }
            >
              {/* Symptom result */}
              {m.role ===
                "ai" &&
              m.symptomCard ? (
                <SymptomAnalysisCard
                  analysis={
                    m.symptomCard
                  }
                  onBook={(
                    doctor
                  ) => {
                    setSelectedDoctor(
                      doctor
                    );

                    void handleSend(
                      `I would like to book an appointment with ${doctor.name}.`,
                      undefined,
                      {
                        action:
                          "start_booking",

                        doctor,
                      }
                    );
                  }}
                />
              ) : null}

              {/* Document result */}
              {m.role ===
                "ai" &&
              m.documentResult ? (
                <DocumentResultCard
                  result={
                    m.documentResult
                  }
                />
              ) : null}

              {/* Standard chat bubble */}
              {!m.bookingConfirmed &&
              !m.symptomCard &&
              !m.documentResult ? (
                <div
                  className={`w-fit max-w-full rounded-xl px-4 py-2 text-sm ${
                    m.role ===
                    "ai"
                      ? "bg-teal-100 text-slate-800"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  {m.role ===
                  "ai" ? (
                    <>
                      <div className="flex items-start gap-2">
                        {m.inputMode ===
                        "voice" ? (
                          <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                        ) : null}

                        <span>
                          AI: {m.text}
                        </span>
                      </div>

                      {m.inputMode ===
                        "voice" &&
                      m.voiceAudioBase64 ? (
                        <VoicePlayback
                          audioBase64={
                            m.voiceAudioBase64
                          }
                          mimeType={
                            m.voiceMimeType
                          }
                        />
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        {m.inputMode ===
                        "voice" ? (
                          <Mic className="mt-0.5 h-4 w-4 shrink-0" />
                        ) : null}

                        <span>
                          {m.text}
                        </span>
                      </div>

                      {m.inputMode ===
                      "voice" ? (
                        <div className="mt-1 text-[10px] text-teal-100">
                          Voice message
                        </div>
                      ) : null}

                      {m.imageName ? (
                        <div className="mt-1 text-xs opacity-80">
                          Image:{" "}
                          {
                            m.imageName
                          }
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}

              {/* Document choice */}
              {m.documentChoice ===
              "pending" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDocumentType(
                        "MEDICAL_REPORT"
                      );

                      setMessages(
                        (
                          current
                        ) => [
                          ...current.map(
                            (
                              message,
                              index
                            ) =>
                              index ===
                              i
                                ? {
                                    ...message,

                                    documentChoice:
                                      "MEDICAL_REPORT" as const,
                                  }
                                : message
                          ),

                          {
                            role:
                              "ai",

                            text:
                              "Medical report selected. Attach an image of the report; you can add a question too.",
                          },
                        ]
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
                  >
                    <FileText className="h-4 w-4" />
                    Medical report
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDocumentType(
                        "PRESCRIPTION"
                      );

                      setMessages(
                        (
                          current
                        ) => [
                          ...current.map(
                            (
                              message,
                              index
                            ) =>
                              index ===
                              i
                                ? {
                                    ...message,

                                    documentChoice:
                                      "PRESCRIPTION" as const,
                                  }
                                : message
                          ),

                          {
                            role:
                              "ai",

                            text:
                              "Prescription selected. Attach an image of the prescription; you can add a question too.",
                          },
                        ]
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-3.5 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50"
                  >
                    <Pill className="h-4 w-4" />
                    Prescription
                  </button>
                </div>
              ) : null}

              {/* History warning */}
              {m.role ===
                "ai" &&
              m.historySaved ===
                false ? (
                <p
                  className="mt-1 text-xs text-amber-700"
                  role="status"
                >
                  This chat
                  could not be
                  saved. Your
                  previous
                  conversation
                  may not be
                  available
                  next time.
                </p>
              ) : null}

              {/* Booking yes/no */}
              {m.bookingPrompt ===
              "pending" ? (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={
                      isSending
                    }
                    onClick={() => {
                      const answeredMessages =
                        messages.map(
                          (
                            message,
                            index
                          ) =>
                            index ===
                            i
                              ? {
                                  ...message,

                                  bookingPrompt:
                                    "accepted" as const,
                                }
                              : message
                        );

                      setMessages(
                        answeredMessages
                      );

                      void handleSend(
                        "Who are the available doctors?",
                        undefined,
                        undefined,
                        answeredMessages
                      );
                    }}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    disabled={
                      isSending
                    }
                    onClick={() => {
                      const answeredMessages =
                        messages.map(
                          (
                            message,
                            index
                          ) =>
                            index ===
                            i
                              ? {
                                  ...message,

                                  bookingPrompt:
                                    "declined" as const,
                                }
                              : message
                        );

                      setMessages(
                        [
                          ...answeredMessages,

                          {
                            role:
                              "ai",

                            text:
                              "No problem. Let me know if you need anything else.",
                          },
                        ]
                      );
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              ) : null}

              {/* Booking confirmation */}
              {m.role ===
                "ai" &&
              m.bookingConfirmed ? (
                <BookingConfirmationMessage
                  message={
                    m.text
                  }
                  appointmentId={
                    m.appointmentId
                  }
                />
              ) : null}

              {/* Doctors */}
              {m.role ===
                "ai" &&
              m.doctors &&
              !m.symptomCard ? (
                <DoctorCards
                  doctors={
                    m.doctors
                  }
                  onBook={(
                    doctor
                  ) => {
                    setSelectedDoctor(
                      doctor
                    );

                    void handleSend(
                      `I would like to book an appointment with ${doctor.name}.`,
                      undefined,
                      {
                        action:
                          "start_booking",

                        doctor,
                      }
                    );
                  }}
                />
              ) : null}

              {/* Date / time picker */}
              {m.role ===
                "ai" &&
              m.bookingStep ? (
                <AppointmentStepPicker
                  step={
                    m.bookingStep
                  }
                  timeSlots={
                    m.timeSlots
                  }
                  onSubmit={(
                    value
                  ) => {
                    if (
                      m.bookingStep !==
                      "date"
                    ) {
                      return;
                    }

                    setSelectedDate(
                      value
                    );

                    /*
                     * RESCHEDULE:
                     * Send only the selected date.
                     * The n8n operation state already knows
                     * which appointment is being rescheduled.
                     *
                     * Do not include "appointment 7" again,
                     * because an explicit appointment id is
                     * treated as a fresh operation by the
                     * state machine.
                     */
                    if (
                      m.rescheduleMode ||
                      m.intent ===
                        "reschedule_date_required"
                    ) {
                      void handleSend(
                        value
                      );

                      return;
                    }

                    /*
                     * NORMAL BOOKING:
                     * Requires the selected doctor.
                     */
                    if (
                      !selectedDoctor
                    ) {
                      return;
                    }

                    void handleSend(
                      `My preferred appointment date is ${value}. Please check available times.`,
                      undefined,
                      {
                        action:
                          "check_time_slots",

                        doctor:
                          selectedDoctor,

                        date:
                          value,
                      }
                    );
                  }}
                  onSelectTime={(
                    time
                  ) => {
                    /*
                     * RESCHEDULE:
                     * The backend/n8n state already contains
                     * appointment id + selected new date.
                     * Sending the selected slot is enough to
                     * execute the reschedule operation.
                     */
                    if (
                      m.rescheduleMode ||
                      m.intent ===
                        "reschedule_time_required"
                    ) {
                      void handleSend(
                        time
                      );

                      return;
                    }

                    /*
                     * NORMAL BOOKING:
                     * Keep the existing confirmation preview.
                     */
                    if (
                      !selectedDoctor ||
                      !selectedDate
                    ) {
                      return;
                    }

                    setMessages(
                      (
                        current
                      ) => [
                        ...current,

                        {
                          role:
                            "ai",

                          text:
                            "Please review your appointment details:",

                          appointmentPreview:
                            {
                              doctor:
                                selectedDoctor,

                              date:
                                selectedDate,

                              time,
                            },
                        },
                      ]
                    );
                  }}
                />
              ) : null}

              {/* Appointment preview */}
              {m.role ===
                "ai" &&
              m.appointmentPreview ? (
                <AppointmentConfirmationCard
                  doctorName={
                    m
                      .appointmentPreview
                      .doctor
                      .name
                  }
                  date={
                    m
                      .appointmentPreview
                      .date
                  }
                  time={
                    m
                      .appointmentPreview
                      .time
                  }
                  onConfirm={() => {
                    const preview =
                      m.appointmentPreview;

                    if (
                      !preview
                    ) {
                      return;
                    }

                    void handleSend(
                      `I confirm the appointment with ${preview.doctor.name} on ${preview.date} at ${preview.time}.`,
                      undefined,
                      {
                        action:
                          "select_time_slot",

                        doctor:
                          preview.doctor,

                        date:
                          preview.date,

                        time:
                          preview.time,
                      }
                    );
                  }}
                />
              ) : null}
            </div>
          )
        )}
      </div>

      {/* Chat bar - TEXT + ATTACHMENT + VOICE */}
      <div className="mt-4 shrink-0">
        <ChatInput
          onSend={
            handleSend
          }
          onVoiceSend={
            handleVoiceSend
          }
          disabled={
            isSending
          }
        />
      </div>
    </div>
  );
}