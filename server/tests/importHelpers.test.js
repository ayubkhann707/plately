const { detectPlatform, parseMaybeNumber } = require("../services/importHelpers");

describe("importHelpers", () => {
  describe("detectPlatform", () => {
    test("detects youtube links", () => {
      expect(detectPlatform("https://www.youtube.com/watch?v=abc")).toBe("youtube");
      expect(detectPlatform("https://youtu.be/abc")).toBe("youtube");
    });

    test("detects instagram links", () => {
      expect(detectPlatform("https://www.instagram.com/reel/abc")).toBe("instagram");
    });

    test("detects tiktok links", () => {
      expect(detectPlatform("https://www.tiktok.com/@user/video/123")).toBe("tiktok");
    });

    test("returns unknown for unsupported links", () => {
      expect(detectPlatform("https://example.com")).toBe("unknown");
    });
  });

  describe("parseMaybeNumber", () => {
    test("parses valid numbers", () => {
      expect(parseMaybeNumber("2")).toBe(2);
      expect(parseMaybeNumber("2.5")).toBe(2.5);
    });

    test("returns null for empty values", () => {
      expect(parseMaybeNumber("")).toBeNull();
      expect(parseMaybeNumber(null)).toBeNull();
      expect(parseMaybeNumber(undefined)).toBeNull();
    });

    test("returns null for invalid values", () => {
      expect(parseMaybeNumber("abc")).toBeNull();
    });
  });
});