# ABCUNA — Central Operacional

Sistema de gestão financeira, administrativa e operacional da **Associação de Bombeiros Civis de Uiraúna (ABCUNA)**.

## Stack

- **TanStack Start** (React 19 + Vite 7) com SSR e file-based routing
- **TypeScript** estrito
- **Tailwind CSS v4** + shadcn/ui
- **Lovable Cloud** (Postgres + Auth + Storage gerenciados, com toda a infra Supabase por baixo)
- **TanStack Query** para cache de dados
- **Recharts** para gráficos
- Deploy edge nativo no Lovable (botão _Publish_)

## Módulos

| Módulo              | Caminho       | Descrição                                                                      |
| ------------------- | ------------- | ------------------------------------------------------------------------------ |
| Central operacional | `/`           | KPIs financeiros, alertas, escalas do dia, últimos lançamentos, fluxo de caixa |
| Associados          | `/associates` | CRUD completo com busca, filtro por status, foto, histórico                    |
| Mensalidades        | `/fees`       | Geração mensal, controle de pagamento, identificação de atrasos                |
| Financeiro          | `/finance`    | Receitas, despesas, categorias, fluxo de caixa, períodos                       |
| Estoque             | `/inventory`  | Equipamentos, uniformes, materiais com alertas de mínimo                       |
| Colaboradores       | `/staff`      | Cadastro, valor/hora, ranking de pagamentos                                    |
| Escalas             | `/shifts`     | Plantões com data, horário e local                                             |
| Relatórios          | `/reports`    | Gráficos consolidados, exportação CSV/Excel e impressão (PDF)                  |

## Banco de dados

Todas as tabelas, enums, índices, RLS, políticas, triggers e dados de demonstração são criados via migrations. Veja `supabase/migrations/`.

Principais tabelas:
`profiles`, `user_roles` (+ função `has_role` security-definer), `associates`, `monthly_fees`, `finance_categories`, `finance_transactions`, `inventory_items`, `inventory_movements`, `staff`, `shifts`, `staff_payments`, `audit_logs`.

## Autenticação

- E-mail + senha via Lovable Cloud Auth
- Confirmação automática de e-mail habilitada (ambiente operacional interno)
- Trigger `handle_new_user` cria automaticamente o profile e atribui papel `member`; e-mail `admin@abcuna.org` recebe `admin` + `manager`

## Acesso de demonstração

Cadastre na aba **"Cadastrar"** da tela de login:

```
E-mail:  admin@abcuna.org
Senha:   Abcuna@2026
Nome:    Comando ABCUNA
```

Você entrará automaticamente como administrador, com toda a base demo já populada (12 associados, 8 itens de estoque, 6 colaboradores, mensalidades dos últimos 4 meses, transações dos últimos 90 dias, escalas dos próximos 7 dias).

## Comandos

```bash
bun install            # instala dependências
bun run dev            # ambiente de desenvolvimento
bun run build          # build de produção
bun run lint           # ESLint
bun run format         # Prettier
```

## Deploy

No editor Lovable: botão **Publish** (canto superior direito).
O sistema é publicado em URL `*.lovable.app`. Domínio próprio é configurável em Project Settings → Domains.

## Variáveis de ambiente

Veja `.env.example`. Todos os valores são configurados automaticamente pelo Lovable Cloud — **não é necessário criar conta externa nem configurar nada manualmente**.

## Estrutura

```
src/
  assets/                     Imagens (logo, background)
  components/
    abcuna-brand.tsx          Marca institucional
    app-sidebar.tsx           Sidebar profissional recolhível
    page-header.tsx           Cabeçalho de página padronizado
    ui/                       shadcn/ui
  hooks/
    use-current-user.ts
  integrations/supabase/      Clientes Supabase (gerado)
  lib/
    format.ts                 Formatadores BRL, datas, máscaras
  routes/
    __root.tsx                Shell HTML + dark theme + Toaster + auth listener
    auth.tsx                  Login/Cadastro estilizado
    _authenticated/
      route.tsx               Gate de autenticação + layout com sidebar
      index.tsx               Dashboard
      associates.tsx
      fees.tsx
      finance.tsx
      inventory.tsx
      staff.tsx
      shifts.tsx
      reports.tsx
  styles.css                  Design system tactical dark
supabase/
  migrations/                 Schema + seed
```
