// Shared types and helpers for the admin Doctors page

export type Doctor = {
  id: number;
  name: string;
  email: string;
  specialization?: string | null;
  phone?: string | null;
  designation?: string | null;
  yearsOfExperience?: number | null;
  education?: string | null;
  profileImageUrl?: string | null;
  certifications?: string[];
};

export type DoctorForm = {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  designation: string;
  yearsOfExperience: string;
  education: string;
};

// password removed (invite flow)
export const EMPTY_FORM: DoctorForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  designation: "",
  yearsOfExperience: "",
  education: "",
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Call the doctors API with the admin's token; throws the backend's message on failure
export async function request(path: string, failMessage: string, options: RequestInit = {}) {
  const res = await fetch(`${API}/api/doctors${path}`, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || failMessage);
  return data;
}

export const jsonOptions = (method: string, body: object): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const errorText = (error: unknown, fallback: string) =>
  `❌ ${error instanceof Error ? error.message : fallback}`;

// Empty text → null, so the backend stores "not set" instead of ""
export const orNull = (value: string) => value.trim() || null;

// Fields that the add and edit forms send the same way
export const toPayload = (form: DoctorForm) => ({
  name: form.name.trim(),
  email: form.email.trim(),
  phone: orNull(form.phone),
  designation: orNull(form.designation),
  yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
  education: orNull(form.education),
});
