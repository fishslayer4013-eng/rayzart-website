window.RAYZART_AVAILABILITY = {
  updated: "2026-09-02",
  bookings: [
    { trailer: "23 Deck Trailer", start: "2026-09-02", end: "2026-09-03", status: "booked" },
    { trailer: "26 Deck Trailer", start: "2026-09-03", end: "2026-09-04", status: "booked" }
  ]
};

(function () {
  if (document.getElementById("rayzart-calendar-sizing")) return;
  var style = document.createElement("style");
  style.id = "rayzart-calendar-sizing";
  style.textContent = [
    ".calendar-day{min-height:112px}",
    ".calendar-empty{min-height:112px}",
    ".calendar-booking{font-size:0;padding:3px 1px}",
    ".calendar-booking.trailer-23::after{content:\"T1 BOOKED\";font-size:.50rem}",
    ".calendar-booking.trailer-26::after{content:\"T2 BOOKED\";font-size:.50rem}",
    ".calendar-booking.trailer-dump::after{content:\"DUMP BOOKED\";font-size:.50rem}",
    ".calendar-booking.past-rental{background:#e7ebef!important;color:#68737e!important;border:1px solid #d5dbe1;box-shadow:none;opacity:.72}",
    ".calendar-booking.past-rental.trailer-23::after{content:\"T1 RENTED\"}",
    ".calendar-booking.past-rental.trailer-26::after{content:\"T2 RENTED\"}",
    ".calendar-booking.past-rental.trailer-dump::after{content:\"DUMP RENTED\"}",
    ".calendar-legend .legend-past{background:#d5dbe1;border:1px solid #c5ccd3}",
    "@media(max-width:680px){.calendar-day{min-height:104px!important}.calendar-empty{min-height:104px!important}.calendar-booking.trailer-23::after,.calendar-booking.trailer-26::after,.calendar-booking.trailer-dump::after{font-size:.44rem}}"
  ].join("");
  document.head.appendChild(style);
})();