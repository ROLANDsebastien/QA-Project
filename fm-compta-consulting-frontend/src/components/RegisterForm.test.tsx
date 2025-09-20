import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RegisterForm from "./RegisterForm";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return key as is for simplicity
  }),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock react-icons
jest.mock("react-icons/fa", () => ({
  FaEnvelope: () => <div data-testid="fa-envelope" />,
  FaLock: () => <div data-testid="fa-lock" />,
  FaUser: () => <div data-testid="fa-user" />,
}));

// Mock fetch
global.fetch = jest.fn();

import { signIn } from "next-auth/react";

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>;

describe("RegisterForm", () => {
  const mockOnClose = jest.fn();
  const mockOnSwitchToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with inputs and buttons", () => {
    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    expect(screen.getByLabelText("auth.register.name")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.register.email")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.register.password")).toBeInTheDocument();
    expect(
      screen.getByLabelText("auth.register.confirmPassword"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "navbar.register" }),
    ).toBeInTheDocument();
    expect(screen.getByText("auth.register.hasAccount")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "navbar.login" }),
    ).toBeInTheDocument();
  });

  it("updates form fields on input change", () => {
    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const nameInput = screen.getByLabelText("auth.register.name");
    const emailInput = screen.getByLabelText("auth.register.email");
    const passwordInput = screen.getByLabelText("auth.register.password");
    const confirmPasswordInput = screen.getByLabelText(
      "auth.register.confirmPassword",
    );

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  it("shows error when passwords do not match", async () => {
    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const nameInput = screen.getByLabelText("auth.register.name");
    const emailInput = screen.getByLabelText("auth.register.email");
    const passwordInput = screen.getByLabelText("auth.register.password");
    const confirmPasswordInput = screen.getByLabelText(
      "auth.register.confirmPassword",
    );
    const submitButton = screen.getByRole("button", {
      name: "navbar.register",
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "different" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("auth.register.passwordMismatch"),
      ).toBeInTheDocument();
    });
  });

  it("calls fetch and signIn on successful registration", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    mockSignIn.mockResolvedValueOnce({ ok: true });

    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const nameInput = screen.getByLabelText("auth.register.name");
    const emailInput = screen.getByLabelText("auth.register.email");
    const passwordInput = screen.getByLabelText("auth.register.password");
    const confirmPasswordInput = screen.getByLabelText(
      "auth.register.confirmPassword",
    );
    const submitButton = screen.getByRole("button", {
      name: "navbar.register",
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
      });
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "john@example.com",
        password: "password123",
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows error on registration failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Registration failed" }),
    });

    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const nameInput = screen.getByLabelText("auth.register.name");
    const emailInput = screen.getByLabelText("auth.register.email");
    const passwordInput = screen.getByLabelText("auth.register.password");
    const confirmPasswordInput = screen.getByLabelText(
      "auth.register.confirmPassword",
    );
    const submitButton = screen.getByRole("button", {
      name: "navbar.register",
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });

  it("shows error on signIn failure after registration", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    mockSignIn.mockResolvedValueOnce({ error: "SignIn failed" });

    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const nameInput = screen.getByLabelText("auth.register.name");
    const emailInput = screen.getByLabelText("auth.register.email");
    const passwordInput = screen.getByLabelText("auth.register.password");
    const confirmPasswordInput = screen.getByLabelText(
      "auth.register.confirmPassword",
    );
    const submitButton = screen.getByRole("button", {
      name: "navbar.register",
    });

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("SignIn failed")).toBeInTheDocument();
    });
  });

  it("calls onSwitchToLogin when login button is clicked", () => {
    render(
      <RegisterForm
        onClose={mockOnClose}
        onSwitchToLogin={mockOnSwitchToLogin}
      />,
    );

    const loginButton = screen.getByRole("button", { name: "navbar.login" });
    fireEvent.click(loginButton);

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });
});
