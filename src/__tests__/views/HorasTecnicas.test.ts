import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HorasTecnicas from "@/views/HorasTecnicas.vue";

describe("HorasTecnicas.vue", () => {
  it("renders the technical hours page", () => {
    const wrapper = mount(HorasTecnicas);

    expect(wrapper.text()).toContain("Horas Técnicas");
    expect(wrapper.find(".table-card").exists()).toBe(true);
  });

  it("displays metric cards and filters", () => {
    const wrapper = mount(HorasTecnicas);

    expect(wrapper.text()).toContain("Custo Total - Horas");
    expect(wrapper.text()).toContain("Total de Horas");
    expect(wrapper.text()).toContain("Filtros");
  });
});
