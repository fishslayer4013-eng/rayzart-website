(() => {
  const reviews = [
    {
      name: "Lloan Farias",
      date: "August 20, 2026",
      source: "Google customer review",
      text: "was absolutely awesome to work with! The dump trailer was in great shape, the rental was super affordable, and Ray was very flexible and worked with my schedule. He made the whole process easy and stress free. I would definitely rent from him again and highly recommend him to anyone looking for a dump trailer rental or any car hauler he also has 26 feet heavy duty ones."
    },
    {
      name: "Kandis Duff",
      date: "August 12, 2026",
      source: "Google customer review",
      text: "Absolutely wonderful experience! From start to finish, Ray is incredibly polite, kind, and accommodating. He made the entire rental process so easy and stress-free, were quick to answer questions, and went out of his way to make sure everything worked for us. It’s refreshing to do business with people who genuinely care about their customers and provide such great service. Friendly, professional, reliable, and so easy to work with. I would absolutely rent from him again and highly recommend them to anyone looking for a trailer rental!"
    },
    {
      name: "Kyle Cannon",
      date: "August 2026",
      source: "Google customer review",
      text: "Excellent!! Great business and equipment! Easy to communicate with and to schedule."
    },
    {
      name: "Kyle",
      date: "October 13, 2024",
      source: "Facebook Marketplace customer review",
      text: "Great trailer, towed extremely smooth and he has more than enough straps and chains to get the job done. He also took his time to show me how to use the winch and the hydraulic tilt."
    },
    {
      name: "Thomas",
      date: "December 13, 2024",
      source: "Facebook Marketplace customer review",
      text: "Great experience with Bill. He has nice equipment and I would rent from Bill again, plenty of chains and binders to haul a truck. Thanks again Bill."
    },
    {
      name: "Jared",
      date: "July 5, 2025",
      source: "Facebook Marketplace customer review",
      text: "Bill saved the day! Great friendly guy who was very helpful getting us set up with a trailer. He had everything you could need for the rental and everything worked flawless. highly recommend him!"
    },
    {
      name: "Brandon",
      date: "March 2, 2025",
      source: "Facebook Marketplace customer review",
      text: "Very nice functional equipment, easy pick up and drop off quick response, good pricing. Would recommend to anyone in need."
    },
    {
      name: "Calvin",
      date: "July 30, 2024",
      source: "Facebook Marketplace customer review",
      text: "Easy pick up and drop off, very nice equipment."
    }
  ];

  function initReviewCarousel() {
    const layout = document.querySelector("#reviews .reviews-layout");
    if (!layout || layout.dataset.carouselReady === "true") return;

    layout.dataset.carouselReady = "true";
    layout.classList.add("review-carousel-ready");

    const carousel = document.createElement("div");
    carousel.className = "review-carousel";
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", "Customer reviews");

    const viewport = document.createElement("div");
    viewport.className = "review-carousel-viewport";

    const track = document.createElement("div");
    track.className = "review-carousel-track";

    const slides = reviews.map((review, index) => {
      const article = document.createElement("article");
      article.className = "review-card review-carousel-slide";
      article.dataset.reviewIndex = String(index);
      article.setAttribute("aria-roledescription", "slide");
      article.setAttribute("aria-label", `${index + 1} of ${reviews.length}`);
      article.setAttribute("aria-hidden", index === 0 ? "false" : "true");
      article.innerHTML = `
        <div class="review-carousel-topline">
          <div class="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
          <span class="review-published">Published customer review</span>
        </div>
        <blockquote>“${review.text}”</blockquote>
        <div class="review-source">
          <strong>${review.name}</strong>
          <span>${review.source} • ${review.date}</span>
        </div>
      `;
      track.appendChild(article);
      return article;
    });

    viewport.appendChild(track);

    const controls = document.createElement("div");
    controls.className = "review-carousel-controls";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "review-carousel-arrow review-carousel-previous";
    previous.setAttribute("aria-label", "Show previous review");
    previous.innerHTML = "<span aria-hidden=\"true\">←</span>";

    const dots = document.createElement("div");
    dots.className = "review-carousel-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Choose a customer review");

    const dotButtons = reviews.map((review, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `review-carousel-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
      dot.setAttribute("aria-label", `Show review from ${review.name}`);
      dot.addEventListener("click", () => showReview(index, true));
      dots.appendChild(dot);
      return dot;
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "review-carousel-arrow review-carousel-next";
    next.setAttribute("aria-label", "Show next review");
    next.innerHTML = "<span aria-hidden=\"true\">→</span>";

    const counter = document.createElement("p");
    counter.className = "review-carousel-counter";
    counter.setAttribute("aria-live", "polite");
    counter.textContent = `1 of ${reviews.length}`;

    controls.append(previous, dots, next);
    carousel.append(viewport, controls, counter);
    layout.replaceChildren(carousel);

    let activeIndex = 0;
    let timer = null;
    let touchStartX = 0;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    function showReview(index, userInitiated = false) {
      activeIndex = (index + reviews.length) % reviews.length;
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
      counter.textContent = `${activeIndex + 1} of ${reviews.length}`;
      if (userInitiated) restartRotation();
    }

    function stopRotation() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function startRotation() {
      if (reduceMotion || timer || document.hidden) return;
      timer = window.setInterval(() => showReview(activeIndex + 1), 8000);
    }

    function restartRotation() {
      stopRotation();
      startRotation();
    }

    previous.addEventListener("click", () => showReview(activeIndex - 1, true));
    next.addEventListener("click", () => showReview(activeIndex + 1, true));

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
      if (Math.abs(distance) > 45) showReview(activeIndex + (distance < 0 ? 1 : -1), true);
      else startRotation();
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopRotation();
      else startRotation();
    });

    showReview(0);
    startRotation();
  }

  const style = document.createElement("style");
  style.id = "rayzart-review-carousel-styles";
  style.textContent = `
    #reviews .reviews-layout.review-carousel-ready {
      display: block;
      max-width: 940px;
      margin: 38px auto 0;
    }
    #reviews .review-carousel {
      position: relative;
    }
    #reviews .review-carousel-viewport {
      overflow: hidden;
      border-radius: 24px;
    }
    #reviews .review-carousel-track {
      display: grid;
    }
    #reviews .review-carousel-slide {
      grid-area: 1 / 1;
      min-height: 320px;
      padding: clamp(28px, 5vw, 52px);
      opacity: 0;
      visibility: hidden;
      transform: translateX(18px);
      transition: opacity .42s ease, transform .42s ease, visibility .42s;
      pointer-events: none;
    }
    #reviews .review-carousel-slide.active {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
      pointer-events: auto;
    }
    #reviews .review-carousel-topline {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    #reviews .review-published {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 6px 11px;
      border-radius: 999px;
      background: #eef4fb;
      color: var(--blue);
      font-size: .78rem;
      font-weight: 800;
      letter-spacing: .02em;
    }
    #reviews .review-carousel-slide blockquote {
      margin: 26px 0 30px;
      max-width: 810px;
      font-size: clamp(1.22rem, 2.2vw, 1.72rem);
      line-height: 1.55;
    }
    #reviews .review-carousel-slide .review-source {
      margin-top: auto;
    }
    #reviews .review-carousel-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin-top: 20px;
    }
    #reviews .review-carousel-arrow,
    #reviews .review-carousel-dot {
      appearance: none;
      border: 0;
      cursor: pointer;
    }
    #reviews .review-carousel-arrow {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: var(--navy);
      color: #fff;
      font-size: 1.25rem;
      box-shadow: 0 8px 22px rgba(8,42,85,.18);
    }
    #reviews .review-carousel-arrow:hover,
    #reviews .review-carousel-arrow:focus-visible {
      transform: translateY(-1px);
      background: var(--blue);
    }
    #reviews .review-carousel-dots {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #reviews .review-carousel-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #b7c4d4;
      transition: width .22s ease, background .22s ease;
    }
    #reviews .review-carousel-dot.active {
      width: 28px;
      border-radius: 999px;
      background: var(--blue);
    }
    #reviews .review-carousel-counter {
      margin: 10px 0 0;
      color: var(--muted);
      text-align: center;
      font-size: .8rem;
    }
    @media (max-width: 640px) {
      #reviews .review-carousel-slide {
        min-height: 390px;
        padding: 28px 24px 30px;
      }
      #reviews .review-carousel-topline {
        align-items: flex-start;
      }
      #reviews .review-carousel-slide blockquote {
        margin-top: 22px;
        font-size: 1.16rem;
      }
      #reviews .review-published {
        width: 100%;
        justify-content: center;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      #reviews .review-carousel-slide,
      #reviews .review-carousel-arrow,
      #reviews .review-carousel-dot {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewCarousel, { once: true });
  } else {
    initReviewCarousel();
  }
})();
