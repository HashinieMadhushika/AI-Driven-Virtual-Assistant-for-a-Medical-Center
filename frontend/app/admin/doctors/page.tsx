"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Stethoscope,
  Briefcase,
  Clock,
  GraduationCap,
} from "lucide-react";

type Doctor = {
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

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    designation: "",
    yearsOfExperience: "",
    education: "",
    certifications: "",
  });

  // ✅ password removed (invite flow)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    designation: "",
    yearsOfExperience: "",
    education: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API}/api/doctors`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch doctors");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMsg(`❌ ${error instanceof Error ? error.message : "Failed to fetch doctors"}`);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (doctorId: number) => {
    if (!selectedImage) {
      setMsg("❌ No image selected");
      return;
    }

    try {
      setUploadingId(doctorId);
      setMsg("");

      const formDataToSend = new FormData();
      formDataToSend.append("image", selectedImage);

      const res = await fetch(`${API}/api/doctors/${doctorId}/image`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formDataToSend,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to upload image");

      setMsg("✅ Doctor image uploaded successfully");
      setSelectedImage(null);
      setImagePreview("");
      setEditingId(null);
      fetchDoctors();
    } catch (error) {
      console.error(error);
      setMsg(`❌ ${error instanceof Error ? error.message : "Upload failed"}`);
    } finally {
      setUploadingId(null);
    }
  };

  const removeImage = async (doctorId: number) => {
    try {
      const res = await fetch(`${API}/api/doctors/${doctorId}/image`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to remove image");

      setMsg("✅ Doctor image removed successfully");
      fetchDoctors();
    } catch (error) {
      console.error(error);
      setMsg(`❌ ${error instanceof Error ? error.message : "Remove failed"}`);
    }
  };

  // ✅ Invite flow add doctor (NO password)
  const addDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg("");

      // backend requires: name, email, specialization
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        specialization: formData.specialization.trim(),
        phone: formData.phone.trim() || null,
        designation: formData.designation.trim() || null,
        yearsOfExperience: formData.yearsOfExperience
          ? Number(formData.yearsOfExperience)
          : null,
        education: formData.education.trim() || null,
        // certifications not in add form currently
      };

      const res = await fetch(`${API}/api/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to invite doctor");

      // backend response: "Doctor invited successfully"
      setMsg("✅ Doctor invited successfully. Password setup link has been sent to the doctor’s email.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        designation: "",
        yearsOfExperience: "",
        education: "",
      });

      setShowAddForm(false);
      fetchDoctors();
    } catch (error) {
      console.error(error);
      setMsg(`❌ ${error instanceof Error ? error.message : "Failed to invite doctor"}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (doctorId: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/doctors/${doctorId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to delete doctor");

      setMsg("✅ Doctor deleted successfully");
      fetchDoctors();
    } catch (error) {
      console.error(error);
      setMsg(`❌ ${error instanceof Error ? error.message : "Delete failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (doctor: Doctor) => {
    if (editingId === doctor.id) {
      setEditingId(null);
      setSelectedImage(null);
      setImagePreview("");
      return;
    }

    setEditingId(doctor.id);
    setSelectedImage(null);
    setImagePreview("");
    setEditForm({
      name: doctor.name ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
      specialization: doctor.specialization ?? "",
      designation: doctor.designation ?? "",
      yearsOfExperience:
        typeof doctor.yearsOfExperience === "number" ? String(doctor.yearsOfExperience) : "",
      education: doctor.education ?? "",
      certifications: Array.isArray(doctor.certifications)
        ? doctor.certifications.join(", ")
        : "",
    });
  };

  const updateDoctor = async (doctorId: number) => {
    try {
      setLoading(true);
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || null,
        specialization: editForm.specialization.trim() || null,
        designation: editForm.designation.trim() || null,
        yearsOfExperience: editForm.yearsOfExperience
          ? Number(editForm.yearsOfExperience)
          : null,
        education: editForm.education.trim() || null,
        certifications: editForm.certifications
          ? editForm.certifications
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      const res = await fetch(`${API}/api/doctors/${doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update doctor");

      setMsg("✅ Doctor updated successfully");
      setEditingId(null);
      fetchDoctors();
    } catch (error) {
      console.error(error);
      setMsg(`❌ ${error instanceof Error ? error.message : "Update failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Stethoscope className="text-teal-600" size={32} />
            Doctors Management
          </h1>
          <p className="text-slate-500 mt-2">Manage doctor profiles and upload images</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md flex items-center gap-2 ${
            showAddForm
              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {showAddForm ? (
            <>
              <X size={20} />
              Cancel
            </>
          ) : (
            <>
              <User size={20} />
              Add Doctor
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {msg && (
        <div
          className={`p-4 rounded-xl shadow-sm border flex items-start gap-3 ${
            msg.includes("✅")
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span className="text-xl">{msg.includes("✅") ? "✅" : "❌"}</span>
          <p className="flex-1 font-medium">{msg.replaceAll("✅", "").replaceAll("❌", "").trim()}</p>
          <button onClick={() => setMsg("")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Add Doctor Form */}
      {showAddForm && (
        <form onSubmit={addDoctor} className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">Add New Doctor</h2>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the details to invite a doctor. They will receive an email to set their password.
            </p>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-700">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <User size={16} className="text-teal-600" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail size={16} className="text-teal-600" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Phone size={16} className="text-teal-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+94 70 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-700">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Specialization */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Stethoscope size={16} className="text-teal-600" />
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cardiology, Pediatrics"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Briefcase size={16} className="text-teal-600" />
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Consultant"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock size={16} className="text-teal-600" />
                  Years of Experience
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  min="0"
                  max="60"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <GraduationCap size={16} className="text-teal-600" />
                Education & Qualifications
              </label>
              <textarea
                placeholder="e.g., MBBS from ... , MD in ..."
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-start">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Inviting Doctor...
                </>
              ) : (
                <>
                  <User size={18} />
                  Invite Doctor
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Doctors Grid (unchanged from your original) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
          >
            {/* Image Section */}
            <div className="relative h-72 bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
              {doctor.profileImageUrl ? (
                <Image
                  src={doctor.profileImageUrl}
                  alt={doctor.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={false}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-teal-50 border border-teal-300 flex items-center justify-center text-2xl font-bold text-teal-700">
                  {doctor.name
                    ?.split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}

              {editingId === doctor.id && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-2">
                  <label className="cursor-pointer bg-white px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2 text-sm font-semibold">
                    <Upload size={16} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      hidden
                    />
                  </label>
                  {imagePreview && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => uploadImage(doctor.id)}
                        disabled={uploadingId === doctor.id}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        {uploadingId === doctor.id ? "Uploading..." : "Upload"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview("");
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {doctor.profileImageUrl && editingId === doctor.id && (
                <button
                  onClick={() => removeImage(doctor.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Doctor Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{doctor.name}</h3>
                <p className="text-sm text-slate-500">{doctor.specialization || "N/A"}</p>
              </div>

              {doctor.designation && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Designation:</span> {doctor.designation}
                </p>
              )}

              {doctor.yearsOfExperience && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Experience:</span> {doctor.yearsOfExperience} years
                </p>
              )}

              <p className="text-xs text-slate-500 break-all">{doctor.email}</p>
              {doctor.phone && <p className="text-xs text-slate-500">{doctor.phone}</p>}

              {editingId === doctor.id && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Specialization"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={editForm.yearsOfExperience}
                    onChange={(e) => setEditForm({ ...editForm, yearsOfExperience: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <textarea
                    placeholder="Education"
                    value={editForm.education}
                    onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                  />
                  <textarea
                    placeholder="Certifications (comma-separated)"
                    value={editForm.certifications}
                    onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDoctor(doctor.id)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      onClick={() => startEditing(doctor)}
                      className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => startEditing(doctor)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <Edit2 size={16} />
                  {editingId === doctor.id ? "Close" : "Edit"}
                </button>
                <button
                  onClick={() => deleteDoctor(doctor.id)}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <p className="text-slate-500">No doctors found. Add your first doctor to get started.</p>
        </div>
      )}
    </div>
  );
}