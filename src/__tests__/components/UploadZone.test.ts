import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import UploadZone from "@/components/UploadZone.vue";

describe("UploadZone.vue", () => {
  it("renders the upload-grid container", () => {
    const wrapper = mount(UploadZone);
    expect(wrapper.find(".upload-grid").exists()).toBe(true);
  });

  it("renders default slot content", () => {
    const wrapper = mount(UploadZone, {
      slots: { default: "<div class='card'>Card</div>" },
    });
    expect(wrapper.find(".upload-grid .card").exists()).toBe(true);
    expect(wrapper.find(".card").text()).toBe("Card");
  });

  it("renders multiple slot items", () => {
    const wrapper = mount(UploadZone, {
      slots: {
        default: [
          "<div class='item'>A</div>",
          "<div class='item'>B</div>",
          "<div class='item'>C</div>",
        ],
      },
    });
    expect(wrapper.findAll(".item")).toHaveLength(3);
  });

  it("renders empty without slot content", () => {
    const wrapper = mount(UploadZone);
    expect(wrapper.find(".upload-grid").exists()).toBe(true);
    expect(wrapper.find(".upload-grid").text()).toBe("");
  });
});
