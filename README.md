# Rayzart Website v1

This is a fast, mobile-first static website ready for GitHub and Cloudflare Pages.

## Before public launch

1. Open `site.config.js`.
2. Add the confirmed public phone number, business email, and final website URL.
3. Replace/add trailer photos in `assets/images`.
4. Availability requests prepare a text message to the public phone number; Rayzart confirms reservations and trailer readiness.

### Rental times

RBMS 2.1 is the source of truth. On Customers and Rentals, O is Pickup At, P is Due At, Q is Actual Return At, and R explains time certainty. Enter full numeric date/time values in Pacific time (America/Los_Angeles). Never substitute a scheduled due time for an actual return. K/L derive calendar dates from these values and preserve older date-only history. On Availability Holds, I/J hold the start/end timestamps.

The hidden Website Availability Feed includes the original five date/status columns plus Pacific start/end times, precision, due time, and actual return. The public dataset includes only trailer, window, status, and time precision; customer and payment details stay private.

The website requests pickup and return times and checks interval overlap: pickup is included, return is excluded. A request that ends at another reservation's pickup has no time overlap. Unknown or approximate times conservatively block the whole date range. On Rent and Inspection Pending remain unavailable or require readiness confirmation until RBMS is updated; passing the due time never checks a trailer in. Completed rentals remain grey history. All reservations require Rayzart confirmation.

The website uses a published snapshot, so RBMS edits still need an explicit website refresh. Export the feed's ten columns as JSON rows, including headers, then run `node scripts/export-availability.cjs /path/to/public-feed-rows.json YYYY-MM-DD`. Review the generated `availability-data.js`, commit it, and verify deployment. Do not publish Customers and Rentals exports or notes. Update the backup calendar with the same verified Pacific timestamps and preserve actual versus scheduled return in its description.

Run timing checks with `node --test tests/availability-times.test.cjs`. They cover boundaries, missing times, physical trailer identity, ongoing rentals, return readiness, Pacific daylight-saving changes, and privacy of the public export.
5. Review every rate, capacity, deposit, towing requirement, and service claim.
6. Publish a private preview first. Do not replace the existing live website until approved.

## Current content basis

- Rayzart Website Master Plan
- RBMS 2.1 trailer assets, rental history, rates, and current fleet
- Confirmed business services and service area
- Rayzart logo and available trailer photos from Google Drive

## Free hosting target

- Private GitHub repository for version history
- Cloudflare Pages for hosting
- GoDaddy remains the domain registrar and can continue handling email/DNS

No build command is required. Publish the repository root.

