import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";

vi.mock("@/services/authService", () => ({
  authService: {
    login: vi.fn(),
    saveSession: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(false),
  },
}));

vi.mock("@/composables/useTheme", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

import { authService } from "@/services/authService";
import type { AuthResponse } from "@/types/api";

const mockResponse: AuthResponse = {
  access: "token",
  refresh: "refresh",
  user: { id: 1, username: "admin", name: "Admin", perfil: "Administrador" },
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: LoginView },
    { path: "/materiais", component: { template: "<div/>" } },
  ],
});

function mountLogin() {
  return mount(LoginView, { global: { plugins: [router] } });
}

describe("LoginView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders username input", () => {
    const wrapper = mountLogin();
    expect(wrapper.find("#username").exists()).toBe(true);
  });

  it("renders password input", () => {
    const wrapper = mountLogin();
    expect(wrapper.find("#password").exists()).toBe(true);
  });

  it("renders submit button with text Entrar", () => {
    const wrapper = mountLogin();
    expect(wrapper.find('button[type="submit"]').text()).toContain("Entrar");
  });

  it("shows error when username is empty on submit", async () => {
    const wrapper = mountLogin();
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("O usuário é obrigatório.");
  });

  it("shows error when password is empty on submit", async () => {
    const wrapper = mountLogin();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("A senha é obrigatória.");
  });

  it("shows username error on blur with empty field", async () => {
    const wrapper = mountLogin();
    await wrapper.find("#username").trigger("blur");
    expect(wrapper.text()).toContain("O usuário é obrigatório.");
  });

  it("shows password error on blur with empty field", async () => {
    const wrapper = mountLogin();
    await wrapper.find("#password").trigger("blur");
    expect(wrapper.text()).toContain("A senha é obrigatória.");
  });

  it("calls authService.login with correct credentials on submit", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockResponse);
    const wrapper = mountLogin();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("#password").setValue("admin123");
    await wrapper.find("form").trigger("submit");
    expect(authService.login).toHaveBeenCalledWith({
      username: "admin",
      password: "admin123",
    });
  });

  it("saves session after successful login", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockResponse);
    const wrapper = mountLogin();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("#password").setValue("admin123");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => {
      expect(authService.saveSession).toHaveBeenCalledWith(mockResponse);
    });
  });

  it("displays general error message when login fails", async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new Error("Usuário ou senha inválidos."),
    );
    const wrapper = mountLogin();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("#password").setValue("wrong");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Usuário ou senha inválidos.");
    });
  });

  it("displays generic error when login throws non-Error", async () => {
    vi.mocked(authService.login).mockRejectedValue("unexpected");
    const wrapper = mountLogin();
    await wrapper.find("#username").setValue("admin");
    await wrapper.find("#password").setValue("pass");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Erro inesperado. Tente novamente.");
    });
  });
});
