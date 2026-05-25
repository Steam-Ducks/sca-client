import { computed } from "vue";
import { authService } from "@/services/authService";

export function usePermissions() {
  const userProfile = computed(() => authService.getUser()?.perfil ?? null);

  const isSuperAdmin = computed(() => userProfile.value === "super_admin");
  const isFinanceiro = computed(() => userProfile.value === "financeiro");
  const isCompras = computed(() => userProfile.value === "compras");
  const isAlmoxarifado = computed(() => userProfile.value === "almoxarifado");
  const isProjetos = computed(() => userProfile.value === "projetos");

  /** Profiles that can see monetary/cost values */
  const canSeeCosts = computed(
    () => isSuperAdmin.value || isFinanceiro.value,
  );

  /** Profiles that see materials but without cost data */
  const isMaterialsLimitedProfile = computed(
    () => isCompras.value || isAlmoxarifado.value || isProjetos.value,
  );

  const canAccessDashboard = computed(
    () => isSuperAdmin.value || isFinanceiro.value || isProjetos.value,
  );

  const canAccessHoras = computed(
    () => isSuperAdmin.value || isFinanceiro.value || isProjetos.value,
  );

  const canAccessConsolidado = computed(
    () => isSuperAdmin.value || isFinanceiro.value || isProjetos.value,
  );

  const canAccessOrcamento = computed(
    () => isSuperAdmin.value || isFinanceiro.value,
  );

  return {
    userProfile,
    isSuperAdmin,
    isFinanceiro,
    isCompras,
    isAlmoxarifado,
    isProjetos,
    canSeeCosts,
    isMaterialsLimitedProfile,
    canAccessDashboard,
    canAccessHoras,
    canAccessConsolidado,
    canAccessOrcamento,
  };
}
