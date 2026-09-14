import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "../pages/LoginPage";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
