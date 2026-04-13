function detectPlatform(url = "") {
  const lower = url.toLowerCase();

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }
  if (lower.includes("instagram.com")) {
    return "instagram";
  }
  if (lower.includes("tiktok.com")) {
    return "tiktok";
  }

  return "unknown";
}

function parseMaybeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

module.exports = {
  detectPlatform,
  parseMaybeNumber,
};