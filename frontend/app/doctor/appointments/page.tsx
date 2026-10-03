'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

const AUTO_REFRESH_INTERVAL_MS = 15000;

type PatientSummary = {
  firstName: string;
  lastName: string;
};

type DoctorAppointment = {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  type?: string;
  mode?: string;
  status: string;
  Patient?: PatientSummary | null;
};

type AppointmentsResponse = {
  appointments?: DoctorAppointment[];
};

const API =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:5000';

export default function DoctorAppointments() {
  const [searchQuery, setSearchQuery] =
    useState('');

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [
    appointments,
    setAppointments,
  ] = useState<DoctorAppointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('');

  const fetchAppointments = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const token =
          localStorage.getItem(
            'token'
          );

        if (!token) {
          console.error(
            'No authentication token found'
          );
          return;
        }

        let url =
          `${API}/api/appointments`;

        if (statusFilter) {
          url += `?status=${encodeURIComponent(
            statusFilter
          )}`;
        }

        const response =
          await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          });

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            'Error fetching appointments:',
            response.status,
            errorText
          );

          return;
        }

        const data =
          (await response.json()) as AppointmentsResponse;

        setAppointments(
          data.appointments ?? []
        );
      } catch (error) {
        console.error(
          'Error fetching appointments:',
          error
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    const initialFetchId =
      window.setTimeout(() => {
        void fetchAppointments(
          true
        );
      }, 0);

    const intervalId =
      window.setInterval(() => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          void fetchAppointments(
            false
          );
        }
      }, AUTO_REFRESH_INTERVAL_MS);

    const handleFocus = () => {
      void fetchAppointments(
        false
      );
    };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          void fetchAppointments(
            false
          );
        }
      };

    window.addEventListener(
      'focus',
      handleFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.clearTimeout(
        initialFetchId
      );

      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        'focus',
        handleFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [fetchAppointments]);

  const updateAppointmentStatus =
    async (
      id: number,
      status: string
    ) => {
      try {
        const token =
          localStorage.getItem(
            'token'
          );

        if (!token) {
          console.error(
            'No authentication token found'
          );
          return;
        }

        const response =
          await fetch(
            `${API}/api/appointments/${id}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                status,
              }),
            }
          );

        if (response.ok) {
          await fetchAppointments(
            false
          );
        } else {
          const errorText =
            await response.text();

          console.error(
            'Error updating appointment status:',
            response.status,
            errorText
          );
        }
      } catch (error) {
        console.error(
          'Error updating appointment:',
          error
        );
      }
    };

  const deleteAppointment =
    async (id: number) => {
      if (
        !confirm(
          'Are you sure you want to delete this appointment?'
        )
      ) {
        return;
      }

      try {
        const token =
          localStorage.getItem(
            'token'
          );

        if (!token) {
          console.error(
            'No authentication token found'
          );
          return;
        }

        const response =
          await fetch(
            `${API}/api/appointments/${id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (response.ok) {
          await fetchAppointments(
            false
          );
        } else {
          const errorText =
            await response.text();

          console.error(
            'Error deleting appointment:',
            response.status,
            errorText
          );
        }
      } catch (error) {
        console.error(
          'Error deleting appointment:',
          error
        );
      }
    };

  const formatDate = (
    dateStr: string
  ) => {
    const date =
      new Date(dateStr);

    const today =
      new Date();

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    if (
      date.toDateString() ===
      today.toDateString()
    ) {
      return 'Today';
    }

    if (
      date.toDateString() ===
      tomorrow.toDateString()
    ) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  const filteredAppointments =
    appointments.filter(
      (appointment) => {
        const patientName =
          appointment.Patient
            ? `${appointment.Patient.firstName} ${appointment.Patient.lastName}`.toLowerCase()
            : '';

        return patientName.includes(
          searchQuery.toLowerCase()
        );
      }
    );

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';

      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';

      case 'Cancelled':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderAppointmentsContent =
    () => {
      if (loading) {
        return (
          <div className="p-12 text-center text-slate-500">
            Loading
            appointments...
          </div>
        );
      }

      if (
        filteredAppointments.length ===
        0
      ) {
        return (
          <div className="p-12 text-center text-slate-500">
            No appointments
            found
          </div>
        );
      }

      return (
        <div className="divide-y divide-slate-100">
          {filteredAppointments.map(
            (appointment) => {
              const patientName =
                appointment.Patient
                  ? `${appointment.Patient.firstName} ${appointment.Patient.lastName}`
                  : 'Unknown Patient';

              const patientInitial =
                appointment.Patient
                  ? appointment.Patient.firstName.charAt(
                      0
                    )
                  : 'U';

              return (
                <div
                  key={
                    appointment.id
                  }
                  className="p-6 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center space-x-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-700 to-cyan-500 text-lg font-bold text-white">
                        {
                          patientInitial
                        }
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {
                            patientName
                          }
                        </h3>

                        <p className="text-sm text-slate-600">
                          {
                            appointment.type
                          }
                        </p>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2 text-slate-700">
                          <svg
                            className="h-5 w-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={
                                2
                              }
                              d="M8 7V3m8 4v3m-9 1h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>

                          <span className="text-sm font-medium">
                            {formatDate(
                              appointment.appointmentDate
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-slate-700">
                          <svg
                            className="h-5 w-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={
                                2
                              }
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>

                          <span className="text-sm font-medium">
                            {
                              appointment.appointmentTime
                            }
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-slate-700">
                          {appointment.mode ===
                          'Video Call' ? (
                            <svg
                              className="h-5 w-5 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={
                                  2
                                }
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={
                                  2
                                }
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          )}

                          <span className="text-sm font-medium">
                            {
                              appointment.mode
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {
                            appointment.status
                          }
                        </span>

                        <div className="flex items-center space-x-2">
                          {appointment.status ===
                            'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    'Confirmed'
                                  )
                                }
                                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                              >
                                Confirm
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateAppointmentStatus(
                                    appointment.id,
                                    'Cancelled'
                                  )
                                }
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {appointment.status ===
                            'Confirmed' && (
                            <button
                              type="button"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  'Completed'
                                )
                              }
                              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                            >
                              Mark
                              Complete
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              deleteAppointment(
                                appointment.id
                              )
                            }
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                            title="Delete appointment"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={
                                  2
                                }
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      );
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Appointments
        </h1>

        <p className="mt-1 text-slate-500">
          Manage and view your
          scheduled appointments
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search patients..."
              value={
                searchQuery
              }
              onChange={(event) =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              className="w-full rounded-xl border border-black/10 py-3 pl-12 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFilterOpen(
                !filterOpen
              )
            }
            className="flex items-center space-x-2 rounded-xl border border-black/10 px-6 py-3 transition-colors hover:bg-slate-50"
          >
            <svg
              className="h-5 w-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>

            <span className="font-medium text-slate-700">
              Filter
            </span>
          </button>
        </div>

        {filterOpen && (
          <div className="mt-4 rounded-xl border border-black/10 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Filter by
              Status:
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                '',
                'Pending',
                'Confirmed',
                'Cancelled',
                'Completed',
              ].map(
                (status) => (
                  <button
                    key={
                      status
                    }
                    type="button"
                    onClick={() =>
                      setStatusFilter(
                        status
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      statusFilter ===
                      status
                        ? 'bg-teal-700 text-white'
                        : 'border border-black/10 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {status ||
                      'All'}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {renderAppointmentsContent()}
      </div>
    </div>
  );
}