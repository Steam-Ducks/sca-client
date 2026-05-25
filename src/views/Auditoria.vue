<template>
  <div class="app">
    <main class="main">
      <h1 class="sr-only">
        Auditoria e Importação de Dados
      </h1>

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-title">
          <svg
            class="shield-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Auditoria e Importação de Dados</span>
        </div>
        <p class="header-subtitle">
          Monitoramento de cargas, importação manual de dados e rastreabilidade do sistema
        </p>
      </div>

      <!-- KPI CARDS -->
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-icon-wrap blue">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <ellipse
                cx="12"
                cy="5"
                rx="9"
                ry="3"
              />
              <path d="M3 5v5c0 1.7 4 3 9 3s9-1.3 9-3V5" />
              <path d="M3 10v5c0 1.7 4 3 9 3s9-1.3 9-3v-5" />
            </svg>
          </div>
          <p class="metric-label">
            Total de Cargas
          </p>
          <p class="metric-value">
            {{ falhasTotal }}
          </p>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap green">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p class="metric-label">
            Concluídas
          </p>
          <p class="metric-value">
            {{ kpis.concluidas }}
          </p>
          <p class="metric-sub">
            {{ pct(kpis.concluidas) }}% do total
          </p>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap amber">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
                stroke-width="2"
              />
            </svg>
          </div>
          <p class="metric-label">
            Parciais
          </p>
          <p class="metric-value">
            {{ kpis.parciais }}
          </p>
          <p class="metric-sub">
            {{ pct(kpis.parciais) }}% do total
          </p>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap red">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <line
                x1="15"
                y1="9"
                x2="9"
                y2="15"
              />
              <line
                x1="9"
                y1="9"
                x2="15"
                y2="15"
              />
            </svg>
          </div>
          <p class="metric-label">
            Falhas
          </p>
          <p class="metric-value">
            {{ kpis.falhas }}
          </p>
          <p class="metric-sub">
            {{ pct(kpis.falhas) }}% do total
          </p>
        </div>
      </div>

      <!-- TABS CONTAINER -->
      <div class="tabs-container">
        <!-- Tab Navigation -->
        <div class="tabs-nav">
          <button
            :class="['tab-btn', { active: activeTab === 'importacao' }]"
            @click="activeTab = 'importacao'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="15"
              />
            </svg>
            Importação de Dados
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'historico' }]"
            @click="activeTab = 'historico'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Histórico de Execuções
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'falhas' }]"
            @click="activeTab = 'falhas'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
                stroke-width="2"
              />
            </svg>
            Falhas e Inconsistências
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tabs-content">
          <!-- ── Importação de Dados ──────────────────────────────────── -->
          <div
            v-show="activeTab === 'importacao'"
            class="tab-panel"
          >
            <div class="import-sections">
              <!-- Importação Organizacional -->
              <div
                v-if="visibleOrgFiles.length > 0"
                class="import-section"
              >
                <div class="section-header">
                  <div class="section-icon blue">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z" />
                      <path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                      <path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" />
                      <line
                        x1="10"
                        y1="6"
                        x2="14"
                        y2="6"
                      />
                      <line
                        x1="10"
                        y1="10"
                        x2="14"
                        y2="10"
                      />
                      <line
                        x1="10"
                        y1="14"
                        x2="14"
                        y2="14"
                      />
                      <line
                        x1="10"
                        y1="18"
                        x2="14"
                        y2="18"
                      />
                    </svg>
                  </div>
                  <h3 class="section-title">
                    Importação Organizacional
                  </h3>
                </div>
                <p class="section-desc">
                  Atualização das estruturas organizacionais utilizadas no ambiente analítico
                </p>
                <div class="upload-grid">
                  <div
                    v-for="file in visibleOrgFiles"
                    :key="file.key"
                    class="upload-card"
                  >
                    <div class="upload-card-header">
                      <div class="file-name-row">
                        <svg
                          class="file-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line
                            x1="16"
                            y1="13"
                            x2="8"
                            y2="13"
                          />
                          <line
                            x1="16"
                            y1="17"
                            x2="8"
                            y2="17"
                          />
                        </svg>
                        <span class="file-name">{{ file.name }}</span>
                      </div>
                      <span
                        v-if="importStatus[file.key]"
                        :class="importBadgeClass(importStatus[file.key].status)"
                      >
                        {{ importBadgeLabel(importStatus[file.key].status) }}
                      </span>
                    </div>
                    <p
                      v-if="importStatus[file.key]?.message"
                      :class="['upload-message', { error: importStatus[file.key].status === 'error' }]"
                    >
                      {{ importStatus[file.key].message }}
                      <span v-if="importStatus[file.key].recordsProcessed"> — {{ importStatus[file.key].recordsProcessed }} registros</span>
                    </p>
                    <input
                      :id="`file-input-${file.key}`"
                      type="file"
                      accept=".csv"
                      class="sr-only"
                      @change="handleFileChange(file.key, $event)"
                    >
                    <button
                      :disabled="importStatus[file.key]?.status === 'processing'"
                      class="upload-btn"
                      @click="triggerFileInput(file.key)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line
                          x1="12"
                          y1="3"
                          x2="12"
                          y2="15"
                        />
                      </svg>
                      {{ importStatus[file.key]?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Importação de Materiais -->
              <div
                v-if="visibleMateriaisFiles.length > 0"
                class="import-section"
              >
                <div class="section-header">
                  <div class="section-icon green">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line
                        x1="16.5"
                        y1="9.4"
                        x2="7.5"
                        y2="4.21"
                      />
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line
                        x1="12"
                        y1="22.08"
                        x2="12"
                        y2="12"
                      />
                    </svg>
                  </div>
                  <h3 class="section-title">
                    Importação de Materiais
                  </h3>
                </div>
                <p class="section-desc">
                  Atualização dos dados relacionados a materiais, compras, estoque e fornecedores
                </p>
                <div class="upload-grid">
                  <div
                    v-for="file in visibleMateriaisFiles"
                    :key="file.key"
                    class="upload-card"
                  >
                    <div class="upload-card-header">
                      <div class="file-name-row">
                        <svg
                          class="file-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line
                            x1="16"
                            y1="13"
                            x2="8"
                            y2="13"
                          />
                          <line
                            x1="16"
                            y1="17"
                            x2="8"
                            y2="17"
                          />
                        </svg>
                        <span class="file-name">{{ file.name }}</span>
                      </div>
                      <span
                        v-if="importStatus[file.key]"
                        :class="importBadgeClass(importStatus[file.key].status)"
                      >
                        {{ importBadgeLabel(importStatus[file.key].status) }}
                      </span>
                    </div>
                    <p
                      v-if="importStatus[file.key]?.message"
                      :class="['upload-message', { error: importStatus[file.key].status === 'error' }]"
                    >
                      {{ importStatus[file.key].message }}
                      <span v-if="importStatus[file.key].recordsProcessed"> — {{ importStatus[file.key].recordsProcessed }} registros</span>
                    </p>
                    <input
                      :id="`file-input-${file.key}`"
                      type="file"
                      accept=".csv"
                      class="sr-only"
                      @change="handleFileChange(file.key, $event)"
                    >
                    <button
                      :disabled="importStatus[file.key]?.status === 'processing'"
                      class="upload-btn"
                      @click="triggerFileInput(file.key)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line
                          x1="12"
                          y1="3"
                          x2="12"
                          y2="15"
                        />
                      </svg>
                      {{ importStatus[file.key]?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Importação de Horas Técnicas -->
              <div
                v-if="visibleHorasFiles.length > 0"
                class="import-section"
              >
                <div class="section-header">
                  <div class="section-icon purple">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                      />
                      <path d="M23 21v-2a4 4 0 00-3-3.87" />
                      <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <h3 class="section-title">
                    Importação de Horas Técnicas
                  </h3>
                </div>
                <p class="section-desc">
                  Atualização dos dados relacionados às tarefas executadas e horas técnicas registradas
                </p>
                <div class="upload-grid">
                  <div
                    v-for="file in visibleHorasFiles"
                    :key="file.key"
                    class="upload-card"
                  >
                    <div class="upload-card-header">
                      <div class="file-name-row">
                        <svg
                          class="file-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line
                            x1="16"
                            y1="13"
                            x2="8"
                            y2="13"
                          />
                          <line
                            x1="16"
                            y1="17"
                            x2="8"
                            y2="17"
                          />
                        </svg>
                        <span class="file-name">{{ file.name }}</span>
                      </div>
                      <span
                        v-if="importStatus[file.key]"
                        :class="importBadgeClass(importStatus[file.key].status)"
                      >
                        {{ importBadgeLabel(importStatus[file.key].status) }}
                      </span>
                    </div>
                    <p
                      v-if="importStatus[file.key]?.message"
                      :class="['upload-message', { error: importStatus[file.key].status === 'error' }]"
                    >
                      {{ importStatus[file.key].message }}
                      <span v-if="importStatus[file.key].recordsProcessed"> — {{ importStatus[file.key].recordsProcessed }} registros</span>
                    </p>
                    <input
                      :id="`file-input-${file.key}`"
                      type="file"
                      accept=".csv"
                      class="sr-only"
                      @change="handleFileChange(file.key, $event)"
                    >
                    <button
                      :disabled="importStatus[file.key]?.status === 'processing'"
                      class="upload-btn"
                      @click="triggerFileInput(file.key)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line
                          x1="12"
                          y1="3"
                          x2="12"
                          y2="15"
                        />
                      </svg>
                      {{ importStatus[file.key]?.status === 'processing' ? 'Processando...' : 'Selecionar Arquivo' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Histórico de Execuções ────────────────────────────── -->
          <div
            v-show="activeTab === 'historico'"
            class="tab-panel"
          >
            <p class="hist-subtitle">
              Histórico completo de execuções de importação e integração de dados
            </p>

            <!-- Filters -->
            <div class="hist-filters">
              <select
                v-model="historicoFilters.status"
                class="hist-select"
                @change="loadHistorico"
              >
                <option value="">
                  Todos os status
                </option>
                <option value="SUCCESS">
                  Sucesso
                </option>
                <option value="PARTIAL">
                  Parcial
                </option>
                <option value="FAILED">
                  Falha
                </option>
              </select>
              <input
                v-model="historicoFilters.tabela"
                type="text"
                placeholder="Tabela..."
                class="hist-input"
                @input="loadHistorico"
              >
              <input
                v-model="historicoFilters.fonte"
                type="text"
                placeholder="Fonte..."
                class="hist-input"
                @input="loadHistorico"
              >
              <input
                v-model="historicoFilters.data_inicio"
                type="date"
                class="hist-input"
                @change="loadHistorico"
              >
              <input
                v-model="historicoFilters.data_fim"
                type="date"
                class="hist-input"
                @change="loadHistorico"
              >
            </div>

            <!-- Table card -->
            <div class="hist-card">
              <div class="hist-card-header">
                <span class="hist-card-title">Execuções</span>
                <span class="hist-count">{{ historicoTotal }} registros</span>
              </div>

              <!-- Loading -->
              <div
                v-if="historicoLoading"
                class="hist-feedback"
              >
                <span class="hist-spinner" />
                Carregando...
              </div>

              <!-- Error -->
              <div
                v-else-if="historicoError"
                class="hist-feedback hist-feedback--error"
              >
                {{ historicoError }}
              </div>

              <!-- Empty -->
              <div
                v-else-if="historicoRows.length === 0"
                class="hist-feedback hist-feedback--muted"
              >
                Nenhum registro encontrado.
              </div>

              <!-- Table -->
              <div
                v-else
                class="hist-table-wrap"
              >
                <table class="hist-table">
                  <thead>
                    <tr>
                      <th
                        class="sort-col"
                        @click="sortHistorico('iniciado_em')"
                      >
                        Data/Hora {{ historicoSortIcon('iniciado_em') }}
                      </th>
                      <th
                        class="sort-col"
                        @click="sortHistorico('tabela')"
                      >
                        Tabela {{ historicoSortIcon('tabela') }}
                      </th>
                      <th
                        class="sort-col"
                        @click="sortHistorico('tipo_processo')"
                      >
                        Tipo {{ historicoSortIcon('tipo_processo') }}
                      </th>
                      <th
                        class="sort-col"
                        @click="sortHistorico('fonte')"
                      >
                        Fonte {{ historicoSortIcon('fonte') }}
                      </th>
                      <th
                        class="sort-col num-col"
                        @click="sortHistorico('duracao_segundos')"
                      >
                        Duração {{ historicoSortIcon('duracao_segundos') }}
                      </th>
                      <th
                        class="sort-col num-col"
                        @click="sortHistorico('linhas_processadas')"
                      >
                        Registros {{ historicoSortIcon('linhas_processadas') }}
                      </th>
                      <th
                        class="sort-col"
                        @click="sortHistorico('status')"
                      >
                        Status {{ historicoSortIcon('status') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in historicoPagedData"
                      :key="row.id"
                    >
                      <td class="mono">
                        {{ formatDate(row.iniciado_em) }}
                      </td>
                      <td>{{ row.tabela }}</td>
                      <td>
                        <span :class="row.tipo_processo === 'INCREMENTAL' ? 'tipo-badge tipo-badge--inc' : 'tipo-badge tipo-badge--comp'">
                          {{ row.tipo_processo === 'INCREMENTAL' ? 'Incremental' : 'Completa' }}
                        </span>
                      </td>
                      <td class="muted-cell">
                        {{ row.fonte }}
                      </td>
                      <td class="mono num-col">
                        {{ formatDuration(row.duracao_segundos) }}
                      </td>
                      <td class="mono num-col">
                        {{ row.linhas_processadas }}
                      </td>
                      <td>
                        <span :class="falhaStatusClass(row.status)">
                          <svg
                            v-if="row.status === 'PARTIAL'"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line
                              x1="12"
                              y1="9"
                              x2="12"
                              y2="13"
                            />
                            <line
                              x1="12"
                              y1="17"
                              x2="12.01"
                              y2="17"
                            />
                          </svg>
                          <svg
                            v-else-if="row.status === 'FAILED'"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                            />
                            <line
                              x1="15"
                              y1="9"
                              x2="9"
                              y2="15"
                            />
                            <line
                              x1="9"
                              y1="9"
                              x2="15"
                              y2="15"
                            />
                          </svg>
                          <svg
                            v-else
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          {{ falhaStatusLabel(row.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="hist-pagination">
                <span>{{ historicoRows.length }} registros · página {{ historicoPage }} de {{ historicoTotalPages }}</span>
                <div class="pg-btns">
                  <button
                    class="pg-btn"
                    :disabled="historicoPage === 1"
                    @click="historicoPage = 1"
                  >
                    «
                  </button>
                  <button
                    class="pg-btn"
                    :disabled="historicoPage === 1"
                    @click="historicoPage--"
                  >
                    ‹
                  </button>
                  <button
                    v-for="p in historicoVisiblePages"
                    :key="p"
                    class="pg-btn"
                    :class="{ active: p === historicoPage }"
                    @click="historicoPage = p"
                  >
                    {{ p }}
                  </button>
                  <button
                    class="pg-btn"
                    :disabled="historicoPage === historicoTotalPages"
                    @click="historicoPage++"
                  >
                    ›
                  </button>
                  <button
                    class="pg-btn"
                    :disabled="historicoPage === historicoTotalPages"
                    @click="historicoPage = historicoTotalPages"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Falhas e Inconsistências ──────────────────────────── -->
          <div
            v-show="activeTab === 'falhas'"
            class="tab-panel"
          >
            <p class="falhas-subtitle">
              Identificação de falhas ocorridas durante processos de importação e integração de dados
            </p>

            <!-- Filters -->
            <div class="falhas-filters">
              <select
                v-model="falhasFilters.status"
                class="falhas-select"
                @change="loadFalhas"
              >
                <option value="">
                  Todos os status
                </option>
                <option value="SUCCESS">
                  Sucesso
                </option>
                <option value="PARTIAL">
                  Parcial
                </option>
                <option value="FAILED">
                  Falha
                </option>
              </select>
              <input
                v-model="falhasFilters.data_inicio"
                type="date"
                class="falhas-input"
                @change="loadFalhas"
              >
              <input
                v-model="falhasFilters.data_fim"
                type="date"
                class="falhas-input"
                @change="loadFalhas"
              >
            </div>

            <!-- Table card -->
            <div class="falhas-card">
              <div class="falhas-card-header">
                <span class="falhas-card-title">Falhas Detectadas</span>
                <span class="falhas-count">{{ falhasTotal }} registros</span>
              </div>

              <!-- Loading -->
              <div
                v-if="falhasLoading"
                class="falhas-feedback"
              >
                <span class="falhas-spinner" />
                Carregando...
              </div>

              <!-- Error -->
              <div
                v-else-if="falhasError"
                class="falhas-feedback falhas-feedback--error"
              >
                {{ falhasError }}
              </div>

              <!-- Empty -->
              <div
                v-else-if="falhasRows.length === 0"
                class="falhas-feedback falhas-feedback--muted"
              >
                Nenhum registro encontrado.
              </div>

              <!-- Table -->
              <div
                v-else
                class="falhas-table-wrap"
              >
                <table class="falhas-table">
                  <thead>
                    <tr>
                      <th
                        class="sort-col"
                        @click="sortFalhas('iniciado_em')"
                      >
                        Data/Hora {{ sortIcon('iniciado_em') }}
                      </th>
                      <th>Tabela</th>
                      <th>Mensagem de Falha</th>
                      <th
                        class="sort-col num-col"
                        @click="sortFalhas('erros')"
                      >
                        Erros {{ sortIcon('erros') }}
                      </th>
                      <th
                        class="sort-col num-col"
                        @click="sortFalhas('avisos')"
                      >
                        Avisos {{ sortIcon('avisos') }}
                      </th>
                      <th
                        class="sort-col num-col"
                        @click="sortFalhas('linhas_processadas')"
                      >
                        Registros {{ sortIcon('linhas_processadas') }}
                      </th>
                      <th
                        class="sort-col"
                        @click="sortFalhas('status')"
                      >
                        Status {{ sortIcon('status') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in falhasPagedData"
                      :key="row.id"
                    >
                      <td class="mono">
                        {{ formatDate(row.iniciado_em) }}
                      </td>
                      <td>{{ row.tabela }}</td>
                      <td :class="['falha-msg', { 'falha-msg--red': row.status === 'FAILED', 'falha-msg--amber': row.status === 'PARTIAL' }]">
                        {{ row.detalhes_falha || '—' }}
                      </td>
                      <td class="mono num-col erros-col">
                        {{ row.erros }}
                      </td>
                      <td class="mono num-col avisos-col">
                        {{ row.avisos }}
                      </td>
                      <td class="mono num-col">
                        {{ row.linhas_processadas }}
                      </td>
                      <td>
                        <span :class="falhaStatusClass(row.status)">
                          <svg
                            v-if="row.status === 'PARTIAL'"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line
                              x1="12"
                              y1="9"
                              x2="12"
                              y2="13"
                            />
                            <line
                              x1="12"
                              y1="17"
                              x2="12.01"
                              y2="17"
                            />
                          </svg>
                          <svg
                            v-else-if="row.status === 'FAILED'"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                            />
                            <line
                              x1="15"
                              y1="9"
                              x2="9"
                              y2="15"
                            />
                            <line
                              x1="9"
                              y1="9"
                              x2="15"
                              y2="15"
                            />
                          </svg>
                          <svg
                            v-else
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          {{ falhaStatusLabel(row.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="pagination">
                <span>{{ sortedFalhas.length }} registros · página {{ falhasPage }} de {{ falhasTotalPages }}</span>
                <div class="pg-btns">
                  <button
                    class="pg-btn"
                    :disabled="falhasPage === 1"
                    @click="falhasPage = 1"
                  >
                    «
                  </button>
                  <button
                    class="pg-btn"
                    :disabled="falhasPage === 1"
                    @click="falhasPage--"
                  >
                    ‹
                  </button>
                  <button
                    v-for="p in falhasVisiblePages"
                    :key="p"
                    class="pg-btn"
                    :class="{ active: p === falhasPage }"
                    @click="falhasPage = p"
                  >
                    {{ p }}
                  </button>
                  <button
                    class="pg-btn"
                    :disabled="falhasPage === falhasTotalPages"
                    @click="falhasPage++"
                  >
                    ›
                  </button>
                  <button
                    class="pg-btn"
                    :disabled="falhasPage === falhasTotalPages"
                    @click="falhasPage = falhasTotalPages"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { CONFIG } from "@/utils/config";
import { authService } from "@/services/authService";
import { apiFetch } from "@/utils/apiFetch";

type TabType = "importacao" | "historico" | "falhas";
type ImportStatus = "idle" | "processing" | "success" | "error";

interface FileImportStatus {
  status: ImportStatus;
  message?: string;
  recordsProcessed?: number;
}


// ─── Endpoint map ────────────────────────────────────────────────────────────
const IMPORT_ENDPOINTS: Record<string, string> = {
  programas:                 "/import/programas/",
  projetos:                  "/import/projetos/",
  materiais:                 "/import/materiais/",
  empenho_materiais:         "/import/empenho-materiais/",
  estoque_materiais_projeto: "/import/estoque-materiais-projeto/",
  fornecedores:              "/import/fornecedores/",
  pedidos_compras:           "/import/pedidos-compra/",
  solicitacoes_compra:       "/import/solicitacoes-compra/",
  compras_projeto:           "/import/compras-projeto/",
  tarefa_projeto:            "/import/tarefas-projeto/",
  tempo_tarefas:             "/import/tempo-tarefas/",
};

// ─── File definitions ─────────────────────────────────────────────────────────
const orgFiles = [
  { key: "programas", name: "programas.csv" },
  { key: "projetos",  name: "projetos.csv" },
];
const materiaisFiles = [
  { key: "materiais",                 name: "materiais.csv" },
  { key: "empenho_materiais",         name: "empenho_materiais.csv" },
  { key: "estoque_materiais_projeto", name: "estoque_materiais_projeto.csv" },
  { key: "fornecedores",              name: "fornecedores.csv" },
  { key: "pedidos_compras",           name: "pedidos_compras.csv" },
  { key: "solicitacoes_compra",       name: "solicitacoes_compra.csv" },
  { key: "compras_projeto",           name: "compras_projeto.csv" },
];
const horasFiles = [
  { key: "tarefa_projeto", name: "tarefa_projeto.csv" },
  { key: "tempo_tarefas",  name: "tempo_tarefas.csv" },
];

// ─── Profile-based file visibility ───────────────────────────────────────────
const _ALLOWED_IMPORT_KEYS: Record<string, Set<string> | null> = {
  super_admin:  null,
  financeiro:   new Set(["programas", "projetos", "tarefa_projeto", "tempo_tarefas"]),
  compras:      new Set(["fornecedores", "pedidos_compras", "solicitacoes_compra", "compras_projeto"]),
  almoxarifado: new Set(["materiais", "empenho_materiais", "estoque_materiais_projeto"]),
  projetos:     new Set(["projetos", "tarefa_projeto", "tempo_tarefas"]),
};

const allowedImportKeys = computed<Set<string> | null>(() => {
  const profile = authService.getUser()?.perfil ?? null;
  if (!profile || !(profile in _ALLOWED_IMPORT_KEYS)) return null;
  return _ALLOWED_IMPORT_KEYS[profile];
});

function isFileAllowed(key: string): boolean {
  const allowed = allowedImportKeys.value;
  return allowed === null || allowed.has(key);
}

const visibleOrgFiles       = computed(() => orgFiles.filter((f) => isFileAllowed(f.key)));
const visibleMateriaisFiles = computed(() => materiaisFiles.filter((f) => isFileAllowed(f.key)));
const visibleHorasFiles     = computed(() => horasFiles.filter((f) => isFileAllowed(f.key)));

// ─── State ────────────────────────────────────────────────────────────────────
const activeTab    = ref<TabType>("importacao");
const importStatus = ref<Record<string, FileImportStatus>>({});

// ─── KPIs derived from monitoring data ───────────────────────────────────────
const kpis = computed(() => ({
  concluidas: falhasRows.value.filter((r) => r.status === "SUCCESS").length,
  parciais:   falhasRows.value.filter((r) => r.status === "PARTIAL").length,
  falhas:     falhasRows.value.filter((r) => r.status === "FAILED").length,
}));

const pct = (v: number) =>
  falhasRows.value.length > 0 ? ((v / falhasRows.value.length) * 100).toFixed(1) : "0.0";

onMounted(() => { void loadFalhas(); void loadHistorico(); });


// ─── File import ──────────────────────────────────────────────────────────────
function triggerFileInput(fileKey: string) {
  const el = document.getElementById(`file-input-${fileKey}`) as HTMLInputElement | null;
  el?.click();
}

async function handleFileChange(fileKey: string, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!file.name.endsWith(".csv")) {
    importStatus.value = {
      ...importStatus.value,
      [fileKey]: { status: "error", message: "Arquivo deve ser do tipo CSV" },
    };
    return;
  }

  importStatus.value = {
    ...importStatus.value,
    [fileKey]: { status: "processing", message: "Processando arquivo..." },
  };

  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = authService.getToken();
    const res = await fetch(`${CONFIG.API_BASE_URL}${IMPORT_ENDPOINTS[fileKey]}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      let detail: string;
      if (data.tipo_esperado) {
        detail = `Arquivo incorreto. Este campo espera: ${data.tipo_esperado}.csv`;
        if (data.colunas_ausentes?.length) {
          detail += `. Colunas ausentes: ${(data.colunas_ausentes as string[]).join(", ")}`;
        }
      } else if (data.colunas_ausentes?.length) {
        detail = `Colunas ausentes: ${(data.colunas_ausentes as string[]).join(", ")}`;
      } else {
        detail = data.error ?? "Erro ao importar arquivo";
      }
      importStatus.value = {
        ...importStatus.value,
        [fileKey]: { status: "error", message: detail },
      };
      void loadFalhas(); void loadHistorico();
      return;
    }

    importStatus.value = {
      ...importStatus.value,
      [fileKey]: {
        status: "success",
        message: "Importação concluída com sucesso",
        recordsProcessed: data.linhas_recebidas ?? 0,
      },
    };
    void loadFalhas(); void loadHistorico();
  } catch {
    importStatus.value = {
      ...importStatus.value,
      [fileKey]: { status: "error", message: "Erro de conexão com o servidor" },
    };
    void loadFalhas(); void loadHistorico();
  }
}

function importBadgeClass(status: ImportStatus) {
  const map: Record<ImportStatus, string> = {
    idle:       "import-badge idle",
    processing: "import-badge processing",
    success:    "import-badge success",
    error:      "import-badge error",
  };
  return map[status];
}

// ─── Falhas e Inconsistências ─────────────────────────────────────────────────
interface ExecucaoRow {
  id: number;
  run_id: string;
  fonte: string;
  tabela: string;
  tipo_processo: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  linhas_processadas: number;
  duracao_segundos: number | null;
  erros: number;
  avisos: number;
  detalhes_falha: string | null;
  iniciado_em: string;
  finalizado_em: string | null;
}

const FALHAS_PER_PAGE = 10;

const falhasRows    = ref<ExecucaoRow[]>([]);
const falhasTotal   = ref(0);
const falhasLoading = ref(false);
const falhasError   = ref<string | null>(null);
const falhasPage    = ref(1);

const falhasFilters = ref({ status: "", data_inicio: "", data_fim: "" });

const falhasSortKey = ref<keyof ExecucaoRow>("iniciado_em");
const falhasSortDir = ref<1 | -1>(-1);

const sortedFalhas = computed(() => {
  const key = falhasSortKey.value;
  const dir = falhasSortDir.value;
  return [...falhasRows.value].sort((a, b) => {
    const av = a[key] ?? "";
    const bv = b[key] ?? "";
    return typeof av === "number"
      ? ((av as number) - (bv as number)) * dir
      : String(av).localeCompare(String(bv)) * dir;
  });
});

const falhasTotalPages = computed(() =>
  Math.max(1, Math.ceil(sortedFalhas.value.length / FALHAS_PER_PAGE)),
);
const falhasPagedData = computed(() =>
  sortedFalhas.value.slice((falhasPage.value - 1) * FALHAS_PER_PAGE, falhasPage.value * FALHAS_PER_PAGE),
);
const falhasVisiblePages = computed(() => {
  const p = falhasPage.value, t = falhasTotalPages.value;
  const s = Math.max(1, p - 2), e = Math.min(t, p + 2);
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
});

function sortFalhas(key: keyof ExecucaoRow) {
  if (falhasSortKey.value === key) falhasSortDir.value = (falhasSortDir.value * -1) as 1 | -1;
  else { falhasSortKey.value = key; falhasSortDir.value = -1; }
  falhasPage.value = 1;
}

function sortIcon(key: keyof ExecucaoRow) {
  if (falhasSortKey.value !== key) return "↕";
  return falhasSortDir.value > 0 ? "↑" : "↓";
}

async function loadFalhas() {
  falhasPage.value = 1;
  falhasLoading.value = true;
  falhasError.value = null;
  try {
    const params = new URLSearchParams();
    if (falhasFilters.value.status)      params.set("status",      falhasFilters.value.status);
    if (falhasFilters.value.data_inicio) params.set("data_inicio", falhasFilters.value.data_inicio);
    if (falhasFilters.value.data_fim)    params.set("data_fim",    falhasFilters.value.data_fim);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`${CONFIG.API_BASE_URL}/monitoring/execucoes/${query}`);
    if (!res.ok) { falhasError.value = "Erro ao carregar registros."; return; }
    const data: { count: number; results: ExecucaoRow[] } = await res.json();
    falhasTotal.value = data.count;
    falhasRows.value  = data.results;
  } catch {
    falhasError.value = "Erro de conexão com o servidor.";
  } finally {
    falhasLoading.value = false;
  }
}


function falhaStatusClass(status: string) {
  const map: Record<string, string> = {
    SUCCESS: "exec-badge exec-badge--success",
    PARTIAL: "exec-badge exec-badge--partial",
    FAILED:  "exec-badge exec-badge--failed",
  };
  return map[status] ?? "exec-badge";
}

function falhaStatusLabel(status: string) {
  const map: Record<string, string> = { SUCCESS: "Sucesso", PARTIAL: "Parcial", FAILED: "Falha" };
  return map[status] ?? status;
}

function formatDate(iso: string) {
  return iso ? iso.replace("T", " ").slice(0, 19) : "—";
}

watch(() => falhasFilters.value.status, () => void loadFalhas());

// ─── Histórico de Execuções ───────────────────────────────────────────────────
const HIST_PER_PAGE = 10;

const historicoRows    = ref<ExecucaoRow[]>([]);
const historicoTotal   = ref(0);
const historicoLoading = ref(false);
const historicoError   = ref<string | null>(null);
const historicoPage    = ref(1);

const historicoFilters = ref({ status: "", tabela: "", fonte: "", data_inicio: "", data_fim: "" });

const historicoSortKey = ref<keyof ExecucaoRow>("iniciado_em");
const historicoSortDir = ref<1 | -1>(-1);

const sortedHistorico = computed(() => {
  const key = historicoSortKey.value;
  const dir = historicoSortDir.value;
  return [...historicoRows.value].sort((a, b) => {
    const av = a[key] ?? "";
    const bv = b[key] ?? "";
    return typeof av === "number"
      ? ((av as number) - (bv as number)) * dir
      : String(av).localeCompare(String(bv)) * dir;
  });
});

const historicoTotalPages = computed(() =>
  Math.max(1, Math.ceil(sortedHistorico.value.length / HIST_PER_PAGE)),
);
const historicoPagedData = computed(() =>
  sortedHistorico.value.slice(
    (historicoPage.value - 1) * HIST_PER_PAGE,
    historicoPage.value * HIST_PER_PAGE,
  ),
);
const historicoVisiblePages = computed(() => {
  const p = historicoPage.value, t = historicoTotalPages.value;
  const s = Math.max(1, p - 2), e = Math.min(t, p + 2);
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
});

function sortHistorico(key: keyof ExecucaoRow) {
  if (historicoSortKey.value === key) historicoSortDir.value = (historicoSortDir.value * -1) as 1 | -1;
  else { historicoSortKey.value = key; historicoSortDir.value = -1; }
  historicoPage.value = 1;
}

function historicoSortIcon(key: keyof ExecucaoRow) {
  if (historicoSortKey.value !== key) return "↕";
  return historicoSortDir.value > 0 ? "↑" : "↓";
}

async function loadHistorico() {
  historicoPage.value = 1;
  historicoLoading.value = true;
  historicoError.value = null;
  try {
    const params = new URLSearchParams();
    if (historicoFilters.value.status)      params.set("status",      historicoFilters.value.status);
    if (historicoFilters.value.tabela)      params.set("tabela",      historicoFilters.value.tabela);
    if (historicoFilters.value.fonte)       params.set("fonte",       historicoFilters.value.fonte);
    if (historicoFilters.value.data_inicio) params.set("data_inicio", historicoFilters.value.data_inicio);
    if (historicoFilters.value.data_fim)    params.set("data_fim",    historicoFilters.value.data_fim);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${CONFIG.API_BASE_URL}/monitoring/execucoes/${query}`);
    if (!res.ok) { historicoError.value = "Erro ao carregar registros."; return; }
    const data: { count: number; results: ExecucaoRow[] } = await res.json();
    historicoTotal.value = data.count;
    historicoRows.value  = data.results;
  } catch {
    historicoError.value = "Erro de conexão com o servidor.";
  } finally {
    historicoLoading.value = false;
  }
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${m}m ${s}s`;
}

watch(() => historicoFilters.value.status, () => void loadHistorico());

function importBadgeLabel(status: ImportStatus) {
  const map: Record<ImportStatus, string> = {
    idle:       "Aguardando",
    processing: "Processando",
    success:    "Concluído",
    error:      "Erro",
  };
  return map[status];
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 14px;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

.main {
  padding: 24px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Page Header ──────────────────────────────────────────────────────────── */
.page-header { animation: fadeIn 0.3s ease both; }

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 22px;
  font-weight: 400;
  color: var(--text);
}
.shield-icon {
  width: 22px;
  height: 22px;
  color: #f5793a;
  flex-shrink: 0;
}
.header-subtitle {
  font-size: 13px;
  color: var(--text2);
  margin: 0;
}

/* ── KPI Cards ────────────────────────────────────────────────────────────── */
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.metric-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px 22px;
  transition: border-color 0.2s;
  animation: fadeIn 0.35s ease both;
}
.metric-card:nth-child(2) { animation-delay: 0.06s; }
.metric-card:nth-child(3) { animation-delay: 0.12s; }
.metric-card:nth-child(4) { animation-delay: 0.18s; }
.metric-card:hover { border-color: var(--border2); }

.metric-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-bottom: 14px;
}
.metric-icon-wrap svg { width: 18px; height: 18px; }
.metric-icon-wrap.blue  { background: rgba(77, 143, 255, 0.12); color: var(--blue); }
.metric-icon-wrap.green { background: rgba(45, 212, 160, 0.12); color: var(--green); }
.metric-icon-wrap.amber { background: rgba(245, 166, 35, 0.12); color: var(--amber); }
.metric-icon-wrap.red   { background: rgba(245, 90, 90, 0.12);  color: var(--red); }

.metric-label {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 6px;
}
.metric-value {
  font-size: 30px;
  font-weight: 400;
  font-family: "IBM Plex Mono", monospace;
  color: var(--text);
  line-height: 1;
  margin-bottom: 4px;
}
.metric-sub {
  font-size: 11px;
  color: var(--text3);
  margin: 0;
}

/* ── Tabs Container ───────────────────────────────────────────────────────── */
.tabs-container {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  animation: fadeIn 0.35s ease both;
  animation-delay: 0.1s;
}

.tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--border);
}
.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: var(--text2);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.tab-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--blue); border-bottom-color: var(--blue); }

.tabs-content { padding: 24px; }
.tab-panel { min-height: 40px; }

/* ── Import Sections ──────────────────────────────────────────────────────── */
.import-sections { display: flex; flex-direction: column; gap: 28px; }

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}
.section-icon svg { width: 15px; height: 15px; }
.section-icon.blue   { background: rgba(77, 143, 255, 0.12);  color: var(--blue); }
.section-icon.green  { background: rgba(45, 212, 160, 0.12);  color: var(--green); }
.section-icon.purple { background: rgba(155, 127, 255, 0.12); color: var(--purple); }

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  margin: 0;
}
.section-desc {
  font-size: 12px;
  color: var(--text2);
  margin: 0 0 14px 0;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.upload-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
  transition: border-color 0.2s;
}
.upload-card:hover { border-color: var(--blue2); }

.upload-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.file-name-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.file-icon { width: 14px; height: 14px; color: var(--text3); flex-shrink: 0; }
.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.upload-message {
  font-size: 11px;
  color: var(--text2);
  margin: 0 0 10px 0;
}
.upload-message.error { color: var(--red); }

.upload-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 14px;
  background: var(--blue2);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-btn:hover { background: var(--blue); }
.upload-btn:disabled {
  background: var(--border2);
  color: var(--text3);
  cursor: not-allowed;
}
.upload-btn svg { width: 13px; height: 13px; }

.import-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.import-badge.idle       { background: rgba(139,146,170,0.1); color: var(--text3);  border-color: var(--border); }
.import-badge.processing { background: rgba(77,143,255,0.1);  color: var(--blue);   border-color: rgba(77,143,255,0.2); }
.import-badge.success    { background: rgba(45,212,160,0.1);  color: var(--green);  border-color: rgba(45,212,160,0.2); }
.import-badge.error      { background: rgba(245,90,90,0.1);   color: var(--red);    border-color: rgba(245,90,90,0.2); }

/* ── Histórico de Execuções ───────────────────────────────────────────────── */
.hist-subtitle {
  font-size: 13px;
  color: var(--text2);
  margin: 0 0 16px 0;
}

.hist-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.hist-select,
.hist-input {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.2s;
}
.hist-select:focus,
.hist-input:focus { border-color: var(--blue2); }
.hist-input::placeholder { color: var(--text3); }

.hist-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.hist-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}
.hist-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}
.hist-count { font-size: 12px; color: var(--text3); }

.hist-feedback {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 28px 18px;
  font-size: 13px;
  color: var(--text2);
}
.hist-feedback--error { color: var(--red); }
.hist-feedback--muted { color: var(--text3); }

.hist-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border2);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.hist-table-wrap { overflow-x: auto; }

.hist-table {
  width: 100%;
  border-collapse: collapse;
}
.hist-table thead tr { border-bottom: 1px solid var(--border); }
.hist-table th {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}
.hist-table th.sort-col { cursor: pointer; user-select: none; }
.hist-table th.sort-col:hover { color: var(--text2); }
.hist-table th.num-col,
.hist-table td.num-col { text-align: right; }

.hist-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.hist-table tbody tr:last-child { border-bottom: none; }
.hist-table tbody tr:hover { background: var(--bg3); }
.hist-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
}
.hist-table td.mono {
  font-family: "IBM Plex Mono", monospace;
  font-size: 12px;
}
.hist-table td.muted-cell { color: var(--text2); }

.tipo-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid transparent;
}
.tipo-badge--comp { background: rgba(77,143,255,0.1);  color: var(--blue);   border-color: rgba(77,143,255,0.2); }
.tipo-badge--inc  { background: rgba(155,127,255,0.1); color: var(--purple); border-color: rgba(155,127,255,0.2); }

.hist-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text3);
}

/* ── Falhas e Inconsistências ─────────────────────────────────────────────── */
.falhas-subtitle {
  font-size: 13px;
  color: var(--text2);
  margin: 0 0 16px 0;
}

.falhas-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.falhas-select,
.falhas-input {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  padding: 7px 10px;
  outline: none;
  transition: border-color 0.2s;
}
.falhas-select:focus,
.falhas-input:focus { border-color: var(--blue2); }

.falhas-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.falhas-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}
.falhas-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}
.falhas-count {
  font-size: 12px;
  color: var(--text3);
}

.falhas-feedback {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 28px 18px;
  font-size: 13px;
  color: var(--text2);
}
.falhas-feedback--error { color: var(--red); }
.falhas-feedback--muted { color: var(--text3); }

.falhas-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--border2);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.falhas-table-wrap { overflow-x: auto; }

.falhas-table {
  width: 100%;
  border-collapse: collapse;
}
.falhas-table thead tr {
  border-bottom: 1px solid var(--border);
}
.falhas-table th {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}
.falhas-table th.sort-col {
  cursor: pointer;
  user-select: none;
}
.falhas-table th.sort-col:hover { color: var(--text2); }
.falhas-table th.num-col,
.falhas-table td.num-col { text-align: right; }

.falhas-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.falhas-table tbody tr:last-child { border-bottom: none; }
.falhas-table tbody tr:hover { background: var(--bg3); }

.falhas-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
}
.falhas-table td.mono {
  font-family: "IBM Plex Mono", monospace;
  font-size: 12px;
}

.falha-msg { max-width: 360px; white-space: normal; }
.falha-msg--red   { color: var(--red); }
.falha-msg--amber { color: var(--amber); }

.erros-col  { color: var(--red); }
.avisos-col { color: var(--amber); }

.exec-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid transparent;
}
.exec-badge svg { width: 12px; height: 12px; flex-shrink: 0; }
.exec-badge--success { background: rgba(45,212,160,0.1);  color: var(--green);  border-color: rgba(45,212,160,0.2); }
.exec-badge--partial { background: rgba(245,166,35,0.1);  color: var(--amber);  border-color: rgba(245,166,35,0.2); }
.exec-badge--failed  { background: rgba(245,90,90,0.1);   color: var(--red);    border-color: rgba(245,90,90,0.2); }

/* ── Pagination ───────────────────────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text3);
}
.pg-btns { display: flex; gap: 4px; }
.pg-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text2);
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
}
.pg-btn:hover { border-color: var(--blue2); color: var(--blue); }
.pg-btn.active { background: var(--blue2); border-color: var(--blue2); color: #fff; }
.pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── Utilities ────────────────────────────────────────────────────────────── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
</style>
