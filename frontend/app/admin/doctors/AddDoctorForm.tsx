"use client";

import { useState } from "react";
import {User,Mail,Phone,Stethoscope,Briefcase,Clock,GraduationCap,type LucideIcon,} from "lucide-react";
import { EMPTY_FORM, errorText, jsonOptions, request, toPayload, type DoctorForm } from "./api";

type Field = {
  key: keyof DoctorForm;
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder: string;
  required?: boolean;
};

const BASIC_FIELDS: Field[] = [
  { key: "name", label: "Full Name", icon: User, placeholder: "e.g., Dr. John Smith", required: true },
  { key: "email", label: "Email Address", icon: Mail, type: "email", placeholder: "doctor@hospital.com", required: true },
  { key: "phone", label: "Phone Number", icon: Phone, type: "tel", placeholder: "+94 70 000 0000" },
];

const PROFESSIONAL_FIELDS: Field[] = [
  { key: "specialization", label: "Specialization", icon: Stethoscope, placeholder: "e.g., Cardiology, Pediatrics", required: true },
  { key: "designation", label: "Designation", icon: Briefcase, placeholder: "e.g., Senior Consultant" },
  { key: "yearsOfExperience", label: "Years of Experience", icon: Clock, type: "number", placeholder: "e.g., 10" },
];

const inputClass =
  "w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";

// "Add New Doctor" form: invites a doctor, who then gets an email to set their password
export default function AddDoctorForm({
  onMessage,
  onAdded,
}: {
  onMessage: (msg: string) => void;
  onAdded: () => void;
}) {
  const [formData, setFormData] = useState<DoctorForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  //  Invite flow add doctor (NO password)
  const addDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onMessage("");
      // backend requires: name, email, specialization
      await request(
        "",
        "Failed to invite doctor",
        jsonOptions("POST", { ...toPayload(formData), specialization: formData.specialization.trim() })
      );

      onMessage("✅ Doctor invited successfully. Password setup link has been sent to the doctor’s email.");
      setFormData(EMPTY_FORM);
      onAdded();
    } catch (error) {
      console.error(error);
      onMessage(errorText(error, "Failed to invite doctor"));
    } finally {
      setLoading(false);
    }
  };

  const renderField = ({ key, label, icon: Icon, type = "text", placeholder, required }: Field) => (
    <div key={key} className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Icon size={16} className="text-teal-600" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={formData[key]}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        required={required}
        {...(type === "number" ? { min: "0", max: "60" } : {})}
        className={inputClass}
      />
    </div>
  );

  return (
    <form onSubmit={addDoctor} className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Add New Doctor</h2>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details to invite a doctor. They will receive an email to set their password.
        </p>
      </div>

      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-700">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{BASIC_FIELDS.map(renderField)}</div>
      </div>

      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-700">Professional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{PROFESSIONAL_FIELDS.map(renderField)}</div>

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
            className={`${inputClass} resize-none`}
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
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <User size={18} />
          )}
          {loading ? "Inviting Doctor..." : "Invite Doctor"}
        </button>
      </div>
    </form>
  );
}
