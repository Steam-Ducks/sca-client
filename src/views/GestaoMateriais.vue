<template>
  <div>
    <h2>Gestão de Materiais</h2>

    <!-- METRICS -->
    <div>
      <div>Custo Total de Materiais {{ totalCusto }}</div>
      <div>Total de Itens {{ tableData.length }}</div>
      <div>Custo Médio por Item {{ custoMedio }}</div>
    </div>

    <!-- FILTROS -->
    <div>
      <h3>Filtros</h3>

      <select v-model="filters.periodo">
        <option value="">
          Todos os Períodos
        </option>
        <option
          v-for="p in periodos"
          :key="p"
        >
          {{ p }}
        </option>
      </select>

      <select v-model="filters.programa">
        <option value="">
          Todos os Programas
        </option>
        <option
          v-for="p in programas"
          :key="p"
        >
          {{ p }}
        </option>
      </select>

      <select v-model="filters.projeto">
        <option value="">
          Todos os Projetos
        </option>
        <option
          v-for="p in availableProjects"
          :key="p"
        >
          {{ p }}
        </option>
      </select>

      <select v-model="filters.categoria">
        <option value="">
          Todas as Categorias
        </option>
        <option
          v-for="c in categorias"
          :key="c"
        >
          {{ c }}
        </option>
      </select>

      <select v-model="filters.fornecedor">
        <option value="">
          Todos os Fornecedores
        </option>
        <option
          v-for="f in fornecedores"
          :key="f"
        >
          {{ f }}
        </option>
      </select>

      <button
        class="clear-btn"
        @click="clearFilters"
      >
        Limpar filtros
      </button>
    </div>

    <!-- FILTROS ATIVOS -->
    <div v-if="activeFilters.length">
      <strong>Filtros ativos</strong>
      <div
        v-for="f in activeFilters"
        :key="f.key"
      >
        {{ f.label }}: {{ f.value }}
      </div>
    </div>

    <!-- CHARTS -->
    <div class="chart-card">
      Chart 1
    </div>
    <div class="chart-card">
      Chart 2
    </div>

    <!-- TABELA -->
    <table>
      <thead>
        <tr>
          <!-- SORT AQUI -->
          <th @click="sortBy('material')">
            Material
          </th>
          <th>Projeto</th>
          <th>Programa</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in sortedData"
          :key="r.id"
        >
          <td>{{ r.material }}</td>
          <td>{{ r.projeto }}</td>
          <td>{{ r.programa }}</td>
        </tr>
      </tbody>
    </table>

    <!-- PAGINAÇÃO -->
    <div class="pagination">
      Paginação
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { RAW } from "@/data/materiais";

/* STATE */
const filters = ref({
  periodo: "",
  programa: "",
  projeto: "",
  categoria: "",
  fornecedor: "",
});

/* SORT (resolve erro 2) */
const sortKey = ref("");

function sortBy(key: string) {
  sortKey.value = key;
}

/* OPTIONS */
const periodos = [...new Set(RAW.map((r) => r.periodo))];
const programas = [...new Set(RAW.map((r) => r.programa))];
const projetos = [...new Set(RAW.map((r) => r.projeto))];
const categorias = [...new Set(RAW.map((r) => r.categoria))];
const fornecedores = [...new Set(RAW.map((r) => r.fornecedor))];

/* DATA */
const tableData = ref(RAW);

/* SORTED DATA */
const sortedData = computed(() => {
  if (!sortKey.value) return tableData.value;

  return [...tableData.value].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
    String(a[sortKey.value]).localeCompare(String(b[sortKey.value]))
  );
});

/* METRICS */
const totalCusto = computed(() =>
  tableData.value.reduce((s, r: Record<string, unknown>) =>  s + Number(r.valor_total), 0
));

const custoMedio = computed(() =>
  tableData.value.length ? totalCusto.value / tableData.value.length : 0
);

/* PROJETOS DINÂMICOS */
const availableProjects = computed(() => {
  if (!filters.value.programa) return projetos;

  return [
    ...new Set(
      RAW
        .filter((r) => r.programa === filters.value.programa)
        .map((r) => r.projeto)
    ),
  ];
});

/* RESET */
watch(() => filters.value.programa, () => {
  filters.value.projeto = "";
});

/* FILTROS ATIVOS */
const activeFilters = computed(() =>
  [
    { key: "periodo", label: "Período", value: filters.value.periodo },
    { key: "programa", label: "Programa", value: filters.value.programa },
    { key: "projeto", label: "Projeto", value: filters.value.projeto },
    { key: "categoria", label: "Categoria", value: filters.value.categoria },
    { key: "fornecedor", label: "Fornecedor", value: filters.value.fornecedor },
  ].filter((f) => f.value !== "")
);

/* CLEAR */
function clearFilters() {
  filters.value = {
    periodo: "",
    programa: "",
    projeto: "",
    categoria: "",
    fornecedor: "",
  };
}
</script>