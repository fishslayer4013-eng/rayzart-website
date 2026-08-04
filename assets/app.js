
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
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  if (startDate) startDate.min = localToday;
  if (endDate) endDate.min = localToday;

  startDate?.addEventListener("change", () => {
    endDate.min = startDate.value || localToday;
    if (endDate.value && endDate.value < startDate.value) endDate.value = startDate.value;
  });

  // Trailer card buttons populate the availability form.
  document.querySelectorAll(".select-trailer").forEach(link => {
    link.addEventListener("click", () => {
      const select = document.getElementById("trailer");
      if (select) select.value = link.dataset.trailer || "";
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
    const request = [
      `Rayzart availability request`,
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Trailer: ${data.get("trailer")}`,
      `Dates: ${data.get("startDate")} through ${data.get("endDate")}`,
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
