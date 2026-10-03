import {
  refreshAccessToken,
  setCredentials,
} from './googleCalendar.js';

export const getDoctorCalendarAuth = async (doctor) => {
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  if (!doctor.googleCalendarConnected) {
    throw new Error('Google Calendar not connected');
  }

  if (!doctor.googleCalendarRefreshToken) {
    throw new Error('Google Calendar refresh token not found. Please reconnect your Google Calendar.');
  }

  let accessToken = doctor.googleCalendarAccessToken;
  let expiryDate = doctor.googleCalendarTokenExpiry
    ? new Date(doctor.googleCalendarTokenExpiry).getTime()
    : 0;

  const expired = !accessToken || !expiryDate || Date.now() >= expiryDate - 60_000;

  if (expired) {
    const newTokens = await refreshAccessToken(doctor.googleCalendarRefreshToken);

    accessToken = newTokens.access_token || accessToken;
    expiryDate = newTokens.expiry_date || expiryDate;

    await doctor.update({
      googleCalendarAccessToken: accessToken,
      googleCalendarRefreshToken: newTokens.refresh_token || doctor.googleCalendarRefreshToken,
      googleCalendarTokenExpiry: expiryDate ? new Date(expiryDate) : doctor.googleCalendarTokenExpiry,
      googleCalendarConnected: true,
    });
  }

  return setCredentials({
    access_token: accessToken,
    refresh_token: doctor.googleCalendarRefreshToken,
    expiry_date: expiryDate,
  });
};

export default {
  getDoctorCalendarAuth,
};
