const ELEVENLABS_STT_URL =
  'https://api.elevenlabs.io/v1/speech-to-text';

export async function transcribeHandoverAudio({
  buffer,
  mimeType = 'audio/webm',
  fileName = 'handover.webm',
}) {
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

  if (!buffer || buffer.length < 500) {
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
