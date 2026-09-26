"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Edit2, Trash2 } from "lucide-react";
import { errorText, jsonOptions, orNull, request, toPayload, type Doctor, type DoctorForm } from "./api";

type EditForm = DoctorForm & { certifications: string };

const EDIT_FIELDS: { key: keyof EditForm; type?: string; placeholder: string }[] = [
  { key: "name", placeholder: "Full Name" },
  { key: "email", type: "email", placeholder: "Email" },
  { key: "phone", type: "tel", placeholder: "Phone" },
  { key: "specialization", placeholder: "Specialization" },
  { key: "designation", placeholder: "Designation" },
  { key: "yearsOfExperience", type: "number", placeholder: "Years of Experience" },
];

const inputClass =
  "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm";

const toEditForm = (doctor: Doctor): EditForm => ({
  name: doctor.name ?? "",
  email: doctor.email ?? "",
  phone: doctor.phone ?? "",
  specialization: doctor.specialization ?? "",
  designation: doctor.designation ?? "",
  yearsOfExperience: typeof doctor.yearsOfExperience === "number" ? String(doctor.yearsOfExperience) : "",
  education: doctor.education ?? "",
  certifications: Array.isArray(doctor.certifications) ? doctor.certifications.join(", ") : "",
});

// One doctor's card: photo, details, edit form, image upload/remove and delete
export default function DoctorCard({
  doctor,
  onMessage,
  onChanged,
}: {
  doctor: Doctor;
  onMessage: (msg: string) => void;
  onChanged: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(() => toEditForm(doctor));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  // Open the edit form with the doctor's current details, or close it
  const toggleEditing = () => {
    clearImage();
    if (!isEditing) setEditForm(toEditForm(doctor));
    setIsEditing(!isEditing);
  };

  // Run an action; on success show the message and reload the doctors list
  const run = async (action: () => Promise<unknown>, successMsg: string, failMsg: string) => {
    try {
      await action();
      onMessage(`✅ ${successMsg}`);
      onChanged();
      return true;
    } catch (error) {
      console.error(error);
      onMessage(errorText(error, failMsg));
      return false;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      onMessage("❌ No image selected");
      return;
    }
    setUploading(true);
    onMessage("");
    const body = new FormData();
    body.append("image", selectedImage);
    const ok = await run(
      () => request(`/${doctor.id}/image`, "Failed to upload image", { method: "POST", body }),
      "Doctor image uploaded successfully",
      "Upload failed"
    );
    if (ok) {
      clearImage();
      setIsEditing(false);
    }
    setUploading(false);
  };

  const removeImage = () =>
    run(
      () => request(`/${doctor.id}/image`, "Failed to remove image", { method: "DELETE" }),
      "Doctor image removed successfully",
      "Remove failed"
    );

  const deleteDoctor = async () => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    setLoading(true);
    await run(
      () => request(`/${doctor.id}`, "Failed to delete doctor", { method: "DELETE" }),
      "Doctor deleted successfully",
      "Delete failed"
    );
    setLoading(false);
  };

  const updateDoctor = async () => {
    setLoading(true);
    const payload = {
      ...toPayload(editForm),
      specialization: orNull(editForm.specialization),
      certifications: editForm.certifications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const ok = await run(
      () => request(`/${doctor.id}`, "Failed to update doctor", jsonOptions("PUT", payload)),
      "Doctor updated successfully",
      "Update failed"
    );
    if (ok) setIsEditing(false);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Image Section */}
      <div className="relative h-50 bg-linear-to-b from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
        {doctor.profileImageUrl ? (
          <Image
            src={doctor.profileImageUrl}
            alt={doctor.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

        {isEditing && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-2">
            <label className="cursor-pointer bg-white px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-2 text-sm font-semibold">
              <Upload size={16} />
              Choose Image
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} hidden />
            </label>
            {imagePreview && (
              <div className="flex gap-2">
                <button
                  onClick={uploadImage}
                  disabled={uploading}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button onClick={clearImage} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {doctor.profileImageUrl && isEditing && (
          <button
            onClick={removeImage}
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

        {isEditing && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {EDIT_FIELDS.map(({ key, type = "text", placeholder }) => (
              <input
                key={key}
                type={type}
                placeholder={placeholder}
                value={editForm[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                className={inputClass}
              />
            ))}
            <textarea
              placeholder="Education"
              value={editForm.education}
              onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
            />
            <textarea
              placeholder="Certifications (comma-separated)"
              value={editForm.certifications}
              onChange={(e) => setEditForm({ ...editForm, certifications: e.target.value })}
              rows={2}
              className={`${inputClass} resize-none`}
            />
            <div className="flex gap-2">
              <button
                onClick={updateDoctor}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={toggleEditing}
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
            onClick={toggleEditing}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <Edit2 size={16} />
            {isEditing ? "Close" : "Edit"}
          </button>
          <button
            onClick={deleteDoctor}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
