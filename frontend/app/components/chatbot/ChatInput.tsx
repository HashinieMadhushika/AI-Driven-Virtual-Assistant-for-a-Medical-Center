"use client";

import { useRef, useState } from "react";
import {
  Paperclip,
  Mic,
  Send,
  Square,
  X,
} from "lucide-react";

type Props = {
  disabled?: boolean;

  onSend: (
    text: string,
    image?: File
  ) => void | Promise<void>;

  onVoiceSend?: (
    audioBlob: Blob
  ) => void | Promise<void>;
};

export default function ChatInput({
  disabled = false,
  onSend,
  onVoiceSend,
}: Props) {
  const [text, setText] =
    useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    recordingError,
    setRecordingError,
  ] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(
      null
    );

  const chunksRef =
    useRef<Blob[]>([]);

  const handleSubmit =
    async () => {
      if (disabled) {
        return;
      }

      const trimmed =
        text.trim();

      if (!trimmed && !image) {
        return;
      }

      const selectedImage =
        image ?? undefined;

      setText("");
      setImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      await onSend(
        trimmed,
        selectedImage
      );
    };

  const stopMediaStream =
    () => {
      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current =
        null;
    };

  const startRecording =
    async () => {
      if (disabled) {
        return;
      }

      if (isRecording) {
        return;
      }

      if (!onVoiceSend) {
        setRecordingError(
          "Voice input is not connected."
        );

        console.error(
          "[ChatInput] onVoiceSend is missing"
        );

        return;
      }

      setRecordingError("");

      try {
        if (
          !navigator.mediaDevices
            ?.getUserMedia
        ) {
          throw new Error(
            "Microphone recording is not supported by this browser."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                echoCancellation:
                  true,

                noiseSuppression:
                  true,

                autoGainControl:
                  true,
              },
            }
          );

        streamRef.current =
          stream;

        const preferredTypes =
          [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
          ];

        const supportedType =
          preferredTypes.find(
            (type) =>
              MediaRecorder.isTypeSupported(
                type
              )
          );

        const recorder =
          supportedType
            ? new MediaRecorder(
                stream,
                {
                  mimeType:
                    supportedType,
                }
              )
            : new MediaRecorder(
                stream
              );

        chunksRef.current =
          [];

        recorder.ondataavailable =
          (event) => {
            if (
              event.data.size >
              0
            ) {
              chunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onerror =
          () => {
            setRecordingError(
              "Microphone recording failed."
            );

            setIsRecording(
              false
            );

            stopMediaStream();
          };

        recorder.onstop =
          async () => {
            const mimeType =
              recorder.mimeType ||
              supportedType ||
              "audio/webm";

            const blob =
              new Blob(
                chunksRef.current,
                {
                  type: mimeType,
                }
              );

            chunksRef.current =
              [];

            stopMediaStream();

            setIsRecording(
              false
            );

            mediaRecorderRef.current =
              null;

            console.log(
              "[ChatInput] recording stopped",
              {
                bytes:
                  blob.size,

                mimeType:
                  blob.type,
              }
            );

            if (
              blob.size <
              500
            ) {
              setRecordingError(
                "The recording was too short. Please try again."
              );

              return;
            }

            try {
              await onVoiceSend(
                blob
              );
            } catch (
              error
            ) {
              console.error(
                "[ChatInput] voice send failed",
                error
              );

              setRecordingError(
                "Unable to send the voice recording."
              );
            }
          };

        mediaRecorderRef.current =
          recorder;

        recorder.start();

        setIsRecording(
          true
        );

        console.log(
          "[ChatInput] microphone recording started",
          {
            mimeType:
              recorder.mimeType,
          }
        );
      } catch (
        error
      ) {
        stopMediaStream();

        mediaRecorderRef.current =
          null;

        setIsRecording(
          false
        );

        console.error(
          "[ChatInput] microphone error",
          error
        );

        setRecordingError(
          error instanceof
          Error
            ? error.message
            : "Microphone access was denied."
        );
      }
    };

  const stopRecording =
    () => {
      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state ===
          "recording"
      ) {
        recorder.stop();
      }
    };

  const handleVoiceButton =
    () => {
      if (isRecording) {
        stopRecording();
      } else {
        void startRecording();
      }
    };

  return (
    <div className="w-full space-y-2">
      {/* Selected image */}
      {image ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <span className="truncate">
            Attachment:{" "}
            {image.name}
          </span>

          <button
            type="button"
            onClick={() =>
              setImage(null)
            }
            className="ml-2 rounded-lg p-1 hover:bg-slate-100"
            aria-label="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Recording/error status */}
      {recordingError ? (
        <div
          className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
          role="alert"
        >
          {recordingError}
        </div>
      ) : null}

      {isRecording ? (
        <div className="flex items-center gap-2 px-2 text-xs font-medium text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />

          <span>
            Recording... click
            the stop button when
            finished.
          </span>
        </div>
      ) : null}

      {/* Main chat bar */}
      <div className="flex w-full items-center gap-2 rounded-[28px] border border-slate-200 bg-white px-3 py-2 shadow-sm">
        {/* Hidden attachment input */}
        <input
          ref={
            fileInputRef
          }
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(
            event
          ) => {
            setImage(
              event.target
                .files?.[0] ??
                null
            );
          }}
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={
            disabled ||
            isRecording
          }
          className="flex shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            width: 42,
            height: 42,
            minWidth: 42,
          }}
          aria-label="Attach image"
          title="Attach image"
        >
          <Paperclip
            size={23}
            strokeWidth={2}
          />
        </button>

        {/* Text input */}
        <textarea
          value={text}
          disabled={
            disabled ||
            isRecording
          }
          rows={1}
          placeholder={
            isRecording
              ? "Recording voice..."
              : "Type your message..."
          }
          onChange={(
            event
          ) => {
            setText(
              event.target.value
            );
          }}
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              void handleSubmit();
            }
          }}
          className="min-h-[42px] min-w-0 flex-1 resize-none border-0 bg-transparent px-2 py-[10px] text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:bg-transparent"
        />

        {/* VOICE BUTTON - ALWAYS VISIBLE */}
        <button
          type="button"
          onClick={
            handleVoiceButton
          }
          disabled={
            disabled &&
            !isRecording
          }
          className={`relative flex shrink-0 items-center justify-center rounded-full transition ${
            isRecording
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
          } disabled:cursor-not-allowed disabled:opacity-40`}
          style={{
            width: 42,
            height: 42,
            minWidth: 42,
            flexBasis: 42,
          }}
          aria-label={
            isRecording
              ? "Stop voice recording"
              : "Start voice recording"
          }
          title={
            isRecording
              ? "Stop recording"
              : "Voice message"
          }
        >
          {isRecording ? (
            <Square
              size={21}
              strokeWidth={2.3}
            />
          ) : (
            <Mic
              size={23}
              strokeWidth={2.3}
            />
          )}
        </button>

        {/* Send button */}
        <button
          type="button"
          onClick={() =>
            void handleSubmit()
          }
          disabled={
            disabled ||
            isRecording ||
            (!text.trim() &&
              !image)
          }
          className="flex shrink-0 items-center justify-center rounded-full bg-teal-400 text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            width: 48,
            height: 48,
            minWidth: 48,
          }}
          aria-label="Send message"
          title="Send"
        >
          <Send
            size={22}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}