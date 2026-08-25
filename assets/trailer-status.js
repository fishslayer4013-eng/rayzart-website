(() => {
  const applyTrailerStatus = () => {
    const availability = window.RAYZART_AVAILABILITY || {};
    const unavailable = new Set(availability.unavailableTrailers || []);
    const dumpName = "26 Dump Trailer";

    if (!unavailable.has(dumpName)) return;

    const card = document.querySelector("#dump-trailer");
    if (card && !card.querySelector(".trailer-unavailable-badge")) {
      const badge = document.createElement("div");
      badge.className = "trailer-unavailable-badge";
      badge.textContent = "Currently unavailable";
      card.prepend(badge);
    }

    const requestLink = document.querySelector('.select-trailer[data-trailer="26 Dump Trailer"]');
    if (requestLink) {
      const disabled = document.createElement("span");
      disabled.className = `${requestLink.className} trailer-unavailable-link`;
      disabled.textContent = "Currently unavailable";
      disabled.setAttribute("aria-disabled", "true");
      requestLink.replaceWith(disabled);
    }

    const trailerSelect = document.querySelector("#trailer");
    if (trailerSelect) {
      const option = Array.from(trailerSelect.options).find(
        (item) => item.value === dumpName || item.textContent.trim() === dumpName
      );
      if (option) {
        option.disabled = true;
        option.textContent = "26 Dump Trailer — Currently unavailable";
      }
      if (trailerSelect.value === dumpName) trailerSelect.value = "";
    }
  };

  const style = document.createElement("style");
  style.textContent = `
    .trailer-unavailable-badge {
      display: inline-block;
      margin: 0 0 0.75rem;
      padding: 0.4rem 0.7rem;
      border: 2px solid currentColor;
      border-radius: 999px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .trailer-unavailable-link {
      cursor: not-allowed;
      opacity: 0.72;
      text-decoration: none;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTrailerStatus, { once: true });
  } else {
    applyTrailerStatus();
  }
})();
