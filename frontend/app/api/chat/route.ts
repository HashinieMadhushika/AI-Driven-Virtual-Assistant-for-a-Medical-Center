import {

  NextResponse,

} from "next/server";



type ChatMessage = {

  role:

    | "assistant"

    | "user"

    | "system";



  content: string;

};



type ChatDoctor = {

  id?:

    | number

    | string;



  doctorId?:

    | number

    | string;



  doctorName?: string;



  name?: string;



  specialization?:

    | string

    | null;



  designation?:

    | string

    | null;



  profileImageUrl?:

    | string

    | null;



  yearsOfExperience?:

    | number

    | null;



  weeklySchedule?: Record<

    string,

    unknown

  >;



  availableTimes?:

    | string[]

    | string

    | Record<

        string,

        unknown

      >

    | null;

};



type ChatRequest = {

  messages?: ChatMessage[];



  sessionId?: string;



  firstName?: string;



  email?: string;



  bookingAction?:

    | "start_booking"

    | "check_time_slots"

    | "select_time_slot";



  selectedDoctor?:

    | ChatDoctor

    | string;



  appointmentDate?: string;



  appointmentTime?: string;



  displayDate?: string;



  dayName?: string;



  audioBase64?: string;



  mimeType?: string;



  requestVoiceReply?: boolean;

};



type CalendarDay = {
  date: string;
  displayDate?: string;
  dayName?: string;
  available?: boolean;
  timeSlots?: string[];
};

type AssistantResponse = {

  intent?: string;



  reply?: string;



  transcript?: string;



  message?: string;



  cards?: ChatDoctor[];



  doctors?: ChatDoctor[];



  timeSlots?: unknown[];



  availableTimeSlots?: unknown[];

  calendar?: CalendarDay[] | null;

  selectedDoctor?: ChatDoctor | null;

  selectedDate?: string;



  bookingStep?:

    | "date"

    | "time"

    | "patient"

    | "none";



  bookingConfirmed?: boolean;



  success?: boolean;



  appointmentId?:

    | string

    | number;



  appointment?: {

    id?:

      | string

      | number;



    [key: string]:

      unknown;

  } | null;



  sessionId?: string;



  email?: string;



  voiceMode?: boolean;



  audioBase64?: string;



  mimeType?: string;

};



function getBackendUrl() {

  return (

    process.env

      .NEXT_PUBLIC_BACKEND_URL ||

    process.env

      .BACKEND_BASE_URL ||

    "http://localhost:5000"

  );

}



