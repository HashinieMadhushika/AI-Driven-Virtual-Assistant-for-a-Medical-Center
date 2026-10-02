"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

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

type BookingStep =
  | "date"
  | "time"
  | "patient"
  | "none";

type BookingAction =
  | "start_booking"
  | "check_time_slots"
  | "select_time_slot";

interface Props {
  feature: string;

  onBack: () => void;

  visitor: {
    firstName: string;
    email: string;
  };
}

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

  historySaved?: boolean;

  symptomCard?: SymptomCardData;

  documentResult?: DocumentResultData;
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

  bookingConfirmed?: boolean;

  appointmentId?:
    | string
    | number;

  historySaved?: boolean;

  symptomCard?: SymptomCardData;

  documentResult?: DocumentResultData;

  voiceMode?: boolean;

  audioBase64?: string;

  mimeType?: string;
};

export default function ChatScreen({
  feature,
  onBack,
  visitor,
}: Props) {
  /*
   * IMPORTANT:
   * Text and voice MUST use this same sessionId.
   */
  const [sessionId] =
    useState(
      () =>
        crypto.randomUUID()
    );

  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([
      {
        role: "ai",

        text:
          `How can I assist you with ${feature}?`,
      },
    ]);

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

  /*
   * Convert browser-recorded Blob to raw base64.
   *
   * We intentionally remove:
   *
   * data:audio/webm;base64,
   *
   * because n8n receives mimeType separately.
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

            if (
              !base64
            ) {
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
   * Play the MP3/base64 reply returned by n8n/ElevenLabs.
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
          "[ChatScreen] browser blocked assistant audio playback",
          error
        );
      }
    };

  /*
   * Existing TEXT + BOOKING flow.
   *
   * Keep this separate from voice.
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
      }
    ) => {
      const trimmedText =
        text.trim();

      if (
        (!trimmedText &&
          !image) ||
        isSending
      ) {
        return;
      }

      /*
       * Prescription/image support is still being connected separately.
       * Don't send image files down the text/voice n8n path yet.
       */
      if (image) {
        setMessages(
          (
            current
          ) => [
            ...current,

            {
              role:
                "user",

              text:
                trimmedText ||
                "Please analyze this image.",

              imageName:
                image.name,
            },

            {
              role:
                "ai",

              text:
                "Prescription/image analysis is temporarily unavailable while the new assistant workflow is being connected.",
            },
          ]
        );

        return;
      }

      const messageText =
        trimmedText;

      const nextMessages: ChatMessage[] =
        [
          ...messages,

          {
            role:
              "user",

            text:
              messageText,
          },
        ];

      setMessages(
        nextMessages
      );

      setIsSending(
        true
      );

      try {
        const requestBody =
          {
            messages:
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
              ),

            sessionId,

            firstName:
              visitor.firstName,

            email:
              visitor.email,

            bookingAction:
              booking?.action,

            selectedDoctor:
              booking?.doctor,

            appointmentDate:
              booking?.date,

            appointmentTime:
              booking?.time,

            displayDate:
              booking?.date
                ? new Date(
                    `${booking.date}T12:00:00`
                  ).toLocaleDateString()
                : undefined,

            dayName:
              booking?.date
                ? new Date(
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
                : undefined,

            requestVoiceReply:
              false,
          };

        console.log(
          "[ChatScreen] text request",
          {
            sessionId,

            email:
              visitor.email,

            bookingAction:
              booking?.action,

            doctor:
              booking?.doctor
                ?.name,

            date:
              booking?.date,

            time:
              booking?.time,
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
                  requestBody
                ),
            }
          );

        const data =
          (await response.json()) as ChatApiResponse;

        console.log(
          "[ChatScreen] text response",
          {
            status:
              response.status,

            intent:
              data.intent,

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
              "Assistant request failed"
          );
        }

        if (
          !data.reply
        ) {
          throw new Error(
            "Assistant returned an empty response"
          );
        }

        const returnedDoctors =
          data.doctors ??
          data.cards;

        let resolvedBookingStep =
          data.bookingStep;

        /*
         * After clicking Book,
         * force the calendar UI if needed.
         */
        if (
          booking?.action ===
            "start_booking" &&
          (!resolvedBookingStep ||
            resolvedBookingStep ===
              "none")
        ) {
          resolvedBookingStep =
            "date";
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
                data.reply as string,

              doctors:
                returnedDoctors,

              bookingStep:
                resolvedBookingStep,

              timeSlots:
                data.timeSlots,

              bookingConfirmed:
                data.bookingConfirmed,

              appointmentId:
                data.appointmentId,

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
          data.bookingConfirmed
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
          "[ChatScreen] text assistant request failed:",
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
                  : "I could not connect to the assistant. Please try again.",
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
   * ChatInput supplies a recorded Blob.
   *
   * Blob
   * → base64
   * → /api/chat
   * → backend
   * → n8n
   * → STT
   * → same booking/intent router
   * → TTS
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
          "[ChatScreen] voice request",
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
                    /*
                     * SAME ID USED BY TEXT.
                     */
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
          "[ChatScreen] voice response",
          {
            status:
              response.status,

            intent:
              data.intent,

            transcript:
              data.transcript,

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
         * Add the actual ElevenLabs STT transcript
         * to the visible chat.
         *
         * If STT transcript isn't returned yet,
         * show a generic voice-message marker.
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
                "🎤 Voice message",
            },
          ]
        );

        const returnedDoctors =
          data.doctors ??
          data.cards;

        /*
         * Same response rendering structure as text.
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
         * Play ElevenLabs TTS response.
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
            "[ChatScreen] voice response contained no audioBase64"
          );
        }

        if (
          data.bookingConfirmed
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
          "[ChatScreen] voice request failed:",
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
                  : "I could not process the voice message.",
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
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={
            onBack
          }
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          aria-label="Back to options"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-bold text-teal-700">
          {
            feature
          }
        </h2>
      </div>

      {/* Chat area */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white p-4 shadow-inner">
        {messages.map(
          (
            message,
            index
          ) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role ===
                "user"
                  ? "ml-auto flex max-w-[80%] justify-end"
                  : "max-w-full"
              }
            >
              {/* Symptom analysis */}
              {message.role ===
                "ai" &&
              message.symptomCard ? (
                <SymptomAnalysisCard
                  analysis={
                    message.symptomCard
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

              {/* Prescription / document result */}
              {message.role ===
                "ai" &&
              message.documentResult ? (
                <DocumentResultCard
                  result={
                    message.documentResult
                  }
                />
              ) : null}

              {/* Standard chat bubble */}
              {!message.bookingConfirmed &&
              !message.symptomCard &&
              !message.documentResult ? (
                <div
                  className={`w-fit max-w-full rounded-lg px-4 py-2 text-sm ${
                    message.role ===
                    "ai"
                      ? "bg-teal-100 text-slate-800"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  {message.role ===
                  "ai" ? (
                    `AI: ${message.text}`
                  ) : (
                    <>
                      {
                        message.text
                      }

                      {message.imageName ? (
                        <div className="mt-1 text-xs opacity-80">
                          Image:{" "}
                          {
                            message.imageName
                          }
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}

              {/* History warning */}
              {message.role ===
                "ai" &&
              message.historySaved ===
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

              {/* Booking confirmed card */}
              {message.role ===
                "ai" &&
              message.bookingConfirmed ? (
                <BookingConfirmationMessage
                  message={
                    message.text
                  }
                  appointmentId={
                    message.appointmentId
                  }
                />
              ) : null}

              {/* Doctor cards */}
              {message.role ===
                "ai" &&
              message.doctors &&
              message.doctors
                .length > 0 &&
              !message.symptomCard ? (
                <DoctorCards
                  doctors={
                    message.doctors
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

              {/* Booking calendar / slots */}
              {message.role ===
                "ai" &&
              message.bookingStep ? (
                <AppointmentStepPicker
                  step={
                    message.bookingStep
                  }
                  timeSlots={
                    message.timeSlots
                  }
                  onSubmit={(
                    value
                  ) => {
                    if (
                      message.bookingStep !==
                        "date" ||
                      !selectedDoctor
                    ) {
                      return;
                    }

                    setSelectedDate(
                      value
                    );

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

              {/* Final appointment preview */}
              {message.role ===
                "ai" &&
              message.appointmentPreview ? (
                <AppointmentConfirmationCard
                  doctorName={
                    message
                      .appointmentPreview
                      .doctor
                      .name
                  }
                  date={
                    message
                      .appointmentPreview
                      .date
                  }
                  time={
                    message
                      .appointmentPreview
                      .time
                  }
                  onConfirm={() => {
                    const preview =
                      message.appointmentPreview;

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

      {/* Chat input + microphone */}
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