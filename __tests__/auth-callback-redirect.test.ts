import { describe, it, expect } from "vitest";
import { safeRedirectTarget } from "@/lib/safe-redirect";

const ORIGIN = "https://travel.example";

// The callback route read `next` from the query string and passed it to
// redirect() unvalidated, making this site an open redirector -- including for
// links with no valid code, which redirected without establishing a session at
// all. These specs pin the allowlist.

describe("safeRedirectTarget", () => {
  it("allows a same-origin relative path", () => {
    expect(safeRedirectTarget("/trips", ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("allows a nested same-origin path", () => {
    expect(safeRedirectTarget("/auth/reset-password", ORIGIN).toString()).toBe(
      "https://travel.example/auth/reset-password",
    );
  });

  it("preserves the query string of a relative path", () => {
    expect(safeRedirectTarget("/trips?tab=itinerary", ORIGIN).toString()).toBe(
      "https://travel.example/trips?tab=itinerary",
    );
  });

  it("falls back to /trips when next is absent", () => {
    expect(safeRedirectTarget(null, ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("falls back to /trips for an absolute off-origin URL", () => {
    expect(
      safeRedirectTarget("https://evil.example/steal", ORIGIN).toString(),
    ).toBe("https://travel.example/trips");
  });

  it("falls back for a protocol-relative URL", () => {
    // "//evil.example" is the payload that makes an open redirect look harmless.
    expect(safeRedirectTarget("//evil.example", ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("falls back for a backslash protocol-relative URL", () => {
    expect(safeRedirectTarget("/\\evil.example", ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("falls back for an encoded protocol-relative URL", () => {
    expect(safeRedirectTarget("%2F%2Fevil.example", ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("falls back for a javascript: URL", () => {
    expect(safeRedirectTarget("javascript:alert(1)", ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("falls back for a data: URL", () => {
    expect(
      safeRedirectTarget(
        "data:text/html,<script>alert(1)</script>",
        ORIGIN,
      ).toString(),
    ).toBe("https://travel.example/trips");
  });

  it("falls back for a relative-looking path with no leading slash", () => {
    expect(safeRedirectTarget("evil.example", ORIGIN).toString()).toBe(
      "https://travel.example/trips",
    );
  });

  it("falls back for the same origin given as an absolute URL with a port", () => {
    // The port differs, so this is a different origin and must not be honoured.
    expect(
      safeRedirectTarget(
        "https://travel.example:8443/trips",
        ORIGIN,
      ).toString(),
    ).toBe("https://travel.example/trips");
  });

  it("never returns an off-origin URL for any input", () => {
    const hostile = [
      "https://evil.example",
      "http://evil.example",
      "//evil.example",
      "/\\evil.example",
      "%2f%2fevil.example",
      "javascript:alert(1)",
      "data:text/html,x",
      "\\\\evil.example",
      "/\\/@evil.example",
    ];

    for (const input of hostile) {
      expect(safeRedirectTarget(input, ORIGIN).origin).toBe(ORIGIN);
    }
  });
});
