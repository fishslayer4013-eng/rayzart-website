/* Rental times are Hauser/Pacific wall times, independent of the visitor's zone. */
(function (root) {
  "use strict";
  const TIME_ZONE = "America/Los_Angeles";
  const DAY = 86400000;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });
  function parts(ms) {
    return Object.fromEntries(formatter.formatToParts(new Date(ms))
      .filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
  }
  function dateInPacific(ms = Date.now()) {
    const p = parts(ms);
    return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  }
  // A DST gap has no match; a repeated hour has two. Neither may be guessed.
  function wallTime(date, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !/^\d{2}:\d{2}$/.test(time || "")) return null;
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    if (hour > 23 || minute > 59) return null;
    const naive = Date.UTC(year, month - 1, day, hour, minute);
    const offsets = new Set([-DAY, 0, DAY].map(delta => {
      const ms = naive + delta, p = parts(ms);
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms;
    }));
    const matches = [...offsets].map(offset => naive - offset).filter(ms => {
      const p = parts(ms);
      return p.year === year && p.month === month && p.day === day && p.hour === hour && p.minute === minute;
    });
    return matches.length === 1 ? matches[0] : null;
  }
  function nextDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return null;
    const [y, m, d] = date.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  }
  function instant(value) {
    if (!/T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value || "")) return null;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  function bounds(booking, ongoing = true) {
    const exactStart = instant(booking.startAt), exactEnd = instant(booking.endAt);
    const start = exactStart ?? wallTime(booking.start, "00:00");
    let end = exactEnd ?? wallTime(nextDate(booking.end || booking.start), "00:00");
    if (ongoing && ["On Rent", "Inspection Pending"].includes(booking.rentalState)) end = Infinity;
    if (start === null || end === null || end <= start) return null;
    return { start, end };
  }
  function overlaps(a, b) { return a.start < b.end && a.end > b.start; }
  function matchesTrailer(booking, trailer) {
    return booking.trailer === trailer || (booking.trailer === "Deck Trailers" &&
      ["23 Deck Trailer", "26 Deck Trailer"].includes(trailer));
  }
  function requestWindow(startDate, pickupTime, endDate, returnTime) {
    if (!startDate || !pickupTime || !endDate || !returnTime)
      return { status: "unknown", reason: "Select pickup and return dates and times. All times are Pacific." };
    const start = wallTime(startDate, pickupTime), end = wallTime(endDate, returnTime);
    if (start === null || end === null)
      return { status: "invalid", reason: "This time is invalid or falls in a daylight-saving clock change. Choose another time or contact Rayzart." };
    if (end <= start)
      return { status: "invalid", reason: "Return must be after pickup." };
    if (end - start > 366 * DAY)
      return { status: "invalid", reason: "For a rental longer than a year, contact Rayzart." };
    return { status: "valid", start, end };
  }
  function check(trailer, startDate, pickupTime, endDate, returnTime, records) {
    const requested = requestWindow(startDate, pickupTime, endDate, returnTime);
    if (requested.status !== "valid") return requested;
    if (!["23 Deck Trailer", "26 Deck Trailer", "26 Dump Trailer"].includes(trailer))
      return { ...requested, status: "unknown", reason: "Rayzart will help choose a trailer and confirm these times." };
    const bookings = records ?? root.RAYZART_AVAILABILITY?.bookings;
    if (!Array.isArray(bookings))
      return { ...requested, status: "unknown", reason: "Availability could not load. Contact Rayzart to confirm these times." };
    let limited = false;
    for (const booking of bookings) {
      if (!matchesTrailer(booking, trailer) || booking.status === "completed" || booking.rentalState === "Released") continue;
      const occupied = bounds(booking);
      if (!occupied) { limited = true; continue; }
      if (!overlaps(requested, occupied)) continue;
      if (booking.rentalState === "Inspection Pending") limited = true;
      else if (booking.status === "booked") return { ...requested, status: "booked" };
      else limited = true;
    }
    return { ...requested, status: limited ? "limited" : "open" };
  }
  function onDate(booking, date) {
    const start = wallTime(date, "00:00"), end = wallTime(nextDate(date), "00:00");
    // Returned bookings are history; readiness flags apply from today's date onward.
    const ongoing = date >= dateInPacific() && booking.status !== "completed";
    const occupied = bounds(booking, ongoing);
    return start !== null && end !== null && occupied ? overlaps({ start, end }, occupied)
      : date >= booking.start && date <= (booking.end || booking.start);
  }
  function summary(status) {
    return status === "booked" ? "Conflicting rental time shown"
      : status === "limited" ? "Availability or readiness needs Rayzart confirmation"
      : status === "open" ? "No conflicting booking shown — confirmation required"
      : "Rayzart confirmation required";
  }
  root.RAYZART_TIMES = { timeZone: TIME_ZONE, wallTime, dateInPacific, requestWindow, check, onDate, summary };
  if (typeof module !== "undefined" && module.exports) module.exports = root.RAYZART_TIMES;
})(typeof window !== "undefined" ? window : globalThis);
