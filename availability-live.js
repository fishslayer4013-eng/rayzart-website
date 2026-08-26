window.RAYZART_AVAILABILITY = {
  updated: "2026-08-26",
  bookings: [
    {
      trailer: "26 Dump Trailer",
      start: "2026-08-22",
      end: "2026-09-20",
      status: "booked"
    }
  ]
};

(function () {
  var availability = window.RAYZART_AVAILABILITY;
  var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function detailsFor(trailer) {
    if (trailer === "23 Deck Trailer") return { label: "T1 BOOKED", className: "trailer-23" };
    if (trailer === "26 Deck Trailer") return { label: "T2 BOOKED", className: "trailer-26" };
    if (trailer === "26 Dump Trailer") return { label: "DUMP BOOKED", className: "trailer-dump" };
    return { label: "BOOKED", className: "trailer-deck-limited" };
  }

  function installStyle() {
    if (document.getElementById("rayzart-live-calendar-style")) return;
    var style = document.createElement("style");
    style.id = "rayzart-live-calendar-style";
    style.textContent = ".calendar-day{min-height:100px}.calendar-empty{min-height:100px}.calendar-events{display:flex;flex-direction:column;gap:3px;margin-top:8px}.calendar-booking{display:block;border-radius:5px;padding:3px 2px;color:#fff;font-size:.48rem;line-height:1.05;font-weight:900;text-align:center}.calendar-booking.trailer-23{background:#1768c5}.calendar-booking.trailer-26{background:#b85c00}.calendar-booking.trailer-dump{background:#187653}.calendar-booking.trailer-deck-limited{background:#6a4ca3}@media(max-width:680px){.calendar-day{min-height:92px!important}.calendar-empty{min-height:92px!important}.calendar-booking{font-size:.43rem!important}}";
    document.head.appendChild(style);
  }

  function applyLiveAvailability() {
    installStyle();

    var monthLabel = document.getElementById("calendar-month");
    var grid = document.getElementById("calendar-grid");
    if (!monthLabel || !grid) return;

    var parts = monthLabel.textContent.trim().split(/\s+/);
    if (parts.length < 2) return;
    var monthIndex = monthNames.indexOf(parts[0]);
    var year = Number(parts[1]);
    if (monthIndex < 0 || !year) return;

    var buttons = grid.querySelectorAll("button.calendar-day");
    buttons.forEach(function (button) {
      var numberEl = button.querySelector(".calendar-date-number");
      if (!numberEl) return;
      var day = Number(numberEl.textContent);
      if (!day) return;

      var iso = year + "-" + pad(monthIndex + 1) + "-" + pad(day);
      var matches = availability.bookings.filter(function (booking) {
        return booking.status === "booked" && iso >= booking.start && iso <= booking.end;
      });

      var oldEvents = button.querySelector(".calendar-events");
      if (oldEvents) oldEvents.remove();

      if (matches.length) {
        button.classList.add("has-bookings");
        var eventList = document.createElement("span");
        eventList.className = "calendar-events";
        matches.forEach(function (booking) {
          var details = detailsFor(booking.trailer);
          var eventLabel = document.createElement("span");
          eventLabel.className = "calendar-booking " + details.className;
          eventLabel.textContent = details.label;
          eventList.appendChild(eventLabel);
        });
        button.appendChild(eventList);
      } else {
        button.classList.remove("has-bookings");
      }
    });

    var updated = document.getElementById("calendar-updated");
    if (updated && availability.updated) {
      var d = new Date(availability.updated + "T12:00:00");
      updated.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  }

  function scheduleApply() {
    applyLiveAvailability();
    setTimeout(applyLiveAvailability, 50);
    setTimeout(applyLiveAvailability, 250);
    setTimeout(applyLiveAvailability, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
  } else {
    scheduleApply();
  }

  var observerStarted = false;
  function startObserver() {
    if (observerStarted) return;
    var grid = document.getElementById("calendar-grid");
    if (!grid) {
      setTimeout(startObserver, 100);
      return;
    }
    observerStarted = true;
    var observer = new MutationObserver(function () {
      setTimeout(applyLiveAvailability, 0);
    });
    observer.observe(grid, { childList: true });
  }
  startObserver();
})();
