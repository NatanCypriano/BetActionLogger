# Guia do agente — aplicativo de registro de ações

## 1. Missão

Desenvolver e manter um aplicativo pessoal para registrar ações operacionais simples e calcular a remuneração devida por ciclo.

Existem inicialmente dois usuários:

- **Operador (`operator`)**: registra as ações que executou e consulta o próprio histórico.
- **Gestor (`manager`)**: consulta todas as ações, administra os tipos e valores, fecha ciclos e marca ciclos como pagos.

O aplicativo não executa movimentações financeiras. O pagamento ocorre fora do sistema.

## 2. Princípios do projeto

Priorize, nesta ordem:

1. integridade do histórico;
2. segurança e privacidade;
3. simplicidade de uso;
4. baixo custo operacional;
5. facilidade de manutenção;
6. compatibilidade entre Android e web.

Evite abstrações prematuras. Este é um produto pessoal com dois usuários, não uma plataforma financeira multiempresa.

## 3. Escopo do MVP

### Operador

- autenticar;
- registrar uma ação;
- escolher o tipo;
- confirmar data e hora, usando o momento atual como padrão;
- adicionar observação opcional;
- visualizar o valor unitário;
- consultar ações do mês;
- anular uma ação própria ainda não incluída em ciclo fechado.

### Gestor

- autenticar;
- visualizar ações por período;
- visualizar quantidade por tipo;
- visualizar total calculado;
- criar, editar e desativar tipos de ação;
- definir o preço de cada tipo;
- fechar um ciclo;
- marcar um ciclo como pago;
- consultar ciclos anteriores.

### Fora do escopo

- movimentar dinheiro;
- conectar bancos ou corretoras;
- armazenar senhas, tokens ou números de contas financeiras;
- importar extratos;
- recomendar investimentos;
- armazenar detalhes desnecessários sobre os investimentos;
- processar pagamentos;
- suportar organizações, equipes ou múltiplos operadores no MVP;
- anexar comprovantes;
- notificações push.

## 4. Stack

- Expo;
- React Native;
- TypeScript estrito;
- Expo Router;
- Supabase Auth;
- Supabase Postgres;
- Supabase Data API;
- Row Level Security;
- React Hook Form;
- Zod;
- TanStack Query;
- Vitest;
- ESLint;
- Prettier;
- npm.

Não adicionar servidor próprio no MVP. O cliente pode acessar a Data API do Supabase porque a autorização deve ser garantida por RLS, constraints e triggers.

## 5. Arquitetura

### Cliente universal

Uma única aplicação Expo atende:

- Android nativo;
- navegador desktop;
- navegador mobile responsivo.

Telas devem apenas coordenar componentes e hooks. Regras de negócio ficam em funções puras ou serviços das features.

### Backend

Supabase fornece:

- identidade;
- banco Postgres;
- API;
- políticas de autorização.

Não confiar no cliente para:

- papel do usuário;
- autor da ação;
- preço histórico;
- total de um ciclo;
- estado de fechamento;
- validações de integridade.

### Infraestrutura

- repositório GitHub;
- Supabase Free;
- web estática em Cloudflare Pages ou EAS Hosting;
- Android por EAS Build;
- distribuição interna por APK no início.

Nenhum recurso do MVP deve depender obrigatoriamente de um serviço pago.

## 6. Estrutura recomendada

```text
app/
  _layout.tsx
  (auth)/
    login.tsx
  (app)/
    _layout.tsx
    operator/
      index.tsx
      new-action.tsx
      history.tsx
    manager/
      index.tsx
      action-types.tsx
      cycles.tsx
src/
  components/
    ui/
  features/
    auth/
      api/
      hooks/
      schemas/
      types/
    actions/
      api/
      components/
      hooks/
      schemas/
      utils/
    settlements/
      api/
      components/
      hooks/
      utils/
  hooks/
  lib/
    supabase.ts
    query-client.ts
  theme/
  types/
  utils/
supabase/
  migrations/
  seed.sql
tests/
```

Arquivos de rota não devem conter consultas SQL complexas, cálculos financeiros ou regras de autorização.

## 7. Modelo de dados

Use UUIDs e `timestamptz`. Armazene dinheiro em centavos usando `bigint` ou `integer`, nunca `float`.

### `profiles`

- `id uuid primary key references auth.users(id)`;
- `display_name text`;
- `role app_role not null default 'operator'`;
- `created_at timestamptz`;
- `updated_at timestamptz`.

Papéis:

- `operator`;
- `manager`.

O usuário não pode alterar o próprio papel.

### `action_types`

- `id uuid primary key`;
- `name text not null`;
- `description text`;
- `unit_price_cents integer not null check (unit_price_cents >= 0)`;
- `active boolean not null default true`;
- `created_at timestamptz`;
- `updated_at timestamptz`.

Nomes devem ser únicos sem diferenciar maiúsculas e minúsculas.

