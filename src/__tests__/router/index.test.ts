import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/authService", () => ({
  authService: { isAuthenticated: vi.fn(), getUser: vi.fn() },
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

    it("/dashboard tem allowedProfiles corretos", () => {
      const route = router.options.routes[3];
      expect(route.meta?.allowedProfiles).toEqual(["super_admin", "financeiro", "projetos"]);
    });

    it("defines /horas route", () => {
      expect(router.options.routes[4].path).toBe("/horas");
    });

    it("/horas tem allowedProfiles corretos", () => {
      const route = router.options.routes[4];
      expect(route.meta?.allowedProfiles).toEqual(["super_admin", "financeiro", "projetos"]);
    });

    it("defines /consolidado route", () => {
      expect(router.options.routes[5].path).toBe("/consolidado");
    });

    it("/consolidado tem allowedProfiles corretos", () => {
      const route = router.options.routes[5];
      expect(route.meta?.allowedProfiles).toEqual(["super_admin", "financeiro", "projetos"]);
    });

    it("defines /orcamento route", () => {
      expect(router.options.routes[6].path).toBe("/orcamento");
    });

    it("/orcamento tem allowedProfiles corretos", () => {
      const route = router.options.routes[6];
      expect(route.meta?.allowedProfiles).toEqual(["super_admin", "financeiro"]);
    });

    it("defines /auditoria route", () => {
      expect(router.options.routes[7].path).toBe("/auditoria");
    });

    it("/auditoria não tem allowedProfiles (acesso a todos os perfis)", () => {
      const route = router.options.routes[7];
      expect(route.meta?.allowedProfiles).toBeUndefined();
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

  describe("allowedProfiles guard", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    });

    it.each(["compras", "almoxarifado"])(
      "redireciona %s para /materiais ao acessar /dashboard",
      async (perfil) => {
        vi.mocked(authService.getUser).mockReturnValue({ perfil } as ReturnType<typeof authService.getUser>);
        await router.push("/dashboard");
        expect(router.currentRoute.value.path).toBe("/materiais");
      },
    );

    it.each(["compras", "almoxarifado"])(
      "redireciona %s para /materiais ao acessar /horas",
      async (perfil) => {
        vi.mocked(authService.getUser).mockReturnValue({ perfil } as ReturnType<typeof authService.getUser>);
        await router.push("/horas");
        expect(router.currentRoute.value.path).toBe("/materiais");
      },
    );

    it.each(["compras", "almoxarifado"])(
      "redireciona %s para /materiais ao acessar /consolidado",
      async (perfil) => {
        vi.mocked(authService.getUser).mockReturnValue({ perfil } as ReturnType<typeof authService.getUser>);
        await router.push("/consolidado");
        expect(router.currentRoute.value.path).toBe("/materiais");
      },
    );

    it.each(["projetos", "compras", "almoxarifado"])(
      "redireciona %s para /materiais ao acessar /orcamento",
      async (perfil) => {
        vi.mocked(authService.getUser).mockReturnValue({ perfil } as ReturnType<typeof authService.getUser>);
        await router.push("/orcamento");
        expect(router.currentRoute.value.path).toBe("/materiais");
      },
    );

    it.each(["super_admin", "financeiro", "projetos"])(
      "permite %s acessar /dashboard",
      async (perfil) => {
        vi.mocked(authService.getUser).mockReturnValue({ perfil } as ReturnType<typeof authService.getUser>);
        await router.push("/dashboard");
        expect(router.currentRoute.value.path).toBe("/dashboard");
      },
    );

    it.each(["super_admin", "financeiro"])(
      "permite %s acessar /orcamento",
      async (perfil) => {
        vi.mocked(authService.getUser).mockReturnValue({ perfil } as ReturnType<typeof authService.getUser>);
        await router.push("/orcamento");
        expect(router.currentRoute.value.path).toBe("/orcamento");
      },
    );

    it("permite qualquer perfil autenticado acessar /auditoria", async () => {
      vi.mocked(authService.getUser).mockReturnValue({ perfil: "compras" } as ReturnType<typeof authService.getUser>);
      await router.push("/auditoria");
      expect(router.currentRoute.value.path).toBe("/auditoria");
    });

    it("permite qualquer perfil autenticado acessar /materiais", async () => {
      vi.mocked(authService.getUser).mockReturnValue({ perfil: "almoxarifado" } as ReturnType<typeof authService.getUser>);
      await router.push("/materiais");
      expect(router.currentRoute.value.path).toBe("/materiais");
    });
  });
});
