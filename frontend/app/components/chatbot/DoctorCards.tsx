export type Doctor = {
  id: number | string;
  name: string;
  specialization?: string | null;
  designation?: string | null;
  profileImageUrl?: string | null;
  yearsOfExperience?: number | null;
  weeklySchedule?: Record<string, unknown>;
};

export default function DoctorCards({
  doctors,
  onBook
}: {
  doctors: Doctor[];
  onBook: (doctor: Doctor) => void;
}) {
  if (doctors.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {doctors.map((doctor) => {
        return (
          <article
            key={doctor.id}
            className="overflow-hidden rounded-lg border border-teal-100 bg-white text-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-3 p-3">
              {doctor.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor.profileImageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-50 text-lg font-semibold text-teal-800">
                  {doctor.name.trim().charAt(0).toUpperCase() || "D"}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{doctor.name}</h3>
                {doctor.designation ? (
                  <p className="truncate text-xs text-slate-500">{doctor.designation}</p>
                ) : null}
                {doctor.specialization ? (
                  <p className="truncate text-sm text-teal-800">{doctor.specialization}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
              {typeof doctor.yearsOfExperience === "number" ? (
                <p className="text-xs text-slate-600">{doctor.yearsOfExperience} years experience</p>
              ) : <span />}
              <button
                type="button"
                onClick={() => onBook(doctor)}
                className="shrink-0 rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                Book
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}