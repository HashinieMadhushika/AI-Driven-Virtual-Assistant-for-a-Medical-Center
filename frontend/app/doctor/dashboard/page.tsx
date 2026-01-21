'use client';

import { useEffect, useState } from 'react';

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<any>(null);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    pendingReviews: 0,
    notifications: 5
  });
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todaysSchedule, setTodaysSchedule] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [announcements] = useState([
    { id: 1, author: 'System', message: 'Welcome to your medical center dashboard', time: '1h ago' },
    { id: 2, author: 'Admin', message: 'Please keep your appointment schedule updated', time: '3h ago' }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setDoctor(JSON.parse(userData));
    }
    checkCalendarConnection();
    fetchCalendarEvents();
    fetchTodaysAppointments();
    fetchAppointmentStats();
  }, []);

  const checkCalendarConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/calendar/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setIsCalendarConnected(data.connected);
    } catch (error) {
      console.error('Error checking calendar status:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/calendar/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchTodaysAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTodaysSchedule(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchAppointmentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(prevStats => ({
          ...prevStats,
          todaysAppointments: data.todaysAppointments || 0,
          totalPatients: data.totalPatients || 0,
          pendingReviews: data.pendingReviews || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    if (!day) return [];
    const targetYear = currentMonth.getFullYear();
    const targetMonth = currentMonth.getMonth();
    const targetDay = day;
    
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.getFullYear() === targetYear &&
             eventDate.getMonth() === targetMonth &&
             eventDate.getDate() === targetDay;
    });
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, DR. {doctor?.name?.split(' ')[doctor?.name?.split(' ').length - 1]} 👋
            </h1>
            <p className="text-cyan-100">Here's what's happening with your practice today</p>
          </div>
          <button className="px-6 py-3 bg-white text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50 transition-all shadow-md">
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.todaysAppointments}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalPatients}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingReviews}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium">Notifications</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.notifications}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
          </div>
          <div className="p-6 space-y-4">
            {loadingAppointments ? (
              <div className="text-center py-8 text-gray-500">Loading appointments...</div>
            ) : todaysSchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments scheduled for today</div>
            ) : (
              todaysSchedule.map((appointment) => {
                const patientName = appointment.Patient 
                  ? `${appointment.Patient.firstName} ${appointment.Patient.lastName}`
                  : 'Unknown Patient';
                const patientInitial = appointment.Patient 
                  ? appointment.Patient.firstName.charAt(0)
                  : 'U';
                
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {patientInitial}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{patientName}</p>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {appointment.mode}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Calendar & Announcements */}
        <div className="space-y-6">
          {/* Google Calendar */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm2 4h10v2H7v-2z"/>
                </svg>
                Google Calendar
              </h3>
              <div className="flex items-center space-x-2">
                {isCalendarConnected && (
                  <a
                    href="/doctor/profile?tab=calendar"
                    className="text-xs px-2 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                  >
                    Add Event
                  </a>
                )}
                <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {!isCalendarConnected ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-sm mb-4">Connect Google Calendar to see your events</p>
                <a href="/doctor/profile" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                  Go to Profile → Calendar
                </a>
              </div>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-800 mb-4">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                    <div key={day} className="text-gray-500 font-medium text-xs py-2">{day}</div>
                  ))}
                  {getDaysInMonth(currentMonth).map((day, i) => {
                    const events = day ? getEventsForDay(day) : [];
                    const hasEvents = events.length > 0;
                    const today = day ? isToday(day) : false;
                    
                    return (
                      <div
                        key={i}
                        className={`min-h-[50px] p-1 rounded-lg relative ${
                          !day ? '' :
                          today ? 'bg-cyan-500 text-white font-bold' : 
                          'text-gray-700 hover:bg-gray-100 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (day && isCalendarConnected) {
                            window.location.href = '/doctor/profile?tab=calendar';
                          }
                        }}
                        title={hasEvents ? events.map(e => e.summary).join(', ') : (day && isCalendarConnected ? 'Click to add event' : '')}
                      >
                        {day && (
                          <>
                            <div className={today ? 'text-white' : ''}>{day}</div>
                            {hasEvents && (
                              <div className="flex justify-center mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  today ? 'bg-white' : 'bg-cyan-500'
                                }`}></div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Today's Events */}
                {calendarEvents.filter(event => {
                  const eventDate = new Date(event.start.dateTime || event.start.date);
                  const today = new Date();
                  return eventDate.toDateString() === today.toDateString();
                }).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Today's Events:</p>
                    {calendarEvents.filter(event => {
                      const eventDate = new Date(event.start.dateTime || event.start.date);
                      const today = new Date();
                      return eventDate.toDateString() === today.toDateString();
                    }).slice(0, 2).map((event, idx) => (
                      <div key={idx} className="p-2 bg-cyan-50 rounded-lg">
                        <p className="text-xs font-bold text-cyan-800">{event.summary}</p>
                        {event.start.dateTime && (
                          <p className="text-xs text-cyan-600">
                            {formatTime(event.start.dateTime)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Announcements</h3>
              <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                See more
              </button>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm shrink-0">
                    {announcement.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{announcement.author}</p>
                    <p className="text-xs text-gray-600 mt-1">{announcement.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
