const DEFAULT_MODEL =
  process.env.GEMINI_MEDICAL_DOCUMENT_MODEL?.trim() ||
  'gemini-2.5-flash';

function getGeminiKey() {
  const apiKey =
    String(
      process.env.GEMINI_API_KEY ||
      ''
    ).trim();

  if (!apiKey) {
    throw new Error(
      'Gemini document guidance is not configured. Set GEMINI_API_KEY in backend/.env.'
    );
  }

  return apiKey;
}

async function readGeminiError(
  response
) {
  try {
    const data =
      await response.json();

    return (
      data?.error?.message ||
      data?.message ||
      JSON.stringify(
        data
      )
    );
  } catch {
    try {
      return await response.text();
    } catch {
      return `HTTP ${response.status}`;
    }
  }
}

function buildSafetyPrompt({
  documentType,
  question,
}) {
  return `
You are a patient-facing medical-document explanation assistant for Medicare Medical Center.

You are given ONE patient-uploaded medical document and the patient's question.

Your role:
- Explain the document in clear, simple language.
- Base your answer only on information that is visible in the uploaded document plus generally established medical information needed to explain terms.
- Clearly distinguish what the document says from general educational information.
- If a value, medicine name, dose, date, diagnosis, instruction, or result is unclear or unreadable, say that it is unclear. Do not guess.
- Do not invent information that is not present in the document.
- Do not diagnose a new condition from the document.
- Do not recommend starting, stopping, increasing, decreasing, replacing, or substituting prescription medicines.
- For prescriptions, explain what the written medicines/instructions mean and mention common precautions only as general education. Tell the patient to follow the prescriber's written directions and contact a doctor or pharmacist before starting, stopping, changing, substituting, or adjusting any medicine.
- If the prescription image is handwritten, partially obscured, blurry, or ambiguous, explicitly say that medicine names/doses may be misread and should be confirmed with a pharmacist or prescribing doctor.
- For lab reports, explain reported values and reference ranges when visible. Do not declare a diagnosis solely from an abnormal result. Mention that ranges and interpretation depend on the laboratory and clinical context, and advise discussing significant or unexpected results with the treating clinician.
- For imaging/medical reports, explain the written findings/impression in plain language without adding a diagnosis beyond the report.
- If the document contains urgent warning signs or the patient's question describes emergency symptoms, advise urgent in-person medical care or local emergency services.
- Keep the answer practical and patient-friendly.

When the patient asks to LIST, EXTRACT, IDENTIFY, or NAME medicines:
- Start immediately with the medicine list. Do not write an introduction first.
- Include every medicine that is clearly readable.
- Use a numbered list.
- For each medicine show:
  Medicine name
  Strength/dose
  Frequency/timing
  Duration, if visible
- If any field is unreadable, write "unclear".
- Do not guess handwriting.
- After the complete list, add a short "What to do next" section reminding the patient to verify medicine names, doses, and timing with the prescribing doctor or pharmacist.

For every answer:
- End with a short "What to do next" section containing 1-3 practical next steps.
- For prescriptions, one step should be to confirm medicine names/doses/instructions with the prescribing doctor or pharmacist before making any medication change.
- For lab/medical reports, one step should be to review important findings with the treating clinician when appropriate.
- Do not claim that an AI explanation replaces a doctor, pharmacist, or other clinician.

Document type: ${documentType}

Patient question:
${question}
`.trim();
}

export async function askGeminiAboutMedicalDocument({
  documentType,
  question,
  buffer,
  mimeType,
}) {
  const apiKey =
    getGeminiKey();

  if (
    !buffer ||
    buffer.length ===
      0
  ) {
    throw new Error(
      'The stored medical document is empty.'
    );
  }

  const requestBody = {
    contents: [
      {
        role:
          'user',
        parts: [
          {
            text:
              buildSafetyPrompt({
                documentType,
                question,
              }),
          },
          {
            inlineData: {
              mimeType,
              data:
                buffer.toString(
                  'base64'
                ),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature:
        0.1,

      maxOutputTokens:
        4096,

      thinkingConfig: {
        thinkingBudget:
          0,
      },
    },
  };

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        DEFAULT_MODEL
      )}:generateContent`,
      {
        method:
          'POST',
        headers: {
          'x-goog-api-key':
            apiKey,
          'Content-Type':
            'application/json',
        },
        body:
          JSON.stringify(
            requestBody
          ),
      }
    );

  if (!response.ok) {
    throw new Error(
      `Gemini document guidance failed: ${await readGeminiError(
        response
      )}`
    );
  }

  const data =
    await response.json();

  const candidate =
    data?.candidates?.[0];

  const finishReason =
    candidate?.finishReason ??
    '';

  if (
    finishReason &&
    finishReason !==
      'STOP'
  ) {
    console.warn(
      '[medical document AI] Gemini finish reason:',
      finishReason
    );
  }

  const reply =
    candidate
      ?.content?.parts
      ?.map(
        (
          part
        ) =>
          String(
            part?.text ||
            ''
          )
      )
      .join(
        '\n'
      )
      .trim();

  if (!reply) {
    throw new Error(
      finishReason
        ? `Gemini returned an empty document explanation. Finish reason: ${finishReason}`
        : 'Gemini returned an empty document explanation.'
    );
  }

  return {
    reply,
    model:
      DEFAULT_MODEL,
    finishReason:
      finishReason ||
      'STOP',
  };
}
