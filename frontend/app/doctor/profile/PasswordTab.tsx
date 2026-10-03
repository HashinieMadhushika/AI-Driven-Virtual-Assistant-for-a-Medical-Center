'use client';

import { useState } from 'react';
import { Info, Lock } from 'lucide-react';
import { apiFetch, readJson, type ApiMessage } from './api';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';

const MIN_PASSWORD_LENGTH = 8;
const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

type PasswordField = keyof typeof EMPTY_PASSWORDS;

const FIELDS: { id: PasswordField; label: string; placeholder: string; hint?: string }[] = [
  { id: 'currentPassword', label: 'Current Password', placeholder: 'Enter your current password' },
  {
    id: 'newPassword',
    label: 'New Password',
    placeholder: 'Enter new password',
    hint: `Must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  },
  { id: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Confirm new password' },
];

export default function PasswordTab() {
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!passwords.currentPassword) {
      alert('Please enter your current password');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    if (passwords.newPassword.length < MIN_PASSWORD_LENGTH) {
      alert(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long!`);
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch('/api/doctors/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await readJson<ApiMessage>(response);

      if (response.ok) {
        alert('Password updated successfully!');
        setPasswords(EMPTY_PASSWORDS);
      } else {
        alert(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <div className="max-w-2xl">
        <div className="flex items-start space-x-3 p-4 bg-teal-50 border border-teal-200 rounded-xl mb-6">
          <Info className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
          <p className="text-sm text-teal-800">
            Keep your password secure. You can change it anytime. Your email cannot be changed.
          </p>
        </div>

        <div className="space-y-5">
          {FIELDS.map(({ id, label, placeholder, hint }) => (
            <div key={id}>
              <label htmlFor={id} className={labelClass}>{label}</label>
              <input
                id={id}
                type="password"
                autoComplete={id === 'currentPassword' ? 'current-password' : 'new-password'}
                value={passwords[id]}
                onChange={(e) => setPasswords((p) => ({ ...p, [id]: e.target.value }))}
                placeholder={placeholder}
                className={inputClass}
              />
              {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
            </div>
          ))}

          <div className="flex items-center space-x-3 pt-4">
            <button onClick={handleSubmit} disabled={saving} className={`px-6 py-3 ${primaryButtonClass}`}>
              <Lock className="w-5 h-5" />
              <span>{saving ? 'Updating...' : 'Update Password'}</span>
            </button>
            <button onClick={() => setPasswords(EMPTY_PASSWORDS)} className={`px-6 py-3 ${secondaryButtonClass}`}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
