# Stack

**Framework**
- Vue.js — framework principal da interface
- TypeScript — tipagem estática

**Build / Dev Server**
- Vite

**Testes**
- Vitest — testes unitários
- Playwright — testes E2E

**Qualidade de código**
- ESLint — padronização
- Prettier — formatação automática
- vue-tsc — validação de tipos em `.vue`

**Runtime**
- Node.js 20 (Debian Bookworm)

---

# Pré‑requisitos

Você precisa apenas de:

-   Docker
-   Docker Compose

Verifique:
```
docker --version 
docker compose version
```

Instalação: https://docker.com

---

# Configuração de Ambiente

1.  Copie o arquivo de exemplo

Linux/Mac: 
```
cp .env.example .env
```

Windows:
```
copy .env.example .env
```

2.  Configure as variáveis

Exemplo:

no .env:
```
VITE_API_BASE_URL=http://localhost:8000/api
```
No código:
```
import.meta.env.VITE_API_BASE_URL
```

---

# Como subir o Frontend

Na raiz do projeto:
```
docker compose up --build
```

Rodar em background:
```
docker compose up -d --build
```

Aplicação disponível em: http://localhost:5173

---

# Conexão com o Backend

O frontend consome APIs REST.

Backend esperado em: http://localhost:8000

Variável no .env:
```
VITE_API_BASE_URL=http://localhost:8000/api
```
---

# Estrutura do Projeto
```text
frontend/
│
├─ src/
│  ├─ __tests__/
│  ├─ components/
│  ├─ views/
│  ├─ router/
│  ├─ assets/
│  │  └─ styles/
│  ├─ types/
│  ├─ composables/
│  ├─ utils/
│  ├─ App.vue
│  └─ main.ts
```
---

# Comandos úteis

Entrar no container:
```
docker compose exec frontend sh
```

Instalar dependências:
```
docker compose exec frontend npm install
```

Rodar servidor dev:
```
docker compose exec frontend npm run dev
```
---

# Testes

Testes unitários:
```
docker compose exec frontend npm run test
```

Cobertura:
```
docker compose exec frontend npm run test -- --coverage
```

Testes E2E:
```
docker compose exec frontend npm run test:e2e
```
---

# Qualidade de código

Lint:
```
docker compose exec frontend npm run lint
```

Prettier:
```
docker compose exec frontend npx prettier . --write
```

Type check:
```
docker compose exec frontend npm run type-check
```
---

# Build
```
docker compose exec frontend npm run build
```
Resultado:
```
dist/
```
---

# Fluxo recomendado de desenvolvimento

1.  Clonar repositório
2.  Subir backend
3.  Subir frontend

```
docker compose up --build
```

Abrir: http://localhost:5173

---

# Como desenvolver no projeto (passo a passo)

Este projeto segue **TDD - Test Driven Development**.

Fluxo ideal:

1️⃣ Criar teste\
2️⃣ Rodar teste (falha)\
3️⃣ Implementar código mínimo\
4️⃣ Teste passa\
5️⃣ Refatorar

---

# Exemplo: criando um novo componente

### 1. Criar o teste

Arquivo:
```
src/__tests__/components/UserList.test.ts
```

Exemplo:
```
import { mount } from '@vue/test-utils'
import UserList from '@/components/UserList.vue'

describe('UserList', () => {
  it('renders users', () => {
    const users = [{ id: 1, full_name: 'John' }]

    const wrapper = mount(UserList, {
      props: { users }
    })

    expect(wrapper.text()).toContain('John')
  })
})
```
---

### 2. Rodar o teste
```
docker compose exec frontend npm run test
```

Ele deve falhar inicialmente.

---

### 3. Criar o componente
```
src/components/UserList.vue
```
---

### 4. Implementar código mínimo
```
<script setup lang="ts">
defineProps<{
  users: { id:number; full_name:string }[]
}>()
</script>

<template>
<ul>
  <li v-for="user in users" :key="user.id">
    {{ user.full_name }}
  </li>
</ul>
</template>
```

---

### 5. Rodar os testes novamente
```
docker compose exec frontend npm run test
```

Agora o teste deve passar.

---

# Onde criar cada coisa

Componentes reutilizáveis:
```
src/components/
```

Views:
```
src/views/
```

Rotas:
```
src/router/
```

Services API:
```
src/services/
```

Composables:
```
src/composables/
```

Tipos:
```
src/types/
```

Utilidades:
```
src/utils/
```
---

# Como validar antes de entregar

Sempre rode:
```
docker compose exec frontend npm run lint
docker compose exec frontend npm run test
docker compose exec frontend npm run type-check
docker compose exec frontend npm run build
```
---

# O que fazer quando der erro

## Teste falhou

Verifique:

-   imports
-   nomes de arquivos
-   lógica implementada

Depois rode novamente os testes.

---

## Lint falhou
```
docker compose exec frontend npm run lint
```
Corrigir código ou usar:
```
docker compose exec frontend npx eslint . --fix
```
---

## Type check falhou
```
docker compose exec frontend npm run type-check
```
Corrigir tipos ou imports.

---

## Build falhou
```
docker compose exec frontend npm run build
```
Verifique:

-   imports quebrados
-   erros TypeScript

---

## E2E falhou
```
docker compose exec frontend npm run test:e2e
```
Verifique:

-   frontend rodando
-   seletores Playwright corretos
-   texto da interface mudou

---

# Checklist antes de Pull Request

Antes de abrir PR:

-   funcionalidade implementada
-   testes criados ou atualizados
-   lint passou
-   testes passaram
-   type-check passou
-   build passou
-   estrutura de pastas respeitada

---

# Resumo

Depois de clonar:
```
cp .env.example .env 
docker compose up --build
```
Aplicação disponível em: http://localhost:5173