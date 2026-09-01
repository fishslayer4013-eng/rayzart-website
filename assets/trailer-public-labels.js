(() => {
  const units = [
    {
      internalName: "23 Deck Trailer",
      publicName: "Trailer 1",
      color: "#1768c5",
      bookingClass: "trailer-23"
    },
    {
      internalName: "26 Deck Trailer",
      publicName: "Trailer 2",
      color: "#b85c00",
      bookingClass: "trailer-26"
    }
  ];

  const sharedDescription = "One of two identical 26-foot tilt-deck trailers. Both have the same dimensions, load capacity, 12,000-lb winch and towing requirements.";

  function publicNameFor(value) {
    return units.find(unit => unit.internalName === value)?.publicName || value;
  }

  function applyCardLabels() {
    const specLists = [];

    units.forEach(unit => {
      const requestLink = document.querySelector(`.select-trailer[data-trailer="${unit.internalName}"]`);
      const card = requestLink?.closest(".trailer-card");
      if (!card) return;

      const title = card.querySelector("h3");
      if (title) {
        title.textContent = unit.publicName;
        title.style.color = unit.color;
      }

      const description = card.querySelector(".card-body > p");
      if (description) description.textContent = sharedDescription;

      const badge = card.querySelector(".badge");
      if (badge) badge.textContent = "Matching 26-foot tilt deck";

      const specList = card.querySelector(".spec-list");
      if (specList) specLists.push(specList);

      requestLink.innerHTML = `Request ${unit.publicName} <span>→</span>`;
      requestLink.style.color = unit.color;
      requestLink.setAttribute("aria-label", `Request ${unit.publicName}`);
    });

    if (specLists.length === 2) specLists[1].innerHTML = specLists[0].innerHTML;
  }

  function applyFormLabels() {
    const select = document.getElementById("trailer");
    if (!select) return;

    units.forEach(unit => {
      const option = Array.from(select.options).find(item => item.value === unit.internalName);
      if (option) option.textContent = unit.publicName;
    });
  }

  function applyLegendLabels() {
    const legend = document.querySelector(".calendar-legend");
    if (!legend) return;

    const trailer1 = legend.querySelector(".legend-23")?.closest("span");
    const trailer2 = legend.querySelector(".legend-26")?.closest("span");
    const dump = legend.querySelector(".legend-dump")?.closest("span");

    if (trailer1) trailer1.innerHTML = '<i class="legend-23"></i>Blue — Trailer 1 booked';
    if (trailer2) trailer2.innerHTML = '<i class="legend-26"></i>Orange — Trailer 2 booked';
    if (dump) dump.innerHTML = '<i class="legend-dump"></i>Green — Dump Trailer booked';
  }

  function applyCalendarLabels() {
    units.forEach(unit => {
      document.querySelectorAll(`.calendar-booking.${unit.bookingClass}`).forEach(label => {
        if (label.textContent !== unit.publicName) label.textContent = unit.publicName;
      });
    });

    document.querySelectorAll(".calendar-day[aria-label]").forEach(day => {
      const current = day.getAttribute("aria-label") || "";
      const next = current
        .replaceAll("23 Deck", "Trailer 1")
        .replaceAll("26 Deck", "Trailer 2")
        .replaceAll("26 Dump", "Dump Trailer");
      if (next !== current) day.setAttribute("aria-label", next);
    });
  }

  function wireCalendarNavigation() {
    ["calendar-prev", "calendar-next"].forEach(id => {
      const button = document.getElementById(id);
      if (!button || button.dataset.publicLabelWired === "1") return;
      button.dataset.publicLabelWired = "1";
      button.addEventListener("click", () => {
        setTimeout(applyCalendarLabels, 0);
        setTimeout(applyCalendarLabels, 50);
      });
    });
  }

  function isLikelyMobileDevice() {
    const userAgent = navigator.userAgent || "";
    const isAppleTouchDevice = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent) || isAppleTouchDevice;
  }

  function cleanPhone(value) {
    return String(value || "").replace(/[^\d+]/g, "");
  }

  function statusForRange(physicalTrailer, start, end) {
    if (!physicalTrailer || !start || !end || end < start) return "unknown";
    const bookings = Array.isArray(window.RAYZART_AVAILABILITY?.bookings)
      ? window.RAYZART_AVAILABILITY.bookings
      : [];
    const isDeck = physicalTrailer === "23 Deck Trailer" || physicalTrailer === "26 Deck Trailer";
    let rangeStatus = "open";
    const cursor = new Date(`${start}T12:00:00`);
    const finalDate = new Date(`${end}T12:00:00`);

    for (let guard = 0; cursor <= finalDate && guard < 370; guard += 1) {
      const isoDate = [
        cursor.getFullYear(),
        String(cursor.getMonth() + 1).padStart(2, "0"),
        String(cursor.getDate()).padStart(2, "0")
      ].join("-");

      const matches = bookings.filter(booking => {
        const trailerMatches = booking.trailer === physicalTrailer || (booking.trailer === "Deck Trailers" && isDeck);
        return trailerMatches && isoDate >= booking.start && isoDate <= booking.end;
      });

      if (matches.some(booking => booking.status === "booked")) return "booked";
      if (matches.length) rangeStatus = "limited";
      cursor.setDate(cursor.getDate() + 1);
    }

    return rangeStatus;
  }

  function replaceFormSubmission() {
    const form = document.getElementById("availability-form");
    const status = document.getElementById("form-status");
    if (!form || !status || form.dataset.publicTrailerHandler === "true") return;

    form.dataset.publicTrailerHandler = "true";
    form.addEventListener("submit", async event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const data = new FormData(form);
      const physicalTrailer = String(data.get("trailer") || "");
      const rangeStatus = statusForRange(
        physicalTrailer,
        String(data.get("startDate") || ""),
        String(data.get("endDate") || "")
      );
      const calendarSummary = rangeStatus === "booked"
        ? "Booked date shown"
        : rangeStatus === "limited"
          ? "Limited date shown"
          : "No booking shown — confirmation required";

      const request = [
        "Rayzart availability request",
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Trailer: ${publicNameFor(physicalTrailer)}`,
        `Dates: ${data.get("startDate")} through ${data.get("endDate")}`,
        `Website calendar: ${calendarSummary}`,
        `Project: ${data.get("project") || "Not provided"}`
      ].join("\n");

      const phone = cleanPhone(window.RAYZART_CONFIG?.publicPhone);
      if (phone && isLikelyMobileDevice()) {
        window.location.href = `sms:${phone}?&body=${encodeURIComponent(request)}`;
        status.textContent = "Your text message is ready. Sending it does not confirm the reservation.";
        return;
      }

      const desktopRequest = `${request}\n\nSend to Rayzart at ${window.RAYZART_CONFIG?.publicPhone || "208-691-2496"}`;
      try {
        await navigator.clipboard.writeText(desktopRequest);
        status.textContent = `Request copied. Send it by text to ${window.RAYZART_CONFIG?.publicPhone || "208-691-2496"}.`;
      } catch {
        status.textContent = `Request prepared. Send it by text to ${window.RAYZART_CONFIG?.publicPhone || "208-691-2496"}.`;
      }
    }, true);
  }

  function initPublicTrailerLabels() {
    applyCardLabels();
    applyFormLabels();
    applyLegendLabels();
    applyCalendarLabels();
    wireCalendarNavigation();
    replaceFormSubmission();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPublicTrailerLabels, { once: true });
  } else {
    initPublicTrailerLabels();
  }
})();
