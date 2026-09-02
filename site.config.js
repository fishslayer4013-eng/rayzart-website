window.RAYZART_CONFIG = {
  businessName: "Rayzart Diversified Services LLC",
  shortName: "Rayzart",
  publicPhone: "208-691-2496",
  publicEmail: "bill@rayzartllc.com",
  websiteUrl: "https://rayzartllc.com",
  pickupLocation: "Hauser, Idaho",
  serviceArea: "North Idaho & the Spokane Area"
};

// Availability is business-critical and changes often. Always load a fresh copy.
// The existing availability-data.js tag in index.html is kept as a fallback,
// but it is prevented from overwriting the fresh copy if a browser cached it.
(() => {
  let availabilityValue;
  let firstAvailabilityAssignment = true;
  window.RAYZART_AVAILABILITY_FRESH = false;

  try {
    Object.defineProperty(window, "RAYZART_AVAILABILITY", {
      configurable: true,
      get() {
        return availabilityValue;
      },
      set(value) {
        if (!firstAvailabilityAssignment) return;
        availabilityValue = value;
        firstAvailabilityAssignment = false;
      }
    });
  } catch {
    // If an older browser cannot install the guard, the fresh request below still runs.
  }

  const freshAvailabilityUrl = `availability-data.js?fresh=${Date.now()}`;
  document.write(
    `<script src="${freshAvailabilityUrl}" ` +
    `onload="window.RAYZART_AVAILABILITY_FRESH=true" ` +
    `onerror="window.RAYZART_AVAILABILITY_FRESH=false"><\/script>`
  );

  // Never silently present possibly stale availability if the fresh request fails.
  window.addEventListener("DOMContentLoaded", () => {
    if (window.RAYZART_AVAILABILITY_FRESH) return;

    const calendarMonth = document.getElementById("calendar-month");
    const calendarGrid = document.getElementById("calendar-grid");
    const calendarUpdated = document.getElementById("calendar-updated");
    const dateCheck = document.getElementById("date-check");
    const form = document.getElementById("availability-form");
    const submitButton = form?.querySelector('button[type="submit"]');

    if (calendarMonth) calendarMonth.textContent = "Live availability unavailable";
    if (calendarUpdated) calendarUpdated.textContent = "Live check unavailable";

    if (calendarGrid) {
      const warning = document.createElement("div");
      warning.className = "availability-load-warning";
      warning.setAttribute("role", "status");
      warning.style.gridColumn = "1 / -1";
      warning.style.padding = "20px";
      warning.style.textAlign = "center";
      warning.textContent = "Live availability could not refresh. Please text Rayzart to confirm your dates.";
      calendarGrid.replaceChildren(warning);
    }

    if (dateCheck) {
      dateCheck.className = "date-check";
      dateCheck.textContent = "Live availability could not refresh. Text Rayzart to confirm your dates.";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.title = "Live availability must refresh before using the request form.";
    }
  }, { once: true });
})();

// Keep Google's page information tied to the public Rayzart domain.
(() => {
  const publicUrl = "https://rayzartllc.com/";

  document.querySelector('link[rel="canonical"]')?.setAttribute("href", publicUrl);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", publicUrl);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", `${publicUrl}assets/images/rayzart-social.webp`);

  const businessData = document.querySelector('script[type="application/ld+json"]');
  if (!businessData) return;

  try {
    const details = JSON.parse(businessData.textContent || "{}");
    details["@id"] = `${publicUrl}#business`;
    details.url = publicUrl;
    businessData.textContent = JSON.stringify(details);
  } catch {
    // Leave the existing business information in place if it cannot be read.
  }
})();

// Load the customer review carousel without changing the large page file.
(() => {
  const reviewScript = document.createElement("script");
  reviewScript.src = "assets/reviews-carousel.js?v=20260824-1";
  reviewScript.async = false;
  document.head.appendChild(reviewScript);
})();

// Keep public trailer names tied to the matching website calendar colors.
(() => {
  const trailerLabelScript = document.createElement("script");
  trailerLabelScript.src = "assets/trailer-public-labels.js?v=20260901-1";
  trailerLabelScript.async = false;
  document.head.appendChild(trailerLabelScript);
})();

// Keep unavailable trailers visible while preventing customer requests.
(() => {
  const trailerStatusScript = document.createElement("script");
  trailerStatusScript.src = "assets/trailer-status.js?v=20260824-1";
  trailerStatusScript.async = false;
  document.head.appendChild(trailerStatusScript);
})();

// Apply the approved trailer badge positions/colors as an isolated cosmetic layer.
(() => {
  const badgeStyles = document.createElement("link");
  badgeStyles.rel = "stylesheet";
  badgeStyles.href = "assets/trailer-badge-layout.css?v=20260901-1";
  document.head.appendChild(badgeStyles);
})();
