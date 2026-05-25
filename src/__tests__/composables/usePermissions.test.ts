import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/services/authService";

vi.mock("@/services/authService", () => ({
  authService: { getUser: vi.fn() },
}));

async function setup(perfil: string | null) {
  vi.mocked(authService.getUser).mockReturnValue(
    perfil ? ({ perfil } as ReturnType<typeof authService.getUser>) : null,
  );
  const { usePermissions } = await import("@/composables/usePermissions");
  return usePermissions();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("usePermissions — perfis base", () => {
  it("isSuperAdmin é true para super_admin", async () => {
    const { isSuperAdmin } = await setup("super_admin");
    expect(isSuperAdmin.value).toBe(true);
  });

  it("isSuperAdmin é false para financeiro", async () => {
    const { isSuperAdmin } = await setup("financeiro");
    expect(isSuperAdmin.value).toBe(false);
  });

  it("isFinanceiro é true para financeiro", async () => {
    const { isFinanceiro } = await setup("financeiro");
    expect(isFinanceiro.value).toBe(true);
  });

  it("isCompras é true para compras", async () => {
    const { isCompras } = await setup("compras");
    expect(isCompras.value).toBe(true);
  });

  it("isAlmoxarifado é true para almoxarifado", async () => {
    const { isAlmoxarifado } = await setup("almoxarifado");
    expect(isAlmoxarifado.value).toBe(true);
  });

  it("isProjetos é true para projetos", async () => {
    const { isProjetos } = await setup("projetos");
    expect(isProjetos.value).toBe(true);
  });

  it("userProfile é null quando não há usuário", async () => {
    const { userProfile } = await setup(null);
    expect(userProfile.value).toBeNull();
  });
});

describe("usePermissions — canSeeCosts", () => {
  it.each(["super_admin", "financeiro"])(
    "canSeeCosts é true para %s",
    async (perfil) => {
      const { canSeeCosts } = await setup(perfil);
      expect(canSeeCosts.value).toBe(true);
    },
  );

  it.each(["compras", "almoxarifado", "projetos"])(
    "canSeeCosts é false para %s",
    async (perfil) => {
      const { canSeeCosts } = await setup(perfil);
      expect(canSeeCosts.value).toBe(false);
    },
  );
});

describe("usePermissions — isMaterialsLimitedProfile", () => {
  it.each(["compras", "almoxarifado", "projetos"])(
    "isMaterialsLimitedProfile é true para %s",
    async (perfil) => {
      const { isMaterialsLimitedProfile } = await setup(perfil);
      expect(isMaterialsLimitedProfile.value).toBe(true);
    },
  );

  it.each(["super_admin", "financeiro"])(
    "isMaterialsLimitedProfile é false para %s",
    async (perfil) => {
      const { isMaterialsLimitedProfile } = await setup(perfil);
      expect(isMaterialsLimitedProfile.value).toBe(false);
    },
  );
});

describe("usePermissions — canAccessDashboard", () => {
  it.each(["super_admin", "financeiro", "projetos"])(
    "canAccessDashboard é true para %s",
    async (perfil) => {
      const { canAccessDashboard } = await setup(perfil);
      expect(canAccessDashboard.value).toBe(true);
    },
  );

  it.each(["compras", "almoxarifado"])(
    "canAccessDashboard é false para %s",
    async (perfil) => {
      const { canAccessDashboard } = await setup(perfil);
      expect(canAccessDashboard.value).toBe(false);
    },
  );
});

describe("usePermissions — canAccessHoras", () => {
  it.each(["super_admin", "financeiro", "projetos"])(
    "canAccessHoras é true para %s",
    async (perfil) => {
      const { canAccessHoras } = await setup(perfil);
      expect(canAccessHoras.value).toBe(true);
    },
  );

  it.each(["compras", "almoxarifado"])(
    "canAccessHoras é false para %s",
    async (perfil) => {
      const { canAccessHoras } = await setup(perfil);
      expect(canAccessHoras.value).toBe(false);
    },
  );
});

describe("usePermissions — canAccessConsolidado", () => {
  it.each(["super_admin", "financeiro", "projetos"])(
    "canAccessConsolidado é true para %s",
    async (perfil) => {
      const { canAccessConsolidado } = await setup(perfil);
      expect(canAccessConsolidado.value).toBe(true);
    },
  );

  it.each(["compras", "almoxarifado"])(
    "canAccessConsolidado é false para %s",
    async (perfil) => {
      const { canAccessConsolidado } = await setup(perfil);
      expect(canAccessConsolidado.value).toBe(false);
    },
  );
});

describe("usePermissions — canAccessOrcamento", () => {
  it.each(["super_admin", "financeiro"])(
    "canAccessOrcamento é true para %s",
    async (perfil) => {
      const { canAccessOrcamento } = await setup(perfil);
      expect(canAccessOrcamento.value).toBe(true);
    },
  );

  it.each(["projetos", "compras", "almoxarifado"])(
    "canAccessOrcamento é false para %s",
    async (perfil) => {
      const { canAccessOrcamento } = await setup(perfil);
      expect(canAccessOrcamento.value).toBe(false);
    },
  );

  it("canAccessOrcamento é false quando não há usuário", async () => {
    const { canAccessOrcamento } = await setup(null);
    expect(canAccessOrcamento.value).toBe(false);
  });
});
