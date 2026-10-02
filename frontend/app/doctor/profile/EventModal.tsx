'use client';

import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { apiFetch, readJson, type ApiMessage } from './api';
import { toDateInput, toTimeInput } from './calendarUtils';
import type { EventFormValues } from './types';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';

const ONE_HOUR_MS = 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toLocalDateTime = (d: Date) => `${toDateInput(d)}T${toTimeInput(d)}:00`;

const Required = () => <span className="text-red-500">*</span>;

interface EventModalProps {
  /** Google Calendar event id when editing, null when creating. */
  eventId: string | null;
  initialValues: EventFormValues;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventModal({ eventId, initialValues, onClose, onSaved }: EventModalProps) {
  const [form, setForm] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const isEditing = eventId !== null;

  const bind = (field: keyof EventFormValues) => ({
    id: `event-${field}`,
    value: form[field],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: e.target.value })),
    className: inputClass,
  });

  const handleSubmit = async () => {
    const { title, description, startDate, startTime, endDate, endTime, attendees } = form;

    if (!title || !startDate || !startTime) {
      alert('Please fill in at least the title, start date, and start time');
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    // Default to a one-hour event when no end is given
    const end = endDate && endTime ? new Date(`${endDate}T${endTime}`) : new Date(start.getTime() + ONE_HOUR_MS);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      alert('Invalid date/time');
      return;
    }
    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    const attendeeList = attendees.split(',').map((email) => email.trim()).filter(Boolean);
    const invalidEmails = attendeeList.filter((email) => !EMAIL_PATTERN.test(email));
    if (invalidEmails.length > 0) {
      alert(
        `Invalid email format(s): ${invalidEmails.join(', ')}\n\nPlease use valid email addresses only (e.g., john@example.com)`
      );
      return;
    }

    setSaving(true);
    try {
      const response = await apiFetch(isEditing ? `/api/calendar/events/${eventId}` : '/api/calendar/events', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({
          title,
          description,
          startTime: toLocalDateTime(start),
          endTime: toLocalDateTime(end),
          attendees: attendeeList,
        }),
      });
      const data = await readJson<ApiMessage>(response);

      if (response.ok) {
        alert(isEditing ? 'Event updated successfully!' : 'Event created successfully!');
        onSaved();
      } else {
        alert(data.message || data.error || `Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Calendar Event' : 'Create Calendar Event'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="event-title" className={labelClass}>Event Title <Required /></label>
            <input type="text" placeholder="e.g., Patient Appointment" {...bind('title')} />
          </div>

          <div>
            <label htmlFor="event-description" className={labelClass}>Description</label>
            <textarea rows={3} placeholder="Event details..." {...bind('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-startDate" className={labelClass}>Start Date <Required /></label>
              <input type="date" {...bind('startDate')} />
            </div>
            <div>
              <label htmlFor="event-startTime" className={labelClass}>Start Time <Required /></label>
              <input type="time" {...bind('startTime')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-endDate" className={labelClass}>End Date</label>
              <input type="date" {...bind('endDate')} />
            </div>
            <div>
              <label htmlFor="event-endTime" className={labelClass}>End Time</label>
              <input type="time" {...bind('endTime')} />
            </div>
          </div>

          <div>
            <label htmlFor="event-attendees" className={labelClass}>Attendees (Optional)</label>
            <input type="text" placeholder="Email addresses: john@hospital.com, jane@clinic.com" {...bind('attendees')} />
            <p className="text-xs text-gray-500 mt-1">
              Enter valid email addresses separated by commas. Example: doctor@hospital.com, nurse@hospital.com
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button onClick={onClose} className={`px-6 py-3 ${secondaryButtonClass}`}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} className={`px-6 py-3 ${primaryButtonClass}`}>
              {isEditing ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
