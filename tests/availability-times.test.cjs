const test = require("node:test");
const assert = require("node:assert/strict");
const t = require("../assets/availability-times.js");
const { exportRows } = require("../scripts/export-availability.cjs");
const robert = { trailer: "23 Deck Trailer", start: "2026-10-11", end: "2026-10-12", startAt: "2026-10-11T14:00:00-07:00", endAt: "2026-10-12T18:00:00-07:00", status: "booked", rentalState: "Scheduled" };
const check = (sd, st, ed, et, records = [robert], trailer = "23 Deck Trailer") => t.check(trailer, sd, st, ed, et, records).status;
test("time refresh preserves published past rentals exactly", () => {
  const history = { trailer: "23 Deck Trailer", start: "2026-09-04", end: "2026-09-04", status: "completed" };
  const data = exportRows([["Trailer", "Start Date", "End Date", "Status", "Source", "Start At (Pacific)"], ["23 Deck Trailer", "2026-09-04", "2026-09-04", "Returned", "Rental", "2026-09-04 08:00:00", "2026-09-04 13:36:00", "Timed"]], "2026-10-11", [history]);
  assert.deepEqual(data.bookings, [history]);
});
test("same-day requests before pickup and after return remain open; true overlap blocks", () => {
  assert.equal(check("2026-10-11", "10:00", "2026-10-11", "14:00"), "open");
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "15:00"), "booked");
  assert.equal(check("2026-10-12", "17:59", "2026-10-12", "19:00"), "booked");
  assert.equal(check("2026-10-12", "18:00", "2026-10-12", "19:00"), "open");
});
test("zero-length, backwards and malformed calendar times cannot report open", () => {
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "14:00"), "invalid");
  assert.equal(check("2026-10-11", "15:00", "2026-10-11", "14:00"), "invalid");
  assert.equal(check("2027-02-30", "10:00", "2027-03-01", "12:00"), "invalid");
  assert.equal(check("2026-10-11", "", "2026-10-12", "18:00"), "unknown");
});
test("unknown legacy times conservatively occupy the entire end date", () => {
  const legacy = { trailer: "23 Deck Trailer", start: "2026-10-11", end: "2026-10-12", status: "booked" };
  assert.equal(check("2026-10-12", "23:00", "2026-10-12", "23:59", [legacy]), "booked");
  assert.equal(check("2026-10-13", "00:00", "2026-10-13", "01:00", [legacy]), "open");
});
test("completed rentals and released records never block a request", () => {
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "15:00", [{ ...robert, status: "completed" }]), "open");
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "15:00", [{ ...robert, rentalState: "Released" }]), "open");
});
test("on-rent and inspection-pending states do not become ready at the due time", () => {
  assert.equal(check("2026-10-13", "10:00", "2026-10-13", "11:00", [{ ...robert, rentalState: "On Rent" }]), "booked");
  assert.equal(check("2026-10-13", "10:00", "2026-10-13", "11:00", [{ ...robert, rentalState: "Inspection Pending", status: "limited" }]), "limited");
});
test("a booking belongs to its physical trailer; shared deck holds cover both decks", () => {
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "15:00", [robert], "26 Deck Trailer"), "open");
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "15:00", [{ ...robert, trailer: "Deck Trailers" }], "26 Deck Trailer"), "booked");
});
test("Pacific DST gaps and repeated hours require clarification", () => {
  assert.equal(t.wallTime("2027-03-14", "02:30"), null);
  assert.equal(t.wallTime("2026-11-01", "01:30"), null);
  assert.equal(t.wallTime("2026-10-11", "14:00"), Date.parse("2026-10-11T14:00:00-07:00"));
  assert.equal(t.wallTime("2026-12-01", "14:00"), Date.parse("2026-12-01T14:00:00-08:00"));
});
test("midnight-exclusive return does not paint the next day as booked", () => {
  const b = { ...robert, start: "2026-12-01", end: "2026-12-02", startAt: "2026-12-01T14:00:00-08:00", endAt: "2026-12-02T00:00:00-08:00" };
  assert.equal(t.onDate(b, "2026-12-01"), true);
  assert.equal(t.onDate(b, "2026-12-02"), false);
});
test("malformed occupied window requires confirmation; missing data cannot report open", () => {
  assert.equal(check("2026-10-11", "14:00", "2026-10-11", "15:00", [{ ...robert, endAt: "2026-10-11T13:00:00-07:00" }]), "limited");
  assert.equal(t.check("23 Deck Trailer", "2026-10-11", "14:00", "2026-10-11", "15:00").status, "unknown");
});
test("public export applies the business offset and excludes private feed columns", () => {
  const data = exportRows([["Trailer", "Start Date", "End Date", "Status", "Source", "Start At (Pacific)"], ["23 Deck Trailer", "2026-10-11", "2026-10-12", "Scheduled", "Rental", "2026-10-11 14:00:00", "2026-10-12 18:00:00", "Timed", "SECRET", "PRIVATE"]], "2026-10-11");
  assert.equal(data.bookings[0].startAt, robert.startAt);
  assert.equal(JSON.stringify(data).includes("SECRET"), false);
  assert.equal(JSON.stringify(data).includes("PRIVATE"), false);
});
