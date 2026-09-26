"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, FileText, Cake, Hash } from 'lucide-react';

type Doctor = {
  id: number;
  name: string;
  specialization?: string | null;
};

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:5000';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  date: '',
  time: '',
  doctor: '',
  notes: ''
};

const NewAppointmentForm = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState('');

  // Load doctors from the database for the "Select Doctor" dropdown
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/api/doctors`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load doctors');
        setDoctors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setDoctorsError(error instanceof Error ? error.message : 'Failed to load doctors');
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
        !formData.date || !formData.time || !formData.doctor) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/appointments/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          doctorId: Number(formData.doctor),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || null,
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          notes: formData.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to schedule appointment');

      alert('Appointment scheduled successfully!');
      setFormData(emptyForm);
    } catch (error) {
      console.error(error);
      alert(`❌ ${error instanceof Error ? error.message : 'Failed to schedule appointment'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Schedule New Appointment</h2>
              <p className="text-teal-100 text-sm">Fill in the patient and appointment details</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-teal-600" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="e.g., patient@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g., 0771234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-teal-600" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) => handleChange('doctor', e.target.value)}
                  disabled={doctorsLoading || doctors.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {doctorsLoading
                      ? 'Loading doctors...'
                      : doctors.length === 0
                        ? 'No doctors available'
                        : 'Choose a doctor'}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={String(doctor.id)}>
                      {doctor.name}{doctor.specialization ? ` — ${doctor.specialization}` : ''}
                    </option>
                  ))}
                </select>
                {doctorsError && (
                  <p className="mt-2 text-sm text-red-600">❌ {doctorsError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional information..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setFormData(emptyForm)}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Form
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentForm;
