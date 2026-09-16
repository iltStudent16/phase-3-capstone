import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Navbar from "../components/Navbar";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Alice Admin", role: "admin" },
    logout: vi.fn(),
  }),
}));

describe("Navbar", () => {
  it("renders app name and navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Policy Claims Tracker")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Claims")).toBeInTheDocument();
    expect(screen.getByText("Policies")).toBeInTheDocument();
  });
});