Exemplos iniciais:

- Depósito;
- Saque;
- Outra ação.

### `action_entries`

- `id uuid primary key`;
- `actor_id uuid not null references profiles(id)`;
- `action_type_id uuid not null references action_types(id)`;
- `occurred_at timestamptz not null`;
- `unit_price_cents_snapshot integer not null`;
- `note text`;
- `status action_status not null default 'confirmed'`;
- `created_at timestamptz`;
- `updated_at timestamptz`;
- `voided_at timestamptz`;
- `voided_by uuid`;
- `void_reason text`.

Regras:

- `actor_id` é preenchido pelo banco usando o usuário autenticado;
- `unit_price_cents_snapshot` é preenchido pelo banco usando o preço atual do tipo;
- o cliente não escolhe ou altera esses campos;
- `note` tem tamanho máximo definido;
- não usar exclusão física;
- anulação exige motivo;
- ação de ciclo fechado é imutável;
- alteração de preço no tipo não muda registros antigos.

### `settlement_cycles`

- `id uuid primary key`;
- `period_start date not null`;
- `period_end date not null`;
- `status settlement_status not null default 'open'`;
- `total_actions integer`;
- `total_cents bigint`;
- `closed_at timestamptz`;
- `closed_by uuid`;
- `paid_at timestamptz`;
- `payment_note text`;
- `created_at timestamptz`;
- `updated_at timestamptz`.

Status:

- `open`;
- `closed`;
- `paid`.

Regras:

- períodos não podem se sobrepor;
- `period_end >= period_start`;
- ao fechar, o banco calcula e grava os totais;
- após fechar, ações do intervalo não podem mudar;
- `paid` exige que o ciclo esteja fechado;
- marcar como pago não significa que o app movimentou dinheiro.

Se necessário para auditoria mais forte, adicionar posteriormente uma tabela de associação entre ciclo e ações.

## 8. Autorização

Toda tabela no schema exposto deve ter RLS habilitado.

### Operador

- lê o próprio perfil;
- lê tipos ativos;
- insere ação somente para si;
- lê somente as próprias ações;
- anula somente a própria ação em ciclo aberto;
- lê ciclos apenas se isso for necessário para informar o status das próprias ações;
- não administra preços;
- não fecha ciclos.

### Gestor

- lê perfis;
- lê todas as ações;
- administra tipos;
- cria e fecha ciclos;
- marca ciclo como pago;
- não pode alterar silenciosamente o preço histórico de uma ação.

### Regras adicionais

- não usar `raw_user_meta_data` como fonte de autorização;
- preferir papel em tabela protegida ou app metadata administrada;
- nunca expor `service_role`;
- usar apenas a publishable key no cliente;
- constraints e triggers são obrigatórios mesmo quando a UI já valida;
- indexar colunas usadas nas políticas.

## 9. Autenticação

No MVP:

- e-mail e senha;
- somente duas contas criadas conscientemente;
- cadastro público desabilitado depois da criação;
- recuperação de senha documentada;
- mensagens de erro sem revelar detalhes internos.

O primeiro usuário pode permanecer `operator`. O segundo deve ser promovido manualmente para `manager` por SQL documentado.

## 10. Regras de negócio

- moeda: BRL;
- persistência monetária: centavos inteiros;
- persistência temporal: UTC;
- exibição: `America/Sao_Paulo`;
- período mensal: início inclusivo e fim exclusivo internamente;
- quantidade padrão de cada registro: uma ação;
- cada registro representa um evento confirmado;
- totais são derivados do preço histórico;
- alterações no catálogo valem somente para novos registros;
- totais fechados são calculados pelo banco;
- nenhuma tela deve somar valores usando ponto flutuante.

## 11. UX

### Operador

A tela principal deve favorecer registro em poucos toques:

1. tocar em “Registrar ação”;
2. selecionar tipo;
3. revisar horário, observação e valor;
4. confirmar;
5. receber feedback inequívoco.

Evitar formulários longos.

### Gestor

O dashboard deve mostrar:

- período selecionado;
- quantidade total;
- total em BRL;
- agrupamento por tipo;
- lista cronológica;
- status do ciclo;
- ação explícita para fechar ou marcar como pago.

### Responsividade

- mobile-first;
- largura máxima de conteúdo em desktop;
- toque mínimo confortável;
- navegação por teclado na web;
- sem hover como único mecanismo de interação;
- estados de loading, vazio, erro e sucesso;
- confirmações para ações irreversíveis.

## 12. Padrões de código

- TypeScript estrito;
- evitar `any`;
- nomes de código em inglês;
- textos de interface em português do Brasil;
- componentes pequenos;
- hooks por feature;
- funções puras para cálculo e formatação;
- validação Zod na fronteira da UI;
- validação SQL na fronteira do banco;
- tratamento explícito de erros;
- não capturar erro e ignorá-lo;
- evitar dependências sem necessidade;
- não criar “utils” genéricos quando a função pertence a uma feature;
- comentários explicam decisões, não repetem o código.

