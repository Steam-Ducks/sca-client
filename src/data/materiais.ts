import type { Material } from '@/types/materiais'

export const RAW: Material[] = [
  // ── Data Center Regional (Infraestrutura) ─────────────────────────────────
  { id: 1,  material: 'Servidor Dell PowerEdge R750',      projeto: 'Data Center Regional',       programa: 'Infraestrutura', quantidade: 5,   valorUnitario: 178000, valorTotal: 890000, periodo: '2024-01', fornecedor: 'Dell Brasil',  categoria: 'Hardware',  status: 'Ativo',    area: 'TI'          },
  { id: 7,  material: 'Módulos de Memória DDR5 64GB',      projeto: 'Data Center Regional',       programa: 'Infraestrutura', quantidade: 40,  valorUnitario: 8500,   valorTotal: 340000, periodo: '2024-01', fornecedor: 'Samsung',      categoria: 'Hardware',  status: 'Ativo',    area: 'TI'          },
  { id: 13, material: 'Rack 42U APC NetShelter',           projeto: 'Data Center Regional',       programa: 'Infraestrutura', quantidade: 8,   valorUnitario: 18000,  valorTotal: 144000, periodo: '2024-01', fornecedor: 'APC',          categoria: 'Hardware',  status: 'Ativo',    area: 'TI'          },
  { id: 14, material: 'Nobreak APC Smart-UPS 10KVA',       projeto: 'Data Center Regional',       programa: 'Infraestrutura', quantidade: 4,   valorUnitario: 28000,  valorTotal: 112000, periodo: '2024-01', fornecedor: 'APC',          categoria: 'Hardware',  status: 'Ativo',    area: 'TI'          },

  // ── Storage Upgrade (Infraestrutura) ──────────────────────────────────────
  { id: 2,  material: 'Storage NetApp AFF A400',           projeto: 'Storage Upgrade',            programa: 'Infraestrutura', quantidade: 2,   valorUnitario: 360000, valorTotal: 720000, periodo: '2024-04', fornecedor: 'NetApp',        categoria: 'Storage',   status: 'Ativo',    area: 'TI'          },
  { id: 10, material: 'SSD NVMe Seagate 3.84TB',           projeto: 'Storage Upgrade',            programa: 'Infraestrutura', quantidade: 32,  valorUnitario: 7200,   valorTotal: 230400, periodo: '2024-04', fornecedor: 'Seagate',       categoria: 'Storage',   status: 'Ativo',    area: 'TI'          },
  { id: 15, material: 'Cabo DAC 25G SFP28 3m',             projeto: 'Storage Upgrade',            programa: 'Infraestrutura', quantidade: 60,  valorUnitario: 850,    valorTotal: 51000,  periodo: '2024-04', fornecedor: 'FS.com',        categoria: 'Rede',      status: 'Ativo',    area: 'TI'          },

  // ── Migração AWS (Cloud) ──────────────────────────────────────────────────
  { id: 3,  material: 'Instâncias AWS RDS PostgreSQL',     projeto: 'Migração AWS',               programa: 'Cloud',          quantidade: 5,   valorUnitario: 134000, valorTotal: 670000, periodo: '2024-03', fornecedor: 'AWS',           categoria: 'Cloud',     status: 'Ativo',    area: 'Cloud'       },
  { id: 8,  material: 'Cluster Kubernetes EKS',            projeto: 'Migração AWS',               programa: 'Cloud',          quantidade: 3,   valorUnitario: 95000,  valorTotal: 285000, periodo: '2024-02', fornecedor: 'AWS',           categoria: 'Cloud',     status: 'Ativo',    area: 'Cloud'       },
  { id: 16, material: 'AWS Transit Gateway',               projeto: 'Migração AWS',               programa: 'Cloud',          quantidade: 1,   valorUnitario: 48000,  valorTotal: 48000,  periodo: '2024-02', fornecedor: 'AWS',           categoria: 'Cloud',     status: 'Ativo',    area: 'Cloud'       },

  // ── SOC Implementation (Segurança) ────────────────────────────────────────
  { id: 4,  material: 'Firewall Fortinet FortiGate 600E',  projeto: 'SOC Implementation',         programa: 'Segurança',      quantidade: 4,   valorUnitario: 130000, valorTotal: 520000, periodo: '2024-03', fornecedor: 'Fortinet',      categoria: 'Segurança', status: 'Ativo',    area: 'Segurança'   },
  { id: 9,  material: 'HSM Thales Luna 7',                 projeto: 'SOC Implementation',         programa: 'Segurança',      quantidade: 2,   valorUnitario: 130000, valorTotal: 260000, periodo: '2024-03', fornecedor: 'Thales',        categoria: 'Segurança', status: 'Ativo',    area: 'Segurança'   },
  { id: 17, material: 'SIEM Splunk Enterprise Security',   projeto: 'SOC Implementation',         programa: 'Segurança',      quantidade: 1,   valorUnitario: 185000, valorTotal: 185000, periodo: '2024-03', fornecedor: 'Splunk',        categoria: 'Software',  status: 'Ativo',    area: 'Segurança'   },

  // ── Modernização de Rede (Infraestrutura) ─────────────────────────────────
  { id: 5,  material: 'Switch Cisco Catalyst 9300',        projeto: 'Modernização de Rede',       programa: 'Infraestrutura', quantidade: 15,  valorUnitario: 30000,  valorTotal: 450000, periodo: '2024-01', fornecedor: 'Cisco',         categoria: 'Rede',      status: 'Ativo',    area: 'TI'          },
  { id: 18, material: 'Roteador Cisco ASR 1001-X',         projeto: 'Modernização de Rede',       programa: 'Infraestrutura', quantidade: 2,   valorUnitario: 95000,  valorTotal: 190000, periodo: '2024-01', fornecedor: 'Cisco',         categoria: 'Rede',      status: 'Ativo',    area: 'TI'          },
  { id: 19, material: 'Access Point Cisco 9120AX',         projeto: 'Modernização de Rede',       programa: 'Infraestrutura', quantidade: 80,  valorUnitario: 4500,   valorTotal: 360000, periodo: '2024-02', fornecedor: 'Cisco',         categoria: 'Rede',      status: 'Ativo',    area: 'TI'          },

  // ── Modernização de Sistemas (Infraestrutura) ─────────────────────────────
  { id: 6,  material: 'Licenças Microsoft 365 E5',         projeto: 'Modernização de Sistemas',   programa: 'Infraestrutura', quantidade: 200, valorUnitario: 1800,   valorTotal: 360000, periodo: '2024-02', fornecedor: 'Microsoft',     categoria: 'Software',  status: 'Ativo',    area: 'TI'          },
  { id: 20, material: 'Microsoft Azure AD Premium P2',     projeto: 'Modernização de Sistemas',   programa: 'Infraestrutura', quantidade: 200, valorUnitario: 600,    valorTotal: 120000, periodo: '2024-02', fornecedor: 'Microsoft',     categoria: 'Software',  status: 'Ativo',    area: 'TI'          },

  // ── Container Platform (Cloud) ────────────────────────────────────────────
  { id: 11, material: 'Container Platform OpenShift',      projeto: 'Container Platform',         programa: 'Cloud',          quantidade: 1,   valorUnitario: 210000, valorTotal: 210000, periodo: '2024-05', fornecedor: 'Red Hat',       categoria: 'Cloud',     status: 'Ativo',    area: 'Cloud'       },
  { id: 21, material: 'Red Hat Ansible Automation',        projeto: 'Container Platform',         programa: 'Cloud',          quantidade: 1,   valorUnitario: 95000,  valorTotal: 95000,  periodo: '2024-05', fornecedor: 'Red Hat',       categoria: 'Software',  status: 'Ativo',    area: 'Cloud'       },

  // ── Portal Web (Desenvolvimento) ──────────────────────────────────────────
  { id: 12, material: 'Desenvolvimento Portal Web',        projeto: 'Portal Web',                 programa: 'Desenvolvimento',quantidade: 1,   valorUnitario: 120000, valorTotal: 120000, periodo: '2024-05', fornecedor: 'Interna',       categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },
  { id: 22, material: 'Licença Adobe XD Teams',            projeto: 'Portal Web',                 programa: 'Desenvolvimento',quantidade: 5,   valorUnitario: 3600,   valorTotal: 18000,  periodo: '2024-05', fornecedor: 'Adobe',         categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },

  // ── Firewall Corporativo (Segurança) ──────────────────────────────────────
  { id: 23, material: 'Fortinet FortiAnalyzer 300G',       projeto: 'Firewall Corporativo',       programa: 'Segurança',      quantidade: 1,   valorUnitario: 78000,  valorTotal: 78000,  periodo: '2024-03', fornecedor: 'Fortinet',      categoria: 'Segurança', status: 'Pendente', area: 'Segurança'   },
  { id: 24, material: 'FortiManager 200F',                 projeto: 'Firewall Corporativo',       programa: 'Segurança',      quantidade: 1,   valorUnitario: 62000,  valorTotal: 62000,  periodo: '2024-03', fornecedor: 'Fortinet',      categoria: 'Segurança', status: 'Pendente', area: 'Segurança'   },

  // ── CRM Customizado (Desenvolvimento) ─────────────────────────────────────
  { id: 25, material: 'Salesforce Sales Cloud Enterprise', projeto: 'CRM Customizado',            programa: 'Desenvolvimento',quantidade: 50,  valorUnitario: 4200,   valorTotal: 210000, periodo: '2024-04', fornecedor: 'Salesforce',    categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },
  { id: 26, material: 'Desenvolvimento CRM Custom',        projeto: 'CRM Customizado',            programa: 'Desenvolvimento',quantidade: 1,   valorUnitario: 95000,  valorTotal: 95000,  periodo: '2024-04', fornecedor: 'Interna',       categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },

  // ── DevOps Pipeline (Cloud) ───────────────────────────────────────────────
  { id: 27, material: 'GitHub Enterprise Server',          projeto: 'DevOps Pipeline',            programa: 'Cloud',          quantidade: 1,   valorUnitario: 55000,  valorTotal: 55000,  periodo: '2024-02', fornecedor: 'GitHub',        categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },
  { id: 28, material: 'HashiCorp Terraform Enterprise',    projeto: 'DevOps Pipeline',            programa: 'Cloud',          quantidade: 1,   valorUnitario: 48000,  valorTotal: 48000,  periodo: '2024-02', fornecedor: 'HashiCorp',     categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },
  { id: 29, material: 'DataDog APM Pro (anual)',           projeto: 'DevOps Pipeline',            programa: 'Cloud',          quantidade: 1,   valorUnitario: 72000,  valorTotal: 72000,  periodo: '2024-03', fornecedor: 'Datadog',       categoria: 'Software',  status: 'Ativo',    area: 'Dev'         },

  // ── App Mobile (Desenvolvimento) ──────────────────────────────────────────
  { id: 30, material: 'Desenvolvimento App Mobile',        projeto: 'App Mobile',                 programa: 'Desenvolvimento',quantidade: 1,   valorUnitario: 180000, valorTotal: 180000, periodo: '2024-05', fornecedor: 'Interna',       categoria: 'Software',  status: 'Pendente', area: 'Dev'         },
  { id: 31, material: 'Firebase Blaze (anual)',            projeto: 'App Mobile',                 programa: 'Cloud',          quantidade: 1,   valorUnitario: 36000,  valorTotal: 36000,  periodo: '2024-05', fornecedor: 'Google',        categoria: 'Cloud',     status: 'Pendente', area: 'Dev'         },
]
