import { Activity, CheckCircle2, FileText, LockKeyhole, Pill } from "lucide-react";

export type DocumentResultData = {
  documentType: string;
  success: boolean;
  error?: boolean | string;
  message?: string;
  timestamp?: string;
  card?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type RecordValue = Record<string, unknown>;

const asRecord = (value: unknown): RecordValue =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : {};

const asText = (value: unknown, fallback = "") =>
  typeof value === "string" || typeof value === "number" ? String(value) : fallback;

export default function DocumentResultCard({
  result,
  onAskDocumentQuestion,
}: {
  result: DocumentResultData;
  onAskDocumentQuestion?: (
    question: string
  ) => void;
}) {
  const card = asRecord(result.card);
  const data = asRecord(result.data);
  const content = Object.keys(card).length ? card : data;
  const isStoredUpload =
    typeof data.documentId === "string" &&
    asText(data.status).toUpperCase() === "UPLOADED";
  const patientInfo = asRecord(content.patientInfo);
  const reportInfo = asRecord(content.reportInfo);
  const riskAssessment = asRecord(content.riskAssessment);
  const testResults = asRecord(content.testResults);
  const analysis = asRecord(content.analysis);
  const recommendations = asRecord(content.recommendations);
  const isPrescription = result.documentType.toUpperCase() === "PRESCRIPTION";
  const title = asText(content.title, isPrescription ? "Prescription summary" : "Medical report summary");
  const medications = Array.isArray(content.medications) ? content.medications.map(asRecord) : [];
  const reportTests = Array.isArray(testResults.tests) ? testResults.tests : content.tests;
  const tests = Array.isArray(reportTests) ? reportTests.map(asRecord) : [];
  const healthGuidance = asRecord(content.healthGuidance);
  const isError = result.success === false || result.error === true;
  const riskLevel = asText(riskAssessment.level, "").toUpperCase();
  const riskClass = riskLevel === "HIGH" || riskLevel === "CRITICAL"
    ? "bg-rose-100 text-rose-800"
    : riskLevel === "MODERATE"
      ? "bg-amber-100 text-amber-900"
      : "bg-emerald-100 text-emerald-800";
  const reportSummary = asText(
    analysis.summary ?? content.overallAnalysis ?? content.summary
  );
  const healthCondition = asText(analysis.healthCondition ?? content.healthCondition);
  const specificRecommendations = Array.isArray(recommendations.specificRecommendations)
    ? recommendations.specificRecommendations
    : Array.isArray(content.specificRecommendations)
      ? content.specificRecommendations
      : [];
  const reportPatientName = reportInfo.patientName ?? content.patientName;
  const reportType = reportInfo.reportType ?? content.reportType;
  const reportDate = reportInfo.testDate ?? content.testDate;

  if (isStoredUpload) {
    const labels: Record<string, string> = {
      PRESCRIPTION: "Prescription",
      MEDICAL_REPORT: "Medical report",
      LAB_REPORT: "Lab report",
      OTHER_MEDICAL_DOCUMENT: "Medical document",
    };

    const documentLabel =
      labels[result.documentType.toUpperCase()] ??
      "Medical document";

    const fileName =
      asText(
        data.originalFileName,
        "Medical document"
      );

    const fileSize =
      Number(
        data.fileSize ??
        0
      );

    const sizeText =
      fileSize > 0
        ? fileSize >=
          1024 * 1024
          ? `${(
              fileSize /
              (1024 * 1024)
            ).toFixed(
              1
            )} MB`
          : `${Math.max(
              1,
              Math.round(
                fileSize /
                1024
              )
            )} KB`
        : "";

    return (
      <article className="w-full max-w-2xl overflow-hidden rounded-xl border border-teal-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 bg-linear-to-r from-teal-700 via-teal-600 to-emerald-600 px-4 py-3 text-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
            <LockKeyhole className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
              Secure upload
            </p>

            <h3 className="truncate text-sm font-semibold">
              {documentLabel}
            </h3>
          </div>

          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium">
            Private
          </span>
        </header>

        <div className="space-y-3 px-4 py-4">
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-3 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Uploaded securely
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-800">
                The file is stored privately and is not exposed through a public document URL.
              </p>
            </div>
          </div>

          <dl className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">
                File
              </dt>

              <dd className="mt-0.5 break-all text-slate-800">
                {fileName}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-slate-500">
                Reference
              </dt>

              <dd className="mt-0.5 break-all font-mono text-slate-800">
                {asText(data.documentId)}
              </dd>
            </div>

            {sizeText ? (
              <div>
                <dt className="font-medium text-slate-500">
                  Size
                </dt>

                <dd className="mt-0.5 text-slate-800">
                  {sizeText}
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="font-medium text-slate-500">
                Status
              </dt>

              <dd className="mt-0.5 text-slate-800">
                Stored for authorized Medicare staff review
              </dd>
            </div>
          </dl>
        </div>

        {onAskDocumentQuestion ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">
              Ask the assistant to explain this document
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onAskDocumentQuestion(
                    "Explain this document in simple language. Tell me the important points and what I should discuss with my doctor."
                  )
                }
                className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 transition hover:bg-teal-100"
              >
                Explain simply
              </button>

              <button
                type="button"
                onClick={() =>
                  onAskDocumentQuestion(
                    result.documentType.toUpperCase() ===
                    "PRESCRIPTION"
                      ? "Explain the medicines and instructions written in this prescription. Do not change the prescribed treatment."
                      : "Explain the main findings and any values or terms I should ask my clinician about."
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Key points
              </button>

              <button
                type="button"
                onClick={() =>
                  onAskDocumentQuestion(
                    "What questions would be useful to ask my doctor or pharmacist about this document?"
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Questions for clinician
              </button>

              <button
                type="button"
                onClick={() =>
                  onAskDocumentQuestion(
                    result.documentType.toUpperCase() ===
                    "PRESCRIPTION"
                      ? "List the medicines exactly as they appear in this prescription. For each one, explain the written dose and timing in simple language. If anything is unclear, say so. End by reminding me to verify the medicine names, doses, and timing with my prescribing doctor or pharmacist before making any change."
                      : "Tell me which parts of this document I should confirm with my doctor or other clinician, and explain why."
                  )
                }
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Verify with clinician
              </button>
            </div>
          </div>
        ) : null}

        <footer className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] leading-4 text-slate-500">
          AI can help explain the document, but medicine names, doses, timings, and important findings should be verified with the prescribing doctor, pharmacist, or treating clinician before you act on them.
        </footer>
      </article>
    );
  }

  return (
    <article className={`w-full max-w-2xl overflow-hidden rounded-xl border bg-white shadow-sm ${
      isError ? "border-rose-200" : "border-teal-200"
    }`}>
      <header className="flex items-center gap-3 bg-linear-to-r from-teal-700 via-teal-600 to-emerald-600 px-4 py-3 text-white">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
          {isPrescription ? <Pill className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
            {isPrescription ? "Prescription" : "Medical report"}
          </p>
          <h3 className="truncate text-sm font-semibold">{title}</h3>
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium">
          AI extracted
        </span>
      </header>

      {isError ? (
        <p className="px-4 py-3 text-sm text-rose-800">
          {result.message || "This document could not be analyzed."}
        </p>
      ) : (
        <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
          {(patientInfo.patientName || content.patientName || reportPatientName || patientInfo.doctorName || content.doctorName) ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              {(patientInfo.patientName || content.patientName || reportPatientName) ? (
                <span><strong className="font-medium text-slate-800">Patient:</strong> {asText(patientInfo.patientName ?? reportPatientName ?? content.patientName)}</span>
              ) : null}
              {(patientInfo.doctorName || content.doctorName) ? (
                <span><strong className="font-medium text-slate-800">Doctor:</strong> {asText(patientInfo.doctorName ?? content.doctorName)}</span>
              ) : null}
            </div>
          ) : null}

          {(reportType || reportDate || patientInfo.date) ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {reportType ? <span className="font-medium text-slate-800">{asText(reportType)}</span> : null}
              {(reportDate || patientInfo.date) ? <span className="text-slate-500">{asText(reportDate ?? patientInfo.date)}</span> : null}
            </div>
          ) : null}

          {!isPrescription && riskLevel ? (
            <section className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2" aria-label="Report risk assessment">
              <span className="text-xs font-medium text-slate-600">Risk assessment</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskClass}`}>{riskLevel}</span>
              {riskAssessment.message ? <span className="text-xs text-slate-600">{asText(riskAssessment.message)}</span> : null}
            </section>
          ) : null}

          {!isPrescription && (reportSummary || healthCondition) ? (
            <section className="space-y-1.5 rounded-lg border border-teal-100 bg-teal-50/70 px-3 py-2.5" aria-label="Report analysis">
              <p className="text-xs font-semibold text-teal-900">What this report suggests</p>
              {reportSummary ? <p className="text-xs leading-5 text-slate-700">{reportSummary}</p> : null}
              {healthCondition && healthCondition !== reportSummary ? (
                <p className="text-xs leading-5 text-slate-600">{healthCondition}</p>
              ) : null}
            </section>
          ) : null}

          {medications.length ? (
            <section className="space-y-2 border-t border-slate-100 pt-3" aria-label="Medications">
              {medications.map((medication, index) => (
                <div key={`${asText(medication.id, index.toString())}-${index}`} className="flex gap-2.5">
                  <Pill className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{asText(medication.name, "Medication")}</p>
                    <p className="text-xs leading-5 text-slate-600">
                      {[medication.dosage, medication.frequency, medication.duration]
                        .map((value) => asText(value))
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {tests.length ? (
            <section className="space-y-2 border-t border-slate-100 pt-3" aria-label="Test results">
              {tests.slice(0, 5).map((test, index) => {
                const status = asText(test.status, "");
                const isOutOfRange = /high|low|abnormal/i.test(status);
                return (
                  <div key={`${asText(test.testName, "test")}-${index}`} className="flex items-start gap-2.5">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <p className="text-sm font-medium text-slate-800">{asText(test.testName ?? test.name, "Test")}</p>
                        <p className="text-sm font-semibold text-slate-900">{asText(test.value)} {asText(test.unit)}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        {test.normalRange ? <span>Reference: {asText(test.normalRange)}</span> : <span />}
                        {status ? (
                          <span className={`rounded-full px-2 py-0.5 font-medium ${
                            isOutOfRange ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {status}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              {tests.length > 5 ? <p className="text-xs text-slate-500">And {tests.length - 5} more results</p> : null}
            </section>
          ) : null}

          {!isPrescription && specificRecommendations.length ? (
            <section className="border-t border-slate-100 pt-3" aria-label="Recommended next steps">
              <p className="mb-1 text-xs font-semibold text-teal-800">Recommended next step</p>
              <p className="text-xs leading-5 text-slate-600">{asText(specificRecommendations[0])}</p>
            </section>
          ) : null}

          {healthGuidance.tips && Array.isArray(healthGuidance.tips) ? (
            <section className="border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-semibold text-teal-800">Health guidance</p>
              <ul className="list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
                {healthGuidance.tips.slice(0, 2).map((tip, index) => <li key={index}>{asText(tip)}</li>)}
              </ul>
            </section>
          ) : null}

          {isPrescription && content.summary ? <p className="border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{asText(content.summary)}</p> : null}
        </div>
      )}

      {!isError ? (
        <footer className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] leading-4 text-slate-500">
          AI-extracted information. Verify it against the original document and consult your clinician before changing treatment.
        </footer>
      ) : null}
    </article>
  );
}