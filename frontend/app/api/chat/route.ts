import { NextResponse } from "next/server";

type ChatMessage = {
  role: "assistant" | "user" | "system";
  content: string;
};

type ChatDoctor = {
  id?: number | string;
  doctorId?: number | string;
  doctorName?: string;
  name?: string;
  specialization?: string | null;
  designation?: string | null;
  profileImageUrl?: string | null;
  yearsOfExperience?: number | null;
  weeklySchedule?: Record<string, unknown>;
  availableTimes?: string[] | string | Record<string, unknown> | null;
};

type ChatRequest = {
  messages: ChatMessage[];

  sessionId?: string;
  firstName?: string;
  email?: string;

  bookingAction?:
    | "start_booking"
    | "check_time_slots"
    | "select_time_slot";

  selectedDoctor?: ChatDoctor | string;

  appointmentDate?: string;
  appointmentTime?: string;

  displayDate?: string;
  dayName?: string;
};

type AssistantResponse = {
  intent?: string;
  reply?: string;

  cards?: ChatDoctor[];
  doctors?: ChatDoctor[];

  timeSlots?: unknown[];
  availableTimeSlots?: unknown[];

  bookingStep?: "date" | "time" | "patient" | "none";

  bookingConfirmed?: boolean;
  success?: boolean;

  appointmentId?: string | number;

  appointment?: {
    id?: string | number;
    [key: string]: unknown;
  } | null;

  sessionId?: string;
  email?: string;
  voiceMode?: boolean;
};

function getBackendUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_BASE_URL ||
    "http://localhost:5000"
  );
}

function mapBookingAction(
  action: ChatRequest["bookingAction"]
) {
  switch (action) {
    case "start_booking":
      return "select_doctor";

    case "check_time_slots":
      return "select_date";

    case "select_time_slot":
      return "confirm_booking";

    default:
      return "";
  }
}

function normalizeDoctor(
  doctor: ChatDoctor | string | undefined
) {
  if (!doctor) {
    return null;
  }

  if (typeof doctor === "string") {
    return {
      name: doctor,
      doctorName: doctor,
    };
  }

  return {
    ...doctor,

    id:
      doctor.id ??
      doctor.doctorId,

    doctorId:
      doctor.doctorId ??
      doctor.id,

    name:
      doctor.name ??
      doctor.doctorName,

    doctorName:
      doctor.doctorName ??
      doctor.name,

    weeklySchedule:
      doctor.weeklySchedule ??
      doctor.availableTimes ??
      {},
  };
}

function normalizeTimeSlots(slots: unknown) {
  if (!Array.isArray(slots)) {
    return [];
  }

  return slots
    .map((slot) => {
      if (typeof slot === "string") {
        return {
          label: slot,
          booked: false,
        };
      }

      if (
        typeof slot !== "object" ||
        slot === null
      ) {
        return null;
      }

      const value =
        slot as Record<string, unknown>;

      const label =
        String(
          value.label ??
            value.value ??
            value.time ??
            ""
        );

      if (!label) {
        return null;
      }

      return {
        label,

        booked:
          value.booked === true ||
          value.isBooked === true ||
          value.available === false,
      };
    })
    .filter(
      (
        slot
      ): slot is {
        label: string;
        booked: boolean;
      } => slot !== null
    );
}

async function parseRequest(
  request: Request
): Promise<{
  payload: ChatRequest;
  image?: File;
}> {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (
    contentType.includes(
      "multipart/form-data"
    )
  ) {
    const formData =
      await request.formData();

    const messagesValue =
      formData.get("messages");

    if (
      typeof messagesValue !==
      "string"
    ) {
      throw new Error(
        "Messages are required"
      );
    }

    let messages: ChatMessage[];

    try {
      messages =
        JSON.parse(
          messagesValue
        ) as ChatMessage[];
    } catch {
      throw new Error(
        "Invalid messages payload"
      );
    }

    const selectedDoctorValue =
      formData.get(
        "selectedDoctor"
      );

    let selectedDoctor:
      | ChatDoctor
      | string
      | undefined;

    if (
      typeof selectedDoctorValue ===
        "string" &&
      selectedDoctorValue
    ) {
      try {
        selectedDoctor =
          JSON.parse(
            selectedDoctorValue
          ) as ChatDoctor;
      } catch {
        selectedDoctor =
          selectedDoctorValue;
      }
    }

    const imageValue =
      formData.get("image");

    return {
      payload: {
        messages,

        sessionId:
          String(
            formData.get(
              "sessionId"
            ) ?? ""
          ),

        firstName:
          String(
            formData.get(
              "firstName"
            ) ?? ""
          ),

        email:
          String(
            formData.get(
              "email"
            ) ?? ""
          ),

        bookingAction:
          String(
            formData.get(
              "bookingAction"
            ) ?? ""
          ) as ChatRequest["bookingAction"],

        selectedDoctor,

        appointmentDate:
          String(
            formData.get(
              "appointmentDate"
            ) ?? ""
          ),

        appointmentTime:
          String(
            formData.get(
              "appointmentTime"
            ) ?? ""
          ),

        displayDate:
          String(
            formData.get(
              "displayDate"
            ) ?? ""
          ),

        dayName:
          String(
            formData.get(
              "dayName"
            ) ?? ""
          ),
      },

      image:
        imageValue instanceof
          File &&
        imageValue.size > 0
          ? imageValue
          : undefined,
    };
  }

  const payload =
    (await request.json()) as ChatRequest;

  return {
    payload,
  };
}

