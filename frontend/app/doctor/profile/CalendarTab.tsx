'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { apiFetch, readJson, type ApiMessage } from './api';
import {
  EMPTY_EVENT_FORM,
  eventToForm,
  getEventStart,
  getMonthDays,
  isSameDay,
  toDateInput,
} from './calendarUtils';
import EventModal from './EventModal';
import type { CalendarEvent, EventFormValues } from './types';
import { primaryButtonClass, Spinner } from './ui';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const UPCOMING_EVENT_LIMIT = 5;

interface ModalState {
  eventId: string | null;
  initialValues: EventFormValues;
}

function GoogleIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ConnectCalendar() {
  const handleConnect = async () => {
    try {
      const response = await apiFetch('/api/calendar/auth-url');
      const data = await readJson<ApiMessage & { authUrl: string }>(response);

      if (response.ok && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert(data.message || data.error || 'Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      alert('Failed to connect Google Calendar. Please check if the backend server is running.');
    }
  };

  return (
    <div className="bg-slate-50 border border-black/10 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">Google Calendar Integration</h3>

      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-teal-700 rounded-2xl flex items-center justify-center shadow-sm">
          <Calendar className="w-12 h-12 text-white" />
        </div>
      </div>

      <div className="text-center space-y-4 mb-8">
        <h4 className="text-xl font-semibold text-gray-800">Connect Google Calendar</h4>
        <p className="text-gray-600 max-w-md mx-auto">
          Sync your appointments with Google Calendar to manage your schedule across platforms and receive notifications.
        </p>
      </div>

      <div className="flex justify-center">
        <button onClick={handleConnect} className={`px-8 py-4 ${primaryButtonClass} space-x-3`}>
          <GoogleIcon />
          <span>Connect with Google</span>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">Your calendar data will be synced securely via OAuth 2.0</p>
    </div>
  );
}

interface MonthViewProps {
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
}

function MonthView({ events, onDayClick }: MonthViewProps) {
  const [month, setMonth] = useState(() => new Date());
  const today = new Date();

  const shiftMonth = (delta: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Calendar View</h4>
        <div className="flex items-center space-x-2">
          <button onClick={() => shiftMonth(-1)} className="p-1 hover:bg-gray-100 rounded" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => shiftMonth(1)} className="p-1 hover:bg-gray-100 rounded" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-md font-bold text-gray-800 mb-4">
        {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-gray-500 font-medium text-xs py-2">{day}</div>
        ))}
        {getMonthDays(month).map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const dayEvents = events.filter((event) => isSameDay(getEventStart(event), date));
          const isToday = isSameDay(date, today);
          const title = dayEvents.length > 0 ? dayEvents.map((e) => e.summary).join(', ') : 'Click to add event';

          return (
            <button
              key={day}
              type="button"
              onClick={() => onDayClick(date)}
              title={title}
              aria-label={`${day}, ${title}`}
              className={`min-h-[60px] p-2 rounded-lg relative text-sm ${
                isToday ? 'bg-teal-700 text-white font-bold' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {day}
              {dayEvents.length > 0 && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-teal-600'}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface EventListItemProps {
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: () => void;
}

function EventListItem({ event, onEdit, onDelete }: EventListItemProps) {
  const start = getEventStart(event);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-800">{event.summary || 'No Title'}</h5>
          {event.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {start.toLocaleDateString()}
            </span>
            {event.start.dateTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button onClick={onEdit} className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors" title="Edit event">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete event">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarTab() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const response = await apiFetch(`/api/calendar/events?maxResults=${UPCOMING_EVENT_LIMIT}`);
      const data = await readJson<{ events: CalendarEvent[] }>(response);
      setEvents(data.events ?? []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const data = await readJson<{ connected: boolean }>(await apiFetch('/api/calendar/status'));
        setConnected(Boolean(data.connected));
        if (data.connected) loadEvents();
      } catch (error) {
        console.error('Error checking calendar status:', error);
      }
    };
    checkConnection();
  }, [loadEvents]);

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) return;

    try {
      const response = await apiFetch('/api/calendar/disconnect', { method: 'POST' });
      if (response.ok) {
        setConnected(false);
        setEvents([]);
        alert('Google Calendar disconnected successfully!');
      } else {
        const data = await readJson<ApiMessage>(response);
        alert(data.message || 'Failed to disconnect Google Calendar');
      }
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      alert('Failed to disconnect Google Calendar');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await apiFetch(`/api/calendar/events/${eventId}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Event deleted successfully!');
        loadEvents();
      } else {
        const data = await readJson<ApiMessage>(response);
        alert(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const openNewEvent = (date?: Date) => {
    const day = date ? toDateInput(date) : '';
    setModal({
      eventId: null,
      initialValues: date
        ? { ...EMPTY_EVENT_FORM, startDate: day, endDate: day, startTime: '09:00', endTime: '10:00' }
        : EMPTY_EVENT_FORM,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {connected ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Google Calendar Connected</h4>
                  <p className="text-sm text-gray-600">Your appointments are synced with Google Calendar</p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthView events={events} onDayClick={openNewEvent} />

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Upcoming Events</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openNewEvent()}
                      className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Event</span>
                    </button>
                    <button
                      onClick={loadEvents}
                      className="text-teal-700 hover:text-teal-800 text-sm font-medium flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </button>
                  </div>
                </div>

                {loadingEvents ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {events.map((event) => (
                      <EventListItem
                        key={event.id}
                        event={event}
                        onEdit={() => setModal({ eventId: event.id, initialValues: eventToForm(event) })}
                        onDelete={() => handleDelete(event.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>No upcoming events</p>
                    <p className="text-sm mt-1">Your scheduled appointments will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ConnectCalendar />
        )}
      </div>

      {modal && (
        <EventModal
          eventId={modal.eventId}
          initialValues={modal.initialValues}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadEvents();
          }}
        />
      )}
    </div>
  );
}
