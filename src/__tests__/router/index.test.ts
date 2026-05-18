import { describe, it, expect } from "vitest";
import router from "@/router";

describe("Router", () => {
  it("has the correct routes defined", () => {
    const routes = router.options.routes;

    expect(routes).toHaveLength(6);

    expect(routes[0].path).toBe("/");
    expect(routes[0].redirect).toBe("/materiais");

    expect(routes[1].path).toBe("/materiais");
    expect(routes[1].name).toBe("materiais");

    expect(routes[2].path).toBe("/dashboard");
    expect(routes[2].name).toBe("dashboard");

    expect(routes[3].path).toBe("/horas");
    expect(routes[3].name).toBe("horas");

    expect(routes[4].path).toBe("/consolidado");
    expect(routes[4].name).toBe("consolidado");

    expect(routes[5].path).toBe("/orcamento");
    expect(routes[5].name).toBe("orcamento");
  });
});
