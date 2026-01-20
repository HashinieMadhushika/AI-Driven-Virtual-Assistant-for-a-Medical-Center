// app/admin/doctors/page.tsx
"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  email: string;
  specialization?: string | null;
  phone?: string | null;
  licenseNo?: string | null;
  roomNo?: string | null;
};

const API = "http://localhost:5000";

export default function DoctorsPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
    licenseNo: "",
    roomNo: "",
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API}/api/doctors`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setMsg(e.message || "Backend connection failed");
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      specialization: "",
      phone: "",
      licenseNo: "",
      roomNo: "",
    });
    setEditingId(null);
  };

  const openAdd = () => {
    setMsg("");
    resetForm();
    setOpen(true);
  };

  const openEdit = (d: Doctor) => {
    setMsg("");
    setEditingId(d.id);
    setForm({
      name: d.name || "",
      email: d.email || "",
      specialization: d.specialization || "",
      phone: d.phone || "",
      licenseNo: d.licenseNo || "",
      roomNo: d.roomNo || "",
    });
    setOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const url =
        editingId === null ? `${API}/api/doctors` : `${API}/api/doctors/${editingId}`;
      const method = editingId === null ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || "Request failed");

      setMsg(editingId === null ? `✅ Doctor added. Temp password: ${data.tempPassword}` : "✅ Doctor updated");
      await fetchDoctors();
      resetForm();
      setOpen(false);
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this doctor?")) return;

    const res = await fetch(`${API}/api/doctors/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg("✅ Doctor deleted");
      fetchDoctors();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(`❌ ${data?.msg || "Delete failed"}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page top row */}
      <div className="rounded-2xl border border-black/10 bg-gradient-to-b from-cyan-50 to-transparent p-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Medical Staff</h2>
          <p className="text-sm text-slate-500 mt-1">Manage doctors and their availability.</p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-3 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800"
        >
          + Add Doctors
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {doctors.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-black/10 grid place-items-center font-extrabold text-teal-800">
                  {d.name?.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <div className="font-extrabold text-slate-800">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.specialization || "-"}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(d)}
                  className="w-9 h-9 rounded-xl border border-black/10 hover:bg-slate-50"
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="w-9 h-9 rounded-xl border border-red-200 hover:bg-red-50"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-700">{d.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room</span>
                <span className="font-medium text-slate-700">{d.roomNo || "-"}</span>
              </div>
            </div>
          </div>
        ))}

        {doctors.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-black/20 p-6 text-center">
            <div className="font-extrabold text-slate-800">No doctors found</div>
            <div className="text-slate-500 mt-1">Click “Add Doctors” to create your first doctor.</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 text-white font-extrabold flex items-center justify-between
                            bg-gradient-to-r from-teal-700 to-cyan-500">
              <div>{editingId === null ? "Add New Doctor" : "Edit Doctor"}</div>
              <button className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Doctor Name *</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:ring-2 focus:ring-teal-200"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Email *</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:ring-2 focus:ring-teal-200"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Specialization *</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:ring-2 focus:ring-teal-200"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Phone</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:ring-2 focus:ring-teal-200"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">License No</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:ring-2 focus:ring-teal-200"
                    name="licenseNo"
                    value={form.licenseNo}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Room / OPD No</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-3 outline-none focus:ring-2 focus:ring-teal-200"
                    name="roomNo"
                    value={form.roomNo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  disabled={loading}
                  className="px-4 py-3 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800 disabled:opacity-60"
                >
                  {loading ? "Saving..." : editingId === null ? "Add Doctor" : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl border border-black/15 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {msg && (
                <div className="mt-3 rounded-xl border border-black/10 bg-slate-50 px-3 py-2 text-sm">
                  {msg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
