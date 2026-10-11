// Export only the public availability feed; never publish customer/rental notes.
// Usage: node scripts/export-availability.cjs public-feed-rows.json YYYY-MM-DD
const fs = require("node:fs");
const times = require("../assets/availability-times.js");
function timestamp(value) {
  if (!value) return undefined;
  const [date, time] = value.split(" ");
  const ms = times.wallTime(date, time.slice(0, 5));
  if (ms === null) throw Error(`Invalid or ambiguous Pacific timestamp: ${value}`);
  const wall = Date.parse(`${date}T${time}Z`);
  const offset = (wall - ms) / 60000;
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return `${date}T${time}${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}
function exportRows(rows, updated, previous = []) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated || "")) throw Error("Supply the verified update date.");
  if (rows[0]?.[0] !== "Trailer" || rows[0]?.[5] !== "Start At (Pacific)") throw Error("Expected the RBMS website feed headers.");
  const current = rows.slice(1).filter(r => r[0] && (r[2] >= updated || ["On Rent", "Inspection Pending"].includes(r[3]))).map(r => {
    const [trailer, start, end, rentalState, , startAt, endAt, precision] = r;
    if (!['23 Deck Trailer', '26 Deck Trailer', '26 Dump Trailer', 'Deck Trailers'].includes(trailer)) throw Error("Unexpected trailer in public feed.");
    if (rentalState === "Released") throw Error("Released hold should not be in the blocking feed.");
    return { trailer, start, end, status: ["Returned", "Available"].includes(rentalState) ? "completed" : rentalState === "Inspection Pending" ? "limited" : "booked",
      rentalState, precision,
      startAt: precision === "Approximate" ? undefined : timestamp(startAt),
      endAt: precision === "Approximate" ? undefined : timestamp(endAt) };
  });
  const history = previous.filter(b => b.end < updated && !["On Rent", "Inspection Pending"].includes(b.rentalState));
  return { updated, timeZone: times.timeZone, version: 2, bookings: [...history, ...current] };
}
if (require.main === module) {
  const [input, updated] = process.argv.slice(2);
  const path = require("node:path").join(__dirname, "../availability-data.js");
  const original = fs.readFileSync(path, "utf8");
  const end = original.indexOf("\n\n  const scriptSrc");
  if (end < 0) throw Error("Availability loading guard is missing; inspect before updating.");
  const previous = JSON.parse(original.slice(original.indexOf("const data = ") + 13, original.lastIndexOf(";", end))).bookings;
  const data = exportRows(JSON.parse(fs.readFileSync(input, "utf8")), updated, previous);
  fs.writeFileSync(path, "(function () {\n  const data = " + JSON.stringify(data, null, 2).split("\n").join("\n  ") + ";" + original.slice(end));
  console.log(`Exported ${data.bookings.length} public bookings for ${updated}.`);
}
module.exports = { exportRows };
