const ELEVENLABS_STT_URL =
  'https://api.elevenlabs.io/v1/speech-to-text';

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID?.trim() ||
  'gsfHgo0em3A2WqPLbIE5';

function getElevenLabsKey() {
  const apiKey =
    String(
      process.env.ELEVENLABS_API_KEY ||
      ''
    ).trim();

  if (!apiKey) {
    throw new Error(
      'ELEVENLABS_API_KEY is not configured in backend/.env'
    );
  }

  return apiKey;
}

export async function transcribeMedicalDocumentAudio({
  buffer,
  mimeType = 'audio/webm',
  fileName = 'medical-document-question.webm',
}) {
  const apiKey =
    getElevenLabsKey();

  if (
    !buffer ||
    buffer.length <
      500
  ) {
    throw new Error(
      'Recorded audio is empty or too short'
    );
  }

  const form =
    new FormData();

  form.append(
    'file',
    new Blob(
      [buffer],
      {
        type:
          mimeType ||
          'audio/webm',
      }
    ),
    fileName
  );

  form.append(
    'model_id',
    'scribe_v2'
  );

  const response =
    await fetch(
      ELEVENLABS_STT_URL,
      {
        method:
          'POST',
        headers: {
          'xi-api-key':
            apiKey,
        },
        body:
          form,
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail?.message ||
      data?.detail ||
      data?.message ||
      'Speech-to-text request failed'
    );
  }

  const transcript =
    String(
      data?.text ||
      data?.transcript ||
      ''
    ).trim();

  if (!transcript) {
    throw new Error(
      'Speech-to-text returned an empty transcript'
    );
  }

  return transcript;
}

export async function synthesizeMedicalDocumentReply(
  text
) {
  const apiKey =
    getElevenLabsKey();

  const cleanText =
    String(
      text ||
      ''
    ).trim();

  if (!cleanText) {
    throw new Error(
      'Cannot synthesize an empty medical-document reply'
    );
  }

  const response =
    await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        DEFAULT_VOICE_ID
      )}`,
      {
        method:
          'POST',
        headers: {
          'xi-api-key':
            apiKey,
          Accept:
            'audio/mpeg',
          'Content-Type':
            'application/json',
        },
        body:
          JSON.stringify({
            text:
              cleanText.length >
              3000
                ? `${cleanText.slice(
                    0,
                    3000
                  )}.`
                : cleanText,
            model_id:
              'eleven_flash_v2_5',
            voice_settings: {
              stability:
                0.55,
              similarity_boost:
                0.8,
              style:
                0.1,
              use_speaker_boost:
                true,
            },
          }),
      }
    );

  if (!response.ok) {
    let message =
      'Text-to-speech request failed';

    try {
      const data =
        await response.json();

      message =
        data?.detail?.message ||
        data?.detail ||
        data?.message ||
        message;
    } catch {
      // Keep generic message.
    }

    throw new Error(
      message
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  const buffer =
    Buffer.from(
      arrayBuffer
    );

  if (
    buffer.length <
    500
  ) {
    throw new Error(
      'Text-to-speech returned an invalid audio response'
    );
  }

  return {
    audioBase64:
      buffer.toString(
        'base64'
      ),
    mimeType:
      'audio/mpeg',
  };
}
