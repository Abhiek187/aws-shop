import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DeleteAccountDialog from "./DeleteAccountDialog";

describe("DeleteAccountDialog", () => {
  it("should enable the Delete button when the email is typed", () => {
    const email = "user@email.com";
    const mockOnClose = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <DeleteAccountDialog
        open
        email={email}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const textField = screen.getByPlaceholderText<HTMLInputElement>(email);
    const cancelButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /cancel/i,
    });
    const deleteButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /delete/i,
    });
    expect(textField).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    fireEvent.change(textField, { target: { value: "wrong email" } });
    expect(deleteButton).toBeDisabled();
    fireEvent.change(textField, { target: { value: email } });
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
