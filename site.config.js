window.RAYZART_CONFIG = {
  businessName: "Rayzart Diversified Services LLC",
  shortName: "Rayzart",
  publicPhone: "208-691-2496",
  publicEmail: "bill@rayzartllc.com",
  websiteUrl: "https://rayzartllc.com",
  pickupLocation: "Hauser, Idaho",
  serviceArea: "North Idaho & the Spokane Area"
};

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
  reviewScript.src = "assets/reviews-carousel.js?v=20260806-1";
  reviewScript.async = false;
  document.head.appendChild(reviewScript);
})();

// Keep public trailer names tied to the matching website calendar colors.
(() => {
  const trailerLabelScript = document.createElement("script");
  trailerLabelScript.src = "assets/trailer-public-labels.js?v=20260806-1";
  trailerLabelScript.async = false;
  document.head.appendChild(trailerLabelScript);
})();
