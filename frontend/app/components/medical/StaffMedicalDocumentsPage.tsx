"use client";

import {
  Download,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type MedicalDocument = {
  id: string;
  sessionId: string;
  patientId: number | null;
  firstName: string;
  email: string;
  documentType:
    | "PRESCRIPTION"
    | "MEDICAL_REPORT"
    | "LAB_REPORT"
    | "OTHER_MEDICAL_DOCUMENT";
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
};

type Props = {
  heading: string;
  description: string;
};

const documentLabels: Record<
  MedicalDocument["documentType"],
  string
> = {
  PRESCRIPTION:
    "Prescription",
  MEDICAL_REPORT:
    "Medical report",
  LAB_REPORT:
    "Lab report",
  OTHER_MEDICAL_DOCUMENT:
    "Other medical document",
};

function formatSize(
  bytes: number
) {
  if (
    !Number.isFinite(
      bytes
    ) ||
    bytes <= 0
  ) {
    return "—";
  }

  if (
    bytes >=
    1024 * 1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${Math.max(
    1,
    Math.round(
      bytes /
      1024
    )
  )} KB`;
}

export default function StaffMedicalDocumentsPage({
  heading,
  description,
}: Props) {
  const backendBaseUrl =
    process.env
      .NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000";

  const [
    documents,
    setDocuments,
  ] =
    useState<
      MedicalDocument[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    downloadingId,
    setDownloadingId,
  ] =
    useState<
      string | null
    >(null);

  const authHeaders =
    useCallback(
      (): Record<
        string,
        string
      > => {
        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          return {};
        }

        return {
          Authorization:
            `Bearer ${token}`,
        };
      },
      []
    );

  const loadDocuments =
    useCallback(
      async () => {
        setLoading(
          true
        );

        try {
          const response =
            await fetch(
              `${backendBaseUrl}/api/medical-documents`,
              {
                headers:
                  authHeaders(),
                cache:
                  "no-store",
              }
            );

          const data =
            (await response.json()) as {
              documents?: MedicalDocument[];
              error?: string;
              message?: string;
            };

          if (
            !response.ok
          ) {
            throw new Error(
              data.error ??
                data.message ??
                "Could not load medical documents."
            );
          }

          setDocuments(
            data.documents ??
              []
          );

          setError(
            null
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Could not load medical documents."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        authHeaders,
        backendBaseUrl,
      ]
    );

  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            void loadDocuments();
          },
          0
        );

      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      loadDocuments,
    ]
  );

  const downloadDocument =
    async (
      document:
        MedicalDocument
    ) => {
      setDownloadingId(
        document.id
      );

      try {
        const response =
          await fetch(
            `${backendBaseUrl}/api/medical-documents/${document.id}/download`,
            {
              headers:
                authHeaders(),
              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as {
            downloadUrl?: string;
            error?: string;
            message?: string;
          };

        if (
          !response.ok ||
          !data.downloadUrl
        ) {
          throw new Error(
            data.error ??
              data.message ??
              "Could not create a secure download link."
          );
        }

        window.open(
          data.downloadUrl,
          "_blank",
          "noopener,noreferrer"
        );
      } catch (
        downloadError
      ) {
        setError(
          downloadError instanceof
            Error
            ? downloadError.message
            : "Could not download the medical document."
        );
      } finally {
        setDownloadingId(
          null
        );
      }
    };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {heading}
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadDocuments()
          }
          disabled={
            loading
          }
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            Uploaded documents
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">
            Loading medical documents…
          </div>
        ) : documents.length ===
          0 ? (
          <div className="p-6 text-sm text-slate-500">
            No medical documents have been uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map(
              (
                document
              ) => (
                <div
                  key={
                    document.id
                  }
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {
                          document.originalFileName
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          {
                            documentLabels[
                              document.documentType
                            ]
                          }
                        </span>

                        <span>
                          {
                            document.firstName
                          }
                        </span>

                        <span>
                          {
                            document.email
                          }
                        </span>

                        <span>
                          {formatSize(
                            document.fileSize
                          )}
                        </span>

                        <span>
                          {new Date(
                            document.uploadedAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      downloadingId ===
                      document.id
                    }
                    onClick={() =>
                      void downloadDocument(
                        document
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {downloadingId ===
                    document.id
                      ? "Preparing…"
                      : "Secure download"}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Download links are temporary signed URLs. Do not forward downloaded patient documents outside authorized clinical or administrative workflows.
      </p>
    </main>
  );
}
