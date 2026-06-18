import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import StatusBadge from "@/components/StatusBadge.vue";

describe("StatusBadge.vue", () => {
  it("has base badge class", () => {
    const wrapper = mount(StatusBadge, { props: { value: "Hardware" } });
    expect(wrapper.find(".badge").exists()).toBe(true);
  });

  it("renders the value as text", () => {
    const wrapper = mount(StatusBadge, { props: { value: "Concluído" } });
    expect(wrapper.text()).toBe("Concluído");
  });

  it.each([
    ["Concluído", "badge-st"],
    ["Em Andamento", "badge-hw"],
    ["Planejado", "badge-sg"],
    ["Cancelado", "badge-rd"],
  ])("maps status '%s' to class %s", (value, expectedClass) => {
    const wrapper = mount(StatusBadge, { props: { value } });
    expect(wrapper.find(".badge").classes()).toContain(expectedClass);
  });

  it.each([
    ["Hardware", "badge-hw"],
    ["Storage", "badge-st"],
    ["Cloud", "badge-cl"],
    ["Segurança", "badge-sg"],
    ["Software", "badge-sw"],
    ["Rede", "badge-rd"],
  ])("maps category '%s' to class %s", (value, expectedClass) => {
    const wrapper = mount(StatusBadge, { props: { value } });
    expect(wrapper.find(".badge").classes()).toContain(expectedClass);
  });

  it("falls back to badge-hw for unknown value", () => {
    const wrapper = mount(StatusBadge, { props: { value: "Desconhecido" } });
    expect(wrapper.find(".badge").classes()).toContain("badge-hw");
  });
});
