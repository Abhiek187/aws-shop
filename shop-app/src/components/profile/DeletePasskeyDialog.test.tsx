import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeletePasskeyDialog from "./DeletePasskeyDialog";

describe("DeletePasskeyDialog", () => {
  it("should render", () => {
    const name = "Windows Hello";
    const mockOnClose = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <DeletePasskeyDialog
        open
        name={name}
        onClose={mockOnClose}
        onDelete={mockOnDelete}
      />
    );

    const cancelButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /cancel/i,
    });
    const deleteButton = screen.getByRole<HTMLButtonElement>("button", {
      name: /delete/i,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
