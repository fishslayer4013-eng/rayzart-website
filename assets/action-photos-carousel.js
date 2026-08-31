(() => {
  const photos = [
    {
      src: "assets/images/shed-hauling.webp",
      alt: "Rayzart tilt-deck trailer carrying a full-size shed",
      title: "Shed Relocation",
      description: "A full-size shed riding on the 26-foot tilt-deck trailer."
    },
    {
      src: "assets/images/deck-trailer-loaded.webp",
      alt: "Rayzart tilt-deck trailer loaded with a vehicle",
      title: "Vehicle Hauling",
      description: "Heavy vehicles and equipment secured on a 26-foot tilt-deck trailer."
    },
    {
      src: "assets/images/deck-trailer.webp",
      alt: "Rayzart 26-foot tilt-deck trailer ready for work",
      title: "Ready for the Next Job",
      description: "A heavy-duty tilt-deck setup for vehicles, equipment and bulky loads."
    },
    {
      src: "assets/images/dump-trailer.webp",
      alt: "Rayzart dump trailer ready for a property project",
      title: "Dump Trailer at Work",
      description: "Built for cleanup, debris, gravel and property projects."
    }
  ];

  function initActionCarousel() {
    const grid = document.querySelector(".action-grid");
    if (!grid || grid.dataset.carouselReady === "true" || photos.length < 2) return;

    grid.dataset.carouselReady = "true";
    grid.classList.add("action-carousel-ready");

    const carousel = document.createElement("div");
    carousel.className = "action-carousel";
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", "Rayzart trailers in action");

    const viewport = document.createElement("div");
    viewport.className = "action-carousel-viewport";

    const track = document.createElement("div");
    track.className = "action-carousel-track";

    const slides = photos.map((photo, index) => {
      const figure = document.createElement("figure");
      figure.className = `action-shot action-carousel-slide${index === 0 ? " active" : ""}`;
      figure.setAttribute("aria-roledescription", "slide");
      figure.setAttribute("aria-label", `${index + 1} of ${photos.length}: ${photo.title}`);
      figure.setAttribute("aria-hidden", index === 0 ? "false" : "true");

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";

      const caption = document.createElement("figcaption");
      const title = document.createElement("strong");
      title.textContent = photo.title;
      const description = document.createElement("span");
      description.textContent = photo.description;
      caption.append(title, description);

      figure.append(img, caption);
      track.appendChild(figure);
      return figure;
    });

    viewport.appendChild(track);

    const controls = document.createElement("div");
    controls.className = "action-carousel-controls";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "action-carousel-arrow";
    previous.setAttribute("aria-label", "Show previous action photo");
    previous.innerHTML = '<span aria-hidden="true">←</span>';

    const dots = document.createElement("div");
    dots.className = "action-carousel-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Choose an action photo");

    const dotButtons = photos.map((photo, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `action-carousel-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
      dot.setAttribute("aria-label", `Show ${photo.title}`);
      dots.appendChild(dot);
      return dot;
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "action-carousel-arrow";
    next.setAttribute("aria-label", "Show next action photo");
    next.innerHTML = '<span aria-hidden="true">→</span>';

    controls.append(previous, dots, next);
    carousel.append(viewport, controls);
    grid.replaceChildren(carousel);

    let activeIndex = 0;
    let timer = null;
    let touchStartX = 0;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    function showPhoto(index, userInitiated = false) {
      activeIndex = (index + photos.length) % photos.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dotButtons.forEach((dot, dotIndex) => {
        const active = dotIndex === activeIndex;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
      if (userInitiated) restartRotation();
    }

    function stopRotation() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function startRotation() {
      if (reduceMotion || timer || document.hidden) return;
      timer = window.setInterval(() => showPhoto(activeIndex + 1), 3000);
    }

    function restartRotation() {
      stopRotation();
      startRotation();
    }

    previous.addEventListener("click", () => showPhoto(activeIndex - 1, true));
    next.addEventListener("click", () => showPhoto(activeIndex + 1, true));
    dotButtons.forEach((dot, index) => dot.addEventListener("click", () => showPhoto(index, true)));

    carousel.addEventListener("pointerenter", stopRotation);
    carousel.addEventListener("pointerleave", startRotation);
    carousel.addEventListener("focusin", stopRotation);
    carousel.addEventListener("focusout", event => {
      if (!carousel.contains(event.relatedTarget)) startRotation();
    });

    viewport.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
      stopRotation();
    }, { passive: true });

    viewport.addEventListener("touchend", event => {
      const touchEndX = event.changedTouches[0]?.clientX || 0;
      const distance = touchEndX - touchStartX;
      if (Math.abs(distance) > 45) showPhoto(activeIndex + (distance < 0 ? 1 : -1), true);
      else startRotation();
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopRotation();
      else startRotation();
    });

    showPhoto(0);
    startRotation();
  }

  const style = document.createElement("style");
  style.id = "rayzart-action-carousel-styles";
  style.textContent = `
    .action-grid.action-carousel-ready {
      display: block;
      max-width: 940px;
      margin: 40px auto 0;
    }
    .action-carousel {
      width: 100%;
      position: relative;
    }
    .action-carousel-viewport {
      overflow: hidden;
      border-radius: 20px;
    }
    .action-carousel-track {
      display: grid;
    }
    .action-carousel-slide {
      grid-area: 1 / 1;
      margin: 0;
      opacity: 0;
      visibility: hidden;
      transform: translateX(18px);
      transition: opacity .38s ease, transform .38s ease, visibility .38s;
      pointer-events: none;
    }
    .action-carousel-slide.active {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
      pointer-events: auto;
    }
    .action-carousel-slide img {
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      display: block;
    }
    .action-carousel-slide figcaption {
      min-height: 88px;
    }
    .action-carousel-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 18px;
    }
    .action-carousel-arrow,
    .action-carousel-dot {
      appearance: none;
      border: 0;
      cursor: pointer;
    }
    .action-carousel-arrow {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--navy);
      color: #fff;
      font-size: 1.2rem;
      box-shadow: 0 8px 22px rgba(8,42,85,.18);
    }
    .action-carousel-dots {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
    }
    .action-carousel-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #b7c4d4;
      transition: width .2s ease, background .2s ease;
    }
    .action-carousel-dot.active {
      width: 26px;
      border-radius: 999px;
      background: var(--blue);
    }
    @media (max-width: 680px) {
      .action-grid.action-carousel-ready {
        margin-top: 28px;
      }
      .action-carousel-viewport {
        border-radius: 16px;
      }
      .action-carousel-slide img {
        aspect-ratio: 4 / 3;
      }
      .action-carousel-slide figcaption {
        min-height: 102px;
        padding: 16px 18px 18px;
      }
      .action-carousel-slide strong {
        font-size: 1rem;
      }
      .action-carousel-slide span {
        font-size: .86rem;
        line-height: 1.4;
      }
      .action-carousel-controls {
        gap: 12px;
        margin-top: 14px;
      }
      .action-carousel-arrow {
        width: 42px;
        height: 42px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .action-carousel-slide,
      .action-carousel-dot {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initActionCarousel, { once: true });
  } else {
    initActionCarousel();
  }
})();
