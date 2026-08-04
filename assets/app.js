
(() => {
  const cfg = window.RAYZART_CONFIG || {};
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const brandSubline = document.querySelector(".brand small");
  if (brandSubline) brandSubline.textContent = "rayzartllc.com";

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("open", !open);
  });

  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  document.getElementById("year").textContent = new Date().getFullYear();

  // Prevent end dates before start dates.
  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");
  const trailerSelect = document.getElementById("trailer");
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  if (startDate) startDate.min = localToday;
  if (endDate) endDate.min = localToday;

  startDate?.addEventListener("change", () => {
    endDate.min = startDate.value || localToday;
    if (endDate.value && endDate.value < startDate.value) endDate.value = startDate.value;
    updateDateCheck();
  });

  endDate?.addEventListener("change", updateDateCheck);

  const availability = window.RAYZART_AVAILABILITY || { bookings: [] };
  const bookings = Array.isArray(availability.bookings) ? availability.bookings : [];
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");
  const calendarPrev = document.getElementById("calendar-prev");
  const calendarNext = document.getElementById("calendar-next");
  const calendarUpdated = document.getElementById("calendar-updated");
  const dateCheck = document.getElementById("date-check");
  const firstViewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastViewMonth = new Date(today.getFullYear(), today.getMonth() + 11, 1);
  let viewMonth = new Date(firstViewMonth);

  function dateToIso(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromIso(value) {
    const [year, month, day] = String(value || "").split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  function isDeckTrailer(trailer) {
    return trailer === "23 Deck Trailer" || trailer === "26 Deck Trailer";
  }

  function bookingApplies(booking, trailer, isoDate) {
    const trailerMatches = booking.trailer === trailer || (booking.trailer === "Deck Trailers" && isDeckTrailer(trailer));
    return trailerMatches && isoDate >= booking.start && isoDate <= booking.end;
  }

  function statusForDate(trailer, isoDate) {
    const matches = bookings.filter(booking => bookingApplies(booking, trailer, isoDate));
    if (matches.some(booking => booking.status === "booked" && booking.trailer === trailer)) return "booked";
    if (matches.some(booking => booking.status === "booked")) return "booked";
    if (matches.length) return "limited";
    return "open";
  }

  function bookingsForDate(isoDate) {
    return bookings.filter(booking => isoDate >= booking.start && isoDate <= booking.end);
  }

  function calendarBookingDetails(booking) {
    if (booking.trailer === "23 Deck Trailer") return { label: "23 Deck", className: "trailer-23" };
    if (booking.trailer === "26 Deck Trailer") return { label: "26 Deck", className: "trailer-26" };
    if (booking.trailer === "26 Dump Trailer") return { label: "26 Dump", className: "trailer-dump" };
    return { label: "Deck limited", className: "trailer-deck-limited" };
  }

  function statusForRange(trailer, start, end) {
    if (!isDeckTrailer(trailer) && trailer !== "26 Dump Trailer") return "unknown";
    if (!start || !end || end < start) return "unknown";
    let rangeStatus = "open";
    const cursor = dateFromIso(start);
    const finalDate = dateFromIso(end);
    for (let guard = 0; cursor <= finalDate && guard < 370; guard += 1) {
      const dayStatus = statusForDate(trailer, dateToIso(cursor));
      if (dayStatus === "booked") return "booked";
      if (dayStatus === "limited") rangeStatus = "limited";
      cursor.setDate(cursor.getDate() + 1);
    }
    return rangeStatus;
  }

  function updateDateCheck() {
    if (!dateCheck) return;
    const rangeStatus = statusForRange(trailerSelect?.value, startDate?.value, endDate?.value);
    dateCheck.className = "date-check";
    if (rangeStatus === "booked") {
      dateCheck.classList.add("booked");
      dateCheck.textContent = "These dates include a booked date for this trailer. You can still ask Rayzart about another date.";
    } else if (rangeStatus === "limited") {
      dateCheck.classList.add("limited");
      dateCheck.textContent = "Availability is limited on at least one selected date. Rayzart will check which deck trailer is open.";
    } else if (rangeStatus === "open") {
      dateCheck.classList.add("open");
      dateCheck.textContent = "No booking is currently shown for these dates. Rayzart will give the final confirmation.";
    } else {
      dateCheck.textContent = "Select a trailer and dates to check the calendar.";
    }
  }

  function renderCalendar() {
    if (!calendarGrid || !calendarMonth) return;
    const monthName = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    calendarMonth.textContent = monthName;
    calendarGrid.replaceChildren();

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
      const label = document.createElement("div");
      label.className = "calendar-weekday";
      label.textContent = day;
      label.setAttribute("role", "columnheader");
      calendarGrid.appendChild(label);
    });

    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    for (let blank = 0; blank < firstDay; blank += 1) {
      const spacer = document.createElement("div");
      spacer.className = "calendar-empty";
      spacer.setAttribute("aria-hidden", "true");
      calendarGrid.appendChild(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, 12);
      const isoDate = dateToIso(date);
      const dateBookings = bookingsForDate(isoDate);
      const isPast = isoDate < localToday;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `calendar-day${dateBookings.length ? " has-bookings" : ""}${isoDate === localToday ? " today" : ""}${isPast ? " past" : ""}`;
      button.disabled = isPast;

      const dateNumber = document.createElement("span");
      dateNumber.className = "calendar-date-number";
      dateNumber.textContent = String(day);
      button.appendChild(dateNumber);

      if (dateBookings.length) {
        const eventList = document.createElement("span");
        eventList.className = "calendar-events";
        dateBookings.forEach(booking => {
          const details = calendarBookingDetails(booking);
          const eventLabel = document.createElement("span");
          eventLabel.className = `calendar-booking ${details.className}`;
          eventLabel.textContent = details.label;
          eventList.appendChild(eventLabel);
        });
        button.appendChild(eventList);
      }

      const spokenStatus = dateBookings.length
        ? dateBookings.map(booking => `${calendarBookingDetails(booking).label} booked`).join(", ")
        : "No booking shown";
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", `${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}: ${spokenStatus}`);
      button.addEventListener("click", () => {
        if (startDate) startDate.value = isoDate;
        if (endDate) {
          endDate.min = isoDate;
          endDate.value = isoDate;
        }
        updateDateCheck();
        document.getElementById("availability-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      calendarGrid.appendChild(button);
    }

    if (calendarPrev) calendarPrev.disabled = viewMonth <= firstViewMonth;
    if (calendarNext) calendarNext.disabled = viewMonth >= lastViewMonth;
  }

  if (calendarUpdated && availability.updated) {
    calendarUpdated.textContent = dateFromIso(availability.updated).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  calendarPrev?.addEventListener("click", () => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  calendarNext?.addEventListener("click", () => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  trailerSelect?.addEventListener("change", () => {
    updateDateCheck();
  });

  renderCalendar();

  // Trailer card buttons populate the availability form.
  document.querySelectorAll(".select-trailer").forEach(link => {
    link.addEventListener("click", () => {
      const select = document.getElementById("trailer");
      if (select) {
        select.value = link.dataset.trailer || "";
        select.dispatchEvent(new Event("change"));
      }
    });
  });

  function cleanPhone(value) {
    return String(value || "").replace(/[^\d+]/g, "");
  }

  function isLikelyMobileDevice() {
    const userAgent = navigator.userAgent || "";
    const isAppleTouchDevice = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent) || isAppleTouchDevice;
  }

  const smsCapable = isLikelyMobileDevice();

  function wireContactLinks() {
    const phone = cleanPhone(cfg.publicPhone);
    const email = String(cfg.publicEmail || "").trim();
    const note = document.getElementById("contact-note");

    document.querySelectorAll(".contact-link").forEach(link => {
      const type = link.dataset.contact;
      if (phone && type === "call") link.href = `tel:${phone}`;
      else if (phone && type === "text") {
        if (smsCapable) link.href = `sms:${phone}`;
        else {
          link.href = "#contact";
          link.title = `Text Rayzart at ${cfg.publicPhone} from your phone`;
          if (link.textContent.trim().toLowerCase().startsWith("text")) {
            link.textContent = `Text ${cfg.publicPhone}`;
          }
        }
      }
      else if (email && type === "email") link.href = `mailto:${email}`;
      else link.href = "#contact";
    });

    if (note && (phone || email)) {
      const contactMethods = [];
      if (phone) contactMethods.push(`Call or text ${cfg.publicPhone}`);
      if (email) contactMethods.push(`Email ${email}`);
      note.textContent = contactMethods.join(" • ");
    }
  }
  wireContactLinks();

  // Request builder. It never claims dates are available.
  const form = document.getElementById("availability-form");
  const status = document.getElementById("form-status");

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const calendarStatus = statusForRange(data.get("trailer"), data.get("startDate"), data.get("endDate"));
    const calendarSummary = calendarStatus === "booked" ? "Booked date shown" : calendarStatus === "limited" ? "Limited date shown" : "No booking shown — confirmation required";
    const request = [
      `Rayzart availability request`,
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Trailer: ${data.get("trailer")}`,
      `Dates: ${data.get("startDate")} through ${data.get("endDate")}`,
      `Website calendar: ${calendarSummary}`,
      `Project: ${data.get("project") || "Not provided"}`
    ].join("\n");

    const phone = cleanPhone(cfg.publicPhone);
    if (phone && smsCapable) {
      window.location.href = `sms:${phone}?&body=${encodeURIComponent(request)}`;
      status.textContent = "Your text message is ready. Sending it does not confirm the reservation.";
      return;
    }

    const desktopRequest = `${request}\n\nSend to Rayzart at ${cfg.publicPhone}`;
    try {
      await navigator.clipboard.writeText(desktopRequest);
      status.textContent = `Request copied. Send it by text to ${cfg.publicPhone}.`;
    } catch {
      status.textContent = `Request prepared. Send it by text to ${cfg.publicPhone}.`;
    }
  });
})();
