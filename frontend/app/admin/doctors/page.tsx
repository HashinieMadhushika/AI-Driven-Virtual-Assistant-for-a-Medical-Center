"use client";

import { useEffect, useState } from "react";
import { X, User, Stethoscope } from "lucide-react";
import { errorText, request, type Doctor } from "./api";
import AddDoctorForm from "./AddDoctorForm";
import DoctorCard from "./DoctorCard";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [msg, setMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Load the doctors list; runs again whenever reloadKey changes
  useEffect(() => {
    request("", "Failed to fetch doctors")
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error(error);
        setMsg(errorText(error, "Failed to fetch doctors"));
      });
  }, [reloadKey]);

  const fetchDoctors = () => setReloadKey((k) => k + 1);

  // Every message (success or error) disappears after 5 seconds, or earlier if the admin closes it
  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => setMsg(""), 5000);
    return () => clearTimeout(timer);
  }, [msg]);

  const isSuccess = msg.includes("✅");

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
          {showAddForm ? <X size={20} /> : <User size={20} />}
          {showAddForm ? "Cancel" : "Add Doctor"}
        </button>
      </div>

      {/* Messages */}
      {msg && (
        <div
          className={`p-4 rounded-xl shadow-sm border flex items-start gap-3 ${
            isSuccess ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span className="text-xl">{isSuccess ? "✅" : "❌"}</span>
          <p className="flex-1 font-medium">{msg.replaceAll("✅", "").replaceAll("❌", "").trim()}</p>
          <button onClick={() => setMsg("")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {showAddForm && (
        <AddDoctorForm
          onMessage={setMsg}
          onAdded={() => {
            setShowAddForm(false);
            fetchDoctors();
          }}
        />
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} onMessage={setMsg} onChanged={fetchDoctors} />
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