export async function POST(
  request: Request
) {
  try {
    const {
      payload,
      image,
    } =
      await parseRequest(
        request
      );

    /*
     * IMPORTANT:
     * FormData alone is allowed.
     * We only block if there is
     * an ACTUAL image attached.
     */
    if (image) {
      return NextResponse.json(
        {
          error:
            "Prescription/image analysis is not connected to the new n8n workflow yet.",

          reply:
            "Prescription/image analysis is temporarily unavailable while the new assistant workflow is being connected.",
        },
        {
          status: 501,
        }
      );
    }

    if (
      !payload.messages ||
      payload.messages.length ===
        0
    ) {
      return NextResponse.json(
        {
          error:
            "No messages provided",
        },
        {
          status: 400,
        }
      );
    }

    const lastMessage =
      payload.messages[
        payload.messages.length -
          1
      ];

    if (
      !lastMessage ||
      lastMessage.role !==
        "user"
    ) {
      return NextResponse.json(
        {
          error:
            "Latest message must be a user message",
        },
        {
          status: 400,
        }
      );
    }

    if (!payload.sessionId) {
      return NextResponse.json(
        {
          error:
            "sessionId is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        {
          error:
            "email is required",
        },
        {
          status: 400,
        }
      );
    }

    const backendUrl =
      getBackendUrl();

    const selectedDoctor =
      normalizeDoctor(
        payload.selectedDoctor
      );

    const backendPayload = {
      message:
        lastMessage.content,

      sessionId:
        payload.sessionId,

      email:
        payload.email,

      action:
        mapBookingAction(
          payload.bookingAction
        ),

      selectedDoctor,

      selectedDate:
        payload.appointmentDate ??
        "",

      displayDate:
        payload.displayDate ??
        payload.appointmentDate ??
        "",

      dayName:
        payload.dayName ??
        "",

      selectedTime:
        payload.appointmentTime ??
        "",

      requestVoiceReply:
        false,
    };

    console.log(
      "======================================"
    );

    console.log(
      "[Next /api/chat] forwarding to backend"
    );

    console.log({
      backendUrl,
      sessionId:
        backendPayload.sessionId,
      email:
        backendPayload.email,
      message:
        backendPayload.message,
      action:
        backendPayload.action,
      selectedDate:
        backendPayload.selectedDate,
      selectedTime:
        backendPayload.selectedTime,
    });

    console.log(
      "======================================"
    );

    const response =
      await fetch(
        `${backendUrl}/api/assistant/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              backendPayload
            ),

          cache:
            "no-store",
        }
      );

    const raw =
      await response.text();

    console.log(
      "[Next /api/chat] backend status:",
      response.status
    );

    console.log(
      "[Next /api/chat] backend response:",
      raw
    );

    let result:
      AssistantResponse;

    try {
      result =
        JSON.parse(
          raw
        ) as AssistantResponse;
    } catch {
      result = {
        reply: raw,
      };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Assistant backend failed",

          reply:
            result.reply ??
            "The assistant is temporarily unavailable.",
        },
        {
          status:
            response.status,
        }
      );
    }

    const doctors =
      result.cards ??
      result.doctors ??
      [];

    const timeSlots =
      normalizeTimeSlots(
        result.timeSlots ??
          result.availableTimeSlots
      );

    let bookingStep =
      result.bookingStep;

    if (
      !bookingStep &&
      result.intent ===
        "booking_calendar"
    ) {
      bookingStep =
        "date";
    }

    if (
      !bookingStep &&
      (result.intent ===
        "time_selection" ||
        timeSlots.length > 0)
    ) {
      bookingStep =
        "time";
    }

    if (
      !bookingStep &&
      payload.bookingAction ===
        "start_booking"
    ) {
      bookingStep =
        "date";
    }

    const bookingConfirmed =
      result.bookingConfirmed ===
        true ||
      result.intent ===
        "booking_confirmed" ||
      result.intent ===
        "appointment_booked";

    return NextResponse.json({
      reply:
        result.reply ??
        "I could not create a response.",

      intent:
        result.intent,

      doctors,

      cards:
        result.cards ??
        doctors,

      bookingStep,

      timeSlots,

      bookingConfirmed,

      appointmentId:
        result.appointment?.id ??
        result.appointmentId,

      sessionId:
        result.sessionId ??
        payload.sessionId,

      email:
        result.email ??
        payload.email,

      voiceMode:
        result.voiceMode ??
        false,
    });
  } catch (error) {
    console.error(
      "[Next /api/chat] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to reach assistant",

        reply:
          error instanceof Error
            ? error.message
            : "The medical assistant is temporarily unavailable.",
      },
      {
        status: 500,
      }
    );
  }
}