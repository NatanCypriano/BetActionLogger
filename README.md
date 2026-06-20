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

## Uso

Consulte o [guia rapido de uso](docs/guia-rapido-uso.md) para o passo a passo do operador e do
gestor.

Para gerar um APK Android de distribuicao interna, consulte o
[guia de build Android](docs/build-android-apk.md).

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

O banco define `actor_id`, copia o preço atual para `unit_price_cents_snapshot`, exige motivo de
anulação e bloqueia mudanças em ações de ciclos fechados.

## Atualizações de histórico

- Cada tipo de ação pode exibir ou ocultar o campo opcional de observação. Tipos já existentes
  passam a exibi-lo por padrão.
- Uma ação anulada em período aberto pode ser desanulada. Ela volta a contar nos totais atuais.
- Somente ações já anuladas e fora de ciclos fechados podem ser excluídas definitivamente, após
  confirmação explícita na interface.
- Um ciclo fechado, mas ainda não pago, pode ser reaberto. A reabertura limpa os totais fechados e
  torna as ações do período editáveis novamente; ao fechá-lo outra vez, o banco recalcula os totais.

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
