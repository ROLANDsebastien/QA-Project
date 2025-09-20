import React from "react";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Layout from "./Layout";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return key as is for simplicity
  }),
}));

// Mock next/router
const mockPush = jest.fn();
const mockRouter = {
  pathname: "/",
  asPath: "/",
  locale: "fr",
  isReady: true,
  push: mockPush,
};
jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock react-icons
jest.mock("react-icons/fa", () => ({
  FaGlobe: () => <div data-testid="fa-globe" />,
  FaUser: () => <div data-testid="fa-user" />,
  FaSignOutAlt: () => <div data-testid="fa-signout" />,
}));

// Mock dynamic imports
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (component: any) => component,
}));

// Mock child components with proper __esModule
jest.mock("./LoginForm", () => ({
  __esModule: true,
  default: ({ onClose, onSwitchToRegister }: any) => (
    <div data-testid="login-form">
      <button onClick={onClose} data-testid="login-close">
        Close Login
      </button>
      <button onClick={onSwitchToRegister} data-testid="switch-to-register">
        Switch to Register
      </button>
    </div>
  ),
}));

jest.mock("./RegisterForm", () => ({
  __esModule: true,
  default: ({ onClose, onSwitchToLogin }: any) => (
    <div data-testid="register-form">
      <button onClick={onClose} data-testid="register-close">
        Close Register
      </button>
      <button onClick={onSwitchToLogin} data-testid="switch-to-login">
        Switch to Login
      </button>
    </div>
  ),
}));

jest.mock("./Modal", () => ({
  __esModule: true,
  default: ({ children, isOpen, onClose, title }: any) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose} data-testid="modal-close">
          Close Modal
        </button>
      </div>
    ) : null,
}));

jest.mock("./ConfirmDialog", () => ({
  __esModule: true,
  default: ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
  }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} data-testid="confirm-cancel">
          {cancelText}
        </button>
        <button onClick={onConfirm} data-testid="confirm-confirm">
          {confirmText}
        </button>
      </div>
    ) : null,
}));

import { useSession, signOut } from "next-auth/react";

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe("Layout", () => {
  const defaultProps = {
    children: <div data-testid="children">Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset router mock
    mockRouter.pathname = "/";
    mockRouter.asPath = "/";
    mockRouter.locale = "fr";
    mockRouter.isReady = true;
  });

  describe("Unauthenticated user", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    it("renders the layout with navigation links", () => {
      render(<Layout {...defaultProps} />);

      expect(screen.getByText("FM Compta Consulting")).toBeInTheDocument();
      expect(screen.getByText("navbar.home")).toBeInTheDocument();
      expect(screen.getByText("navbar.about")).toBeInTheDocument();
      expect(screen.getByText("navbar.team")).toBeInTheDocument();
      expect(screen.getByText("navbar.contact")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("opens login modal when login button is clicked", () => {
      render(<Layout {...defaultProps} />);

      const loginButton = screen.getByText("navbar.login");
      fireEvent.click(loginButton);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    it("switches from login to register modal", () => {
      render(<Layout {...defaultProps} />);

      const loginButton = screen.getByText("navbar.login");
      fireEvent.click(loginButton);

      const switchButton = screen.getByTestId("switch-to-register");
      fireEvent.click(switchButton);

      expect(screen.getByTestId("register-form")).toBeInTheDocument();
    });

    it("toggles mobile menu", () => {
      render(<Layout {...defaultProps} />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      expect(screen.getByText("navbar.home")).toBeInTheDocument(); // Mobile menu items
    });
  });

  describe("Authenticated admin user", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
          },
          expires: "2024-01-01",
        },
        status: "authenticated",
      });
    });

    it("renders admin navigation links", () => {
      render(<Layout {...defaultProps} />);

      expect(screen.getByText("admin.title")).toBeInTheDocument();
      expect(screen.getByText("admin.calendar")).toBeInTheDocument();
    });

    it("shows user menu with logout option", () => {
      render(<Layout {...defaultProps} />);

      const userButton = screen.getByText("Admin User");
      fireEvent.click(userButton);

      expect(screen.getByText("navbar.logout")).toBeInTheDocument();
    });

    it("opens logout confirmation dialog", () => {
      render(<Layout {...defaultProps} />);

      const userButton = screen.getByText("Admin User");
      fireEvent.click(userButton);

      const logoutButton = screen.getByText("navbar.logout");
      fireEvent.click(logoutButton);

      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    });

    it("handles logout confirmation", async () => {
      mockSignOut.mockResolvedValue(undefined);

      render(<Layout {...defaultProps} />);

      const userButton = screen.getByText("Admin User");
      fireEvent.click(userButton);

      const logoutButton = screen.getByText("navbar.logout");
      fireEvent.click(logoutButton);

      const confirmButton = screen.getByTestId("confirm-confirm");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({
          redirect: true,
          callbackUrl: "/",
        });
      });
    });
  });

  describe("Authenticated regular user", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: "2",
            name: "Regular User",
            email: "user@example.com",
            role: "user",
          },
          expires: "2024-01-01",
        },
        status: "authenticated",
      });
    });

    it("renders user navigation links", () => {
      render(<Layout {...defaultProps} />);

      expect(screen.getByText("navbar.profile")).toBeInTheDocument();
      expect(screen.getByText("navbar.appointment")).toBeInTheDocument();
    });

    it("shows user name in navigation", () => {
      render(<Layout {...defaultProps} />);

      expect(screen.getByText("Regular User")).toBeInTheDocument();
    });
  });

  describe("Language switching", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    it("opens language menu", () => {
      render(<Layout {...defaultProps} />);

      const langButton = screen.getByText("FR");
      fireEvent.click(langButton);

      expect(screen.getByText("Français")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("Русский")).toBeInTheDocument();
      expect(screen.getByText("Română")).toBeInTheDocument();
    });

    it("changes language when clicked", () => {
      render(<Layout {...defaultProps} />);

      const langButton = screen.getByText("FR");
      fireEvent.click(langButton);

      const englishButton = screen.getByText("English");
      fireEvent.click(englishButton);

      expect(mockPush).toHaveBeenCalledWith("/", "/", { locale: "en" });
    });
  });

  describe("Footer", () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });
    });

    it("renders footer with company information", () => {
      render(<Layout {...defaultProps} />);

      expect(screen.getByText("FM Compta Consulting")).toBeInTheDocument();
      expect(screen.getByText(/Email: admin@fmcompta.be/)).toBeInTheDocument();
      expect(screen.getByText(/Tél: \+32 2 123 45 67/)).toBeInTheDocument();
      expect(screen.getByText(/Avenue du château 28/)).toBeInTheDocument();
      expect(screen.getByText(/Tous droits réservés/)).toBeInTheDocument();
    });
  });
});
