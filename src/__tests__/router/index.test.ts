import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/authService", () => ({
  authService: { isAuthenticated: vi.fn() },
}));

import { authService } from "@/services/authService";
import router from "@/router";

describe("Router", () => {
  describe("route definitions", () => {
    it("has the correct number of routes defined", () => {
      expect(router.options.routes).toHaveLength(8);
    });

    it("redirects / to /login", () => {
      const root = router.options.routes[0];
      expect(root.path).toBe("/");
      expect(root.redirect).toBe("/login");
    });

    it("defines /login as a public route", () => {
      const login = router.options.routes[1];
      expect(login.path).toBe("/login");
      expect(login.name).toBe("login");
      expect(login.meta?.public).toBe(true);
    });

    it("defines /materiais route", () => {
      expect(router.options.routes[2].path).toBe("/materiais");
      expect(router.options.routes[2].name).toBe("materiais");
    });

    it("defines /dashboard route", () => {
      expect(router.options.routes[3].path).toBe("/dashboard");
    });

    it("defines /horas route", () => {
      expect(router.options.routes[4].path).toBe("/horas");
    });

    it("defines /consolidado route", () => {
      expect(router.options.routes[5].path).toBe("/consolidado");
    });

    it("defines /orcamento route", () => {
      expect(router.options.routes[6].path).toBe("/orcamento");
    });

    it("defines /auditoria route", () => {
      expect(router.options.routes[7].path).toBe("/auditoria");
    });

  });

  describe("navigation guard", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("redirects unauthenticated user to /login when accessing protected route", async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      await router.push("/materiais");
      expect(router.currentRoute.value.path).toBe("/login");
    });

    it("allows unauthenticated user to access /login", async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false);
      await router.push("/login");
      expect(router.currentRoute.value.path).toBe("/login");
    });

    it("redirects authenticated user away from /login to /materiais", async () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
      // Navigate away from /login first — pushing /login from /login is a duplicate
      // navigation that Vue Router skips (guard never runs). Moving to /auditoria
      // (a different authenticated route) first ensures the guard runs on the next push.
      await router.push("/auditoria");
      await router.push("/login");
      expect(router.currentRoute.value.path).toBe("/materiais");
    });
  });
});
