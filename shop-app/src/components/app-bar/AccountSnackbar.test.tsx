import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AccountSnackbar from "./AccountSnackbar";

describe("AccountSnackbar", () => {
  const successMessage = "success";
  const errorMessage = "error";

  it("should show the success message if isSuccess is true", () => {
    render(
      <AccountSnackbar
        open
        isSuccess
        successMessage={successMessage}
        errorMessage={errorMessage}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(successMessage)).toBeInTheDocument();
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  it("should show the error message if isSuccess is false", () => {
    render(
      <AccountSnackbar
        open
        isSuccess={false}
        successMessage={successMessage}
        errorMessage={errorMessage}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
