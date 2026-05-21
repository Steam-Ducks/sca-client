import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/authService", () => ({
  authService: {
    getToken: vi.fn(),
    clearSession: vi.fn(),
  },
}));

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

const locationMock = { href: "" };
Object.defineProperty(window, "location", { value: locationMock, writable: true });

import { authService } from "@/services/authService";
import { apiFetch } from "@/utils/apiFetch";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationMock.href = "";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
  });

  it("adds Authorization header when token exists", async () => {
    vi.mocked(authService.getToken).mockReturnValue("my_token");
    await apiFetch("http://api/resource");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api/resource",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer my_token" }),
      }),
    );
  });

  it("does not add Authorization header when no token", async () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    await apiFetch("http://api/resource");
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("includes Content-Type application/json by default", async () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    await apiFetch("http://api/resource");
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("passes method and body through to fetch", async () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    await apiFetch("http://api/resource", { method: "POST", body: '{"a":1}' });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api/resource",
      expect.objectContaining({ method: "POST", body: '{"a":1}' }),
    );
  });

  it("caller-provided headers override defaults", async () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    await apiFetch("http://api/resource", { headers: { "X-Custom": "value" } });
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["X-Custom"]).toBe("value");
  });

  it("clears session and redirects to /login on 401 when token exists", async () => {
    vi.mocked(authService.getToken).mockReturnValue("expired_token");
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await apiFetch("http://api/resource");
    expect(authService.clearSession).toHaveBeenCalled();
    expect(locationMock.href).toBe("/login");
  });

  it("does not clear session on 401 when no token (login failure)", async () => {
    vi.mocked(authService.getToken).mockReturnValue(null);
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await apiFetch("http://api/resource");
    expect(authService.clearSession).not.toHaveBeenCalled();
    expect(locationMock.href).toBe("");
  });
});