## 13. Estado e dados

- TanStack Query para consultas e mutações remotas;
- estado local para interações de tela;
- contexto somente para sessão, tema ou dependências realmente globais;
- não duplicar dados do servidor em stores globais;
- invalidar queries específicas após mutações;
- impedir duplo envio;
- manter chaves de query centralizadas por feature.

## 14. Testes

### Obrigatórios

- soma de centavos;
- agrupamento por tipo;
- total mensal;
- limites de mês;
- formatação BRL;
- validações Zod;
- permissões críticas do banco;
- trigger de snapshot de preço;
- bloqueio de alteração em ciclo fechado.

### Preferência

- testes unitários rápidos;
- testes SQL com Supabase local para RLS e triggers;
- teste de componente para o formulário principal;
- E2E web somente depois da fatia vertical ficar estável.

Não usar snapshots de UI extensos.

## 15. Comandos

O repositório deve manter estes comandos estáveis:

```bash
npm install
npm run dev
npm run web
npm run android
npm run lint
npm run format
npm run format:check
npm run typecheck
npm test
npm run test:coverage
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run db:types
npm run export:web
```

Se algum comando não existir ainda, crie-o quando a infraestrutura correspondente for adicionada.

## 16. Variáveis de ambiente

Somente variáveis públicas apropriadas ao cliente:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Nunca versionar:

- `.env`;
- passwords;
- access tokens;
- service role;
- secret keys;
- chaves de assinatura;
- credenciais de loja.

Manter `.env.example` sem valores reais.

## 17. Git e mudanças

Antes de editar:

1. ler este arquivo;
2. ler `AGENTS.md`;
3. inspecionar os arquivos existentes;
4. preservar decisões já implementadas, salvo defeito comprovado.

Durante a mudança:

- trabalhar em passos pequenos;
- evitar reescritas sem necessidade;
- adicionar migration nova em vez de editar migration já aplicada;
- atualizar testes e documentação junto com o código;
- não realizar operações destrutivas em Git;
- não apagar trabalho existente sem justificativa.

Ao finalizar:

- executar os checks aplicáveis;
- informar comandos e resultados;
- listar limitações;
- confirmar que nenhum segredo foi adicionado.

## 18. Definition of Done

Uma tarefa está pronta quando:

- requisitos de aceitação estão atendidos;
- tipos passam;
- lint passa;
- formatação passa;
- testes passam;
- build ou exportação relevante passa;
- loading, vazio, erro e sucesso foram tratados;
- RLS foi revisado quando há alteração de dados;
- migrations e tipos estão atualizados;
- documentação foi atualizada;
- não há segredos;
- a solução funciona em largura mobile e desktop;
- o agente resume o que mudou e o que não conseguiu validar.

## 19. Segurança e privacidade

Este projeto é relacionado a tarefas que acompanham atividades financeiras, mas não deve virar um cofre de dados financeiros.

Não armazenar:

- senha bancária;
- token de corretora;
- número completo de conta;
- documento pessoal sem necessidade;
- saldo;
- carteira de investimento;
- comprovante com dados sensíveis;
- estratégia detalhada de investimento.

Observações devem ser opcionais, curtas e desencorajadas a conter dados sensíveis.

Sempre preferir autorização oficial oferecida pela instituição financeira em vez de compartilhamento de credenciais. O aplicativo não legitima ou substitui procuração, autorização, contrato ou requisitos da instituição.

## 20. Roadmap sugerido

### Fase 1

- projeto;
- autenticação;
- banco;
- RLS;
- registro de ação;
- histórico;
- dashboard mensal básico.
- administração de tipos;
- fechamento de ciclo;
- marcação como pago;

### Fase 2

- melhor experiência offline;
- auditoria reforçada;
- acessibilidade avançada;
- monitoramento de erros;
- automação de deploy.

Não antecipar Fase 2 enquanto o fluxo principal não estiver validado.

Regras de maior prioridade:

1. Preserve a stack Expo + TypeScript + Expo Router + Supabase.
2. Não adicione servidor próprio, ORM ou microsserviços no MVP.
3. Nunca exponha chaves secretas ou `service_role`.
4. Toda tabela exposta deve usar RLS.
5. Dinheiro é armazenado em centavos inteiros.
6. O banco, e não o cliente, define autor e preço histórico das ações.
7. Não apague registros de ações; use anulação auditável.
8. Ações em ciclos fechados são imutáveis.
9. Execute lint, formatação, typecheck, testes e build/exportação aplicáveis antes de concluir.
10. Atualize documentação, migrations e testes junto com a mudança.

Ao concluir, informe arquivos alterados, checks executados, resultados, limitações e confirme que nenhum segredo foi adicionado.
