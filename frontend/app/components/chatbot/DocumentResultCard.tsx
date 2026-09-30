import { Activity, FileText, Pill } from "lucide-react";

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

export default function DocumentResultCard({ result }: { result: DocumentResultData }) {
  const card = asRecord(result.card);
  const data = asRecord(result.data);
  const content = Object.keys(card).length ? card : data;
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