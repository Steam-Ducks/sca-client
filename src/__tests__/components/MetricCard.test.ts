import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import MetricCard from "@/components/MetricCard.vue";

describe("MetricCard.vue", () => {
  it("renders label and value", () => {
    const wrapper = mount(MetricCard, { props: { label: "Total", value: "R$ 100" } });
    expect(wrapper.find(".metric-label").text()).toBe("Total");
    expect(wrapper.find(".metric-value").text()).toBe("R$ 100");
  });

  it("renders numeric value as string", () => {
    const wrapper = mount(MetricCard, { props: { label: "Qtd", value: 42 } });
    expect(wrapper.find(".metric-value").text()).toBe("42");
  });

  it("applies color class to metric-value", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V", color: "blue" } });
    expect(wrapper.find(".metric-value").classes()).toContain("blue");
  });

  it.each(["blue", "green", "amber", "red", "date"] as const)(
    "applies color class %s to metric-value",
    (color) => {
      const wrapper = mount(MetricCard, { props: { label: "L", value: "V", color } });
      expect(wrapper.find(".metric-value").classes()).toContain(color);
    },
  );

  it("does not add color class when color is not provided", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V" } });
    const valueClasses = wrapper.find(".metric-value").classes();
    expect(valueClasses).not.toContain("blue");
    expect(valueClasses).not.toContain("green");
  });

  it("applies size-sm class when size prop is sm", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V", size: "sm" } });
    expect(wrapper.find(".metric-value").classes()).toContain("size-sm");
  });

  it("does not apply size-sm class by default", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V" } });
    expect(wrapper.find(".metric-value").classes()).not.toContain("size-sm");
  });

  it("renders sub text when provided", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V", sub: "Snapshot" } });
    expect(wrapper.find(".metric-sub").exists()).toBe(true);
    expect(wrapper.find(".metric-sub").text()).toBe("Snapshot");
  });

  it("does not render metric-sub when sub is not provided", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V" } });
    expect(wrapper.find(".metric-sub").exists()).toBe(false);
  });

  it("renders icon slot and applies icon variant class", () => {
    const wrapper = mount(MetricCard, {
      props: { label: "L", value: "V", color: "green" },
      slots: { icon: "<svg data-testid='icon'></svg>" },
    });
    expect(wrapper.find(".metric-card").classes()).toContain("metric-card--icon");
    expect(wrapper.find(".metric-icon-wrap").exists()).toBe(true);
    expect(wrapper.find(".metric-icon-wrap").classes()).toContain("green");
  });

  it("does not render icon wrap when icon slot is empty", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V" } });
    expect(wrapper.find(".metric-card").classes()).not.toContain("metric-card--icon");
    expect(wrapper.find(".metric-icon-wrap").exists()).toBe(false);
  });

  it("has metric-card root class", () => {
    const wrapper = mount(MetricCard, { props: { label: "L", value: "V" } });
    expect(wrapper.find(".metric-card").exists()).toBe(true);
  });
});
