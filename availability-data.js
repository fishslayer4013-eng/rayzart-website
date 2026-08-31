window.RAYZART_AVAILABILITY = {
  updated: "2026-08-31",
  bookings: [
    { trailer: "26 Dump Trailer", start: "2026-08-22", end: "2026-09-21", status: "booked" },
    { trailer: "23 Deck Trailer", start: "2026-09-03", end: "2026-09-04", status: "booked" }
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
    "@media(max-width:680px){.calendar-day{min-height:104px!important}.calendar-empty{min-height:104px!important}.calendar-booking.trailer-23::after,.calendar-booking.trailer-26::after,.calendar-booking.trailer-dump::after{font-size:.44rem}}"
  ].join("");
  document.head.appendChild(style);
})();

(function () {
  if (document.getElementById("rayzart-rbms-sync")) return;
  var script = document.createElement("script");
  script.id = "rayzart-rbms-sync";
  script.src = "availability-live.js?v=20260831-rbms1";
  script.async = true;
  document.head.appendChild(script);
})();
