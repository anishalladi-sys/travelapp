import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm, LoginForm, SignupForm } from "@/components/auth-form";
import { loginSchema } from "@/lib/validations/auth";

// Regression guards for defects found by driving the real sign-in page in a
// browser rather than by reading it:
//
//   1. There was no way to reveal a password. Every password field rendered as a
//      bare <input type="password">, so a typo was only discoverable by retyping
//      the whole value.
//   2. The auth inputs carried no autocomplete hints, so Chrome and Edge did not
//      offer to fill them and password managers could not tell which credential
//      a field was asking for. current-password vs new-password also drives the
//      "suggest a strong password" prompt on signup.
//
// The autocomplete specs assert against the real <LoginForm/> and <SignupForm/>
// rather than a hand-written field list, so they fail if a shipped form loses
// its hint -- which a hand-written list would not catch.

function renderLoginForm() {
  return render(<LoginForm />);
}

describe("AuthForm password visibility", () => {
  it("hides the password by default", () => {
    renderLoginForm();

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("reveals the password when the toggle is pressed", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: /show password/i }));

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });

  it("hides the password again on a second press", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: /show password/i }));
    await user.click(screen.getByRole("button", { name: /hide password/i }));

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("keeps the typed value intact across a toggle round-trip", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Password"), "s3cret");
    await user.click(screen.getByRole("button", { name: /show password/i }));

    expect(screen.getByLabelText("Password")).toHaveValue("s3cret");

    await user.click(screen.getByRole("button", { name: /hide password/i }));

    expect(screen.getByLabelText("Password")).toHaveValue("s3cret");
  });

  it("exposes the toggle as a real button so it is keyboard reachable", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const toggle = screen.getByRole("button", { name: /show password/i });
    expect(toggle.tagName).toBe("BUTTON");
    // Without type="button" the toggle submits the form it lives in.
    expect(toggle).toHaveAttribute("type", "button");

    toggle.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });

  it("exposes the toggle state to assistive tech", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const toggle = screen.getByRole("button", { name: /show password/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(
      screen.getByRole("button", { name: /hide password/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("does not render a toggle for the email field", () => {
    renderLoginForm();

    // Exactly one toggle: the email input must not get one.
    expect(
      screen.getAllByRole("button", { name: /show password/i }),
    ).toHaveLength(1);
  });
});

describe("AuthForm autocomplete hints", () => {
  it("marks the sign-in email field as an email login field", () => {
    renderLoginForm();

    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
  });

  it("marks the sign-in password as current-password", () => {
    renderLoginForm();

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
  });

  it("marks both signup password fields as new-password", () => {
    render(<SignupForm />);

    // Signup labels the second field "Confirm password", so these are two
    // distinct labels rather than a repeated one.
    const password = screen.getByLabelText("Password", {
      selector: "#password",
    });
    const confirm = screen.getByLabelText("Confirm password", {
      selector: "#confirmPassword",
    });

    expect(password).toHaveAttribute("autocomplete", "new-password");
    expect(confirm).toHaveAttribute("autocomplete", "new-password");
  });

  it("renders a visibility toggle on every signup password field", () => {
    render(<SignupForm />);

    // Signup has password + confirmPassword, so both need a toggle.
    expect(
      screen.getAllByRole("button", { name: /show password/i }),
    ).toHaveLength(2);
  });
});

describe("AuthForm submit behaviour", () => {
  it("calls the server action exactly once per submit", async () => {
    const action = vi.fn(async () => {});
    const user = userEvent.setup();
    render(
      <AuthForm
        schema={loginSchema}
        action={action}
        defaultValues={{ email: "", password: "", remember: false }}
        submitLabel="Sign in"
        title="Welcome back"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "current-password",
          },
        ]}
      />,
    );

    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("blocks submission of an invalid email without calling the action", async () => {
    const action = vi.fn(async () => {});
    const user = userEvent.setup();
    render(
      <AuthForm
        schema={loginSchema}
        action={action}
        defaultValues={{ email: "", password: "", remember: false }}
        submitLabel="Sign in"
        title="Welcome back"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            autoComplete: "current-password",
          },
        ]}
      />,
    );

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(action).not.toHaveBeenCalled();
  });
});
