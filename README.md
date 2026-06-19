# Bet Action Logger

Aplicativo pessoal para registrar ações operacionais simples e calcular a remuneração por ciclo.
O app não movimenta dinheiro, não acessa bancos, não armazena credenciais financeiras e não faz
recomendações de investimento.

## Stack

- Expo + React Native + Expo Router
- TypeScript estrito
- Supabase Auth, Postgres, Data API e Row Level Security
- React Hook Form + Zod
- TanStack Query
- Vitest, ESLint e Prettier

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha apenas as variáveis públicas:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

3. Inicie o Supabase local, se estiver usando a CLI:

   ```bash
   npm run supabase:start
   npm run supabase:reset
   ```

4. Rode o app:

   ```bash
   npm run dev
   npm run web
   npm run android
   ```

## Contas e papéis

Crie duas contas conscientemente no Supabase Auth. A trigger cria `profiles` com papel
`operator` por padrão. No MVP atual, `operator` e `manager` são apenas rótulos de navegação:
ambos os usuários autenticados têm as mesmas permissões de aplicação. Promova o gestor
manualmente apenas para escolher a tela inicial padrão:

```sql
update public.profiles
set role = 'manager'
where id = '<uuid-do-usuario-gestor>';
```

Depois da criação das duas contas, desabilite cadastro público nas configurações de Auth do
Supabase, se essa for a política escolhida para o MVP.

## Banco

A migration inicial cria:

- `profiles`
- `action_types`
- `action_entries`
- `settlement_cycles`
- enums, índices, constraints, triggers e políticas RLS

O banco define `actor_id`, copia o preço atual para `unit_price_cents_snapshot`, impede exclusão
definitiva de ações, exige motivo de anulação e bloqueia mudanças em ações de ciclos fechados.

## Comandos

```bash
npm run lint
npm run format
npm run format:check
npm run typecheck
npm test
npm run test:coverage
npm run export:web
npm run db:types
```

## Segurança

O cliente usa somente `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca coloque `service_role`, tokens privados, senhas ou
credenciais financeiras no app.
