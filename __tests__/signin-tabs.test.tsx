import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInTabs } from "@/components/auth-tabs";

// The sign-in page shipped a Password / Magic Link tablist whose two buttons
// carried role="tab", aria-selected and aria-controls but no onClick handler.
// The magic-link panel was therefore unreachable: clicking the tab did nothing
// and the panel kept its `hidden` attribute for the life of the page. Because
// the markup *looked* correct -- correct roles, correct aria wiring, both labels
// present -- this passed every render assertion and every accessibility scan
// while being completely non-functional.
//
// These specs drive the actual interaction and assert against element ids,
// because querying by label collides with aria-labelledby on the panels.

const passwordPanel = () =>
  document.querySelector("#password-panel") as HTMLElement;
const magicPanel = () => document.querySelector("#magic-panel") as HTMLElement;
const passwordInput = () =>
  document.querySelector("#password-panel input#password") as HTMLInputElement;
const magicSubmit = () =>
  Array.from(document.querySelectorAll("button")).find((b) =>
    /send magic link/i.test(b.textContent ?? ""),
  );

describe("SignInTabs", () => {
  it("shows the password panel by default", () => {
    render(<SignInTabs />);

    expect(screen.getByRole("tab", { name: /^password$/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(passwordPanel().hidden).toBe(false);
    expect(magicPanel().hidden).toBe(true);
    expect(passwordInput()).toBeInTheDocument();
  });

  it("reveals the magic link panel when its tab is clicked", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    expect(magicSubmit()).toBeUndefined();

    await user.click(screen.getByRole("tab", { name: /magic link/i }));

    expect(magicPanel().hidden).toBe(false);
    expect(passwordPanel().hidden).toBe(true);
    expect(magicSubmit()).toBeDefined();
    expect(passwordInput()).toBeNull();
  });

  it("moves aria-selected to the clicked tab only", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    await user.click(screen.getByRole("tab", { name: /magic link/i }));

    expect(screen.getByRole("tab", { name: /magic link/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /^password$/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("returns to the password panel when that tab is clicked again", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    await user.click(screen.getByRole("tab", { name: /magic link/i }));
    await user.click(screen.getByRole("tab", { name: /^password$/i }));

    expect(passwordPanel().hidden).toBe(false);
    expect(magicPanel().hidden).toBe(true);
    expect(passwordInput()).toBeInTheDocument();
  });

  it("keeps only the selected tab in the tab order", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    const passwordTab = screen.getByRole("tab", { name: /^password$/i });
    const magicTab = screen.getByRole("tab", { name: /magic link/i });

    expect(passwordTab).toHaveAttribute("tabindex", "0");
    expect(magicTab).toHaveAttribute("tabindex", "-1");

    await user.click(magicTab);

    expect(magicTab).toHaveAttribute("tabindex", "0");
    expect(passwordTab).toHaveAttribute("tabindex", "-1");
  });

  it("switches panels with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    screen.getByRole("tab", { name: /^password$/i }).focus();
    await user.keyboard("{ArrowRight}");

    expect(magicPanel().hidden).toBe(false);
    expect(screen.getByRole("tab", { name: /magic link/i })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");

    expect(passwordPanel().hidden).toBe(false);
    expect(screen.getByRole("tab", { name: /^password$/i })).toHaveFocus();
  });

  it("wraps from the last tab to the first", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    screen.getByRole("tab", { name: /magic link/i }).focus();
    await user.keyboard("{ArrowRight}");

    expect(passwordPanel().hidden).toBe(false);
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const user = userEvent.setup();
    render(<SignInTabs />);

    screen.getByRole("tab", { name: /^password$/i }).focus();
    await user.keyboard("{End}");
    expect(magicPanel().hidden).toBe(false);

    await user.keyboard("{Home}");
    expect(passwordPanel().hidden).toBe(false);
  });

  it("declares both tabs as non-submitting buttons", () => {
    render(<SignInTabs />);

    // Without type="button" the browser treats these as submit buttons, so
    // arrowing through the tabs would attempt a sign-in.
    screen.getAllByRole("tab").forEach((tab) => {
      expect(tab).toHaveAttribute("type", "button");
    });
  });

  it("wires each tab to its panel with aria-controls and aria-labelledby", () => {
    render(<SignInTabs />);

    const passwordTab = screen.getByRole("tab", { name: /^password$/i });
    const magicTab = screen.getByRole("tab", { name: /magic link/i });

    expect(passwordTab).toHaveAttribute("aria-controls", "password-panel");
    expect(magicTab).toHaveAttribute("aria-controls", "magic-panel");
    expect(passwordPanel()).toHaveAttribute("aria-labelledby", "password-tab");
    expect(magicPanel()).toHaveAttribute("aria-labelledby", "magic-tab");
  });
});
