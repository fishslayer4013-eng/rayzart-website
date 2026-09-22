(function () {
  const data = {
    updated: "2026-09-22",
    bookings: [
      { trailer: "23 Deck Trailer", start: "2026-09-04", end: "2026-09-04", status: "completed" },
      { trailer: "26 Dump Trailer", start: "2026-09-04", end: "2026-09-05", status: "booked" },
      { trailer: "23 Deck Trailer", start: "2026-09-05", end: "2026-09-06", status: "completed" },
      { trailer: "26 Deck Trailer", start: "2026-09-06", end: "2026-09-07", status: "completed" },
      { trailer: "23 Deck Trailer", start: "2026-09-06", end: "2026-09-06", status: "completed" },
      { trailer: "23 Deck Trailer", start: "2026-09-11", end: "2026-09-12", status: "completed" },
      { trailer: "26 Dump Trailer", start: "2026-09-14", end: "2026-09-20", status: "completed" },
      { trailer: "23 Deck Trailer", start: "2026-09-17", end: "2026-09-18", status: "completed" },
      { trailer: "26 Dump Trailer", start: "2026-09-21", end: "2026-09-21", status: "completed" },
      { trailer: "23 Deck Trailer", start: "2026-09-21", end: "2026-09-22", status: "booked" },
      { trailer: "23 Deck Trailer", start: "2026-09-23", end: "2026-09-24", status: "booked" },
      { trailer: "23 Deck Trailer", start: "2026-09-26", end: "2026-09-27", status: "booked" }
    ]
  };

  // site.config.js requests this file with ?fresh=<timestamp> and index.html also
  // keeps a fallback copy. Some mobile browsers can finish those two requests in
  // the opposite order. A fresh response must always win, regardless of load order.
  const scriptSrc = (document.currentScript && document.currentScript.src) || "";
  const isFreshRequest = scriptSrc.indexOf("fresh=") !== -1;

  if (isFreshRequest) {
    try {
      Object.defineProperty(window, "RAYZART_AVAILABILITY", {
        configurable: true,
        writable: true,
        value: data
      });
    } catch {
      window.RAYZART_AVAILABILITY = data;
    }
    window.RAYZART_AVAILABILITY_FRESH_DATA = true;
  } else if (!window.RAYZART_AVAILABILITY_FRESH_DATA) {
    window.RAYZART_AVAILABILITY = data;
  }

  if (document.getElementById("rayzart-calendar-sizing")) return;
  var style = document.createElement("style");
  style.id = "rayzart-calendar-sizing";
  style.textContent = [
    ".calendar-booking{font-size:0;padding:3px 1px}",
    ".calendar-booking.trailer-23::after{content:\"T1 BOOKED\";font-size:.50rem}",
    ".calendar-booking.trailer-26::after{content:\"T2 BOOKED\";font-size:.50rem}",
    ".calendar-booking.trailer-dump::after{content:\"DUMP BOOKED\";font-size:.50rem}",
    ".calendar-booking.past-rental{background:#e7ebef!important;color:#68737e!important;border:1px solid #d5dbe1;box-shadow:none;opacity:.72}",
    ".calendar-booking.past-rental.trailer-23::after{content:\"T1 RENTED\"}",
    ".calendar-booking.past-rental.trailer-26::after{content:\"T2 RENTED\"}",
    ".calendar-booking.past-rental.trailer-dump::after{content:\"DUMP RENTED\"}",
    ".calendar-legend .legend-past{background:#d5dbe1;border:1px solid #c5ccd3}",
    "@media(max-width:680px){.calendar-booking.trailer-23::after,.calendar-booking.trailer-26::after,.calendar-booking.trailer-dump::after{font-size:.44rem}}"
  ].join("");
  document.head.appendChild(style);
})();