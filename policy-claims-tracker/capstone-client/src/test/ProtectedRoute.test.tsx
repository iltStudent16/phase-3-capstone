import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ProtectedRoute from "../components/ProtectedRoute";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
