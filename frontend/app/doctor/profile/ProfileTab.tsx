'use client';

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Check, Clock, FileText, Mail, Pencil, Phone, User, type LucideIcon } from 'lucide-react';
import { apiFetch, readJson, type ApiMessage } from './api';
import type { Doctor } from './types';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const NOT_PROVIDED = 'Not provided';

type ProfileForm = ReturnType<typeof toForm>;

const toForm = (doctor: Doctor) => ({
  name: doctor.name ?? '',
  phone: doctor.phone ?? '',
  specialization: doctor.specialization ?? '',
  yearsOfExperience: doctor.yearsOfExperience?.toString() ?? '',
});

interface ProfileFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  displayValue: string;
  editing?: boolean;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function ProfileField({ id, label, icon: Icon, displayValue, editing, type = 'text', value, onChange }: ProfileFieldProps) {
  if (editing) {
    return (
      <div>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <input id={id} type={type} value={value} onChange={(e) => onChange?.(e.target.value)} className={inputClass} />
      </div>
    );
  }

  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="text-gray-800">{displayValue}</span>
      </div>
    </div>
  );
}

interface ProfileTabProps {
  doctor: Doctor;
  onDoctorUpdate: (doctor: Doctor) => void;
}

export default function ProfileTab({ doctor, onDoctorUpdate }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(() => toForm(doctor));
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const setField = (field: keyof ProfileForm) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const startEditing = () => {
    setForm(toForm(doctor));
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiFetch('/api/doctors/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          designation: doctor.designation ?? '',
          education: doctor.education ?? '',
          certifications: doctor.certifications ?? [],
        }),
      });
      const data = await readJson<ApiMessage & { doctor: Doctor }>(response);

      if (response.ok && data.doctor) {
        onDoctorUpdate(data.doctor);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append('image', file);

      const response = await apiFetch('/api/doctors/profile/image', { method: 'POST', body });
      const data = await readJson<ApiMessage & { doctor: Doctor }>(response);

      if (response.ok && data.doctor) {
        onDoctorUpdate(data.doctor);
        alert('Profile image updated successfully!');
      } else {
        alert(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert('Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-200 h-32"></div>
      <div className="px-8 pb-8">
        <div className="flex items-end -mt-16 mb-6">
          <div className="relative">
            <div className="relative w-32 h-32 bg-teal-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {doctor.profileImageUrl ? (
                <Image src={doctor.profileImageUrl} alt={doctor.name} fill sizes="128px" className="object-cover" />
              ) : (
                <div className="w-28 h-28 bg-teal-700 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {doctor.name?.charAt(0)}
                </div>
              )}
            </div>
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-0 right-0 w-10 h-10 bg-teal-700 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-teal-800 transition-colors"
              title="Upload profile image"
            >
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
          </div>
          <div className="ml-6 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Dr. {doctor.name}</h2>
            <p className="text-slate-600">{doctor.specialization}</p>
          </div>
          <div className="ml-auto mb-4">
            {isEditing ? (
              <div className="flex space-x-3">
                <button onClick={() => setIsEditing(false)} className={`px-6 py-2 ${secondaryButtonClass}`}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className={`px-6 py-2 ${primaryButtonClass}`}>
                  <Check className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            ) : (
              <button onClick={startEditing} className={`px-6 py-2 ${primaryButtonClass}`}>
                <Pencil className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <ProfileField
              id="name"
              label="Full Name"
              icon={User}
              displayValue={doctor.name}
              editing={isEditing}
              value={form.name}
              onChange={setField('name')}
            />
            <ProfileField id="email" label="Email Address" icon={Mail} displayValue={doctor.email} />
            <ProfileField
              id="phone"
              label="Phone Number"
              icon={Phone}
              type="tel"
              displayValue={doctor.phone || NOT_PROVIDED}
              editing={isEditing}
              value={form.phone}
              onChange={setField('phone')}
            />
          </div>

          <div className="space-y-6">
            <ProfileField
              id="specialization"
              label="Specialization"
              icon={FileText}
              displayValue={doctor.specialization || NOT_PROVIDED}
              editing={isEditing}
              value={form.specialization}
              onChange={setField('specialization')}
            />
            <ProfileField
              id="yearsOfExperience"
              label="Years of Experience"
              icon={Clock}
              type="number"
              displayValue={doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : NOT_PROVIDED}
              editing={isEditing}
              value={form.yearsOfExperience}
              onChange={setField('yearsOfExperience')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
