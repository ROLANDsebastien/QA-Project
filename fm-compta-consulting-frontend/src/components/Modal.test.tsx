import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "./Modal";

// Mock createPortal to render directly for testing
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (children: React.ReactNode) => children,
}));

describe("Modal", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: "Test Modal",
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when isOpen is true", () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument(); // Close button
  });

  it("does not render modal when isOpen is false", () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Content")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<Modal {...defaultProps} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking outside the modal", () => {
    render(<Modal {...defaultProps} />);

    // Click on the backdrop (outside the modal content)
    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.mouseDown(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other keys", () => {
    render(<Modal {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("prevents body scroll when open", () => {
    render(<Modal {...defaultProps} />);

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(<Modal {...defaultProps} />);

    rerender(<Modal {...defaultProps} isOpen={false} />);

    expect(document.body.style.overflow).toBe("auto");
  });
});