function mapBookingAction(

  action:

    | ChatRequest[

        "bookingAction"

      ]

    | undefined

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

  doctor:

    | ChatDoctor

    | string

    | undefined

) {

  if (!doctor) {

    return null;

  }



  if (

    typeof doctor ===

    "string"

  ) {

    return {

      name: doctor,

      doctorName:

        doctor,

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



function normalizeTimeSlots(

  slots: unknown

) {

  if (

    !Array.isArray(slots)

  ) {

    return [];

  }



  return slots

    .map((slot) => {

      if (

        typeof slot ===

        "string"

      ) {

        return {

          label: slot,

          booked: false,

        };

      }



      if (

        typeof slot !==

          "object" ||

        slot === null

      ) {

        return null;

      }



      const value =

        slot as Record<

          string,

          unknown

        >;



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

          value.booked ===

            true ||

          value.isBooked ===

            true ||

          value.available ===

            false,

      };

    })

    .filter(

      (

        slot

      ): slot is {

        label: string;

        booked: boolean;

      } =>

        slot !== null

    );

}



async function parseRequest(

  request: Request

): Promise<ChatRequest> {

  const contentType =

    request.headers.get(

      "content-type"

    ) ?? "";



  if (

    contentType.includes(

      "multipart/form-data"

    )

  ) {

    const formData =

      await request.formData();



    const messagesRaw =

      formData.get(

        "messages"

      );



    let messages:

      | ChatMessage[]

      | undefined;



    if (

      typeof messagesRaw ===

        "string" &&

      messagesRaw

    ) {

      try {

        messages =

          JSON.parse(

            messagesRaw

          ) as ChatMessage[];

      } catch {

        messages =

          undefined;

      }

    }



    const doctorRaw =

      formData.get(

        "selectedDoctor"

      );



    let selectedDoctor:

      | ChatDoctor

      | string

      | undefined;



    if (

      typeof doctorRaw ===

        "string" &&

      doctorRaw

    ) {

      try {

        selectedDoctor =

          JSON.parse(

            doctorRaw

          ) as ChatDoctor;

      } catch {

        selectedDoctor =

          doctorRaw;

      }

    }



    return {

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

    };

  }



  return (

    await request.json()

  ) as ChatRequest;

}



export async function POST(

  request: Request

) {

  try {

    const payload =

      await parseRequest(

        request

      );



    if (

      !payload.sessionId

    ) {

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



    const hasAudio =

      typeof payload

        .audioBase64 ===

        "string" &&

      payload.audioBase64

        .length > 100;



    let message = "";



    if (!hasAudio) {

      const messages =

        payload.messages ??

        [];



      const lastMessage =

        messages[

          messages.length -

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



      message =

        lastMessage.content;

    }



    const backendUrl =

      getBackendUrl();



    const selectedDoctor =

      normalizeDoctor(

        payload.selectedDoctor

      );



    const backendPayload = {

      message,



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

        payload

          .appointmentDate ??

        "",



      dayName:

        payload.dayName ??

        "",



      selectedTime:

        payload

          .appointmentTime ??

        "",



      audioBase64:

        hasAudio

          ? payload.audioBase64

          : "",



      mimeType:

        hasAudio

          ? payload.mimeType ||

            "audio/webm"

          : "",



      requestVoiceReply:

        hasAudio

          ? true

          : Boolean(

              payload

                .requestVoiceReply

            ),

    };



    console.log(

      "======================================"

    );



    console.log(

      "[Next /api/chat] forwarding to backend",

      {

        backendUrl,



        sessionId:

          backendPayload

            .sessionId,



        email:

          backendPayload

            .email,



        message:

          backendPayload

            .message,



        action:

          backendPayload

            .action,



        hasAudio,



        mimeType:

          backendPayload

            .mimeType,



        requestVoiceReply:

          backendPayload

            .requestVoiceReply,

      }

    );



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

        timeSlots.length >

          0)

    ) {

      bookingStep =

        "time";

    }



    if (

      !bookingStep &&

      payload

        .bookingAction ===

        "start_booking"

    ) {

      bookingStep =

        "date";

    }



    const bookingConfirmed =

      result

        .bookingConfirmed ===

        true ||

      result.intent ===

        "booking_confirmed" ||

      result.intent ===

        "appointment_booked";



    return NextResponse.json({

      reply:

        result.reply ??

        "I could not create a response.",



      transcript:

        result.transcript ??

        result.message ??

        "",



      intent:

        result.intent,



      doctors,



      cards:

        result.cards ??

        doctors,



      bookingStep,



      timeSlots,

      calendar:
        result.calendar ??
        null,

      selectedDoctor:
        result.selectedDoctor ??
        null,

      selectedDate:
        result.selectedDate ??
        "",

      bookingConfirmed,



      appointmentId:

        result

          .appointment?.id ??

        result

          .appointmentId,



      sessionId:

        result.sessionId ??

        payload.sessionId,



      email:

        result.email ??

        payload.email,



      voiceMode:

        result.voiceMode ??

        hasAudio,



      audioBase64:

        result.audioBase64 ??

        "",



      mimeType:

        result.mimeType ??

        (result.audioBase64

          ? "audio/mpeg"

          : ""),

    });

  } catch (error) {

    console.error(

      "[Next /api/chat]",

      error

    );



    return NextResponse.json(

      {

        error:

          "Unable to reach assistant",



        reply:

          error instanceof

          Error

            ? error.message

            : "The medical assistant is temporarily unavailable.",

      },

      {

        status: 500,

      }

    );

  }

}