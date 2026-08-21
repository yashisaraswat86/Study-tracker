const TIMEZONE = "Asia/Kolkata";

// =====================================
// Get today's date in YYYY-MM-DD
// =====================================
const getTodayString = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

// =====================================
// Get date string from a Date
// =====================================
const getDateString = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

// =====================================
// Get timezone
// =====================================
const getTimezone = () => TIMEZONE;

module.exports = {
  TIMEZONE,
  getTodayString,
  getDateString,
  getTimezone,
};