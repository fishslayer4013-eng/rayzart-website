(function () {
  var availability = window.RAYZART_AVAILABILITY || { updated: "", bookings: [] };
  if (!Array.isArray(availability.bookings)) availability.bookings = [];
  window.RAYZART_AVAILABILITY = availability;

  var FEED_URL = "https://script.google.com/macros/s/AKfycbzz0xo1Cla7CKNwF5t1fnnwboCTvgfc2QleLdAlTMwYzwM3XwwbKB6bOButBQw9qIbC_Q/exec";
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

  function clearSyncWarning() {
    var warning = document.getElementById("availability-sync-warning");
    if (warning) warning.remove();
  }

  function showSyncWarning() {
    var grid = document.getElementById("calendar-grid");
    if (!grid || document.getElementById("availability-sync-warning")) return;
    var warning = document.createElement("div");
    warning.id = "availability-sync-warning";
    warning.setAttribute("role", "status");
    warning.style.cssText = "margin:10px 0;padding:10px 12px;border-radius:8px;background:#fff4e5;border:1px solid #d97706;color:#7c2d12;font-weight:700";
    warning.textContent = "Live availability sync is temporarily unavailable. Please call or text Rayzart to confirm dates.";
    grid.parentNode.insertBefore(warning, grid);
  }

  function applyLiveAvailability() {
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
      var parsed = new Date(availability.updated);
      if (!Number.isNaN(parsed.getTime())) {
        updated.textContent = parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }
  }

  function scheduleApply() {
    applyLiveAvailability();
    setTimeout(applyLiveAvailability, 50);
    setTimeout(applyLiveAvailability, 250);
    setTimeout(applyLiveAvailability, 1000);
  }

  async function refreshFromRbms() {
    try {
      var response = await fetch(FEED_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var payload = await response.json();
      if (!payload || payload.ok !== true || !Array.isArray(payload.bookings)) {
        throw new Error("Unexpected feed response");
      }

      availability.bookings.splice(0, availability.bookings.length);
      payload.bookings.forEach(function (booking) {
        availability.bookings.push(booking);
      });
      availability.updated = payload.updated || "";
      clearSyncWarning();
      scheduleApply();
    } catch (error) {
      console.error("Rayzart availability sync failed", error);
      showSyncWarning();
      scheduleApply();
    }
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
  refreshFromRbms();
})();
