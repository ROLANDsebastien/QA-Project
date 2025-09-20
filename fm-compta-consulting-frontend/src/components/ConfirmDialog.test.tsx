import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmDialog from "./ConfirmDialog";

// Mock createPortal to render directly for testing
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (children: React.ReactNode) => children,
}));

describe("ConfirmDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: "Confirm Action",
    message: "Are you sure?",
    confirmText: "Yes",
    cancelText: "No",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog when isOpen is true", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3); // Close button, No button, Yes button
  });

  it("does not render dialog when isOpen is false", () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    const closeButton = buttons[0]; // Close button (SVG button)
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking outside the dialog", () => {
    render(<ConfirmDialog {...defaultProps} />);

    // Click on the backdrop (outside the dialog content)
    const backdrop = screen.getByTestId("confirm-dialog-backdrop");
    fireEvent.mouseDown(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other keys", () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Enter" });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onConfirm and onClose when confirm button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: "Yes" });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "No" });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("prevents body scroll when open", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} />);

    rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(document.body.style.overflow).toBe("auto");
  });
});
