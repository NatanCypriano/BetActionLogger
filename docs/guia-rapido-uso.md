# Guia rapido de uso

Este guia mostra o fluxo basico do aplicativo para os dois papeis: operador e gestor.

O aplicativo apenas registra acoes e calcula totais. Ele nao movimenta dinheiro, nao acessa bancos,
nao guarda credenciais financeiras e nao recomenda investimentos.

## Antes de usar

1. Acesse o app pela URL publicada ou pelo ambiente local.
2. Entre com o e-mail e a senha criados no Supabase Auth.
3. Confira se os tipos de acao estao cadastrados em **Configuracoes do sistema**.
4. Evite colocar dados sensiveis no campo de observacao.

## Visao do operador

### Registrar uma acao

1. Entre no aplicativo com a conta do operador.
2. Na tela inicial, toque em **Registrar acao**.
3. Escolha um tipo de acao ativo. Todo tipo criado em **Configuracoes do sistema** fica
   disponivel aqui; os tipos desativados deixam de ser oferecidos para novos registros.
4. Confira o horario exibido. O app usa o horario atual como padrao.
5. Se o tipo estiver configurado para exibir observacao, preencha-a se quiser. Ela pode ficar vazia.
6. Confira o valor unitario mostrado na tela.
7. Toque em **Confirmar**.
8. Ao concluir, volte para a tela inicial e confira o resumo do mes.

### Ver historico do mes

1. Na tela inicial do operador, toque em **Ver historico do mes**.
2. Veja as acoes registradas no mes atual, com data, tipo, valor e status.
3. Acoes confirmadas aparecem como **Confirmada**.
4. Acoes anuladas aparecem como **Anulada**, junto com o motivo.

### Anular uma acao

1. Abra **Ver historico do mes**.
2. Encontre a acao incorreta.
3. Preencha **Motivo da anulacao** com pelo menos 3 caracteres.
4. Toque em **Anular acao**.
5. A acao deixa de contar como confirmada.

Observacao: acoes que ja fazem parte de um ciclo fechado nao podem ser alteradas.

## Visao do gestor

### Acompanhar o dashboard mensal

1. Entre no aplicativo com a conta do gestor.
2. Na tela **Dashboard mensal**, confira:
   - quantidade de acoes confirmadas;
   - total calculado em BRL;
   - status do ciclo;
   - quantidade e total por tipo;
   - lista cronologica de acoes.
3. Use **Anterior** e **Proximo** para navegar entre meses.

### Ver e anular historico do mes

1. No dashboard do gestor, toque em **Ver historico do mes**.
2. Revise as acoes do mes atual.
3. Para corrigir um registro incorreto, informe o motivo e toque em **Anular acao**.
4. Se o ciclo do periodo ja estiver fechado, a anulacao sera bloqueada pelo banco.

### Configurar tipos de acao

1. Toque em **Configuracoes** ou **Configuracoes do sistema**.
2. Em **Tipos de acoes**, preencha:
   - **Nome**;
   - **Valor em centavos**;
   - **Descricao**, se necessario.
3. Toque em **Criar tipo** para adicionar um novo tipo.
4. Para alterar um tipo existente, toque em **Editar**, ajuste os campos e toque em **Atualizar**.
5. Para parar de usar um tipo, toque em **Desativar**.
6. Para trazer um tipo de volta, toque em **Reativar**.
7. Use **Excluir** apenas para tipos que ainda nao foram usados. Se o tipo ja tiver historico, o
   banco pode bloquear a exclusao para preservar registros antigos.

Observacao: alterar o valor de um tipo nao muda acoes antigas. Novas acoes passam a usar o valor
atual, e cada registro guarda uma copia do preco no momento do cadastro.

### Fechar ciclo mensal

1. No dashboard, selecione o mes correto.
2. Revise a quantidade de acoes, o total e a lista cronologica.
3. Quando o periodo estiver pronto, toque em **Fechar ciclo**.
4. O banco calcula e grava os totais fechados.
5. Depois do fechamento, as acoes daquele intervalo ficam imutaveis.

### Marcar ciclo como pago

1. Depois que o ciclo estiver fechado, o botao muda para **Marcar como pago**.
2. Preencha **Nota de pagamento** se quiser registrar uma observacao curta.
3. Toque em **Marcar como pago**.
4. Esse status apenas registra que o pagamento foi tratado fora do sistema.

### Desanular ou excluir uma ação anulada

1. Abra o histórico do mês e encontre a ação com status **Anulada**.
2. Toque em **Desanular ação** para restaurá-la sem precisar informar outro motivo.
3. Se o registro não deve permanecer no histórico, toque em **Excluir definitivamente**.
4. Leia o aviso e toque em **Confirmar exclusão permanente**. Essa etapa não pode ser desfeita.

Essas opções só ficam disponíveis enquanto o período não estiver em um ciclo fechado ou pago.

### Configurar a observação de um tipo

1. Em **Configurações do sistema**, crie ou edite um tipo de ação.
2. Marque **Exibir campo de observação** para mostrar esse campo no registro daquele tipo.
3. Mesmo quando exibida, a observação é opcional.

### Reabrir um ciclo fechado

1. No dashboard do gestor, abra o mês cujo ciclo esteja **Fechado**.
2. Toque em **Reabrir ciclo** e confirme a reabertura.
3. O total fechado é descartado e as ações do período voltam a poder ser alteradas.
4. Feche o ciclo novamente quando a revisão terminar; o banco recalcula o total.

Um ciclo **Pago** não pode ser reaberto.

## Boas praticas

1. Cadastre os tipos de acao antes do primeiro uso.
2. Prefira desativar tipos usados em vez de excluir.
3. Anule registros incorretos em vez de tentar apagar historico.
4. Feche o ciclo somente depois de revisar o mes.
5. Nao registre senhas, tokens, contas bancarias, saldos ou detalhes sensiveis em observacoes.
