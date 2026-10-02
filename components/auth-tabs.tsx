"use client";

import * as React from "react";
import { LoginForm, MagicLinkForm } from "@/components/auth-form";
import { cn } from "@/lib/utils";

type TabId = "password" | "magic";

const TABS: ReadonlyArray<{ id: TabId; label: string; panelId: string }> = [
  { id: "password", label: "Password", panelId: "password-panel" },
  { id: "magic", label: "Magic Link", panelId: "magic-panel" },
];

/**
 * Password / Magic Link tablist for the sign-in page.
 *
 * This tablist previously lived inline in app/login/page.tsx as static markup.
 * Both buttons declared role="tab", aria-selected and aria-controls, and both
 * panels existed, so it looked and scanned as a working tab widget -- but
 * neither button had an onClick handler. The magic-link panel therefore kept its
 * `hidden` attribute permanently and the "Magic Link" tab was a no-op. Moving
 * the behaviour into real state here is the fix.
 *
 * The ARIA tab pattern also requires roving tabindex and arrow-key navigation;
 * both are implemented, because a tablist where Tab walks into both tabs and
 * arrow keys do nothing is still not keyboard-operable.
 */
export function SignInTabs() {
  const [active, setActive] = React.useState<TabId>("password");
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = React.useCallback((index: number) => {
    const target = TABS[index];
    if (!target) return;
    setActive(target.id);
    tabRefs.current[index]?.focus();
  }, []);

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab((index + 1) % TABS.length);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab((index - 1 + TABS.length) % TABS.length);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(TABS.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4" id="auth-tabs">
      <div
        className="flex space-x-4"
        role="tablist"
        aria-label="Sign-in method"
      >
        {TABS.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              // Without an explicit type these default to submit inside the
              // forms below, so arrowing through the tabs would attempt a sign-in.
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-selected={selected}
              aria-controls={tab.panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors",
                selected
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="password-panel"
        aria-labelledby="password-tab"
        hidden={active !== "password"}
        tabIndex={0}
      >
        {active === "password" ? <LoginForm /> : null}
      </div>

      <div
        role="tabpanel"
        id="magic-panel"
        aria-labelledby="magic-tab"
        hidden={active !== "magic"}
        tabIndex={0}
      >
        {active === "magic" ? <MagicLinkForm /> : null}
      </div>
    </div>
  );
}
